"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { articleApi, commentApi } from "@/lib/api-unified"
import ArticleContent from "@/components/article-content"
import ArticleMeta from "@/components/article-meta"
import CommentSection from "@/components/comment-section"
import TableOfContents from "@/components/table-of-contents"
import ReadingProgressBar from "@/components/reading-progress-bar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IssueDetail, IssueComment } from "@/types"

export default function ArticlePreviewPage() {
  const { number } = useParams<{ number: string }>()
  const [article, setArticle] = useState<IssueDetail | null>(null)
  const [comments, setComments] = useState<IssueComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true)
        setError(null)

        const articleData = await articleApi.getArticle(number)
        if (!articleData) {
          setError("Article not found")
          return
        }

        setArticle(articleData)

        // Load comments
        const commentsData = await commentApi.getComments(number)
        setComments(commentsData)
      } catch (err) {
        console.error("Error loading article:", err)
        setError(err.message || "Failed to load article")
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [number])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading article preview...</span>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Article not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isDraft = article.state === "closed" && article.labels.some((label) => label.name === "draft")
  const isArchived = article.state === "closed" && article.labels.some((label) => label.name === "archived")

  return (
    <>
      <ReadingProgressBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-4 space-x-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Eye className="h-3 w-3 mr-1" />
            Preview Mode
          </Badge>
          {isDraft && <Badge variant="outline">Draft</Badge>}
          {isArchived && <Badge variant="secondary">Archived</Badge>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <article className="prose dark:prose-invert max-w-none">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
              <ArticleMeta article={article} />
              <ArticleContent content={article.body} />
            </article>

            <div className="mt-12">
              <CommentSection articleNumber={article.number} initialComments={comments} isPreview={true} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <TableOfContents content={article.body} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
