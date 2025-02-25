import NextAuth from "next-auth"
import { authOptions } from "./auth"

// Export named functions instead of using handler
export async function GET(req: Request) {
  return await NextAuth(authOptions)(req)
}

export async function POST(req: Request) {
  return await NextAuth(authOptions)(req)
}

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