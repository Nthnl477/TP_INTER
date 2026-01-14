import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/keycloak/auth-context"
import connectToDatabase from "@/lib/db/connection"
import { DocumentClinique } from "@/lib/db/models/DocumentClinique"
import { isAdmin } from "@/lib/api/authorization"
import { handleApiError, successResponse, NotFoundException } from "@/lib/api/error-handler"

// DELETE /api/documents/[id] - Delete clinical document (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const { id } = await params

    if (!isAdmin(auth)) {
      throw new Error("Forbidden: Only admin can delete documents")
    }

    await connectToDatabase()

    const deleted = await DocumentClinique.findByIdAndDelete(id)
    if (!deleted) {
      throw new NotFoundException("Document not found")
    }

    return successResponse({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
