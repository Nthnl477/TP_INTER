import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { RendezVous } from "@/lib/db/models/RendezVous"
import { Patient } from "@/lib/db/models/Patient"
import { User } from "@/lib/db/models/User"
import "@/lib/db/models/ProfessionnelDeSante"
import { isAdmin, isSecretary, getMongoUserIdFromKeycloak, isProfessionalInCircleOfCare } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"
import { notifySubscribers } from "@/lib/fhir/notify"

// GET /api/rendezvous - List appointments
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    let mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    // Fallback: resolve user by email if not synchronized
    if (!mongoUserId && auth.email) {
      const userDoc = await User.findOne({ email: auth.email }).select("_id")
      mongoUserId = userDoc?._id?.toString() || null
    }
    const { searchParams } = new URL(request.url)
    const patientFilterId = searchParams.get("patientId")
    let appointments: any

    if (isAdmin(auth) || isSecretary(auth)) {
      // Admin and Secretary see all appointments
      const query = patientFilterId ? { patient: patientFilterId } : {}
      appointments = await RendezVous.find(query)
        .populate("patient")
        .populate({ path: "professionnel", populate: "utilisateur" })
        .populate("creePar", "email nom prenom")
    } else if (auth.roles.includes("ROLE_MEDECIN") || auth.roles.includes("ROLE_INFIRMIER")) {
      // Healthcare professionals see their appointments (resolve professional doc from user)
      const professional = await Patient.db.model("ProfessionnelDeSante").findOne({ utilisateur: mongoUserId })
      const professionalId = professional?._id
      if (!professionalId) {
        appointments = []
      } else {
        // if patient filter provided, ensure access to circle of care
        if (patientFilterId) {
          const inCircle = await isProfessionalInCircleOfCare(patientFilterId, mongoUserId!)
          if (!inCircle) {
            throw new Error("Forbidden: Professional not in patient circle of care")
          }
        }
        const query: any = { professionnel: professionalId }
        if (patientFilterId) query.patient = patientFilterId
        appointments = await RendezVous.find(query)
          .populate("patient")
          .populate({ path: "professionnel", populate: "utilisateur" })
          .populate("creePar", "email nom prenom")
      }
    } else {
      // Patients see their own appointments
      const patient = await Patient.findOne({ utilisateur: mongoUserId })
      if (patient) {
        // If a patientId filter is provided but doesn't match own id, forbid
        if (patientFilterId && patientFilterId !== patient._id.toString()) {
          throw new Error("Forbidden: Cannot access other patient's appointments")
        }
        appointments = await RendezVous.find({ patient: patient._id })
          .populate("patient")
          .populate({ path: "professionnel", populate: "utilisateur" })
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

    await notifySubscribers("Appointment", populatedAppointment)
    return successResponse(populatedAppointment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
