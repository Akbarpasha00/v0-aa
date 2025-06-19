import { NextResponse } from "next/server"
import { DatabaseOperations } from "@/lib/database-operations"

export async function GET() {
  try {
    const result = await DatabaseOperations.getStudents()

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      })
    } else {
      const errorMessage = result && result.error ? result.error : "Failed to fetch students"
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await DatabaseOperations.addStudent(body)

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        data: result.data && result.data[0] ? result.data[0] : null,
      })
    } else {
      const errorMessage = result && result.error ? result.error : "Failed to add student"
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to add student" }, { status: 500 })
  }
}
