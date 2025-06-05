import { type SiteSettings, defaultSettings } from "@/types/settings"
import { articleApi } from "@/lib/api-unified"
import type { Issue } from "@/types" // Import Issue type

// Constants for identifying the settings issue
const SETTINGS_ISSUE_TITLE = "SystemBlogSiteSettings" // Using a more unique title
const SETTINGS_LABEL = "site-settings" // This label should be specific to the settings issue

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

  private findMostRecentSettingsIssue(issues: Issue[]): Issue | null {
    if (!issues || issues.length === 0) {
      return null
    }
    // Filter by exact title match
    const matchingIssues = issues.filter(issue => issue.title === SETTINGS_ISSUE_TITLE)
    if (matchingIssues.length === 0) {
      return null
    }
    if (matchingIssues.length > 1) {
      console.warn(`Multiple settings issues found with title "${SETTINGS_ISSUE_TITLE}" and label "${SETTINGS_LABEL}". Using the most recently updated one.`)
      // Sort by updated_at descending to get the most recent
      matchingIssues.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }
    return matchingIssues[0]
  }

  async getSettings(): Promise<SiteSettings> {
    const now = Date.now()
    if (this.settingsCache && now - this.lastFetchTime < this.cacheDuration) {
      return this.settingsCache
    }

    try {
      const potentialSettingsIssues = await articleApi.getArticles({
        labels: SETTINGS_LABEL,
        state: "all", // Settings issue might be open or closed
        pageSize: 5, // Expecting only one or a few
      })

      const settingsIssue = this.findMostRecentSettingsIssue(potentialSettingsIssues)

      if (settingsIssue && settingsIssue.body) {
        try {
          const settings = JSON.parse(settingsIssue.body) as SiteSettings
          this.settingsCache = { ...defaultSettings, ...settings }
          this.lastFetchTime = now
          console.log("Settings loaded from issue:", settingsIssue.number)
          return this.settingsCache
        } catch (e) {
          console.error(`Failed to parse settings JSON from issue #${settingsIssue.number}:`, e)
        }
      } else {
        console.log("No settings issue found with the specific title and label. Using default settings.")
      }
    } catch (error) {
      console.error("Error fetching settings issue(s):", error)
    }

    // Return default settings if not found, parsing error, or fetch error
    this.settingsCache = defaultSettings // Cache default settings on failure to avoid repeated lookups for a while
    this.lastFetchTime = now
    return defaultSettings
  }

  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const settingsJson = JSON.stringify(settings, null, 2)

      const potentialSettingsIssues = await articleApi.getArticles({
        labels: SETTINGS_LABEL,
        state: "all",
        pageSize: 5,
      })

      const existingSettingsIssue = this.findMostRecentSettingsIssue(potentialSettingsIssues)

      if (existingSettingsIssue && typeof existingSettingsIssue.number === 'number') {
        // Update existing settings issue
        // Ensure updateArticle can handle numeric ID (issue number)
        await articleApi.updateArticle(existingSettingsIssue.number, {
          body: settingsJson,
          // Optionally, ensure title and labels remain consistent if updateArticle allows changing them
          // title: SETTINGS_ISSUE_TITLE,
          // labels: [SETTINGS_LABEL] // This might need a separate setArticleLabels call depending on API
        })
        console.log("Settings updated in issue:", existingSettingsIssue.number)
      } else {
        // Create new settings issue
        await articleApi.createArticle(SETTINGS_ISSUE_TITLE, settingsJson, [SETTINGS_LABEL])
        console.log("New settings issue created with title:", SETTINGS_ISSUE_TITLE)
      }

      this.settingsCache = { ...defaultSettings, ...settings } // Update cache with merged settings
      this.lastFetchTime = Date.now()
      return true
    } catch (error) {
      console.error("Error saving settings:", error)
      return false
    }
  }

  async resetSettings(): Promise<boolean> {
    // This will save the defaultSettings object, potentially creating a new settings issue
    // if one doesn't exist, or updating the existing one with defaults.
    return this.saveSettings(defaultSettings)
  }
}

export const settingsApi = SettingsApi.getInstance()
