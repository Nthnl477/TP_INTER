import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { RendezVous } from "@/lib/db/models/RendezVous"
import { getMongoUserIdFromKeycloak, isAdmin, isSecretary } from "@/lib/api/authorization"
import { handleApiError, successResponse, NotFoundException } from "@/lib/api/error-handler"

// PATCH /api/rendezvous/[id] - Update appointment status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    await connectToDatabase()

    const appointment = await RendezVous.findById(id)
    if (!appointment) {
      throw new NotFoundException("Appointment not found")
    }

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)

    // Check authorization
    const canUpdate = isAdmin(auth) || isSecretary(auth) || appointment.professionnel.toString() === mongoUserId

    if (!canUpdate) {
      throw new Error("Forbidden: Cannot update this appointment")
    }

    const body = await request.json()

    if (body.statut) {
      appointment.statut = body.statut
    }

    await appointment.save()

    const updatedAppointment = await appointment
      .populate("patient")
      .populate("professionnel")
      .populate("creePar", "email nom prenom")

    return successResponse(updatedAppointment)
  } catch (error) {
    return handleApiError(error)
  }
}
