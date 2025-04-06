import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = request.nextUrl.pathname === "/admin/login"

  // Get Firebase token from Authorization header or cookie
  const token = request.cookies.get("firebase-token")?.value

  if (isAdminRoute && !isLoginPage && !token) {
    // Redirect to login if trying to access admin routes without token
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (isLoginPage && token) {
    // Redirect to admin if trying to access login page with valid token
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"]
}