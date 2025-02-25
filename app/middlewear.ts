import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
  pages: {
    signIn: "/auth"
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/todos/:path*"
  ]
}