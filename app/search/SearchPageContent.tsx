"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ArticleList from "@/components/article-list"
import { articleApi } from "@/lib/api-unified"
import type { Issue } from "@/types"

export default function SearchPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [articles, setArticles] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const results = await articleApi.getArticles({
        keyword: query,
        pageSize: 50,
      })
      setArticles(results)
    } catch (error) {
      console.error("Search error:", error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery.trim())
      window.history.pushState({}, "", url.toString())
      performSearch(searchQuery.trim())
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Articles</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-md">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Searching...</p>
        </div>
      )}

      {!loading && hasSearched && (
        <div className="mb-4">
          <p className="text-muted-foreground">
            Found {articles.length} article{articles.length !== 1 ? "s" : ""} for "{searchParams.get("q")}"
          </p>
        </div>
      )}

      {!loading && hasSearched && <ArticleList articles={articles} />}

      {!loading && !hasSearched && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a search term to find articles.</p>
        </div>
      )}
    </div>
  )
}
