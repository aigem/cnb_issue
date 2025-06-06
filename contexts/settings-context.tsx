"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type SiteSettings, defaultSettings } from "@/types/settings"
import { settingsApi } from "@/lib/settings-api"

interface SettingsContextType {
  settings: SiteSettings
  isLoading: boolean
  error: string | null
  isHydrated: boolean
  saveSettings: (newSettings: SiteSettings) => Promise<boolean>
  resetSettings: () => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  error: null,
  isHydrated: false,
  saveSettings: async () => false,
  resetSettings: async () => false,
})

export const useSettings = () => useContext(SettingsContext)

// Cache key for localStorage
const SETTINGS_CACHE_KEY = 'site-settings-cache'
const SETTINGS_CACHE_TIMESTAMP_KEY = 'site-settings-cache-timestamp'

// Get cached settings from localStorage
function getCachedSettings(): SiteSettings | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
    const timestamp = localStorage.getItem(SETTINGS_CACHE_TIMESTAMP_KEY)

    if (cached && timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp)
      // Use cache if it's less than 1 hour old
      if (cacheAge < 60 * 60 * 1000) {
        return JSON.parse(cached) as SiteSettings
      }
    }
  } catch (error) {
    console.warn('Failed to load cached settings:', error)
  }

  return null
}

// Save settings to localStorage cache
function setCachedSettings(settings: SiteSettings) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings))
    localStorage.setItem(SETTINGS_CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.warn('Failed to cache settings:', error)
  }
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Always initialize with default settings to avoid hydration mismatch
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return // Wait for hydration

    const loadSettings = async () => {
      try {
        setError(null)

        // First try to load from cache for immediate update
        const cached = getCachedSettings()
        if (cached) {
          const cachedSettings = { ...defaultSettings, ...cached }
          setSettings(cachedSettings)
        }

        // Then load from server/file for latest data
        const loadedSettings = await settingsApi.getSettings()

        // Only update if settings actually changed
        const currentSettingsStr = JSON.stringify(cached || defaultSettings)
        const loadedSettingsStr = JSON.stringify(loadedSettings)

        if (currentSettingsStr !== loadedSettingsStr) {
          setSettings(loadedSettings)
          setCachedSettings(loadedSettings)
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [isHydrated])

  const saveSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      const success = await settingsApi.saveSettings(newSettings)
      if (success) {
        setSettings(newSettings)
        setCachedSettings(newSettings)
      }
      return success
    } catch (err) {
      console.error("Failed to save settings:", err)
      setError("Failed to save settings")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resetSettings = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      const success = await settingsApi.resetSettings()
      if (success) {
        setSettings(defaultSettings)
        setCachedSettings(defaultSettings)
      }
      return success
    } catch (err) {
      console.error("Failed to reset settings:", err)
      setError("Failed to reset settings")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error, isHydrated, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
