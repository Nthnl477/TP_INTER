"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileText } from "lucide-react"

export default function SecretariatDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch("/api/auth/me")
        const userData = await userRes.json()

        if (!userData.email) {
          redirect("/login")
        }

        setUser(userData)

        // Get appointments
        const appointmentsRes = await fetch("/api/rendezvous")
        const appointmentsData = await appointmentsRes.json()

        // Get patients
        const patientsRes = await fetch("/api/patients")
        const patientsData = await patientsRes.json()

        setStats({
          totalAppointments: appointmentsData.data?.length || 0,
          todayAppointments:
            appointmentsData.data?.filter((a: any) => {
              const today = new Date().toDateString()
              return new Date(a.dateHeureDebut).toDateString() === today
            }).length || 0,
          totalPatients: patientsData.data?.length || 0,
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
    { label: "Accueil", href: "/dashboard/secretariat", icon: <Calendar className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/secretariat/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Patients", href: "/dashboard/secretariat/patients", icon: <Users className="w-4 h-4" /> },
    { label: "Documents", href: "/dashboard/secretariat/documents", icon: <FileText className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout navItems={navItems} userName={`${user.firstName} ${user.lastName}`} userRole="Secrétariat">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Secrétariat</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user.firstName}. Gérez les rendez-vous et les dossiers patients.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rendez-vous total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.todayAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPatients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Button asChild>
              <a href="/dashboard/secretariat/appointments">Gérer les rendez-vous</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/secretariat/patients">Voir les patients</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
