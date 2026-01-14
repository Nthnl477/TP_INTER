import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { MessageInterne } from "@/lib/db/models/MessageInterne"
import { getMongoUserIdFromKeycloak, isAdmin, isSecretary, isProfessionalInCircleOfCare } from "@/lib/api/authorization"
import { Patient } from "@/lib/db/models/Patient"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/messages - Get messages for a patient or user
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    if (!mongoUserId) {
      throw new Error("Forbidden: user not synchronized")
    }

    let messages: any

    if (patientId) {
      // Verify access to the patient's messages
      let allowed = false
      const patient = await Patient.findById(patientId)
      if (patient) {
        const isOwnPatient = patient.utilisateur.toString() === mongoUserId
        const inCircle = await isProfessionalInCircleOfCare(patientId, mongoUserId!)
        allowed = isAdmin(auth) || isSecretary(auth) || isOwnPatient || inCircle
      }

      if (!allowed) {
        throw new Error("Forbidden: Cannot access messages for this patient")
      }

      messages = await MessageInterne.find({ dossierPatient: patientId })
        .populate("auteur", "email nom prenom")
        .populate("destinataires", "email nom prenom")
        .sort({ dateEnvoi: -1 })
    } else {
      // Get messages for user
      messages = await MessageInterne.find({
        $or: [{ auteur: mongoUserId }, { destinataires: mongoUserId }],
      })
        .populate("auteur", "email nom prenom")
        .populate("destinataires", "email nom prenom")
        .sort({ dateEnvoi: -1 })
    }

    return successResponse(messages)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    const body = await request.json()
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    if (!body.dossierPatient || !body.contenu || !body.destinataires) {
      throw new BadRequestException("Missing required fields")
    }

    const message = new MessageInterne({
      dossierPatient: body.dossierPatient,
      auteur: mongoUserId,
      destinataires: body.destinataires,
      contenu: body.contenu,
      dateEnvoi: new Date(),
      luPar: [],
    })

    await message.save()

    const populatedMessage = await message
      .populate("auteur", "email nom prenom")
      .populate("destinataires", "email nom prenom")

    return successResponse(populatedMessage, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
