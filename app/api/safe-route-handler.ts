import type { NextRequest } from "next/server"
import { ApiErrorHandler } from "@/lib/api-error-handler"
import { safeHasProperty } from "@/lib/error-handler"

export function createSafeRouteHandler<T = unknown>(handler: (request: NextRequest) => Promise<T>) {
  return async (request: NextRequest) => {
    try {
      const result = await handler(request)
      return result
    } catch (error) {
      return ApiErrorHandler.handleError(error)
    }
  }
}

// Example usage in API routes
export function validateRequestBody(body: unknown, requiredFields: string[]): void {
  if (!body || typeof body !== "object") {
    throw ApiErrorHandler.createError("Request body is required", 400, "MISSING_BODY")
  }

  for (const field of requiredFields) {
    if (!safeHasProperty(body, field)) {
      throw ApiErrorHandler.createError(`Missing required field: ${field}`, 400, "MISSING_FIELD")
    }
  }
}
