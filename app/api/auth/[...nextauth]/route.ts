import NextAuth from "next-auth"
import { authOptions } from "./auth"

const handler = NextAuth(authOptions)

// Use named exports for App Router
export { handler as GET, handler as POST }