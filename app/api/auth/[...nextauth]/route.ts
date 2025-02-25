import NextAuth from "next-auth"
import { authOptions } from "./auth"

const handler = NextAuth(authOptions)

// Export all HTTP methods that NextAuth might need
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler

// Remove the edge runtime line
// export const runtime = 'edge'