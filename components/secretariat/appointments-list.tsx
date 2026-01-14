"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function SecretariatAppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    patient: "",
    professionnel: "",
    dateHeureDebut: "",
    dateHeureFin: "",
    type: "",
    statut: "PLANIFIE",
  })

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

    fetchPatients()
    fetchProfessionals()
  }, [])

  const resetForm = () => {
    setForm({
      patient: "",
      professionnel: "",
      dateHeureDebut: "",
      dateHeureFin: "",
      type: "",
      statut: "PLANIFIE",
    })
    setEditingId(null)
  }

  const openModal = (apt?: any) => {
    if (apt) {
      setEditingId(apt._id)
      setForm({
        patient: apt.patient?._id || apt.patient,
        professionnel: apt.professionnel?._id || apt.professionnel,
        dateHeureDebut: apt.dateHeureDebut ? new Date(apt.dateHeureDebut).toISOString().slice(0, 16) : "",
        dateHeureFin: apt.dateHeureFin ? new Date(apt.dateHeureFin).toISOString().slice(0, 16) : "",
        type: apt.type || "",
        statut: apt.statut || "PLANIFIE",
      })
    } else {
      resetForm()
    }
    setModalOpen(true)
  }

  const saveAppointment = async () => {
    try {
      setSaving(true)
      const res = await fetch(editingId ? `/api/rendezvous/${editingId}` : "/api/rendezvous", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateHeureDebut: form.dateHeureDebut ? new Date(form.dateHeureDebut) : undefined,
          dateHeureFin: form.dateHeureFin ? new Date(form.dateHeureFin) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'enregistrement")

      setAppointments((prev) =>
        editingId ? prev.map((a) => (a._id === editingId ? data.data : a)) : [...prev, data.data],
      )
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving appointment:", error)
      alert((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return
    try {
      const res = await fetch(`/api/rendezvous/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Suppression impossible")
      setAppointments((prev) => prev.filter((a) => a._id !== id))
    } catch (error) {
      console.error("Error deleting appointment:", error)
      alert((error as Error).message)
    }
  }

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
        <Button size="sm" className="gap-2" onClick={() => openModal()}>
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
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openModal(apt)}>
                        Modifier
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteAppointment(apt._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : setModalOpen(false))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label>Professionnel</Label>
              <Select
                value={form.professionnel}
                onValueChange={(value) => setForm({ ...form, professionnel: value })}
              >
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
              <Label>Date et heure de début</Label>
              <Input
                type="datetime-local"
                value={form.dateHeureDebut}
                onChange={(e) => setForm({ ...form, dateHeureDebut: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date et heure de fin</Label>
              <Input
                type="datetime-local"
                value={form.dateHeureFin}
                onChange={(e) => setForm({ ...form, dateHeureFin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANIFIE">Planifié</SelectItem>
                  <SelectItem value="REALISE">Réalisé</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button disabled={saving} onClick={saveAppointment}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
