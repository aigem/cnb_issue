import { type SiteSettings, defaultSettings } from "@/types/settings"

export class SettingsApi {
  private static instance: SettingsApi
  private settingsCache: SiteSettings | null = null
  private lastFetchTime = 0

  private constructor() { }

  static getInstance(): SettingsApi {
    if (!SettingsApi.instance) {
      SettingsApi.instance = new SettingsApi()
    }
    return SettingsApi.instance
  }

  // Get cache duration from current settings
  private getCacheDuration(): number {
    const settings = this.settingsCache || defaultSettings
    return settings.apiCacheMinutes * 60 * 1000
  }

  async getSettings(): Promise<SiteSettings> {
    // Check cache first
    const now = Date.now()
    const cacheDuration = this.getCacheDuration()

    if (this.settingsCache && now - this.lastFetchTime < cacheDuration) {
      return this.settingsCache
    }

    try {
      // Call the file-based settings API
      const response = await fetch('/api/settings/file', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const settings = await response.json() as SiteSettings
        this.settingsCache = { ...defaultSettings, ...settings }
        this.lastFetchTime = now
        return this.settingsCache
      } else {
        console.warn("Failed to load settings from file, using defaults")
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }

    // Return default settings if we couldn't fetch or parse
    this.settingsCache = defaultSettings
    this.lastFetchTime = now
    return defaultSettings
  }

  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
        credentials: 'include',
      })

      if (response.ok) {
        // Update cache
        this.settingsCache = settings
        this.lastFetchTime = Date.now()
        return true
      } else {
        console.error("Failed to save settings to file")
        return false
      }
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
