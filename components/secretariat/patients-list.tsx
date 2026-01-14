"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"

export function SecretariatPatientsList() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

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
        <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un patient</DialogTitle>
              <DialogDescription>
                La création de patients se fait via Keycloak (compte + rôle PATIENT), puis première connexion pour
                synchronisation dans la base. Aucun ajout direct n&apos;est disponible depuis cette interface.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setInfoOpen(false)}>Compris</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setDetailOpen(true)
                        }}
                      >
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPatient?.prenom} {selectedPatient?.nom}
            </DialogTitle>
            <DialogDescription>Informations du dossier patient</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Identifiant local</span>
                <span className="font-medium">{selectedPatient.identifiantPatientLocal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date de naissance</span>
                <span className="font-medium">
                  {new Date(selectedPatient.dateNaissance).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">INS</span>
                <span className="font-medium">{selectedPatient.ins || "—"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600">Cercle de soins</span>
                <ul className="list-disc list-inside text-gray-800">
                  {(selectedPatient.professionnelsDuCercleDeSoin || []).map((pro: any) => (
                    <li key={pro._id || pro}>
                      {pro.prenom || pro.utilisateur?.prenom} {pro.nom || pro.utilisateur?.nom}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
