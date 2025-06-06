import type React from "react"
// 移除Google字体导入
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Metadata } from "next"
import { SettingsProvider } from "@/contexts/settings-context"
import DynamicStyles from "@/components/dynamic-styles"
import { Toaster } from "@/components/ui/toaster"

// 使用系统字体，无需配置

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    template: "%s | Modern Blog",
    default: "Modern Blog - Next.js 15 Powered",
  },
  description: "A modern blog website built with Next.js 15",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "Modern Blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Modern Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modern Blog - Next.js 15 Powered",
    description: "A modern blog website built with Next.js 15",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <SettingsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DynamicStyles />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
