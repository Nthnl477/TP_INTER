import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Patient } from "@/lib/db/models/Patient"
import { isAdmin, isSecretary, isHealthcareProfessional, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/patients - List patients
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    let patients: any

    if (isAdmin(auth) || isSecretary(auth)) {
      // Admin and Secretary can see all patients
      patients = await Patient.find()
        .populate("utilisateur", "email nom prenom")
        .populate("professionnelsDuCercleDeSoin", "email nom prenom")
    } else if (isHealthcareProfessional(auth)) {
      // Healthcare professionals can see patients in their circle of care
      const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
      patients = await Patient.find({
        professionnelsDuCercleDeSoin: mongoUserId,
      })
        .populate("utilisateur", "email nom prenom")
        .populate("professionnelsDuCercleDeSoin", "email nom prenom")
    } else {
      // Patients can only see their own data (through specific endpoint)
      let mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
      // Fallback: resolve user by email if not synchronized
      if (!mongoUserId && auth.email) {
        const userDoc = await Patient.db.model("User").findOne({ email: auth.email }).select("_id")
        mongoUserId = userDoc?._id?.toString() || null
      }
      const patientData = await Patient.findOne({ utilisateur: mongoUserId })
        .populate("utilisateur", "email nom prenom")
        .populate("professionnelsDuCercleDeSoin", "email nom prenom")

      patients = patientData ? [patientData] : []
    }

    return successResponse(patients)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/patients - Create patient
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    // Only admin and secretary can create patients
    if (!isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Only admin and secretary can create patients")
    }

    await connectToDatabase()

    const body = await request.json()

    // Validate required fields
    if (!body.identifiantPatientLocal || !body.nom || !body.prenom || !body.dateNaissance || !body.sexe) {
      throw new BadRequestException("Missing required fields")
    }

    // Create patient
    const patient = new Patient({
      ...body,
      dateNaissance: new Date(body.dateNaissance),
      coordonnees: body.coordonnees || {},
    })

    await patient.save()

    const populatedPatient = await patient.populate("utilisateur", "email nom prenom")

    return successResponse(populatedPatient, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
