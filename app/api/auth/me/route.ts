import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/keycloak/auth-context"
import { getUserByKeycloakId } from "@/lib/db/sync-user"

export async function GET() {
  try {
    const auth = await getAuthContext()

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get extended user info from MongoDB
    const dbUser = await getUserByKeycloakId(auth.userId)

    return NextResponse.json({
      ...auth,
      dbId: dbUser?._id,
      role: dbUser?.role,
    })
  } catch (error) {
    console.error("Error getting user info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
