import NextAuth from "next-auth"
import { authOptions } from "./auth"

// Create a single handler
const handler = NextAuth(authOptions)

// Export the handler directly
export { handler as GET, handler as POST }

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Remove the edge runtime line
// export const runtime = 'edge'