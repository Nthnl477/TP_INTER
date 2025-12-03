"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AdminFacilitiesList() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        // TODO: Implement /api/etablissements endpoint
        setFacilities([])
      } catch (error) {
        console.error("Error fetching facilities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Établissements</CardTitle>
        <CardDescription>Gestion des établissements de santé</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun établissement trouvé</p>
            <Button className="mt-4">Ajouter un établissement</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Code NOS</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility._id}>
                  <TableCell className="font-medium">{facility.nom}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{facility.typeEtablissement}</Badge>
                  </TableCell>
                  <TableCell>{facility.codeNOS || "-"}</TableCell>
                  <TableCell>
                    <Button variant="sm" variant="outline" size="sm">
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
