"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Flag as Flask, MessageCircle } from "lucide-react"
import { PatientAppointmentsList } from "@/components/patient/appointments-list"
import { PatientDocumentsList } from "@/components/patient/documents-list"

export default function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
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

        // Get patient data
        const patientsRes = await fetch("/api/patients")
        const patientsData = await patientsRes.json()
        if (patientsData.data && patientsData.data.length > 0) {
          setPatient(patientsData.data[0])
        }

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
          upcomingAppointments: appointmentsData.data?.filter((a: any) => a.statut === "PLANIFIE").length || 0,
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
    { label: "Accueil", href: "/dashboard/patient", icon: <Calendar className="w-4 h-4" /> },
    { label: "Mon dossier", href: "/dashboard/patient/record", icon: <FileText className="w-4 h-4" /> },
    { label: "Rendez-vous", href: "/dashboard/patient/appointments", icon: <Calendar className="w-4 h-4" /> },
    { label: "Résultats", href: "/dashboard/patient/analyses", icon: <Flask className="w-4 h-4" /> },
    { label: "Messages", href: "/dashboard/patient/messages", icon: <MessageCircle className="w-4 h-4" /> },
  ]

  return (
    <DashboardLayout navItems={navItems} userName={`${user.firstName} ${user.lastName}`} userRole="Patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon espace patient</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, {user.firstName}. Consultez vos rendez-vous, documents et résultats d'analyses.
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
              <div className="text-2xl font-bold text-blue-600">{stats?.upcomingAppointments}</div>
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
              <CardTitle className="text-sm font-medium text-gray-600">Résultats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnalyses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Accès rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Button asChild>
              <a href="/dashboard/patient/record">Voir mon dossier</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/patient/appointments">Mes rendez-vous</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/patient/analyses">Résultats d'analyses</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/patient/messages">Messages</a>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Prochains rendez-vous</CardTitle>
            <CardDescription>Vos rendez-vous à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientAppointmentsList />
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents récents</CardTitle>
            <CardDescription>Vos derniers documents cliniques</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientDocumentsList />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
