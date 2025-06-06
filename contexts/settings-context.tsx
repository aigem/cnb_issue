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

// Get cached settings from localStorage with dynamic cache time
function getCachedSettings(cacheMinutes: number = 60): SiteSettings | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
    const timestamp = localStorage.getItem(SETTINGS_CACHE_TIMESTAMP_KEY)

    if (cached && timestamp) {
      const cacheAge = Date.now() - parseInt(timestamp)
      const cacheMaxAge = cacheMinutes * 60 * 1000

      if (cacheAge < cacheMaxAge) {
        return JSON.parse(cached) as SiteSettings
      }
    }
  } catch (error) {
    console.warn('Failed to load cached settings:', error)
  }

  return null
}

// Always use defaults for initial render to avoid hydration mismatch
function getInitialSettings(): SiteSettings {
  return defaultSettings
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
  // Initialize with server-side or cached settings to prevent flashing
  const [settings, setSettings] = useState<SiteSettings>(() => getInitialSettings())
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

        // Load cached and server settings simultaneously for faster response
        const [cached, serverSettings] = await Promise.allSettled([
          // Get cached settings immediately
          Promise.resolve(getCachedSettings(defaultSettings.localStorageCacheMinutes)),
          // Get server settings
          settingsApi.getSettings()
        ])

        // Use cached settings first if available
        if (cached.status === 'fulfilled' && cached.value) {
          const cachedSettings = { ...defaultSettings, ...cached.value }
          setSettings(cachedSettings)
          setCachedSettings(cachedSettings)
        }

        // Then use server settings if different and successful
        if (serverSettings.status === 'fulfilled') {
          const loadedSettings = serverSettings.value
          const currentSettings = cached.status === 'fulfilled' && cached.value ?
            { ...defaultSettings, ...cached.value } : defaultSettings

          // Only update if settings actually changed
          const currentSettingsStr = JSON.stringify(currentSettings)
          const loadedSettingsStr = JSON.stringify(loadedSettings)

          if (currentSettingsStr !== loadedSettingsStr) {
            setSettings(loadedSettings)
            setCachedSettings(loadedSettings)
          }
        } else if (serverSettings.status === 'rejected') {
          console.warn("Failed to load settings from server:", serverSettings.reason)
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    // Use a small delay to make the transition smoother
    const timeoutId = setTimeout(loadSettings, 50)
    return () => clearTimeout(timeoutId)
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
