import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"
import { Patient } from "@/lib/db/models/Patient"
import {
  isAdmin,
  getMongoUserIdFromKeycloak,
  isProfessionalInCircleOfCare,
} from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/analyses - List biological analyses
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    let analyses: any

    if (isAdmin(auth)) {
      analyses = await AnalyseBiologique.find().populate("patient").populate("prescripteur").populate("laboratoire")
    } else {
      const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
      if (!mongoUserId) {
        return successResponse([])
      }

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

    return successResponse(analyses)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/analyses - Create analysis prescription
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    // Only professionals can prescribe analyses
    if (!auth.roles.includes("ROLE_MEDECIN") && !auth.roles.includes("ROLE_INFIRMIER") && !isAdmin(auth)) {
      throw new Error("Forbidden: Only healthcare professionals can prescribe analyses")
    }

    await connectToDatabase()

    const body = await request.json()
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    if (!body.patient || !body.laboratoire || !body.datePrescription) {
      throw new BadRequestException("Missing required fields")
    }

    const connectedProfessional =
      mongoUserId ? await ProfessionnelDeSante.findOne({ utilisateur: mongoUserId }) : null
    const prescripteurId = body.prescripteur || connectedProfessional?._id
    if (!prescripteurId) {
      throw new BadRequestException(
        "Prescripteur requis : sélectionnez un professionnel ou synchronisez l'utilisateur",
      )
    }

    // Authorization: admin can always create; otherwise professional must be in patient's circle of care
    if (!isAdmin(auth)) {
      const isInCircle = await isProfessionalInCircleOfCare(body.patient, prescripteurId.toString())
      if (!isInCircle) {
        throw new Error("Forbidden: Professional not in patient circle of care")
      }
    }

    const analysis = new AnalyseBiologique({
      ...body,
      datePrescription: new Date(body.datePrescription),
      prescripteur: prescripteurId,
    })

    await analysis.save()

    await analysis.populate([{ path: "patient" }, { path: "prescripteur" }, { path: "laboratoire" }])
    const populatedAnalysis = analysis

    return successResponse(populatedAnalysis, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
