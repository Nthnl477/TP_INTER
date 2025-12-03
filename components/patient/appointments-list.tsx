"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function PatientAppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/rendezvous")
        const data = await res.json()
        setAppointments((data.data || []).slice(0, 5))
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (appointments.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucun rendez-vous trouvé</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professionnel</TableHead>
            <TableHead>Date et heure</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow key={apt._id}>
              <TableCell className="font-medium">
                {apt.professionnel?.utilisateur?.prenom} {apt.professionnel?.utilisateur?.nom}
              </TableCell>
              <TableCell>{formatDate(apt.dateHeureDebut)}</TableCell>
              <TableCell>{apt.type}</TableCell>
              <TableCell>
                <Badge variant={apt.statut === "PLANIFIE" ? "default" : "secondary"}>{apt.statut}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
