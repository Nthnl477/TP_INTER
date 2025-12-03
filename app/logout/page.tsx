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
      const keycloakLogoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL!)}`
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
