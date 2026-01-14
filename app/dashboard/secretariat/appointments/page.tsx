"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText } from "lucide-react"

export default function SecretariatAppointmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json())
        setUser(me)
        const res = await fetch("/api/rendezvous")
        const data = await res.json()
        setAppointments(data.data || [])
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
        <h1 className="text-2xl font-bold">Rendez-vous</h1>
        <Card>
          <CardHeader>
            <CardTitle>Liste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {appointments.length === 0 ? (
              <p className="text-gray-600">Aucun rendez-vous.</p>
            ) : (
              appointments.map((apt) => (
                <div key={apt._id} className="border rounded-md p-3 bg-gray-50">
                  <div className="font-medium">
                    {apt.patient?.prenom} {apt.patient?.nom} — {apt.professionnel?.utilisateur?.prenom}{" "}
                    {apt.professionnel?.utilisateur?.nom}
                  </div>
                  <div>Date : {apt.dateHeureDebut ? new Date(apt.dateHeureDebut).toLocaleString("fr-FR") : "—"}</div>
                  <div>Type : {apt.type}</div>
                  <div>Statut : {apt.statut}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
