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

    // Check if user exists
    let user = await User.findOne({ keycloakId })

    if (user) {
      // Update existing user
      user.email = decoded.email
      user.nom = decoded.family_name
      user.prenom = decoded.given_name
      user.role = appRole
      await user.save()
    } else {
      // Create new user
      user = new User({
        keycloakId,
        email: decoded.email,
        nom: decoded.family_name,
        prenom: decoded.given_name,
        role: appRole,
      })
      await user.save()
    }

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
