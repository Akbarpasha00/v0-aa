import { NextResponse } from "next/server"
import { setupDatabase } from "@/lib/database-setup"

export async function POST() {
  try {
    const result = await setupDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Database setup completed successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup database",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Database setup endpoint ready",
    status: "available",
  })
}
