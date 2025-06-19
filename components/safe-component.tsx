"use client"

import type React from "react"

import { useEffect } from "react"
import { useSafeAsync } from "@/hooks/use-safe-async"
import { safeFetch } from "@/lib/safe-fetch"

interface SafeComponentProps {
  endpoint: string
  children: (data: any, loading: boolean, error: string | null) => React.ReactNode
}

export function SafeComponent({ endpoint, children }: SafeComponentProps) {
  const { data, loading, error, execute } = useSafeAsync()

  useEffect(() => {
    const fetchData = async () => {
      const response = await safeFetch(endpoint)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    }

    execute(fetchData).catch(() => {
      // Error is already handled by useSafeAsync
    })
  }, [endpoint, execute])

  return <>{children(data, loading, error)}</>
}
