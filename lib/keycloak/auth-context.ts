import type { UserAuthContext } from "@/lib/types/keycloak"
import { decodeToken, extractRoles, getAppRole } from "./token"
import { cookies } from "next/headers"

/**
 * Get authentication context from server-side (for server components and route handlers)
 */
export async function getAuthContext(): Promise<UserAuthContext | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("access_token")?.value

    if (!token) {
      return null
    }

    const decoded = decodeToken(token)
    if (!decoded) {
      return null
    }

    const roles = extractRoles(decoded)
    const appRole = getAppRole(roles)

    return {
      userId: decoded.sub,
      email: decoded.email,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      roles,
      isAuthenticated: true,
    }
  } catch (error) {
    console.error("Error getting auth context:", error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 * Use in server components and route handlers
 */
export async function requireAuth(): Promise<UserAuthContext> {
  const auth = await getAuthContext()
  if (!auth) {
    throw new Error("Unauthorized")
  }
  return auth
}

/**
 * Require specific roles - throws if user doesn't have at least one of the roles
 */
export async function requireRole(...requiredRoles: string[]): Promise<UserAuthContext> {
  const auth = await requireAuth()

  const hasRole = requiredRoles.some((role) => auth.roles.includes(role))
  if (!hasRole) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return auth
}
