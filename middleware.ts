import { type NextRequest, NextResponse } from "next/server"
import { decodeToken, isTokenExpired } from "./lib/keycloak/token"

const protectedRoutes = [
  "/dashboard",
  "/api/patients",
  "/api/rendezvous",
  "/api/documents",
  "/api/analyses",
  "/api/messages",
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("access_token")?.value

    // No token or expired token
    if (!token || isTokenExpired(token)) {
      if (path.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      // Redirect to login for frontend routes
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token is valid
    const decoded = decodeToken(token)
    if (!decoded) {
      if (path.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", path)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}
