import { ErrorHandler, safeHasProperty } from "./error-handler"

export interface FetchOptions extends RequestInit {
  timeout?: number
}

export interface SafeFetchResponse<T = unknown> {
  data: T | null
  error: string | null
  status: number
  ok: boolean
}

export async function safeFetch<T = unknown>(url: string, options: FetchOptions = {}): Promise<SafeFetchResponse<T>> {
  const { timeout = 10000, ...fetchOptions } = options

  try {
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let data: T | null = null
    let error: string | null = null

    try {
      const text = await response.text()
      if (text) {
        data = JSON.parse(text) as T
      }
    } catch (parseError) {
      error = "Failed to parse response as JSON"
      ErrorHandler.logError(parseError, "JSON_PARSE")
    }

    // Check if response contains an error
    if (!response.ok) {
      if (safeHasProperty(data, "error")) {
        error = ErrorHandler.getErrorMessage(data.error)
      } else if (safeHasProperty(data, "message")) {
        error = ErrorHandler.getErrorMessage(data.message)
      } else {
        error = `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return {
      data,
      error,
      status: response.status,
      ok: response.ok,
    }
  } catch (fetchError) {
    let error = ErrorHandler.getErrorMessage(fetchError)

    // Handle specific fetch errors
    if (safeHasProperty(fetchError, "name")) {
      if (fetchError.name === "AbortError") {
        error = "Request timed out"
      } else if (fetchError.name === "TypeError") {
        error = "Network error or invalid URL"
      }
    }

    ErrorHandler.logError(fetchError, "FETCH_ERROR")

    return {
      data: null,
      error,
      status: 0,
      ok: false,
    }
  }
}
