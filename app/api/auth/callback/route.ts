import { type NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken } from "@/lib/keycloak/auth"
import { syncUserFromKeycloak } from "@/lib/db/sync-user"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const redirect = searchParams.get("redirect") || "/dashboard"

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
  }

  try {
    // Exchange code for token
    const token = await exchangeCodeForToken(code)
    if (!token) {
      return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 400 })
    }

    // Sync user to MongoDB
    await syncUserFromKeycloak(token)

    // Set token in secure HTTP-only cookie
    const response = NextResponse.redirect(new URL(redirect, request.url))
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    })

    return response
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
