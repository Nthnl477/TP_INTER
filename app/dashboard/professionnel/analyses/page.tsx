"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, Flag as Flask } from "lucide-react"

export default function ProfessionalAnalysesPage() {
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
    { label: "Accueil", href: "/dashboard/professionnel", icon: <Users className="w-4 h-4" /> },
    { label: "Mes patients", href: "/dashboard/professionnel/patients", icon: <Users className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/professionnel/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Documents", href: "/dashboard/professionnel/documents", icon: <FileText className="w-4 h-4" /> },
    { label: "Analyses", href: "/dashboard/professionnel/analyses", icon: <Flask className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
      userName={`${user.firstName} ${user.lastName}`}
      userRole={user.role === "MEDECIN" ? "Médecin" : "Infirmier"}
    >
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mes analyses biologiques</h1>
        {analyses.length === 0 ? (
          <p className="text-gray-600">Aucune analyse.</p>
        ) : (
          <div className="grid gap-3">
            {analyses.map((analysis) => (
              <Card key={analysis._id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {analysis.patient?.prenom} {analysis.patient?.nom} — {analysis.laboratoire?.nom}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>Date prescription : {analysis.datePrescription ? new Date(analysis.datePrescription).toLocaleDateString("fr-FR") : "—"}</div>
                  <div>Statut : {analysis.statut}</div>
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
