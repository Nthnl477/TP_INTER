"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export function AdminProfessionalsList() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    utilisateur: "",
    type: "MEDECIN",
    specialite: "",
    rpps: "",
    etablissement: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const res = await fetch("/api/professionnels")
        const data = await res.json()
        setProfessionals(data.data || [])
      } catch (error) {
        console.error("Error fetching professionals:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/etablissements")
        const data = await res.json()
        setFacilities(data.data || [])
      } catch (error) {
        console.error("Error fetching facilities:", error)
      }
    }

    fetchProfessionals()
    fetchFacilities()
  }, [])

  const upsertProfessional = async () => {
    try {
      setSaving(true)
      const res = await fetch(editingId ? `/api/professionnels/${editingId}` : "/api/professionnels", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec de la création")
      }
      const created = await res.json()
      setProfessionals((prev) =>
        editingId ? prev.map((p) => (p._id === editingId ? created.data : p)) : [...prev, created.data],
      )
      handleClose()
    } catch (error) {
      console.error("Error creating professional:", error)
      alert("Erreur lors de la création : " + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleOpen = (prof?: any) => {
    if (prof) {
      setEditingId(prof._id)
      setForm({
        utilisateur: prof.utilisateur?._id || "",
        type: prof.type || "MEDECIN",
        specialite: prof.specialite || "",
        rpps: prof.rpps || "",
        etablissement: prof.etablissement?._id || "",
      })
    } else {
      setEditingId(null)
      setForm({ utilisateur: "", type: "MEDECIN", specialite: "", rpps: "", etablissement: "" })
    }
    setModalOpen(true)
  }

  const handleClose = () => {
    setEditingId(null)
    setModalOpen(false)
    setForm({ utilisateur: "", type: "MEDECIN", specialite: "", rpps: "", etablissement: "" })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Professionnels de santé</CardTitle>
            <CardDescription>Gestion des professionnels de santé</CardDescription>
          </div>
          <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : handleClose())}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                Ajouter un professionnel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau professionnel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Saisir l&apos;ID Mongo de l&apos;utilisateur déjà synchronisé (connexion Keycloak préalable).
                </p>
                <div className="space-y-2">
                  <Label>ID utilisateur Mongo</Label>
                  <Input
                    value={form.utilisateur}
                    onChange={(e) => setForm({ ...form, utilisateur: e.target.value })}
                    placeholder="6512ab..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEDECIN">Médecin</SelectItem>
                      <SelectItem value="INFIRMIER">Infirmier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Spécialité</Label>
                  <Input
                    value={form.specialite}
                    onChange={(e) => setForm({ ...form, specialite: e.target.value })}
                    placeholder="Cardiologie"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RPPS (optionnel)</Label>
                  <Input value={form.rpps} onChange={(e) => setForm({ ...form, rpps: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Établissement</Label>
                  <Select
                    value={form.etablissement}
                    onValueChange={(value) => setForm({ ...form, etablissement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un établissement" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map((f) => (
                        <SelectItem key={f._id} value={f._id}>
                          {f.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={saving} onClick={upsertProfessional}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingId ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun professionnel trouvé</p>
            <Button className="mt-4" onClick={() => handleOpen()}>
              Ajouter un professionnel
            </Button>
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
                  <TableCell className="font-medium">
                    {prof.utilisateur?.prenom} {prof.utilisateur?.nom}
                  </TableCell>
                  <TableCell>
                    <Badge>{prof.type}</Badge>
                  </TableCell>
                  <TableCell>{prof.specialite}</TableCell>
                  <TableCell>{prof.etablissement?.nom || "-"}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleOpen(prof)}>
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
