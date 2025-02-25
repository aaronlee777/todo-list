import NextAuth from "next-auth"
import { authOptions } from "./auth"

// Create a single handler for all methods
const handler = NextAuth(authOptions)

// Export all methods NextAuth needs
export { handler as GET, handler as POST }

// Remove the edge runtime line
// export const runtime = 'edge'