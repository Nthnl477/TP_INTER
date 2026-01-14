"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Stethoscope, Settings, Calendar, FileText, FlaskConical } from "lucide-react"
import { AdminStatsCard } from "@/components/admin/stats-card"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userRes = await fetch("/api/auth/me")
        const userData = await userRes.json()

        if (!userData.email) {
          redirect("/login")
        }

        setUser(userData)

        // Get patients for stats
        const patientsRes = await fetch("/api/patients")
        const patientsData = await patientsRes.json()

        // Get appointments for stats
        const appointmentsRes = await fetch("/api/rendezvous")
        const appointmentsData = await appointmentsRes.json()

        setStats({
          totalPatients: patientsData.data?.length || 0,
          totalAppointments: appointmentsData.data?.length || 0,
          pendingAppointments: appointmentsData.data?.filter((a: any) => a.statut === "PLANIFIE").length || 0,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user.firstName}. Gérez les utilisateurs, établissements et professionnels de santé.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminStatsCard title="Patients" value={stats?.totalPatients} description="Total des patients" />
          <AdminStatsCard title="Rendez-vous" value={stats?.totalAppointments} description="Total des rendez-vous" />
          <AdminStatsCard title="À venir" value={stats?.pendingAppointments} description="Rendez-vous planifiés" />
        </div>

      </div>
    </DashboardLayout>
  )
}
