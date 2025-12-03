import { NextResponse } from "next/server"

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiException"
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED")
  }
}

export class ForbiddenException extends ApiException {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN")
  }
}

export class NotFoundException extends ApiException {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND")
  }
}

export class BadRequestException extends ApiException {
  constructor(message = "Bad request") {
    super(400, message, "BAD_REQUEST")
  }
}

export function handleApiError(error: any) {
  console.error("API Error:", error)

  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode },
    )
  }

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  )
}

export function successResponse(data: any, statusCode = 200) {
  return NextResponse.json({
    success: true,
    data,
  })
}
