"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"

export function PatientDocumentsList() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents")
        const data = await res.json()
        setDocuments((data.data || []).slice(0, 5))
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (documents.length === 0) {
    return <div className="text-center py-8 text-gray-500">Aucun document trouvé</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Auteur</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc._id}>
              <TableCell className="font-medium">{doc.titre}</TableCell>
              <TableCell>
                <Badge variant="outline">{doc.typeDocument}</Badge>
              </TableCell>
              <TableCell>
                {doc.auteur?.utilisateur?.prenom} {doc.auteur?.utilisateur?.nom}
              </TableCell>
              <TableCell>{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Lire
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
