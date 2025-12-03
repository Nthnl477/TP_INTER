import type { UserAuthContext } from "@/lib/types/keycloak"
import { decodeToken, extractRoles, getAppRole } from "./token"

export function extractUserContext(token: string): UserAuthContext | null {
  const decoded = decodeToken(token)
  if (!decoded) return null

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
}

export function getKeycloakAuthUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`

  const url = new URL(`${baseUrl}/realms/${realm}/protocol/openid-connect/auth`)
  url.searchParams.append("client_id", clientId)
  url.searchParams.append("redirect_uri", redirectUri)
  url.searchParams.append("response_type", "code")
  url.searchParams.append("scope", "openid profile email")

  return url.toString()
}

export function getKeycloakLogoutUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL

  const url = new URL(`${baseUrl}/realms/${realm}/protocol/openid-connect/logout`)
  url.searchParams.append("redirect_uri", redirectUri)

  return url.toString()
}

export async function exchangeCodeForToken(code: string): Promise<string | null> {
  try {
    const baseUrl = process.env.KEYCLOAK_AUTH_URL
    const realm = process.env.KEYCLOAK_REALM
    const clientId = process.env.KEYCLOAK_CLIENT_ID
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`

    const response = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!response.ok) {
      console.error("Token exchange failed:", await response.text())
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error exchanging code for token:", error)
    return null
  }
}
