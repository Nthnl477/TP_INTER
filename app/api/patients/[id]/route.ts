import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Patient } from "@/lib/db/models/Patient"
import { getMongoUserIdFromKeycloak, canAccessPatient } from "@/lib/api/authorization"
import { handleApiError, successResponse, NotFoundException } from "@/lib/api/error-handler"

// GET /api/patients/[id] - Get patient detail
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    await connectToDatabase()

    // Check authorization
    const canAccess = await canAccessPatient(auth, id)
    if (!canAccess) {
      throw new Error("Forbidden: Cannot access this patient")
    }

    const patient = await Patient.findById(id)
      .populate("utilisateur", "email nom prenom")
      .populate("professionnelsDuCercleDeSoin", "email nom prenom")

    if (!patient) {
      throw new NotFoundException("Patient not found")
    }

    return successResponse(patient)
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/patients/[id] - Update patient
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    await connectToDatabase()

    // Check authorization (only admin, secretary, or the patient themselves)
    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    const patient = await Patient.findById(id)

    if (!patient) {
      throw new NotFoundException("Patient not found")
    }

    // Allow if: admin, secretary, or the patient themselves
    const isOwnData = patient.utilisateur.toString() === mongoUserId
    if (
      !isOwnData &&
      auth.roles.includes("ROLE_ADMIN") === false &&
      auth.roles.includes("ROLE_SECRETARIAT") === false
    ) {
      throw new Error("Forbidden: Cannot update this patient")
    }

    const body = await request.json()

    // Update allowed fields
    if (body.coordonnees) {
      patient.coordonnees = { ...patient.coordonnees, ...body.coordonnees }
    }

    if (body.professionnelsDuCercleDeSoin) {
      patient.professionnelsDuCercleDeSoin = body.professionnelsDuCercleDeSoin
    }

    await patient.save()

    const updatedPatient = await patient.populate("utilisateur", "email nom prenom")

    return successResponse(updatedPatient)
  } catch (error) {
    return handleApiError(error)
  }
}
