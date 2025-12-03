import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Clear the access token cookie
  response.cookies.delete("access_token")

  return response
}
