import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { FhirResource } from "@/lib/db/models/FhirResource"
import { handleApiError, BadRequestException, successResponse } from "@/lib/api/error-handler"

export async function GET(_request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const stored = await FhirResource.find({ resourceType: "DocumentReference" }).lean()
    const entries = stored.map((s) => ({ resource: { ...s.resource, id: s._id.toString() } }))
    return successResponse({ resourceType: "Bundle", type: "collection", total: entries.length, entry: entries })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    if (body.resourceType !== "DocumentReference") throw new BadRequestException("resourceType must be DocumentReference")
    const created = await FhirResource.create({ resourceType: "DocumentReference", resource: body })
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
    if (body.resourceType !== "DocumentReference" || !body.id)
      throw new BadRequestException("resourceType DocumentReference with id required")
    const updated = await FhirResource.findOneAndUpdate(
      { _id: body.id, resourceType: "DocumentReference" },
      { resource: body },
      { upsert: true, new: true },
    )
    return successResponse({ ...body, id: updated._id.toString() })
  } catch (error) {
    return handleApiError(error)
  }
}
