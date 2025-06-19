"use client"

import { useState, useCallback } from "react"
import { ErrorHandler } from "@/lib/error-handler"

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useSafeAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorMessage = ErrorHandler.getErrorMessage(error)
      setState({ data: null, loading: false, error: errorMessage })
      ErrorHandler.logError(error, "ASYNC_HOOK")
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
