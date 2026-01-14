import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"
import { User } from "@/lib/db/models/User"
import { isAdmin, isSecretary } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException, NotFoundException } from "@/lib/api/error-handler"

// PATCH /api/professionnels/[id] - Update health professional
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    if (!isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Only admin or secretariat can update professionals")
    }

    await connectToDatabase()

    const body = await request.json()
    const professionnel = await ProfessionnelDeSante.findById(id)
    if (!professionnel) {
      throw new NotFoundException("Professional not found")
    }

    if (body.utilisateur) {
      const user = await User.findById(body.utilisateur)
      if (!user) {
        throw new BadRequestException("Referenced user not found")
      }
      professionnel.utilisateur = body.utilisateur
    }
    if (body.type) professionnel.type = body.type
    if (body.specialite !== undefined) professionnel.specialite = body.specialite
    if (body.rpps !== undefined) professionnel.rpps = body.rpps
    if (body.etablissement) professionnel.etablissement = body.etablissement

    await professionnel.save()

    const populated = await professionnel.populate([
      { path: "utilisateur", select: "email nom prenom role" },
      { path: "etablissement" },
    ])

    return successResponse(populated)
  } catch (error) {
    return handleApiError(error)
  }
}
