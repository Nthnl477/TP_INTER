"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, Flag as Flask } from "lucide-react"

export default function ProfessionalDocumentsPage() {
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/auth/me")
        const meData = await meRes.json()
        setUser(meData)

        const docsRes = await fetch("/api/documents")
        const docsData = await docsRes.json()
        setDocuments(docsData.data || [])
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
        <h1 className="text-2xl font-bold">Mes documents cliniques</h1>
        {documents.length === 0 ? (
          <p className="text-gray-600">Aucun document pour le moment.</p>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <Card key={doc._id}>
                <CardHeader>
                  <CardTitle className="text-base">{doc.titre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div>Type : {doc.typeDocument}</div>
                  <div>
                    Patient : {doc.patient?.prenom} {doc.patient?.nom}
                  </div>
                  <div>
                    Auteur : {doc.auteur?.utilisateur?.prenom} {doc.auteur?.utilisateur?.nom}
                  </div>
                  <div>Date : {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("fr-FR") : "—"}</div>
                  <div className="text-gray-700 mt-1 line-clamp-3">{doc.contenuTexte}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
