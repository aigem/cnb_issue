"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { fetchArticles } from "@/lib/api-client"
import ArticleList from "@/components/article-list"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Issue } from "@/types"

interface TagPageContentProps {
  params: { tag: string }
}

export default function TagPageContent({ params }: TagPageContentProps) {
  const searchParams = useSearchParams()
  const tag = decodeURIComponent(params.tag)
  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1

  const [articles, setArticles] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true)
        console.log(`[TagPage] Fetching articles for tag: ${tag}`)
        const articlesData = await fetchArticles({
          page,
          pageSize: 12,
          labels: tag,
        })
        console.log(`[TagPage] Fetched ${articlesData.length} articles for tag: ${tag}`)
        setArticles(articlesData)
      } catch (err: any) {
        console.error(`Error loading articles for tag ${tag}:`, err)
        setError(err.message || "Failed to load articles")
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [tag, page])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Tag: {tag}</h1>
        <p className="text-muted-foreground mb-8">Loading articles tagged with {tag}...</p>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Tag: {tag}</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load articles: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Tag: {tag}</h1>
        <p className="text-muted-foreground mb-8">No articles found with tag: {tag}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Tag: {tag}</h1>
      <p className="text-muted-foreground mb-8">
        Found {articles.length} article{articles.length !== 1 ? "s" : ""} tagged with {tag}
      </p>

      <ArticleList articles={articles} />
    </div>
  )
}
