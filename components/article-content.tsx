"use client"

import { useEffect } from "react" // Keep for readingTime or other non-DOM effects if any
import { useTheme } from "next-themes" // Keep if used for theme-specific logic, otherwise can remove

// ReactMarkdown and plugins
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"

// Styles for code highlighting
// Choose one theme or allow dynamic theme switching if necessary
import "highlight.js/styles/github.css" // For light theme
// import 'highlight.js/styles/github-dark.css'; // For dark theme - needs logic to switch

interface ArticleContentProps {
  content: string // Expect raw Markdown string
}

export default function ArticleContent({ content }: ArticleContentProps) {
  const { theme } = useTheme() // Still useful for prose-invert or future theme-specific needs

  // The existing image URL processing logic (applied to the string)
  // This should be applied to the raw Markdown content before passing to ReactMarkdown
  const processedContentForImages = content
    // Fix relative image URLs to absolute URLs for issue attachments
    .replace(/!\[([^\]]*)\]\((-\/imgs\/[^)]+)\)/g, (match, alt, src) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
      const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "blog"
      // Ensure src starts with / to form correct URL: /-/imgs/ -> /repoName/-/imgs/
      return `![${alt}](${baseUrl}/${repoName}${src.startsWith("/") ? "" : "/"}${src})`
    })
    // Fix any other potentially relative URLs if they are not starting with http/https and don't have the /-/imgs/ structure
    // This regex is a bit broad, might need refinement based on actual URL patterns
    .replace(/!\[([^\]]*)\]\((?!https?:\/\/|\/-\/imgs\/)([^)]+)\)/g, (match, alt, src) => {
       // Assuming these might be root-relative paths not caught by the first regex
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "" // Or some other base if not API_BASE_URL
      return `![${alt}](${baseUrl}${src.startsWith("/") ? "" : "/"}${src})`
    })

  // Calculate reading time from the raw markdown content
  // Using the original content before image URL processing for reading time calculation
  // as URL changes shouldn't affect word count significantly.
  const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200))

  // useEffect for theme changes that might affect ReactMarkdown if it doesn't auto-react
  // For now, rehype-highlight CSS is static, but this hook is here if needed.
  useEffect(() => {
    // Potentially switch highlight.js theme CSS if a dark mode specific one is also imported
    // e.g., by dynamically adding/removing a link tag or changing a class on the body
  }, [theme])

  return (
    <div className="article-content">
      <div className="text-sm text-muted-foreground mb-6">{readingTime} min read</div>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
          // className prop removed from here
          // If custom components are needed for images or other elements:
          // components={{
        //   img: ({node, ...props}) => {
        //     // Custom image handling here, e.g., error handling, placeholders
        //     // console.log(props.src); // Check the src being passed
        //     return <img {...props} style={{maxWidth: '100%', height: 'auto', borderRadius: '0.5rem'}} onError={(e) => e.currentTarget.style.display='none'} />;
        //   }
        // }}
      >
        {processedContentForImages}
      </ReactMarkdown>

      {/* Global styles that were previously applied. Review and move to global CSS or keep if scoped. */}
      {/* Some of these might be handled by prose classes or rehype-highlight styles. */}
      <style jsx global>{`
        /* Styles for images rendered by ReactMarkdown, if prose classes aren't enough */
        .article-content .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0; /* Default prose margins might be different */
        }
        
        /* Styles for code blocks if rehype-highlight theme needs overrides or additions */
        /* .article-content .prose pre {
          border-radius: 0.5rem;
          padding: 1rem; // Default highlight.js themes usually have padding
          overflow-x: auto;
        } */
        
        /* Styles for blockquotes if prose defaults need override */
        /* .article-content .prose blockquote {
          border-left-width: 4px; // Prose usually handles this
          padding-left: 1rem;
          font-style: italic;
        } */

        /* This specific selector might still be useful if some images are from the Gitea instance */
        .article-content img[src*="/-/imgs/"] {
          border: 1px solid hsl(var(--border)); /* Use CSS variable for border */
        }
      `}</style>
    </div>
  )
}
