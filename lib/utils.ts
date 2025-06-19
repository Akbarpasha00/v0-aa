import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// SAFE PROPERTY CHECKERS - NO 'IN' OPERATOR
export function safeHasProperty(obj: any, prop: string): boolean {
  return obj != null && obj[prop] !== undefined
}

export function safeGetProperty(obj: any, prop: string, defaultValue: any = null): any {
  return obj != null && obj[prop] !== undefined ? obj[prop] : defaultValue
}

export function isError(obj: any): boolean {
  return obj != null && obj.error !== undefined
}

export function isSuccess(obj: any): boolean {
  return obj != null && obj.success === true
}

export function getErrorMessage(obj: any): string {
  return obj != null && obj.error ? String(obj.error) : "Unknown error"
}
