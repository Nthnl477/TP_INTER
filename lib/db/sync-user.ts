import connectToDatabase from "./connection"
import { User } from "./models/User"
import { decodeToken, extractRoles, getAppRole } from "@/lib/keycloak/token"

/**
 * Synchronize or create user from Keycloak token
 * This function is called after successful Keycloak authentication
 */
export async function syncUserFromKeycloak(token: string) {
  try {
    const decoded = decodeToken(token)
    if (!decoded) throw new Error("Invalid token")

    await connectToDatabase()

    const keycloakId = decoded.sub
    const roles = extractRoles(decoded)
    const appRole = getAppRole(roles)

    // Upsert user by keycloakId or email to avoid duplicate key errors
    const user = await User.findOneAndUpdate(
      {
        $or: [{ keycloakId }, { email: decoded.email }],
      },
      {
        $set: {
          email: decoded.email,
          nom: decoded.family_name,
          prenom: decoded.given_name,
          role: appRole,
        },
        $setOnInsert: { keycloakId },
      },
      { new: true, upsert: true },
    )

    return user
  } catch (error) {
    console.error("Error syncing user from Keycloak:", error)
    throw error
  }
}

/**
 * Get user by Keycloak ID
 */
export async function getUserByKeycloakId(keycloakId: string) {
  try {
    await connectToDatabase()
    return await User.findOne({ keycloakId })
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase()
    return await User.findOne({ email })
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}
