import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { AnalyseBiologique } from "@/lib/db/models/AnalyseBiologique"
import { isAdmin } from "@/lib/api/authorization"
import { handleApiError, successResponse, NotFoundException } from "@/lib/api/error-handler"

// DELETE /api/analyses/[id] - Delete biological analysis (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    if (!isAdmin(auth)) {
      throw new Error("Forbidden: Only admin can delete analyses")
    }

    await connectToDatabase()

    const deleted = await AnalyseBiologique.findByIdAndDelete(id)
    if (!deleted) {
      throw new NotFoundException("Analysis not found")
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
