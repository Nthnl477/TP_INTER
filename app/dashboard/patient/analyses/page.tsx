"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, FileText, Flag as Flask, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientAnalysesPage() {
  const [user, setUser] = useState<any>(null)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/auth/me")
        const meData = await meRes.json()
        setUser(meData)

        const res = await fetch("/api/analyses")
        const data = await res.json()
        setAnalyses(data.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>

  const navItems = [
    { label: "Accueil", href: "/dashboard/patient", icon: <Calendar className="w-4 h-4" /> },
    { label: "Mon dossier", href: "/dashboard/patient/record", icon: <FileText className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/patient/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Résultats", href: "/dashboard/patient/analyses", icon: <Flask className="w-4 h-4" /> },
    { label: "Messages", href: "/dashboard/patient/messages", icon: <MessageCircle className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout navItems={navItems} userName={`${user.firstName} ${user.lastName}`} userRole="Patient">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mes résultats d'analyses</h1>
        {analyses.length === 0 ? (
          <p className="text-gray-600">Aucun résultat pour le moment.</p>
        ) : (
          <div className="grid gap-3">
            {analyses.map((analysis) => (
              <Card key={analysis._id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {analysis.laboratoire?.nom || "Laboratoire"} —{" "}
                    {new Date(analysis.datePrescription).toLocaleDateString("fr-FR")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>Statut : {analysis.statut}</div>
                  <div>Prescripteur : {analysis.prescripteur?.utilisateur?.prenom} {analysis.prescripteur?.utilisateur?.nom}</div>
                  <div>
                    Examens :
                    <ul className="list-disc list-inside">
                      {(analysis.examens || []).map((ex: any, idx: number) => (
                        <li key={idx}>
                          {ex.libelle} ({ex.codeTest}) — {ex.valeur} {ex.unite}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
