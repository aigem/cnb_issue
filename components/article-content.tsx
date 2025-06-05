"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import Prism from "prismjs"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-css"
import "prismjs/components/prism-json"
import "prismjs/components/prism-markdown"

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (contentRef.current) {
      // Process images in the content
      processImages(contentRef.current)

      // Highlight code blocks
      Prism.highlightAllUnder(contentRef.current)
    }
  }, [content, theme])

  // Function to process and fix image URLs
  const processImages = (container: HTMLElement) => {
    const images = container.querySelectorAll("img")
    images.forEach((img) => {
      // Add error handling for images
      img.onerror = () => {
        console.warn(`Failed to load image: ${img.src}`)
        img.style.display = "none"
      }

      // Add loading placeholder
      img.onload = () => {
        img.style.opacity = "1"
      }

      // Set initial styles
      img.style.opacity = "0"
      img.style.transition = "opacity 0.3s ease"

      // Ensure images are responsive
      img.style.maxWidth = "100%"
      img.style.height = "auto"
    })
  }

  // Process content to fix image URLs and add proper markdown rendering
  const processedContent = content
    // Fix relative image URLs to absolute URLs
    .replace(/!\[([^\]]*)\]$$(?!https?:\/\/)([^)]+)$$/g, (match, alt, src) => {
      // If it's a relative URL starting with /-/imgs/, make it absolute
      if (src.startsWith("/-/imgs/")) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
        const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "blog"
        return `![${alt}](${baseUrl}/${repoName}${src})`
      }
      return match
    })
    // Fix any other relative URLs
    .replace(/!\[([^\]]*)\]$$\/([^)]+)$$/g, (match, alt, src) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      return `![${alt}](${baseUrl}/${src})`
    })

  // Calculate reading time
  const readingTime = Math.max(1, Math.ceil(processedContent.split(/\s+/).length / 200))

  return (
    <div className="article-content">
      <div className="text-sm text-muted-foreground mb-6">{readingTime} min read</div>

      <div
        ref={contentRef}
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      <style jsx global>{`
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }
        
        .article-content pre {
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
        }
        
        .article-content blockquote {
          border-left-width: 4px;
          padding-left: 1rem;
          font-style: italic;
        }

        .article-content img[src*="/-/imgs/"] {
          /* Special styling for issue images */
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
