import { NextResponse } from "next/server"
import { DatabaseOperations } from "@/lib/database-operations"

export async function GET() {
  try {
    const stats = await DatabaseOperations.getDashboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
