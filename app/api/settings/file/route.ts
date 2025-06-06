import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getAuthUser } from "@/lib/auth"
import { defaultSettings } from "@/types/settings"

const SETTINGS_FILE_PATH = path.join(process.cwd(), "data", "settings.json")

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.dirname(SETTINGS_FILE_PATH)
    try {
        await fs.access(dataDir)
    } catch {
        await fs.mkdir(dataDir, { recursive: true })
    }
}

export async function GET() {
    try {
        await ensureDataDirectory()

        try {
            const settingsData = await fs.readFile(SETTINGS_FILE_PATH, "utf-8")
            const settings = JSON.parse(settingsData)

            // Merge with default settings to ensure all fields exist
            const mergedSettings = { ...defaultSettings, ...settings }

            return NextResponse.json(mergedSettings)
        } catch (error) {
            // If file doesn't exist or is invalid, return default settings
            console.log("Settings file not found or invalid, returning defaults")
            return NextResponse.json(defaultSettings)
        }
    } catch (error) {
        console.error("Error reading settings file:", error)
        return NextResponse.json(defaultSettings)
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated as admin
        const authUser = await getAuthUser(request)
        if (!authUser || authUser.role !== "admin") {
            return NextResponse.json({ error: "Admin authentication required" }, { status: 401 })
        }

        const settings = await request.json()

        // Validate settings structure
        if (!settings.siteName || !settings.siteDescription) {
            return NextResponse.json({ error: "Invalid settings format" }, { status: 400 })
        }

        await ensureDataDirectory()

        // Write settings to file
        const settingsJson = JSON.stringify(settings, null, 2)
        await fs.writeFile(SETTINGS_FILE_PATH, settingsJson, "utf-8")

        console.log("Settings saved to file successfully")
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error saving settings file:", error)
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }
}