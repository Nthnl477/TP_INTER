"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AdminProfessionalsList() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        // TODO: Implement /api/professionnels endpoint
        setProfessionals([])
      } catch (error) {
        console.error("Error fetching professionals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfessionals()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professionnels de santé</CardTitle>
        <CardDescription>Gestion des professionnels de santé</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun professionnel trouvé</p>
            <Button className="mt-4">Ajouter un professionnel</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((prof) => (
                <TableRow key={prof._id}>
                  <TableCell className="font-medium">{prof.utilisateur?.nom}</TableCell>
                  <TableCell>
                    <Badge>{prof.type}</Badge>
                  </TableCell>
                  <TableCell>{prof.specialite}</TableCell>
                  <TableCell>{prof.etablissement?.nom || "-"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
