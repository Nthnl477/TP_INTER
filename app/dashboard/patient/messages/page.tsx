"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, FileText, Flag as Flask, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientMessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
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

        if (patientRecord?._id) {
          const messagesRes = await fetch(`/api/messages?patientId=${patientRecord._id}`)
          const messagesData = await messagesRes.json()
          setMessages(messagesData.data || [])
        }
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
        <h1 className="text-2xl font-bold">Mes messages</h1>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-600">Aucun message pour le moment.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="border rounded-md p-3 bg-gray-50">
                  <div className="text-sm text-gray-800">{msg.contenu}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.auteur?.prenom} {msg.auteur?.nom} —{" "}
                    {msg.dateEnvoi ? new Date(msg.dateEnvoi).toLocaleString("fr-FR") : ""}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
