import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { Patient } from "@/lib/db/models/Patient"
import { isAdmin, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"

// Minimal FHIR Bundle exposing ServiceRequest, DiagnosticReport, Observation for each AnalyseBiologique
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    // Fetch analyses with same access rules as /api/analyses
    let analyses: any[] = []
    if (isAdmin(auth)) {
      analyses = await AnalyseBiologique.find().populate("patient").populate("prescripteur").populate("laboratoire")
    } else if (mongoUserId) {
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        analyses = await AnalyseBiologique.find({ patient: patient._id })
          .populate("patient")
          .populate("prescripteur")
          .populate("laboratoire")
      } else {
        const patientsInCircle = await Patient.find({ professionnelsDuCercleDeSoin: mongoUserId }).select("_id")
        const patientIds = patientsInCircle.map((p) => p._id)
        analyses = await AnalyseBiologique.find({ patient: { $in: patientIds } })
          .populate("patient")
          .populate("prescripteur")
          .populate("laboratoire")
      }
    }

    const entries: any[] = []

    for (const analysis of analyses) {
      const srId = `sr-${analysis._id}`
      const drId = `dr-${analysis._id}`

      const patientRef = {
        reference: `Patient/${analysis.patient?._id ?? "unknown"}`,
        display: `${analysis.patient?.prenom ?? ""} ${analysis.patient?.nom ?? ""}`.trim(),
      }
      const practitionerRef = analysis.prescripteur
        ? {
            reference: `Practitioner/${analysis.prescripteur._id}`,
            display: `${analysis.prescripteur.utilisateur?.prenom ?? ""} ${
              analysis.prescripteur.utilisateur?.nom ?? ""
            }`.trim(),
          }
        : undefined
      const orgRef = analysis.laboratoire
        ? { reference: `Organization/${analysis.laboratoire._id}`, display: analysis.laboratoire.nom }
        : undefined
      const orgIdentifier =
        analysis.laboratoire?.codeNOS != null
          ? [
              {
                system: "https://ans.gouv.fr/nos",
                value: analysis.laboratoire.codeNOS,
              },
            ]
          : undefined

      const srStatus =
        analysis.statut === "VALIDE" ? "completed" : analysis.statut === "EN_COURS" ? "active" : "active"

      const serviceRequest = {
        resourceType: "ServiceRequest",
        id: srId,
        status: srStatus,
        intent: "order",
        code: {
          coding: [
            {
              system: "https://example.org/fhir/CodeSystem/analysis-type",
              code: "LAB-BIO",
              display: "Prescription d'analyses biologiques",
            },
          ],
        },
        subject: patientRef,
        requester: practitionerRef,
        performer: orgRef ? [orgRef] : undefined,
        authoredOn: analysis.datePrescription?.toISOString(),
      }

      const obsStatus = analysis.statut === "VALIDE" ? "final" : "preliminary"
      const observations = (analysis.examens || []).map((ex: any, idx: number) => {
        const obsId = `obs-${analysis._id}-${idx}`
        const quantityValue = ex.valeur !== undefined ? Number(ex.valeur) : undefined

        return {
          resourceType: "Observation",
          id: obsId,
          status: obsStatus,
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/observation-category",
                  code: "laboratory",
                  display: "Laboratory",
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: "https://example.org/fhir/CodeSystem/lab-tests",
                code: ex.codeTest || `EX-${idx + 1}`,
                display: ex.libelle || "Examen",
              },
            ],
            text: ex.libelle,
          },
          subject: patientRef,
          performer: orgRef ? [orgRef] : undefined,
          effectiveDateTime: (analysis.dateResultat || analysis.datePrescription)?.toISOString(),
          valueQuantity:
            quantityValue || quantityValue === 0
              ? {
                  value: quantityValue,
                  unit: ex.unite || undefined,
                }
              : undefined,
          valueString: quantityValue || quantityValue === 0 ? undefined : ex.valeur,
          referenceRange: ex.intervalleReference
            ? [
                {
                  text: ex.intervalleReference,
                },
              ]
            : undefined,
          interpretation: ex.interpretation
            ? [
                {
                  text: ex.interpretation,
                },
              ]
            : undefined,
          basedOn: [{ reference: `ServiceRequest/${srId}` }],
        }
      })

      const diagnosticReport = {
        resourceType: "DiagnosticReport",
        id: drId,
        status: obsStatus,
        code: {
          coding: [
            {
              system: "https://example.org/fhir/CodeSystem/report-type",
              code: "LAB-REPORT",
              display: "Compte-rendu d'analyses biologiques",
            },
          ],
        },
        subject: patientRef,
        performer: orgRef ? [orgRef] : undefined,
        issued: (analysis.dateResultat || analysis.datePrescription)?.toISOString(),
        result: observations.map((o) => ({ reference: `Observation/${o.id}` })),
        basedOn: [{ reference: `ServiceRequest/${srId}` }],
      }

      entries.push({ resource: serviceRequest })
      entries.push({ resource: diagnosticReport })
      observations.forEach((obs) => entries.push({ resource: obs }))
      if (orgRef) {
        entries.push({
          resource: {
            resourceType: "Organization",
            id: analysis.laboratoire._id.toString(),
            identifier: orgIdentifier,
            name: analysis.laboratoire.nom,
          },
        })
      }
      if (analysis.patient) {
        entries.push({
          resource: {
            resourceType: "Patient",
            id: analysis.patient._id.toString(),
            name: [{ family: analysis.patient.nom, given: [analysis.patient.prenom] }],
          },
        })
      }
      if (analysis.prescripteur) {
        entries.push({
          resource: {
            resourceType: "Practitioner",
            id: analysis.prescripteur._id.toString(),
            name: [
              {
                family: analysis.prescripteur.utilisateur?.nom,
                given: [analysis.prescripteur.utilisateur?.prenom].filter(Boolean),
              },
            ],
          },
        })
      }
    }

    const bundle = {
      resourceType: "Bundle",
      type: "collection",
      total: entries.length,
      entry: entries,
    }

    return NextResponse.json(bundle, { status: 200 })
  } catch (error: any) {
    console.error("FHIR analyses error", error)
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: error?.message || "Unknown error" }] },
      { status: 500 },
    )
  }
}
