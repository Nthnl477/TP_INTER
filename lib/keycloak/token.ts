import { jwtDecode } from "jwt-decode"
import type { KeycloakToken } from "@/lib/types/keycloak"

export function decodeToken(token: string): KeycloakToken | null {
  try {
    return jwtDecode<KeycloakToken>(token)
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp <= now
}

export function extractRoles(token: KeycloakToken): string[] {
  const roles: Set<string> = new Set()

  // Add realm roles
  if (token.realm_access?.roles) {
    token.realm_access.roles.forEach((role) => roles.add(role))
  }

  // Add client roles
  if (token.resource_access) {
    Object.values(token.resource_access).forEach((client) => {
      if (client.roles) {
        client.roles.forEach((role) => roles.add(role))
      }
    })
  }

  return Array.from(roles)
}

export function mapKeycloakRoleToAppRole(
  keycloakRole: string,
): "PATIENT" | "MEDECIN" | "INFIRMIER" | "SECRETARIAT" | "ADMIN" | null {
  const mapping: Record<string, "PATIENT" | "MEDECIN" | "INFIRMIER" | "SECRETARIAT" | "ADMIN"> = {
    ROLE_PATIENT: "PATIENT",
    ROLE_MEDECIN: "MEDECIN",
    ROLE_INFIRMIER: "INFIRMIER",
    ROLE_SECRETARIAT: "SECRETARIAT",
    ROLE_ADMIN: "ADMIN",
  }

  return mapping[keycloakRole] || null
}

export function getAppRole(keycloakRoles: string[]): "PATIENT" | "MEDECIN" | "INFIRMIER" | "SECRETARIAT" | "ADMIN" {
  // Priority order for role mapping
  const priorityOrder = ["ROLE_ADMIN", "ROLE_SECRETARIAT", "ROLE_MEDECIN", "ROLE_INFIRMIER", "ROLE_PATIENT"]

  for (const keycloakRole of priorityOrder) {
    if (keycloakRoles.includes(keycloakRole)) {
      const appRole = mapKeycloakRoleToAppRole(keycloakRole)
      if (appRole) return appRole
    }
  }

  return "PATIENT" // Default role
}
