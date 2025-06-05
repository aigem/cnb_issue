"use client"

import { useState, useEffect } from "react"
import { Link } from "lucide-react"

interface TableOfContentsProps {
  content: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  // Extract headings from content
  useEffect(() => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const headings: TocItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")

      headings.push({ id, text, level })
    }

    setToc(headings)
  }, [content])

  // Track active heading on scroll
  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0px 0px -80% 0px" },
    )

    toc.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => {
      toc.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) observer.unobserve(element)
      })
    }
  }, [toc])

  if (toc.length === 0) {
    return null
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center mb-4">
        <Link className="h-4 w-4 mr-2" />
        <h3 className="font-medium">Table of Contents</h3>
      </div>

      <nav>
        <ul className="space-y-2 text-sm">
          {toc.map((item) => (
            <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}>
              <a
                href={`#${item.id}`}
                className={`block hover:text-primary transition-colors ${
                  activeId === item.id ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
