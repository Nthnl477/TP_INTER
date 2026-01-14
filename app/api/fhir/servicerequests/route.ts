import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { Patient } from "@/lib/db/models/Patient"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"
import { Etablissement } from "@/lib/db/models/Etablissement"
import { isAdmin, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"
import { notifySubscribers } from "@/lib/fhir/notify"

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

    const entries = analyses.map((analysis) => {
      const srStatus =
        analysis.statut === "VALIDE"
          ? "completed"
          : analysis.statut === "EN_COURS"
            ? "active"
            : "active"

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

      return {
        resource: {
          resourceType: "ServiceRequest",
          id: `sr-${analysis._id}`,
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
        },
      }
    })

    return NextResponse.json(
      {
        resourceType: "Bundle",
        type: "collection",
        total: entries.length,
        entry: entries,
      },
      { status: 200 },
    )
  } catch (error: any) {
    const message = error?.message || "Unknown error"
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: message }] },
      { status },
    )
  }
}

// POST /api/fhir/servicerequests - create an analysis from FHIR ServiceRequest
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!isAdmin(auth) && !auth.roles.includes("ROLE_MEDECIN") && !auth.roles.includes("ROLE_INFIRMIER")) {
      throw new Error("Forbidden: Only healthcare professionals can create service requests")
    }

    await connectToDatabase()
    const body = await request.json()

    const subjectRef: string | undefined = body.subject?.reference
    const performerRef: string | undefined = body.performer?.[0]?.reference
    const authoredOn: string | undefined = body.authoredOn
    const examens: any[] = body.examens || [] // extension POC

    if (!subjectRef || !performerRef) {
      throw new BadRequestException("subject.reference (Patient/{id}) et performer[0].reference (Organization/{id}) sont requis")
    }

    const patientId = subjectRef.replace("Patient/", "")
    const labId = performerRef.replace("Organization/", "")

    // Resolve prescripteur from connected professional
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    const prescripteur = await ProfessionnelDeSante.findOne({ utilisateur: mongoUserId })
    if (!prescripteur) {
      throw new BadRequestException("Prescripteur introuvable pour l'utilisateur connecté")
    }

    // Validate patient and lab existence
    const patient = await Patient.findById(patientId)
    const lab = await Etablissement.findById(labId)
    if (!patient) throw new BadRequestException("Patient introuvable")
    if (!lab) throw new BadRequestException("Organisation (laboratoire) introuvable")

    const analysis = new AnalyseBiologique({
      patient: patientId,
      prescripteur: prescripteur._id,
      laboratoire: labId,
      datePrescription: authoredOn ? new Date(authoredOn) : new Date(),
      statut: "PRESCRIT",
      examens,
    })

    await analysis.save()
    const populated = await analysis.populate("patient").populate("prescripteur").populate("laboratoire")
    await notifySubscribers("ServiceRequest", populated)
    return successResponse(populated, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
