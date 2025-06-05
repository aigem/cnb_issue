"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"

import "highlight.js/styles/github.css"

interface ArticleContentProps {
  content: string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const { theme } = useTheme()

  const processedContentForImages = content
    .replace(/!\[([^\]]*)\]\((-\/imgs\/[^)]+)\)/g, (match, alt, src) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "blog"
      return `![${alt}](${baseUrl}/${repoName}${src.startsWith("/") ? "" : "/"}${src})`
    })
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/|\/-\/imgs\/)([^)]+)\)/g, (match, alt, src) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
      return `![${alt}](${baseUrl}${src.startsWith("/") ? "" : "/"}${src})`
    })

  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

  useEffect(() => {
    // Intentionally left empty for now, can be used for theme-specific JS if needed
  }, [theme])

  return (
    <div className="article-content">
      <div className="text-sm text-muted-foreground mb-6">{readingTime} min read</div>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {processedContentForImages}
        </ReactMarkdown>
      </div>
      <style jsx global>{`
        .article-content .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }
        .article-content img[src*="/-/imgs/"] {
          border: 1px solid hsl(var(--border));
        }
      `}</style>
    </div>
  )
}
