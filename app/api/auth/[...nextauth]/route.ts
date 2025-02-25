import NextAuth from "next-auth"
import { authOptions } from "./auth"

// Remove any comments and keep only the essential exports
export const GET = NextAuth(authOptions)
export const POST = NextAuth(authOptions)

// Remove the edge runtime line
// export const runtime = 'edge'