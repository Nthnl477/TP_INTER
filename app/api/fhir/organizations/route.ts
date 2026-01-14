import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Etablissement } from "@/lib/db/models/Etablissement"
import { isAdmin, isSecretary, isHealthcareProfessional } from "@/lib/api/authorization"
import { FhirResource } from "@/lib/db/models/FhirResource"
import { handleApiError, successResponse, BadRequestException } from "@/lib/api/error-handler"

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()

    if (!isAdmin(auth) && !isSecretary(auth) && !isHealthcareProfessional(auth)) {
      throw new Error("Unauthorized")
    }

    await connectToDatabase()
    const orgs = await Etablissement.find()

    const entries = orgs.map((org) => {
      const identifier =
        org.codeNOS != null
          ? [
              {
                system: "https://ans.gouv.fr/nos",
                value: org.codeNOS,
              },
            ]
          : [
              {
                system: "https://example.org/fhir/CodeSystem/nos-placeholder",
                value: "NOS-UNKNOWN",
              },
            ]

      return {
        resource: {
          resourceType: "Organization",
          id: org._id.toString(),
          identifier,
          name: org.nom,
          type: [
            {
              coding: [
                {
                  system: org.codeNOS ? "https://ans.gouv.fr/nos" : "https://example.org/fhir/CodeSystem/nos-placeholder",
                  code: org.codeNOS || "NOS-UNKNOWN",
                  display: org.codeNOS ? "Code NOS" : "Code NOS non renseigné",
                },
              ],
            },
          ],
          address: org.adresseSimplifiee ? [{ text: org.adresseSimplifiee }] : undefined,
        },
      }
    })

    const stored = await FhirResource.find({ resourceType: "Organization" }).lean()
    const storedEntries = stored.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))

    return successResponse({
      resourceType: "Bundle",
      type: "collection",
      total: entries.length + storedEntries.length,
      entry: [...entries, ...storedEntries],
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "Organization") throw new BadRequestException("resourceType must be Organization")
    const created = await FhirResource.create({ resourceType: "Organization", resource: body })
    return successResponse({ ...body, id: created._id.toString() }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "Organization" || !body.id)
      throw new BadRequestException("resourceType Organization with id required")
    const updated = await FhirResource.findOneAndUpdate(
      { _id: body.id, resourceType: "Organization" },
      { resource: body },
      { upsert: true, new: true },
    )
    return successResponse({ ...body, id: updated._id.toString() })
  } catch (error) {
    return handleApiError(error)
  }
}
