"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"

export function AdminDocumentsList() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [detailDoc, setDetailDoc] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    patient: "",
    auteur: "",
    typeDocument: "",
    titre: "",
    contenuTexte: "",
  })

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("/api/documents")
        const data = await res.json()
        setDocuments(data.data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients")
        const data = await res.json()
        setPatients(data.data || [])
      } catch (error) {
        console.error("Error fetching patients:", error)
      }
    }

    const fetchProfessionals = async () => {
      try {
        const res = await fetch("/api/professionnels")
        const data = await res.json()
        setProfessionals(data.data || [])
      } catch (error) {
        console.error("Error fetching professionals:", error)
      }
    }

    fetchDocuments()
    fetchPatients()
    fetchProfessionals()
  }, [])

  const resetForm = () =>
    setForm({
      patient: "",
      auteur: "",
      typeDocument: "",
      titre: "",
      contenuTexte: "",
    })

  const saveDocument = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création")
      setDocuments((prev) => [...prev, data.data])
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating document:", error)
      alert((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const deleteDocument = async (id: string) => {
    if (!confirm("Supprimer ce document ?")) return
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Suppression impossible")
      setDocuments((prev) => prev.filter((d) => d._id !== id))
    } catch (error) {
      console.error("Error deleting document:", error)
      alert((error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun document trouvé
          <div className="mt-4">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau document
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Patient</TableHead>
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
                    {doc.patient?.prenom} {doc.patient?.nom}
                  </TableCell>
                  <TableCell>
                    {doc.auteur?.utilisateur?.prenom} {doc.auteur?.utilisateur?.nom}
                  </TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailDoc(doc)}>
                      Détail
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un document clinique</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={form.patient} onValueChange={(value) => setForm({ ...form, patient: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.prenom} {p.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Auteur</Label>
              <Select value={form.auteur} onValueChange={(value) => setForm({ ...form, auteur: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un professionnel" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((pro) => (
                    <SelectItem key={pro._id} value={pro._id}>
                      {pro.utilisateur?.prenom} {pro.utilisateur?.nom} ({pro.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                value={form.typeDocument}
                onChange={(e) => setForm({ ...form, typeDocument: e.target.value })}
                placeholder="COMPTE_RENDU, NOTE_SOINS..."
              />
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contenu</Label>
              <Textarea
                rows={4}
                value={form.contenuTexte}
                onChange={(e) => setForm({ ...form, contenuTexte: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button disabled={saving} onClick={saveDocument}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailDoc} onOpenChange={(open) => setDetailDoc(open ? detailDoc : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailDoc?.titre}</DialogTitle>
          </DialogHeader>
          {detailDoc && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient</span>
                <span className="font-medium">
                  {detailDoc.patient?.prenom} {detailDoc.patient?.nom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auteur</span>
                <span className="font-medium">
                  {detailDoc.auteur?.utilisateur?.prenom} {detailDoc.auteur?.utilisateur?.nom}
                </span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Contenu</span>
                <p className="whitespace-pre-wrap">{detailDoc.contenuTexte}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDoc(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
