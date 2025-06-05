"use client"

import Link from "next/link"
import { Github, Twitter, Linkedin, Facebook, Instagram } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export default function Footer() {
  const { settings } = useSettings()

  const socialIcons = {
    github: <Github className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
  }

  return (
    <footer className="border-t">
      <div className="container flex flex-col md:flex-row items-center justify-between py-10 md:h-24 md:py-0">
        <div className="flex flex-col items-center md:items-start gap-4 md:gap-2 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} {settings.siteName}. Built with{" "}
            <Link
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Next.js 15
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {Object.entries(settings.socialLinks).map(([platform, url]) => {
            if (!url) return null
            return (
              <Link key={platform} href={url} target="_blank" rel="noreferrer">
                {socialIcons[platform] || platform}
                <span className="sr-only">{platform}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Custom Footer HTML */}
      {settings.customFooterHtml && (
        <div className="border-t py-4" dangerouslySetInnerHTML={{ __html: settings.customFooterHtml }} />
      )}
    </footer>
  )
}
