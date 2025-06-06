"use client"

import { useEffect, useRef, useMemo, useCallback } from "react"
import { useTheme } from "next-themes"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'

interface ArticleContentProps {
  content: string
}

// 常量配置
const AVERAGE_READING_SPEED = 200 // 每分钟单词数
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export default function ArticleContent({ content }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  // 优化的图片处理函数
  const processImages = useCallback((container: HTMLElement) => {
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
  }, [])

  // 使用useEffect处理图片，添加依赖优化
  useEffect(() => {
    if (contentRef.current) {
      processImages(contentRef.current)
    }
  }, [content, theme, processImages])

  // Memoized计算阅读时间
  const readingTime = useMemo(() => {
    const wordCount = content.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / AVERAGE_READING_SPEED))
  }, [content])

  // Memoized检查内容类型
  const isMarkdown = useMemo(() => {
    return !content.includes('<') || content.includes('```') || content.includes('#')
  }, [content])

  // Memoized的图片URL修复函数
  const fixImageUrl = useCallback((src: string | undefined) => {
    if (!src || src.startsWith('http')) return src

    if (src.startsWith("/-/imgs/")) {
      return `${BASE_URL}/${REPO_NAME}${src}`
    } else if (src.startsWith("/")) {
      return `${BASE_URL}${src}`
    }
    return src
  }, [])

  // Memoized的Markdown组件配置
  const markdownComponents = useMemo(() => ({
    img: ({ src, alt, ...props }: any) => {
      const fixedSrc = fixImageUrl(src)
      return (
        <img
          {...props}
          src={fixedSrc}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            margin: '1.5rem 0'
          }}
          onError={(e) => {
            console.warn(`Failed to load image: ${fixedSrc}`)
            e.currentTarget.style.display = 'none'
          }}
        />
      )
    }
  }), [fixImageUrl])

  return (
    <div className="article-content">
      <div className="text-sm text-muted-foreground mb-6">{readingTime} min read</div>

      <div ref={contentRef} className="prose prose-lg dark:prose-invert max-w-none">
        {isMarkdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>

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
