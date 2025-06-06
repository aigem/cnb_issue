"use client"

import { useSettings } from "@/contexts/settings-context"
import { useEffect } from "react"

export default function DynamicStyles() {
  const { settings, isHydrated } = useSettings()

  useEffect(() => {
    // Only apply custom styles after hydration to prevent mismatch
    if (!isHydrated) return

    // Apply custom CSS variables
    const root = document.documentElement
    root.style.setProperty("--primary-color", settings.primaryColor)
    root.style.setProperty("--accent-color", settings.accentColor)

    // Update favicon
    if (settings.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = settings.faviconUrl
      }
    }

    // Update page title
    document.title = settings.siteName

    // Add custom CSS
    if (settings.customCss) {
      const existingStyle = document.getElementById("custom-styles")
      if (existingStyle) {
        existingStyle.remove()
      }

      const style = document.createElement("style")
      style.id = "custom-styles"
      style.textContent = settings.customCss
      document.head.appendChild(style)
    }

    // Add Google Analytics
    if (settings.googleAnalyticsId) {
      const existingScript = document.getElementById("google-analytics")
      if (!existingScript) {
        const script = document.createElement("script")
        script.id = "google-analytics"
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`
        document.head.appendChild(script)

        const configScript = document.createElement("script")
        configScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.googleAnalyticsId}');
        `
        document.head.appendChild(configScript)
      }
    }
  }, [settings, isHydrated])

  return null
}
