import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { Patient } from "@/lib/db/models/Patient"
import { FhirResource } from "@/lib/db/models/FhirResource"
import { isAdmin, getMongoUserIdFromKeycloak, isSecretary } from "@/lib/api/authorization"
import { handleApiError, BadRequestException, successResponse } from "@/lib/api/error-handler"

export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth()
    await connectToDatabase()

    if (isAdmin(auth) || isSecretary(auth)) {
      const patients = await Patient.find()
      const entries = patients.map((p) => ({
        resource: {
          resourceType: "Patient",
          id: p._id.toString(),
          identifier: [
            {
              system: "https://example.org/fhir/identifier/patient-local",
              value: p.identifiantPatientLocal,
            },
            ...(p.ins
              ? [
                  {
                    system: "urn:oid:1.2.250.1.213.1.4.10",
                    value: p.ins,
                  },
                ]
              : []),
          ],
          name: [{ family: p.nom, given: [p.prenom] }],
          birthDate: p.dateNaissance?.toISOString().slice(0, 10),
        },
      }))
      const stored = await FhirResource.find({ resourceType: "Patient" }).lean()
      const storedEntries = stored.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))
      return successResponse({
        resourceType: "Bundle",
        type: "collection",
        total: entries.length + storedEntries.length,
        entry: [...entries, ...storedEntries],
      })
    }

    const mongoUserId = await getMongoUserIdFromKeycloak(auth.userId)
    if (!mongoUserId) {
      return successResponse({ resourceType: "Bundle", type: "collection", total: 0, entry: [] })
    }

    const patient = await Patient.findOne({ utilisateur: mongoUserId })
      const entries =
        patient != null
          ? [
              {
                resource: {
                  resourceType: "Patient",
                  id: patient._id.toString(),
                  identifier: [
                    {
                      system: "https://example.org/fhir/identifier/patient-local",
                      value: patient.identifiantPatientLocal,
                    },
                    ...(patient.ins
                      ? [
                          {
                            system: "urn:oid:1.2.250.1.213.1.4.10",
                            value: patient.ins,
                          },
                        ]
                      : []),
                  ],
                  name: [{ family: patient.nom, given: [patient.prenom] }],
                  birthDate: patient.dateNaissance?.toISOString().slice(0, 10),
                },
              },
            ]
        : []

    const stored = await FhirResource.find({ resourceType: "Patient" }).lean()
    const storedEntries = stored.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))

    return successResponse({
      resourceType: "Bundle",
      type: "collection",
      total: entries.length + storedEntries.length,
      entry: [...entries, ...storedEntries],
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "Patient") throw new BadRequestException("resourceType must be Patient")
    const created = await FhirResource.create({ resourceType: "Patient", resource: body })
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
    if (body.resourceType !== "Patient" || !body.id) throw new BadRequestException("resourceType Patient with id required")
    const updated = await FhirResource.findOneAndUpdate(
      { _id: body.id, resourceType: "Patient" },
      { resource: body },
      { upsert: true, new: true },
    )
    return successResponse({ ...body, id: updated._id.toString() })
  } catch (error) {
    return handleApiError(error)
  }
}
