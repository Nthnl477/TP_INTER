"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      // Call logout endpoint
      await fetch("/api/auth/logout", { method: "POST" })

      // Redirect to Keycloak logout
      const baseUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL
      const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM
      const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
      const redirectUri = process.env.NEXT_PUBLIC_APP_URL!

      // Use post_logout_redirect_uri + client_id (Keycloak 22+)
      const keycloakLogoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${encodeURIComponent(clientId!)}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`
      window.location.href = keycloakLogoutUrl
    }

    logout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Déconnexion...</h1>
        <p className="text-gray-600 mb-6">Vous êtes en cours de déconnexion</p>
        <Button
          onClick={() => router.push("/login")}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          Revenir à la page de connexion
        </Button>
      </div>
    </div>
  )
}
