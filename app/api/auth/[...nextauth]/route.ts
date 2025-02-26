import NextAuth from "next-auth"
import { authOptions } from "./auth"


const auth = NextAuth(authOptions)

// Export the handler directly for each method
export const GET = auth
export const POST = auth

// Add runtime directive
export const runtime = 'nodejs'

// Remove OPTIONS handler since we're handling CORS in next.config.mjs