import NextAuth from "next-auth"
import { authOptions } from "./auth"

// Export GET and POST handlers for the auth API route
export const GET = NextAuth(authOptions)
export const POST = NextAuth(authOptions)

// Remove the edge runtime line
// export const runtime = 'edge'