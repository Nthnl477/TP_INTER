"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function SecretariatAppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/rendezvous")
        const data = await res.json()
        setAppointments(data.data || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut) {
      case "PLANIFIE":
        return "default"
      case "REALISE":
        return "secondary"
      case "ANNULE":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rendez-vous</CardTitle>
          <CardDescription>Liste de tous les rendez-vous planifiés</CardDescription>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau rendez-vous
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun rendez-vous trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Professionnel</TableHead>
                  <TableHead>Date et heure</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-medium">
                      {apt.patient?.prenom} {apt.patient?.nom}
                    </TableCell>
                    <TableCell>
                      {apt.professionnel?.utilisateur?.prenom} {apt.professionnel?.utilisateur?.nom}
                    </TableCell>
                    <TableCell>{formatDate(apt.dateHeureDebut)}</TableCell>
                    <TableCell>{apt.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatutBadgeVariant(apt.statut)}>{apt.statut}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
