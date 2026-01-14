import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Etablissement } from "@/lib/db/models/Etablissement"
import { isAdmin, isSecretary } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/etablissements - List facilities
export async function GET() {
  try {
    const auth = await requireAuth()

    // Patients should not browse facilities list
    if (!isAdmin(auth) && !isSecretary(auth) && !auth.roles.includes("ROLE_MEDECIN") && !auth.roles.includes("ROLE_INFIRMIER")) {
      throw new Error("Forbidden: insufficient rights")
    }

    await connectToDatabase()
    const etablissements = await Etablissement.find()

    return successResponse(etablissements)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/etablissements - Create facility
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Only admin or secretariat can create facilities")
    }

    await connectToDatabase()

    const body = await request.json()
    const { nom, typeEtablissement, codeNOS, adresseSimplifiee } = body

    if (!nom || !typeEtablissement) {
      throw new BadRequestException("Missing required fields")
    }

    const etablissement = await Etablissement.create({
      nom,
      typeEtablissement,
      codeNOS,
      adresseSimplifiee,
    })

    return successResponse(etablissement, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
