import { NextResponse } from "next/server"

export async function GET() {
  console.log("[Test API] Simple test route called")

  return NextResponse.json({
    message: "Test API route working",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "not set",
      REPO_NAME: process.env.NEXT_PUBLIC_REPO_NAME || "blog",
      API_TOKEN: process.env.API_TOKEN ? "present" : "missing",
    },
  })
}
