"use client"
import { useSearchParams } from "next/navigation"
import { getKeycloakAuthUrl } from "@/lib/keycloak/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const error = searchParams.get("error")

  const handleLogin = () => {
    window.location.href = getKeycloakAuthUrl()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Epitanie</h1>
          <p className="text-gray-600 mt-2">Plateforme de coordination ville-hôpital</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error === "unauthorized"
                ? "Vous êtes connecté mais non autorisé à accéder à cette ressource"
                : "Une erreur est survenue lors de la connexion"}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Connectez-vous avec votre compte Keycloak</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} size="lg" className="w-full">
              Se connecter avec Keycloak
            </Button>

            <div className="text-sm text-gray-600 text-center">
              <p>Comptes de test disponibles :</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>Médecin : medecin@epitanie.fr</li>
                <li>Infirmier : infirmier@epitanie.fr</li>
                <li>Secrétariat : secretariat@epitanie.fr</li>
                <li>Patient : patient@epitanie.fr</li>
                <li>Admin : admin@epitanie.fr</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Tous les mots de passe : <code className="bg-gray-100 px-2 py-1 rounded">password</code>
          </p>
        </div>
      </div>
    </div>
  )
}
