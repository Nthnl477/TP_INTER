"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, FileText, Flag as Flask } from "lucide-react"
import { ProfessionalAppointmentsList } from "@/components/professional/appointments-list"

export default function ProfessionalDashboard() {
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

        // Get documents
        const documentsRes = await fetch("/api/documents")
        const documentsData = await documentsRes.json()

        // Get analyses
        const analysesRes = await fetch("/api/analyses")
        const analysesData = await analysesRes.json()

        setStats({
          totalAppointments: appointmentsData.data?.length || 0,
          pendingAppointments: appointmentsData.data?.filter((a: any) => a.statut === "PLANIFIE").length || 0,
          totalDocuments: documentsData.data?.length || 0,
          totalAnalyses: analysesData.data?.length || 0,
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Professionnel</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user.firstName}. Gérez vos patients, rendez-vous et documents cliniques.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rendez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">À venir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.pendingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDocuments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnalyses}</div>
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
              <a href="/dashboard/professionnel/patients">Mes patients</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/professionnel/appointments">Rendez-vous</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/professionnel/documents">Nouveaux documents</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/professionnel/analyses">Prescriptions</a>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
            <CardDescription>Vos rendez-vous planifiés pour les 7 prochains jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfessionalAppointmentsList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
