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
    const stored = await FhirResource.find({ resourceType: "DiagnosticReport" }).lean()

    const entries = analyses.map((analysis) => {
      const obsStatus = analysis.statut === "VALIDE" ? "final" : "partial"
      const srId = `sr-${analysis._id}`
      const drId = `dr-${analysis._id}`

      const patientRef = {
        reference: `Patient/${analysis.patient?._id ?? "unknown"}`,
        display: `${analysis.patient?.prenom ?? ""} ${analysis.patient?.nom ?? ""}`.trim(),
      }
      const orgRef = analysis.laboratoire
        ? { reference: `Organization/${analysis.laboratoire._id}`, display: analysis.laboratoire.nom }
        : undefined

      return {
        resource: {
          resourceType: "DiagnosticReport",
          id: drId,
          status: obsStatus,
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
          basedOn: [{ reference: `ServiceRequest/${srId}` }],
          result: (analysis.examens || []).map((_, idx: number) => ({ reference: `Observation/obs-${analysis._id}-${idx}` })),
        },
      }
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

// POST /api/fhir/diagnosticreports - store raw DiagnosticReport
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "DiagnosticReport") {
      throw new BadRequestException("resourceType must be DiagnosticReport")
    }
    const created = await FhirResource.create({ resourceType: "DiagnosticReport", resource: body })
    return successResponse({ ...body, id: created._id.toString() }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
