"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ArticleList from "@/components/article-list"
import type { Issue } from "@/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Loader2 } from "lucide-react"
import { articleApi, tagApi } from "@/lib/api-unified"

export default function Home() {
  const [articles, setArticles] = useState<Issue[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        console.log("[Homepage] Starting to load data")

        // Load articles and tags separately to avoid one failure affecting the other
        const articlesData = await articleApi.getArticles({ page: 1, pageSize: 6 })
        console.log("[Homepage] Articles loaded:", articlesData.length)
        setArticles(articlesData)

        const tagsData = await tagApi.getTags()
        console.log("[Homepage] Tags loaded:", tagsData.length)
        setTags(tagsData)

        console.log("[Homepage] Data loading completed successfully")
      } catch (err) {
        console.error("Error loading homepage:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div>Error: {error}</div>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section className="py-12 md:py-16 lg:py-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">Modern Blog</h1>
          <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
            Discover insightful articles, tutorials, and stories powered by Next.js 15
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button asChild size="lg">
              <Link href="/articles">Browse Articles</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/tags">Explore Topics</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
          <Button variant="ghost" asChild>
            <Link href="/articles">View all</Link>
          </Button>
        </div>
        {articles.length > 0 ? (
          <ArticleList articles={articles} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {loading ? "Loading articles..." : "No articles found. Create your first article!"}
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/admin">Go to Admin</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/debug">Debug API</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {tags.length > 0 && (
        <section className="py-12">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Popular Topics</h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <Link href={`/tags/${encodeURIComponent(tag.name)}`} key={tag.name}>
                <Button variant="outline" size="sm" className="hover:bg-secondary">
                  {tag.name} ({tag.count})
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
