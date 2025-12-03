"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

export function SecretariatPatientsList() {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Liste complète des patients</CardDescription>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau patient
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun patient trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Identifiant local</TableHead>
                  <TableHead>Date de naissance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell className="font-medium">{patient.nom}</TableCell>
                    <TableCell>{patient.prenom}</TableCell>
                    <TableCell>{patient.identifiantPatientLocal}</TableCell>
                    <TableCell>{new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Détail
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
