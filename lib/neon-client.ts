import { neon } from "@neondatabase/serverless"

export function createNeonClient() {
  try {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      console.warn("DATABASE_URL not found")
      return null
    }

    const sql = neon(databaseUrl)
    return sql
  } catch (error) {
    console.error("Failed to initialize Neon client:", error)
    return null
  }
}

export async function safeQuery(query: string, params: any[] = []) {
  const sql = createNeonClient()

  if (!sql) {
    return { success: false, error: "Database connection not available" }
  }

  try {
    const result = await sql(query, params)
    return { success: true, data: result }
  } catch (error: any) {
    const errorMessage = error && error.message ? error.message : "Query failed"
    return { success: false, error: errorMessage }
  }
}
