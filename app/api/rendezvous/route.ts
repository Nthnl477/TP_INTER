import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { RendezVous } from "@/lib/db/models/RendezVous"
import { Patient } from "@/lib/db/models/Patient"
import "@/lib/db/models/ProfessionnelDeSante"
import { isAdmin, isSecretary, getMongoUserIdFromKeycloak, isProfessionalInCircleOfCare } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/rendezvous - List appointments
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    let appointments: any

    if (isAdmin(auth) || isSecretary(auth)) {
      // Admin and Secretary see all appointments
      appointments = await RendezVous.find()
        .populate("patient")
        .populate("professionnel")
        .populate("creePar", "email nom prenom")
    } else if (auth.roles.includes("ROLE_MEDECIN") || auth.roles.includes("ROLE_INFIRMIER")) {
      // Healthcare professionals see their appointments
      appointments = await RendezVous.find({ professionnel: mongoUserId })
        .populate("patient")
        .populate("professionnel")
        .populate("creePar", "email nom prenom")
    } else {
      // Patients see their own appointments
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        appointments = await RendezVous.find({ patient: patient._id })
          .populate("patient")
          .populate("professionnel")
          .populate("creePar", "email nom prenom")
      } else {
        appointments = []
      }
    }

    return successResponse(appointments)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/rendezvous - Create appointment
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    // Only admin, secretary, and healthcare professionals can create appointments
    if (
      !isAdmin(auth) &&
      !isSecretary(auth) &&
      !auth.roles.includes("ROLE_MEDECIN") &&
      !auth.roles.includes("ROLE_INFIRMIER")
    ) {
      throw new Error("Forbidden: Cannot create appointments")
    }

    await connectToDatabase()

    const body = await request.json()
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    if (!body.patient || !body.professionnel || !body.dateHeureDebut || !body.type) {
      throw new BadRequestException("Missing required fields")
    }

    // Verify patient exists and professional is in circle of care
    const isInCircle = await isProfessionalInCircleOfCare(body.patient, body.professionnel)
    if (!isInCircle && !isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Professional not in patient circle of care")
    }

    const appointment = new RendezVous({
      ...body,
      dateHeureDebut: new Date(body.dateHeureDebut),
      dateHeureFin: new Date(body.dateHeureFin),
      creePar: mongoUserId,
    })

    await appointment.save()

    const populatedAppointment = await appointment
      .populate("patient")
      .populate("professionnel")
      .populate("creePar", "email nom prenom")

    return successResponse(populatedAppointment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
