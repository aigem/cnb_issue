import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request)

        if (authUser) {
            return NextResponse.json({
                authenticated: true,
                user: authUser
            })
        } else {
            return NextResponse.json({
                authenticated: false,
                user: null
            })
        }
    } catch (error) {
        console.error("Auth status error:", error)
        return NextResponse.json({
            authenticated: false,
            user: null
        })
    }
}