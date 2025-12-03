"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export function AdminUsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, you'd fetch from /api/users
        // For now, we'll show a placeholder
        setUsers([])
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des utilisateurs</CardTitle>
        <CardDescription>
          Les utilisateurs sont gérés via Keycloak. Accédez à la console Keycloak pour les gérer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">Gestion centralisée via Keycloak</p>
            <p className="text-sm text-blue-800 mt-1">
              Pour ajouter, modifier ou supprimer des utilisateurs, accédez à la console d'administration Keycloak.
            </p>
            <Button variant="outline" size="sm" className="mt-3 bg-transparent">
              Accéder à Keycloak
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
