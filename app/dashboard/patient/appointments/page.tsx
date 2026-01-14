"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientAppointmentsList } from "@/components/patient/appointments-list"
import { Calendar, FileText, Flag as Flask, MessageCircle } from "lucide-react"

export default function PatientAppointmentsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        setUser(data)
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
        <h1 className="text-2xl font-bold">Mes rendez-vous</h1>
        <PatientAppointmentsList />
      </div>
    </DashboardLayout>
  )
}
