"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText } from "lucide-react"

export default function SecretariatDocumentsPage() {
  const [user, setUser] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json())
        setUser(me)

        const docs = await fetch("/api/documents").then((r) => r.json())
        setDocuments(docs.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>

  const navItems = [
    { label: "Accueil", href: "/dashboard/secretariat", icon: <Calendar className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/secretariat/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Patients", href: "/dashboard/secretariat/patients", icon: <Users className="w-4 h-4" /> },
    { label: "Documents", href: "/dashboard/secretariat/documents", icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout navItems={navItems} userName={`${user.firstName} ${user.lastName}`} userRole="Secrétariat">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        {documents.length === 0 ? (
          <p className="text-gray-600">Aucun document.</p>
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
