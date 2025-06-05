import { type SiteSettings, defaultSettings } from "@/types/settings"
import { articleApi } from "@/lib/api-unified"

// Special issue number for storing settings
const SETTINGS_ISSUE_NUMBER = "settings"
const SETTINGS_LABEL = "site-settings"

export class SettingsApi {
  private static instance: SettingsApi
  private settingsCache: SiteSettings | null = null
  private lastFetchTime = 0
  private readonly cacheDuration = 5 * 60 * 1000 // 5 minutes

  private constructor() {}

  static getInstance(): SettingsApi {
    if (!SettingsApi.instance) {
      SettingsApi.instance = new SettingsApi()
    }
    return SettingsApi.instance
  }

  async getSettings(): Promise<SiteSettings> {
    // Check cache first
    const now = Date.now()
    if (this.settingsCache && now - this.lastFetchTime < this.cacheDuration) {
      return this.settingsCache
    }

    try {
      // Try to fetch settings from the special issue
      const settingsIssue = await articleApi.getArticle(SETTINGS_ISSUE_NUMBER)

      if (settingsIssue && settingsIssue.body) {
        try {
          const settings = JSON.parse(settingsIssue.body) as SiteSettings
          this.settingsCache = { ...defaultSettings, ...settings }
          this.lastFetchTime = now
          return this.settingsCache
        } catch (e) {
          console.error("Failed to parse settings JSON:", e)
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }

    // Return default settings if we couldn't fetch or parse
    return defaultSettings
  }

  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const settingsJson = JSON.stringify(settings, null, 2)

      // Check if settings issue exists
      const existingSettings = await articleApi.getArticle(SETTINGS_ISSUE_NUMBER)

      if (existingSettings) {
        // Update existing settings issue
        await articleApi.updateArticle(SETTINGS_ISSUE_NUMBER, {
          body: settingsJson,
        })
      } else {
        // Create new settings issue
        await articleApi.createArticle("Site Settings", settingsJson, [SETTINGS_LABEL])
      }

      // Update cache
      this.settingsCache = settings
      this.lastFetchTime = Date.now()
      return true
    } catch (error) {
      console.error("Error saving settings:", error)
      return false
    }
  }

  // Reset settings to default
  async resetSettings(): Promise<boolean> {
    return this.saveSettings(defaultSettings)
  }
}

export const settingsApi = SettingsApi.getInstance()
