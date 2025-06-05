import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Metadata } from "next"
import { SettingsProvider } from "@/contexts/settings-context"
import DynamicStyles from "@/components/dynamic-styles"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Modern Blog",
    default: "Modern Blog - Next.js 15 Powered",
  },
  description: "A modern blog website built with Next.js 15",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://modern-blog.vercel.app",
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
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <DynamicStyles />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
