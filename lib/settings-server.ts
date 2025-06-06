import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { type SiteSettings, defaultSettings } from "@/types/settings"

// Server-side settings loading (synchronous for SSR)
export function getSettingsSync(): SiteSettings {
    if (typeof window !== 'undefined') {
        throw new Error('getSettingsSync should only be called on server side')
    }

    try {
        const settingsPath = join(process.cwd(), 'data', 'settings.json')
        if (existsSync(settingsPath)) {
            const fileContent = readFileSync(settingsPath, 'utf-8')
            const fileSettings = JSON.parse(fileContent) as Partial<SiteSettings>
            return { ...defaultSettings, ...fileSettings }
        }
    } catch (error) {
        console.error("Error loading settings file:", error)
    }

    return defaultSettings
}