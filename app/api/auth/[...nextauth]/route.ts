import NextAuth from "next-auth"
import { authOptions } from "./auth"

const handler = NextAuth(authOptions)

// Make sure both GET and POST are handled
export const GET = handler
export const POST = handler