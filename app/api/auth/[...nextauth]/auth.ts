import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string | null | undefined
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("JWT Callback:", { token, user, trigger })
      
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }
      
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      return token
    },
    async session({ session, token }) {
      console.log("Session Callback:", { session, token })
      
      if (session.user && token.id) {
        session.user.id = token.id
        session.user.email = token.email || ''
        session.user.name = token.name || null
      }
      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase() 
            },
            select: {
              id: true,
              email: true,
              password: true,
              name: true
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error("Auth Error:", error)
          return null
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === 'development'
} 