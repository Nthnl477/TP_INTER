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

export function AdminFacilitiesList() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nom: "",
    typeEtablissement: "HOPITAL",
    codeNOS: "",
    adresseSimplifiee: "",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/etablissements")
        const data = await res.json()
        setFacilities(data.data || [])
      } catch (error) {
        console.error("Error fetching facilities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  const upsertFacility = async () => {
    try {
      setSaving(true)
      const res = await fetch(editingId ? `/api/etablissements/${editingId}` : "/api/etablissements", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Échec de la création")
      }
      const created = await res.json()
      setFacilities((prev) =>
        editingId ? prev.map((f) => (f._id === editingId ? created.data : f)) : [...prev, created.data],
      )
      handleClose()
    } catch (error) {
      console.error("Error creating facility:", error)
      alert("Erreur lors de la création : " + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleOpen = (facility?: any) => {
    if (facility) {
      setEditingId(facility._id)
      setForm({
        nom: facility.nom || "",
        typeEtablissement: facility.typeEtablissement || "HOPITAL",
        codeNOS: facility.codeNOS || "",
        adresseSimplifiee: facility.adresseSimplifiee || "",
      })
    } else {
      setEditingId(null)
      setForm({ nom: "", typeEtablissement: "HOPITAL", codeNOS: "", adresseSimplifiee: "" })
    }
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm({ nom: "", typeEtablissement: "HOPITAL", codeNOS: "", adresseSimplifiee: "" })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Établissements</CardTitle>
            <CardDescription>Gestion des établissements de santé</CardDescription>
          </div>
          <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : handleClose())}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => handleOpen()}>
                Ajouter un établissement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvel établissement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.typeEtablissement}
                    onValueChange={(value) => setForm({ ...form, typeEtablissement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'établissement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOPITAL">Hôpital</SelectItem>
                      <SelectItem value="CABINET_LIBERAL">Cabinet libéral</SelectItem>
                      <SelectItem value="LABORATOIRE">Laboratoire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code NOS (optionnel)</Label>
                  <Input
                    value={form.codeNOS}
                    onChange={(e) => setForm({ ...form, codeNOS: e.target.value })}
                    placeholder="Ex: 750100123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse simplifiée (optionnel)</Label>
                  <Input
                    value={form.adresseSimplifiee}
                    onChange={(e) => setForm({ ...form, adresseSimplifiee: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={saving} onClick={upsertFacility}>
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
        ) : facilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun établissement trouvé</p>
            <Button className="mt-4" onClick={() => handleOpen()}>
              Ajouter un établissement
            </Button>
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
                    <Button variant="outline" size="sm" onClick={() => handleOpen(facility)}>
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
