import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { FhirSubscription } from "@/lib/db/models/FhirSubscription"

// GET list subscriptions
export async function GET(_request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const subs = await FhirSubscription.find().lean()
    const entries = subs.map((s) => ({
      resource: {
        resourceType: "Subscription",
        id: s._id.toString(),
        status: s.status,
        reason: s.reason,
        criteria: s.criteria,
        channel: s.channel,
      },
    }))
    return NextResponse.json(
      { resourceType: "Bundle", type: "collection", total: entries.length, entry: entries },
      { status: 200 },
    )
  } catch (error: any) {
    const message = error?.message || "Unknown error"
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: message }] },
      { status },
    )
  }
}

// POST create subscription
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    await connectToDatabase()
    const body = await request.json()
    const sub = await FhirSubscription.create({
      status: body.status || "active",
      reason: body.reason || "Subscription",
      criteria: body.criteria,
      channel: body.channel,
    })
    return NextResponse.json(
      {
        resourceType: "Subscription",
        id: sub._id.toString(),
        status: sub.status,
        reason: sub.reason,
        criteria: sub.criteria,
        channel: sub.channel,
      },
      { status: 201 },
    )
  } catch (error: any) {
    const message = error?.message || "Unknown error"
    const status = message.toLowerCase().includes("unauthorized") ? 401 : 500
    return NextResponse.json(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", diagnostics: message }] },
      { status },
    )
  }
}
