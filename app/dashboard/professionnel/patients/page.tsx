"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProfessionalPatientsList } from "@/components/professional/patients-list"
import { Users, Calendar, FileText, Flag as Flask } from "lucide-react"

export default function ProfessionalPatientsPage() {
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
        <h1 className="text-2xl font-bold">Mes patients</h1>
        <ProfessionalPatientsList />
      </div>
    </DashboardLayout>
  )
}
