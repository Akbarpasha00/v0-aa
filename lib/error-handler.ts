// Enhanced error handling utility
export class ErrorHandler {
  static isError(value: unknown): value is Error {
    return value instanceof Error
  }

  static hasProperty<T extends object>(
    obj: T | undefined | null,
    property: string,
  ): obj is T & Record<string, unknown> {
    return obj != null && typeof obj === "object" && property in obj
  }

  static safeCheck(obj: unknown, property: string): boolean {
    try {
      return obj != null && typeof obj === "object" && property in obj
    } catch {
      return false
    }
  }

  static getErrorMessage(error: unknown): string {
    if (this.isError(error)) {
      return error.message
    }

    if (this.hasProperty(error, "message") && typeof error.message === "string") {
      return error.message
    }

    if (typeof error === "string") {
      return error
    }

    return "An unknown error occurred"
  }

  static logError(error: unknown, context?: string): void {
    const message = this.getErrorMessage(error)
    const logMessage = context ? `[${context}] ${message}` : message

    console.error(logMessage)

    if (this.isError(error)) {
      console.error(error.stack)
    }
  }
}

// Safe object property checker
export function safeHasProperty(obj: unknown, property: string): obj is Record<string, unknown> {
  return obj != null && typeof obj === "object" && property in obj
}

// Safe property getter
export function safeGetProperty<T = unknown>(obj: unknown, property: string, defaultValue?: T): T | undefined {
  if (safeHasProperty(obj, property)) {
    return obj[property] as T
  }
  return defaultValue
}
