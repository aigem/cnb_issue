"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare } from "lucide-react"
import { fetchArticle, fetchArticleComments } from "@/lib/api-client"
import Link from "next/link"
import ArticleContent from "@/components/article-content"
import CommentSection from "@/components/comment-section"
import TableOfContents from "@/components/table-of-contents"
import ReadingProgressBar from "@/components/reading-progress-bar"
import type { IssueDetail, IssueComment } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import ArticlePublishing from "@/components/article-publishing"

export default function ArticlePage() {
  const params = useParams()
  const number = params.number as string

  const [article, setArticle] = useState<IssueDetail | null>(null)
  const [comments, setComments] = useState<IssueComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(true) // TODO: Replace with actual admin check

  useEffect(() => {
    async function loadArticleData() {
      if (!number) return

      try {
        setLoading(true)
        setError("")

        // Load article and comments in parallel
        const [articleData, commentsData] = await Promise.all([fetchArticle(number), fetchArticleComments(number)])

        if (!articleData) {
          notFound()
          return
        }

        setArticle(articleData)
        setComments(commentsData)
      } catch (err) {
        console.error("Error loading article:", err)
        setError(err instanceof Error ? err.message : 'Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    loadArticleData()
  }, [number])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load article: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!article) {
    return notFound()
  }

  return (
    <>
      <ReadingProgressBar />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={article.author.avatar_url || "/placeholder.svg"} alt={article.author.nickname} />
                <AvatarFallback>{article.author.nickname.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span>{article.author.nickname}</span>
            </div>

            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{comments.length} comments</span>
            </div>

            {article.priority && (
              <div className="flex items-center">
                <span className="mr-1">🔴</span>
                <span className="text-sm">
                  优先级: {article.priority.toUpperCase()}
                </span>
              </div>
            )}

            {article.assignees && article.assignees.length > 0 && (
              <div className="flex items-center">
                <span className="mr-1">👤</span>
                <span className="text-sm">
                  指派: {article.assignees.map((assignee: any) => assignee.nickname || assignee.username).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {article.labels &&
              article.labels.map((label, index) => (
                <Link href={`/tags/${encodeURIComponent(label.name)}`} key={`${label.name}-${index}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-secondary cursor-pointer"
                    style={{ borderColor: label.color ? `#${label.color}` : undefined }}
                  >
                    {label.name}
                  </Badge>
                </Link>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {isAdmin && (
              <div className="mb-6">
                <ArticlePublishing
                  articleNumber={article.number}
                  articleState={article.state}
                  articleLabels={article.labels.map((label) => label.name)}
                />
              </div>
            )}
            <ArticleContent content={article.body_html || article.body || ""} />

            <hr className="my-8" />

            <CommentSection comments={comments} articleNumber={number} />
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <TableOfContents content={article.body || ""} />
            </div>
          </aside>
        </div>
      </article>
    </>
  )
}
