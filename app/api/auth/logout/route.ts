import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" })
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      path: "/",
      maxAge: -1, // Instructs the browser to delete the cookie immediately
      secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: "Internal server error during logout" }, { status: 500 })
  }
}

// Optionally, you can also include a GET handler if you want to allow logout via GET
// though POST is generally recommended for actions.
export async function GET() {
  // Re-using POST logic for simplicity as the action is the same.
  // In a more complex scenario, GET might just show a confirmation page before POSTing.
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully (via GET)" })
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      path: "/",
      maxAge: -1,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    return response
  } catch (error) {
    console.error("Logout error (via GET):", error)
    return NextResponse.json({ success: false, message: "Internal server error during logout" }, { status: 500 })
  }
}
