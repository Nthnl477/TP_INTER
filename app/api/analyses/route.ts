import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { Patient } from "@/lib/db/models/Patient"
import { isAdmin, getMongoUserIdFromKeycloak, canAccessPatient } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/analyses - List biological analyses
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    let analyses: any

    if (isAdmin(auth)) {
      analyses = await AnalyseBiologique.find().populate("patient").populate("prescripteur").populate("laboratoire")
    } else {
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        analyses = await AnalyseBiologique.find({ patient: patient._id })
          .populate("patient")
          .populate("prescripteur")
          .populate("laboratoire")
      } else {
        analyses = []
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

    // Verify authorization
    const canAccess = await canAccessPatient(auth, body.patient)
    if (!canAccess) {
      throw new Error("Forbidden: Cannot create analysis for this patient")
    }

    const analysis = new AnalyseBiologique({
      ...body,
      datePrescription: new Date(body.datePrescription),
      prescripteur: mongoUserId,
    })

    await analysis.save()

    const populatedAnalysis = await analysis.populate("patient").populate("prescripteur").populate("laboratoire")

    return successResponse(populatedAnalysis, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
