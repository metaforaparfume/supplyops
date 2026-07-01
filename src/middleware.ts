import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname
      if (path === "/login") return true
      return !!token
    },
  },
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons/.*|manifest\\.json|sw\\.js|offline\\.html).*)"],
}
