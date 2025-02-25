import { AuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

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

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt for:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials")
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          if (!user || !user.password) {
            throw new Error("Invalid email or password")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid email or password")
          }

          return user
        } catch (error) {
          console.error("Auth Error:", error)
          throw error
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  pages: {
    signIn: "/auth",
    error: "/auth"
  }
} 