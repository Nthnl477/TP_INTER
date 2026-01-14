"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SecretariatPatientsList } from "@/components/secretariat/patients-list"
import { Settings, Users, Building2, Stethoscope, Calendar, FileText, FlaskConical } from "lucide-react"

export default function AdminPatientsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (!data.email) {
          redirect("/login")
        }
        setUser(data)
      } catch (error) {
        console.error("Error loading user", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>
  }

  const navItems = [
    { label: "Accueil", href: "/dashboard/admin", icon: <Settings className="w-4 h-4" /> },
    { label: "Utilisateurs", href: "/dashboard/admin/users", icon: <Users className="w-4 h-4" /> },
    { label: "Établissements", href: "/dashboard/admin/facilities", icon: <Building2 className="w-4 h-4" /> },
    { label: "Professionnels", href: "/dashboard/admin/professionals", icon: <Stethoscope className="w-4 h-4" /> },
    { label: "Patients", href: "/dashboard/admin/patients", icon: <Users className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/admin/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Documents", href: "/dashboard/admin/documents", icon: <FileText className="w-4 h-4" /> },
    { label: "Analyses", href: "/dashboard/admin/analyses", icon: <FlaskConical className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout navItems={navItems} userName={`${user.firstName} ${user.lastName}`} userRole="Administrateur">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <SecretariatPatientsList />
      </div>
    </DashboardLayout>
  )
}
