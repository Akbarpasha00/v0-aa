// IMMEDIATE FIX - Drop this into any file having the error

export function quickFixInOperator() {
  // Override the problematic code patterns

  // Safe property checker
  const safeHas = (obj: any, prop: string): boolean => {
    return obj != null && typeof obj === "object" && prop in obj
  }

  // Safe property getter
  const safeGet = (obj: any, prop: string, defaultVal: any = null): any => {
    return safeHas(obj, prop) ? obj[prop] : defaultVal
  }

  // Export for immediate use
  return { safeHas, safeGet }
}

// EMERGENCY PATCH - Use this anywhere you're getting the error
export const EMERGENCY_SAFE_CHECK = (obj: unknown, property: string): boolean => {
  try {
    return obj != null && typeof obj === "object" && property in obj
  } catch {
    return false
  }
}

// EMERGENCY PATCH - Safe property access
export const EMERGENCY_SAFE_GET = (obj: unknown, property: string): any => {
  try {
    if (obj != null && typeof obj === "object" && property in obj) {
      return (obj as any)[property]
    }
    return undefined
  } catch {
    return undefined
  }
}
