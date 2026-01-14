import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { Patient } from "@/lib/db/models/Patient"
import { isAdmin, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"
import { FhirResource } from "@/lib/db/models/FhirResource"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

async function loadAnalyses(auth: any) {
  await connectToDatabase()
  const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

  if (isAdmin(auth)) {
    return AnalyseBiologique.find()
      .populate("patient")
      .populate({ path: "prescripteur", populate: "utilisateur" })
      .populate("laboratoire")
  }

  if (!mongoUserId) return []

  const patient = await Patient.findOne({ utilisateur: mongoUserId })
  if (patient) {
    return AnalyseBiologique.find({ patient: patient._id })
      .populate("patient")
      .populate({ path: "prescripteur", populate: "utilisateur" })
      .populate("laboratoire")
  }

  const patientsInCircle = await Patient.find({ professionnelsDuCercleDeSoin: mongoUserId }).select("_id")
  const patientIds = patientsInCircle.map((p) => p._id)
  return AnalyseBiologique.find({ patient: { $in: patientIds } })
    .populate("patient")
    .populate({ path: "prescripteur", populate: "utilisateur" })
    .populate("laboratoire")
}

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()
    const analyses = await loadAnalyses(auth)
    await connectToDatabase()
    const stored = await FhirResource.find({ resourceType: "Observation" }).lean()

    const loincMap: Record<string, { code: string; display: string }> = {
      "BIO-TSH": { code: "3016-3", display: "Thyrotropin [Units/volume] in Serum or Plasma" },
      "BIO-T3L": { code: "3051-0", display: "Triiodothyronine (T3) Free [Mass/volume] in Serum or Plasma" },
      "BIO-T4L": { code: "3024-7", display: "Thyroxine (T4) Free [Mass/volume] in Serum or Plasma" },
      "BIO-LDL": { code: "18262-6", display: "Cholesterol in LDL [Mass/volume] in Serum or Plasma" },
      "BIO-HDL": { code: "2085-9", display: "Cholesterol in HDL [Mass/volume] in Serum or Plasma" },
      "BIO-CHOLTOTAL": { code: "2093-3", display: "Cholesterol total [Mass/volume] in Serum or Plasma" },
      "BIO-HBA1C": { code: "4548-4", display: "Hemoglobin A1c/Hemoglobin.total in Blood" },
      "BIO-GLYC": { code: "2345-7", display: "Glucose [Mass/volume] in Serum or Plasma" },
      "BIO-CRP": { code: "1988-5", display: "C reactive protein [Mass/volume] in Serum or Plasma" },
      "BIO-FIBRIN": { code: "3255-7", display: "Fibrinogen [Mass/volume] in Platelet poor plasma" },
      "BIO-HB": { code: "718-7", display: "Hemoglobin [Mass/volume] in Blood" },
      "BIO-PLAQ": { code: "26515-7", display: "Platelets [#/volume] in Blood" },
      "BIO-GB": { code: "6690-2", display: "Leukocytes [#/volume] in Blood" },
    }

    const entries: any[] = []

    analyses.forEach((analysis) => {
      const obsStatus = analysis.statut === "VALIDE" ? "final" : "preliminary"
      const patientRef = {
        reference: `Patient/${analysis.patient?._id ?? "unknown"}`,
        display: `${analysis.patient?.prenom ?? ""} ${analysis.patient?.nom ?? ""}`.trim(),
      }
      const orgRef = analysis.laboratoire
        ? { reference: `Organization/${analysis.laboratoire._id}`, display: analysis.laboratoire.nom }
        : undefined

      ;(analysis.examens || []).forEach((ex: any, idx: number) => {
        const obsId = `obs-${analysis._id}-${idx}`
        const quantityValue = ex.valeur !== undefined ? Number(ex.valeur) : undefined
        const loinc = loincMap[ex.codeTest]

        entries.push({
          resource: {
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
            basedOn: [{ reference: `ServiceRequest/sr-${analysis._id}` }],
          },
        })
      })
    })

    const storedEntries = stored.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))

    return successResponse({
      resourceType: "Bundle",
      type: "collection",
      total: entries.length + storedEntries.length,
      entry: [...entries, ...storedEntries],
    })
  } catch (error: any) {
    const message = error?.message || "Unknown error"
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: message }] },
      { status },
    )
  }
}

// POST /api/fhir/observations - store a raw Observation
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "Observation") {
      throw new BadRequestException("resourceType must be Observation")
    }
    const created = await FhirResource.create({ resourceType: "Observation", resource: body })
    return successResponse({ ...body, id: created._id.toString() }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
