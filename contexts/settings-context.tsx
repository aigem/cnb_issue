"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type SiteSettings, defaultSettings } from "@/types/settings"
import { settingsApi } from "@/lib/settings-api"

interface SettingsContextType {
  settings: SiteSettings
  isLoading: boolean
  error: string | null
  saveSettings: (newSettings: SiteSettings) => Promise<boolean>
  resetSettings: () => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  error: null,
  saveSettings: async () => false,
  resetSettings: async () => false,
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const loadedSettings = await settingsApi.getSettings()
        setSettings(loadedSettings)
      } catch (err) {
        console.error("Failed to load settings:", err)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const saveSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)
      const success = await settingsApi.saveSettings(newSettings)
      if (success) {
        setSettings(newSettings)
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
    <SettingsContext.Provider value={{ settings, isLoading, error, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}
