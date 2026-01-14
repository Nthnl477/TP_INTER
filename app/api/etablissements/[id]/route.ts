import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Etablissement } from "@/lib/db/models/Etablissement"
import { isAdmin, isSecretary } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException, NotFoundException } from "@/lib/api/error-handler"

// PATCH /api/etablissements/[id] - Update facility
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    if (!isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Only admin or secretariat can update facilities")
    }

    await connectToDatabase()

    const body = await request.json()
    const etablissement = await Etablissement.findById(id)
    if (!etablissement) {
      throw new NotFoundException("Etablissement not found")
    }

    if (body.nom !== undefined) etablissement.nom = body.nom
    if (body.typeEtablissement !== undefined) etablissement.typeEtablissement = body.typeEtablissement
    if (body.codeNOS !== undefined) etablissement.codeNOS = body.codeNOS
    if (body.adresseSimplifiee !== undefined) etablissement.adresseSimplifiee = body.adresseSimplifiee

    await etablissement.save()

    return successResponse(etablissement)
  } catch (error) {
    return handleApiError(error)
  }
}
