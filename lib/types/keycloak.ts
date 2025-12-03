// Keycloak OIDC types
export interface KeycloakToken {
  sub: string // Keycloak user ID
  email_verified: boolean
  name: string
  given_name: string
  family_name: string
  email: string
  realm_access: {
    roles: string[]
  }
  resource_access?: {
    [key: string]: {
      roles: string[]
    }
  }
  iat: number
  exp: number
}

export interface KeycloakUser {
  id: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  emailVerified: boolean
  attributes?: {
    [key: string]: string[]
  }
  realmRoles?: string[]
  clientRoles?: string[]
}

// Extracted roles from Keycloak token
export interface UserAuthContext {
  userId: string // Keycloak ID
  email: string
  firstName: string
  lastName: string
  roles: string[]
  isAuthenticated: boolean
}
