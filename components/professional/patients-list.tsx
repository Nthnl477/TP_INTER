"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function ProfessionalPatientsList() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients")
        const data = await res.json()
        setPatients(data.data || [])
      } catch (error) {
        console.error("Error fetching patients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (patients.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucun patient trouvé</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Sexe</TableHead>
            <TableHead>Date de naissance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell className="font-medium">{patient.nom}</TableCell>
              <TableCell>{patient.prenom}</TableCell>
              <TableCell>{patient.sexe}</TableCell>
              <TableCell>{new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  Dossier patient
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
