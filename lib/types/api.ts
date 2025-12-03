// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
}

// Authorization types
export interface AuthorizationContext {
  userId: string
  role: string
  keycloakId: string
}
