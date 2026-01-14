"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, FileText, Flag as Flask, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientRecordPage() {
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await fetch("/api/auth/me")
        const meData = await meRes.json()
        setUser(meData)

        const patientsRes = await fetch("/api/patients")
        const patientsData = await patientsRes.json()
        const patientRecord = patientsData.data && patientsData.data.length > 0 ? patientsData.data[0] : null
        setPatient(patientRecord)
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
        <h1 className="text-2xl font-bold">Mon dossier</h1>
        {patient ? (
          <Card>
            <CardHeader>
              <CardTitle>{patient.prenom} {patient.nom}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div>Identifiant local : {patient.identifiantPatientLocal}</div>
              <div>INS : {patient.ins || "Non renseigné"}</div>
              <div>Date de naissance : {patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : "—"}</div>
              <div>Sexe : {patient.sexe || "Non renseigné"}</div>
              <div>Email : {patient.utilisateur?.email || "Non renseigné"}</div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-600">Aucune donnée patient disponible.</p>
        )}
      </div>
    </DashboardLayout>
  )
}
