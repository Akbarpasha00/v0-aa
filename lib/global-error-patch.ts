// GLOBAL PATCH - Add this to your app/layout.tsx or _app.tsx

declare global {
  interface Window {
    safeHasProperty: (obj: any, prop: string) => boolean
    safeGetProperty: (obj: any, prop: string, defaultValue?: any) => any
  }
}

// Patch the global scope
if (typeof window !== "undefined") {
  window.safeHasProperty = (obj: any, prop: string): boolean => {
    return obj != null && typeof obj === "object" && prop in obj
  }

  window.safeGetProperty = (obj: any, prop: string, defaultValue: any = null): any => {
    return window.safeHasProperty(obj, prop) ? obj[prop] : defaultValue
  }
}

export {}
