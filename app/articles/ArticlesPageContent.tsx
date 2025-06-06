"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ArticleList from "@/components/article-list"
import ArticleFilters from "@/components/article-filters"
import { articleApi, tagApi } from "@/lib/api-unified"
import type { Issue } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ArticlesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [articles, setArticles] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [totalArticles, setTotalArticles] = useState(0)

  const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page")!) : 1
  const labels = searchParams.get("labels") || ""
  const authors = searchParams.get("authors") || ""
  const keyword = searchParams.get("keyword") || ""
  const pageSize = 9 // 每页显示9篇文章

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const articlesData = await articleApi.getArticles({
          page,
          pageSize,
          labels,
          authors,
          keyword,
        })

        setArticles(articlesData || [])
        // 估算总文章数（这里需要根据实际API返回调整）
        if (articlesData && articlesData.length === pageSize) {
          setTotalArticles(page * pageSize + 1) // 估算还有更多
        } else {
          setTotalArticles((page - 1) * pageSize + (articlesData?.length || 0))
        }
        setError("")
      } catch (err) {
        console.error("Error loading articles page:", err)
        setError(err instanceof Error ? err.message : 'Failed to load articles')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page, labels, authors, keyword, pageSize])

  // 分页导航函数
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    if (labels) params.set('labels', labels)
    if (authors) params.set('authors', authors)
    if (keyword) params.set('keyword', keyword)

    const queryString = params.toString()
    router.push(`/articles${queryString ? `?${queryString}` : ''}`)
  }

  const totalPages = Math.ceil(totalArticles / pageSize)
  const hasNextPage = articles.length === pageSize
  const hasPrevPage = page > 1

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
          <ArticleFilters selectedLabels={labels} selectedAuthors={authors} searchQuery={keyword} />
        </div>

        <div className="md:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : (
            <>
              <ArticleList articles={articles} />

              {/* 现代化分页导航 */}
              {(hasPrevPage || hasNextPage) && (
                <div className="flex justify-center items-center gap-6 mt-16 mb-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!hasPrevPage}
                    className="pagination-btn flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </button>

                  <div className="flex items-center gap-3 px-6 py-2 rounded-full glass">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium gradient-text">
                      第 {page} 页
                      {totalPages > 1 && ` / ${totalPages}`}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasNextPage}
                    className="pagination-btn flex items-center gap-2"
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
