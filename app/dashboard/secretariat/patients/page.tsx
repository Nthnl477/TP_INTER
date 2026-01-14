"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfessionalPatientsList } from "@/components/professional/patients-list"
import { Calendar, Users, FileText } from "lucide-react"

export default function SecretariatPatientsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json())
        setUser(me)
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
        <h1 className="text-2xl font-bold">Patients</h1>
        <ProfessionalPatientsList />
      </div>
    </DashboardLayout>
  )
}
