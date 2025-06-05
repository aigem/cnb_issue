import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function POST(request: NextRequest, { params }: { params: { number: string } }) {
  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { number } = params

    // First, add the archived label
    const labelsResponse = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}/labels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        labels: ["archived"],
      }),
    })

    if (!labelsResponse.ok) {
      const errorText = await labelsResponse.text()
      return NextResponse.json(
        { error: `Failed to add archived label: ${errorText}` },
        { status: labelsResponse.status },
      )
    }

    // Then close the issue
    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        state: "closed",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Failed to archive article: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error archiving article:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
