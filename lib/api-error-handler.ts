import { NextResponse } from "next/server"
import { ErrorHandler } from "./error-handler"

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export class ApiErrorHandler {
  static createError(message: string, status = 500, code?: string, details?: unknown): ApiError {
    return {
      message,
      status,
      code,
      details,
    }
  }

  static handleError(error: unknown): NextResponse {
    let apiError: ApiError

    if (ErrorHandler.safeCheck(error, "status") && ErrorHandler.safeCheck(error, "message")) {
      // Already an API error
      apiError = error as ApiError
    } else if (ErrorHandler.isError(error)) {
      // Standard Error object
      apiError = this.createError(error.message, 500, "INTERNAL_ERROR")
    } else if (typeof error === "string") {
      // String error
      apiError = this.createError(error, 500, "STRING_ERROR")
    } else {
      // Unknown error type
      apiError = this.createError("An unexpected error occurred", 500, "UNKNOWN_ERROR", error)
    }

    ErrorHandler.logError(error, "API_ERROR")

    return NextResponse.json(
      {
        error: {
          message: apiError.message,
          code: apiError.code,
          ...(process.env.NODE_ENV === "development" && { details: apiError.details }),
        },
      },
      { status: apiError.status || 500 },
    )
  }
}
