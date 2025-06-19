import { NextResponse } from "next/server"
import { DatabaseOperations } from "@/lib/database-operations"

export async function GET() {
  try {
    const result = await DatabaseOperations.getCompanies()

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      })
    } else {
      const errorMessage = result && result.error ? result.error : "Failed to fetch companies"
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await DatabaseOperations.addCompany(body)

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        data: result.data && result.data[0] ? result.data[0] : null,
      })
    } else {
      const errorMessage = result && result.error ? result.error : "Failed to add company"
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add company" }, { status: 500 })
  }
}
