"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ArticleList from "@/components/article-list"
import ArticleFilters from "@/components/article-filters"
import { articleApi, tagApi } from "@/lib/api-unified"
import type { Issue } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function ArticlesPageContent() {
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Issue[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
  const labels = searchParams.get("labels") || ""
  const authors = searchParams.get("authors") || ""
  const keyword = searchParams.get("keyword") || ""

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [articlesData, tagsData] = await Promise.all([
          articleApi.getArticles({
            page,
            pageSize: 12,
            labels,
            authors,
            keyword,
          }),
          tagApi.getTags(),
        ])
        setArticles(articlesData)
        setTags(tagsData)
        setError("")
      } catch (err) {
        console.error("Error loading articles page:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page, labels, authors, keyword])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Articles</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load articles: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <ArticleFilters tags={tags} selectedLabels={labels} selectedAuthors={authors} searchQuery={keyword} />
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : (
            <ArticleList articles={articles} />
          )}
        </div>
      </div>
    </div>
  )
}
