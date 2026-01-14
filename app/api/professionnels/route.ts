import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { ProfessionnelDeSante } from "@/lib/db/models/ProfessionnelDeSante"
import { User } from "@/lib/db/models/User"
import { isAdmin, isSecretary, getMongoUserIdFromKeycloak } from "@/lib/api/authorization"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

// GET /api/professionnels - List health professionals
export async function GET() {
  try {
    const auth = await requireAuth()

    // Patients cannot list professionals
    if (!isAdmin(auth) && !isSecretary(auth) && !auth.roles.includes("ROLE_MEDECIN") && !auth.roles.includes("ROLE_INFIRMIER")) {
      throw new Error("Forbidden: insufficient rights")
    }

    await connectToDatabase()

    let query = {}
    // Professionals only see themselves
    if (auth.roles.includes("ROLE_MEDECIN") || auth.roles.includes("ROLE_INFIRMIER")) {
      const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
      if (mongoUserId) {
        query = { utilisateur: mongoUserId }
      }
    }

    const professionnels = await ProfessionnelDeSante.find(query)
      .populate("utilisateur", "email nom prenom role")
      .populate("etablissement")

    return successResponse(professionnels)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/professionnels - Register a health professional
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!isAdmin(auth) && !isSecretary(auth)) {
      throw new Error("Forbidden: Only admin or secretariat can create professionals")
    }

    await connectToDatabase()

    const body = await request.json()
    const { utilisateur, type, specialite, rpps, etablissement } = body

    if (!utilisateur || !type || !specialite || !etablissement) {
      throw new BadRequestException("Missing required fields")
    }

    const user = await User.findById(utilisateur)
    if (!user) {
      throw new BadRequestException("Referenced user not found")
    }

    const professionnel = await ProfessionnelDeSante.create({
      utilisateur,
      type,
      specialite,
      rpps,
      etablissement,
    })

    const populated = await professionnel.populate([
      { path: "utilisateur", select: "email nom prenom role" },
      { path: "etablissement" },
    ])

    return successResponse(populated, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
