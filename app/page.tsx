"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      })
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Epitanie</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">Tableau de bord</Link>
              </Button>
              <Button asChild variant="destructive">
                <Link href="/logout">Déconnexion</Link>
              </Button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue sur Epitanie</h2>
            <p className="text-xl text-gray-600">
              Plateforme de coordination ville-hôpital pour professionnels de santé et patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dossiers Patients</CardTitle>
                <CardDescription>Gestion centralisée des dossiers médicaux</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Accédez aux informations de santé, rendez-vous et résultats d'analyses
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous</CardTitle>
                <CardDescription>Planification et suivi des consultations</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Organisez vos consultations et gérez les agendas
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cercle de Soins</CardTitle>
                <CardDescription>Coordination entre professionnels</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Collaborez avec les professionnels du cercle de soins
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">Accéder au tableau de bord</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Epitanie</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Plateforme Epitanie</h2>
          <p className="text-xl text-gray-600 mb-8">
            Coordination ville-hôpital pour professionnels de santé et patients
          </p>
          <Button size="lg" asChild>
            <Link href="/login">Se connecter avec Keycloak</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Pour les Médecins</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Accédez aux dossiers de vos patients, créez des documents et prescrivez des analyses
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pour les Infirmiers</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Consultez les dossiers patient et documentez les soins prodigués
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pour les Patients</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Accédez à vos dossiers, résultats d'analyses et communiquez avec vos professionnels
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold mb-4">À propos de cette plateforme</h3>
          <p className="text-gray-700 mb-4">
            Epitanie est un POC académique de plateforme de coordination ville-hôpital pour la région fictive
            d'Epitanie. Elle démontre les principes d'interopérabilité des systèmes d'information en santé avec :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Authentification centralisée via Keycloak (OIDC)</li>
            <li>Gestion des rôles et habilitations (RBAC)</li>
            <li>Modélisation de données de santé (simplifié MOS/NOS)</li>
            <li>API REST sécurisée avec autorisation basée sur les rôles</li>
            <li>Respect du cercle de soins et de la confidentialité</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
