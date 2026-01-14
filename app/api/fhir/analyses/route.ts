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
      analyses = await AnalyseBiologique.find()
        .populate("patient")
        .populate({ path: "prescripteur", populate: "utilisateur" })
        .populate("laboratoire")
    } else if (mongoUserId) {
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        analyses = await AnalyseBiologique.find({ patient: patient._id })
          .populate("patient")
          .populate({ path: "prescripteur", populate: "utilisateur" })
          .populate("laboratoire")
      } else {
        const patientsInCircle = await Patient.find({ professionnelsDuCercleDeSoin: mongoUserId }).select("_id")
        const patientIds = patientsInCircle.map((p) => p._id)
        analyses = await AnalyseBiologique.find({ patient: { $in: patientIds } })
          .populate("patient")
          .populate({ path: "prescripteur", populate: "utilisateur" })
          .populate("laboratoire")
      }
    }

    const resourcesMap = new Map<string, any>()

    for (const analysis of analyses) {
      const srId = `sr-${analysis._id}`
      const drId = `dr-${analysis._id}`

      const patientRef = {
        reference: `Patient/${analysis.patient?._id ?? "unknown"}`,
        display: `${analysis.patient?.prenom ?? ""} ${analysis.patient?.nom ?? ""}`.trim(),
      }
      const practitionerDisplay = `${analysis.prescripteur?.utilisateur?.prenom ?? ""} ${
        analysis.prescripteur?.utilisateur?.nom ?? ""
      }`.trim()
      const practitionerRef = analysis.prescripteur
        ? {
            reference: `Practitioner/${analysis.prescripteur._id}`,
            display: practitionerDisplay || undefined,
          }
        : undefined
      const orgRef = analysis.laboratoire
        ? { reference: `Organization/${analysis.laboratoire._id}`, display: analysis.laboratoire.nom }
        : undefined
      const orgIdentifier =
        analysis.laboratoire?.codeNOS
          ? [
              {
                system: "https://ans.gouv.fr/nos",
                value: analysis.laboratoire.codeNOS,
              },
            ]
          : [
              {
                system: "https://example.org/fhir/CodeSystem/nos-placeholder",
                value: "NOS-UNKNOWN",
              },
            ]

      const srStatus =
        analysis.statut === "VALIDE"
          ? "completed"
          : analysis.statut === "EN_COURS"
            ? "active"
            : "active"

      const serviceRequest = {
        resourceType: "ServiceRequest",
        id: srId,
        status: srStatus,
        intent: "order",
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "24320-4",
              display: "Problèmes/observations concernant le laboratoire",
            },
          ],
          text: "Prescription d'analyses biologiques",
        },
        subject: patientRef,
        requester: practitionerRef,
        performer: orgRef ? [orgRef] : undefined,
        authoredOn: analysis.datePrescription?.toISOString(),
      }

      const obsStatus = analysis.statut === "VALIDE" ? "final" : "preliminary"
      const drStatus = analysis.statut === "VALIDE" ? "final" : "partial"
      const loincMap: Record<string, { code: string; display: string }> = {
        // Thyroid panel
        "BIO-TSH": { code: "3016-3", display: "Thyrotropin [Units/volume] in Serum or Plasma" },
        "BIO-T3L": { code: "3051-0", display: "Triiodothyronine (T3) Free [Mass/volume] in Serum or Plasma" },
        "BIO-T4L": { code: "3024-7", display: "Thyroxine (T4) Free [Mass/volume] in Serum or Plasma" },
        // Lipids
        "BIO-LDL": { code: "18262-6", display: "Cholesterol in LDL [Mass/volume] in Serum or Plasma" },
        "BIO-HDL": { code: "2085-9", display: "Cholesterol in HDL [Mass/volume] in Serum or Plasma" },
        "BIO-CHOLTOTAL": { code: "2093-3", display: "Cholesterol total [Mass/volume] in Serum or Plasma" },
        // Glycemia
        "BIO-HBA1C": { code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
        "BIO-GLYC": { code: "2345-7", display: "Glucose [Mass/volume] in Serum or Plasma" },
        // Inflammation
        "BIO-CRP": { code: "1988-5", display: "C reactive protein [Mass/volume] in Serum or Plasma" },
        "BIO-FIBRIN": { code: "3255-7", display: "Fibrinogen [Mass/volume] in Platelet poor plasma" },
        // Hématologie
        "BIO-HB": { code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" },
        "BIO-PLAQ": { code: "26515-7", display: "Platelets [#/volume] in Blood" },
        "BIO-GB": { code: "6690-2", display: "Leukocytes [#/volume] in Blood" },
      }

      const observations = (analysis.examens || []).map((ex: any, idx: number) => {
        const obsId = `obs-${analysis._id}-${idx}`
        const quantityValue = ex.valeur !== undefined ? Number(ex.valeur) : undefined
        const loinc = loincMap[ex.codeTest]

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
                system: loinc ? "http://loinc.org" : "https://example.org/fhir/CodeSystem/lab-tests",
                code: loinc?.code || ex.codeTest || `EX-${idx + 1}`,
                display: loinc?.display || ex.libelle || "Examen de laboratoire (placeholder)",
              },
            ],
            text: loinc?.display || ex.libelle || "Examen de laboratoire (placeholder)",
          },
          subject: patientRef,
          performer: orgRef ? [orgRef] : undefined,
          effectiveDateTime: (analysis.dateResultat || analysis.datePrescription)?.toISOString(),
          valueQuantity:
            quantityValue || quantityValue === 0
              ? {
                  value: quantityValue,
                  unit: ex.unite || undefined,
                  system: ex.unite ? "http://unitsofmeasure.org" : undefined,
                  code: ex.unite || undefined,
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
        status: drStatus,
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "11502-2",
              display: "Laboratory report",
            },
          ],
          text: "Compte-rendu d'analyses biologiques",
        },
        subject: patientRef,
        performer: orgRef ? [orgRef] : undefined,
        issued: (analysis.dateResultat || analysis.datePrescription)?.toISOString(),
        result: observations.map((o) => ({ reference: `Observation/${o.id}` })),
        basedOn: [{ reference: `ServiceRequest/${srId}` }],
      }

      resourcesMap.set(serviceRequest.id, serviceRequest)
      resourcesMap.set(diagnosticReport.id, diagnosticReport)
      observations.forEach((obs) => resourcesMap.set(obs.id, obs))
      if (orgRef) {
        resourcesMap.set(analysis.laboratoire._id.toString(), {
          resourceType: "Organization",
          id: analysis.laboratoire._id.toString(),
          identifier: orgIdentifier,
          name: analysis.laboratoire.nom,
          type: [
            {
              coding: [
                {
                  system: analysis.laboratoire.codeNOS ? "https://ans.gouv.fr/nos" : "https://example.org/fhir/CodeSystem/nos-placeholder",
                  code: analysis.laboratoire.codeNOS || "NOS-UNKNOWN",
                  display: analysis.laboratoire.codeNOS ? "Code NOS" : "Code NOS non renseigné",
                },
              ],
            },
          ],
        })
      }
      if (analysis.patient) {
        resourcesMap.set(analysis.patient._id.toString(), {
          resourceType: "Patient",
          id: analysis.patient._id.toString(),
          name: [{ family: analysis.patient.nom, given: [analysis.patient.prenom] }],
        })
      }
      if (analysis.prescripteur) {
        resourcesMap.set(analysis.prescripteur._id.toString(), {
          resourceType: "Practitioner",
          id: analysis.prescripteur._id.toString(),
          name: [
            {
              family: analysis.prescripteur.utilisateur?.nom,
              given: [analysis.prescripteur.utilisateur?.prenom].filter(Boolean),
            },
          ],
        })
      }
    }

    const entries = Array.from(resourcesMap.values()).map((resource) => ({ resource }))

    const bundle = {
      resourceType: "Bundle",
      type: "collection",
      total: entries.length,
      entry: entries,
    }

    return NextResponse.json(bundle, { status: 200 })
  } catch (error: any) {
    console.error("FHIR analyses error", error)
    const message = error?.message || "Unknown error"
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: message }] },
      { status },
    )
  }
}
