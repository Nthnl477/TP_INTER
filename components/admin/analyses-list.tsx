"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2 } from "lucide-react"

export function AdminAnalysesList() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [labs, setLabs] = useState<any[]>([])
  const [detail, setDetail] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    patient: "",
    prescripteur: "",
    laboratoire: "",
    datePrescription: "",
    statut: "PRESCRIT",
  })
  const statutLabels: Record<string, string> = {
    PRESCRIT: "Prescrit",
    EN_COURS: "En cours",
    VALIDE: "Validé",
    PLANIFIE: "Planifié",
    ANNULE: "Annulé",
  }

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch("/api/analyses")
        const data = await res.json()
        setAnalyses(data.data || [])
      } catch (error) {
        console.error("Error fetching analyses:", error)
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

    const fetchEtablissements = async () => {
      try {
        const res = await fetch("/api/etablissements")
        const data = await res.json()
        setLabs((data.data || []).filter((e: any) => e.typeEtablissement === "LABORATOIRE"))
      } catch (error) {
        console.error("Error fetching labs:", error)
      }
    }

    fetchAnalyses()
    fetchPatients()
    fetchProfessionals()
    fetchEtablissements()
  }, [])

  const resetForm = () =>
    setForm({
      patient: "",
      prescripteur: "",
      laboratoire: "",
      datePrescription: "",
      statut: "PRESCRIT",
    })

  const saveAnalysis = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          datePrescription: form.datePrescription ? new Date(form.datePrescription) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création")
      setAnalyses((prev) => [...prev, data.data])
      setModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error creating analysis:", error)
      alert((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAnalysis = async (id: string) => {
    if (!confirm("Supprimer cette analyse ?")) return
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Suppression impossible")
      setAnalyses((prev) => prev.filter((a) => a._id !== id))
    } catch (error) {
      console.error("Error deleting analysis:", error)
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

  const selectedLab = labs.find((lab) => lab._id === form.laboratoire)

  return (
    <div className="overflow-x-auto">
      {analyses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune analyse trouvée
          <div className="mt-4">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une analyse
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle analyse
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Prescripteur</TableHead>
                <TableHead>Laboratoire</TableHead>
                <TableHead>Date prescription</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.map((analysis) => (
                <TableRow key={analysis._id}>
                  <TableCell className="font-medium">
                    {analysis.patient?.prenom} {analysis.patient?.nom}
                  </TableCell>
                  <TableCell>
                    {analysis.prescripteur?.utilisateur?.prenom} {analysis.prescripteur?.utilisateur?.nom}
                  </TableCell>
                  <TableCell>
                    {analysis.laboratoire?.nom}
                    {analysis.laboratoire?.codeNOS ? ` (NOS ${analysis.laboratoire.codeNOS})` : ""}
                  </TableCell>
                  <TableCell>{new Date(analysis.datePrescription).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                  <Badge variant="outline">{statutLabels[analysis.statut] || analysis.statut}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetail(analysis)}>
                      Détail
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteAnalysis(analysis._id)}>
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
            <DialogTitle>Créer une analyse</DialogTitle>
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
              <Label>Prescripteur</Label>
              <Select
                value={form.prescripteur}
                onValueChange={(value) => setForm({ ...form, prescripteur: value })}
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
              <Label>Laboratoire</Label>
              <Select
                value={form.laboratoire}
                onValueChange={(value) => setForm({ ...form, laboratoire: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un laboratoire" />
                </SelectTrigger>
                <SelectContent>
                  {labs.map((lab) => (
                    <SelectItem key={lab._id} value={lab._id}>
                      {lab.nom}
                      {lab.codeNOS ? ` (NOS ${lab.codeNOS})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {selectedLab?.codeNOS ? `Code NOS du laboratoire sélectionné : ${selectedLab.codeNOS}` : "Le code NOS s'affichera après sélection."}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Date de prescription</Label>
              <Input
                type="date"
                value={form.datePrescription}
                onChange={(e) => setForm({ ...form, datePrescription: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESCRIT">Prescrit</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="VALIDE">Validé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button disabled={saving} onClick={saveAnalysis}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(open) => setDetail(open ? detail : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {detail?.patient?.prenom} {detail?.patient?.nom} — {detail?.laboratoire?.nom}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Prescripteur</span>
                <span className="font-medium">
                  {detail.prescripteur?.utilisateur?.prenom} {detail.prescripteur?.utilisateur?.nom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date prescription</span>
                <span className="font-medium">
                  {new Date(detail.datePrescription).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Code NOS</span>
                <span className="font-medium">
                  {detail.laboratoire?.codeNOS ? `NOS ${detail.laboratoire.codeNOS}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className="font-medium">{statutLabels[detail.statut] || detail.statut}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Examens</span>
                <ul className="list-disc list-inside text-gray-800">
                  {(detail.examens || []).map((ex: any, idx: number) => (
                    <li key={idx}>
                      {ex.libelle} ({ex.codeTest}) — {ex.valeur} {ex.unite}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetail(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
