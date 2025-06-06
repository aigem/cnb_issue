export interface SiteSettings {
  // Site information
  siteName: string
  siteDescription: string
  siteKeywords: string[]

  // Appearance
  primaryColor: string
  accentColor: string
  logoUrl: string
  faviconUrl: string

  // Social media
  socialLinks: {
    twitter?: string
    github?: string
    linkedin?: string
    facebook?: string
    instagram?: string
  }

  // Content settings
  articlesPerPage: number
  featuredTags: string[]
  showAuthorInfo: boolean
  enableComments: boolean

  // SEO settings
  defaultMetaImage: string
  googleAnalyticsId?: string

  // Performance & Cache settings
  apiCacheMinutes: number
  localStorageCacheMinutes: number

  // System settings
  enableDebugMode: boolean
  enableAnalytics: boolean
  maintenanceMode: boolean

  // Search settings
  enableSearch: boolean
  searchResultsPerPage: number

  // Advanced settings
  customCss?: string
  customHeaderHtml?: string
  customFooterHtml?: string
}

export const defaultSettings: SiteSettings = {
  siteName: "Modern Blog",
  siteDescription: "A modern blog website built with Next.js 15",
  siteKeywords: ["blog", "nextjs", "react"],

  primaryColor: "#0070f3",
  accentColor: "#f5a623",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.ico",

  socialLinks: {
    twitter: "https://twitter.com",
    github: "https://github.com",
  },

  articlesPerPage: 10,
  featuredTags: [],
  showAuthorInfo: true,
  enableComments: true,

  defaultMetaImage: "/og-image.png",

  // Performance & Cache settings
  apiCacheMinutes: 5,
  localStorageCacheMinutes: 60,

  // System settings
  enableDebugMode: false,
  enableAnalytics: true,
  maintenanceMode: false,

  // Search settings
  enableSearch: true,
  searchResultsPerPage: 20,
}
