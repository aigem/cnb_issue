import { type NextRequest, NextResponse } from "next/server"

// Redirect to file-based settings API
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/settings/file`, {
      method: 'GET',
    })

    if (response.ok) {
      const settings = await response.json()
      return NextResponse.json(settings)
    } else {
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/settings/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(settings),
    })

    if (response.ok) {
      return NextResponse.json({ success: true })
    } else {
      const error = await response.json()
      return NextResponse.json({ error: error.error || "Failed to save settings" }, { status: response.status })
    }
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
