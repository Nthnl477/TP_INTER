"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText } from "lucide-react"

export default function SecretariatPatientDetailPage() {
  const params = useParams()
  const patientId = params?.id as string
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json())
        setUser(me)
        if (patientId) {
          const res = await fetch(`/api/patients/${patientId}`)
          const data = await res.json()
          setPatient(data.data || null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

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
        <h1 className="text-2xl font-bold">Dossier patient</h1>
        {patient ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {patient.prenom} {patient.nom}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>Identifiant local : {patient.identifiantPatientLocal}</div>
              <div>INS : {patient.ins || "Non renseigné"}</div>
              <div>
                Date de naissance :{" "}
                {patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : "—"}
              </div>
              <div>Sexe : {patient.sexe || "Non renseigné"}</div>
              <div>Email : {patient.utilisateur?.email || "Non renseigné"}</div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-600">Patient introuvable.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
