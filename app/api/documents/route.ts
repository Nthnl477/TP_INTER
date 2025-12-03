import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { DocumentClinique } from "@/lib/db/models/DocumentClinique"
import { Patient } from "@/lib/db/models/Patient"
import { isAdmin, getMongoUserIdFromKeycloak, canAccessPatient } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/documents - List clinical documents
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    let documents: any

    if (isAdmin(auth)) {
      documents = await DocumentClinique.find().populate("patient").populate("auteur")
    } else {
      // Get patient's documents accessible to user
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        documents = await DocumentClinique.find({ patient: patient._id }).populate("patient").populate("auteur")
      } else {
        // Professional or secretary - get documents for their patients
        documents = await DocumentClinique.find().populate("patient").populate("auteur")
      }
    }

    return successResponse(documents)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/documents - Create clinical document
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    // Only professionals can create documents
    if (!auth.roles.includes("ROLE_MEDECIN") && !auth.roles.includes("ROLE_INFIRMIER") && !isAdmin(auth)) {
      throw new Error("Forbidden: Only healthcare professionals can create documents")
    }

    await connectToDatabase()

    const body = await request.json()
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    if (!body.patient || !body.typeDocument || !body.titre || !body.contenuTexte) {
      throw new BadRequestException("Missing required fields")
    }

    // Verify authorization to create document for this patient
    const canAccess = await canAccessPatient(auth, body.patient)
    if (!canAccess) {
      throw new Error("Forbidden: Cannot create document for this patient")
    }

    const document = new DocumentClinique({
      ...body,
      auteur: mongoUserId,
    })

    await document.save()

    const populatedDocument = await document.populate("patient").populate("auteur")

    return successResponse(populatedDocument, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
