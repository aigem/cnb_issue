import { type NextRequest, NextResponse } from "next/server"
import { settingsApi } from "@/lib/settings-api"

export async function GET() {
  try {
    const settings = await settingsApi.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    const success = await settingsApi.saveSettings(settings)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
