"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      // Call logout endpoint
      await fetch("/api/auth/logout", { method: "POST" })

      // Redirect to Keycloak logout
      const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL!)}`
      window.location.href = keycloakLogoutUrl
    }

    logout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Déconnexion...</h1>
        <p className="text-gray-600">Vous êtes en cours de déconnexion</p>
      </div>
    </div>
  )
}
