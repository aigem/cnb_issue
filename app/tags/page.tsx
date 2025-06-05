"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { fetchTags } from "@/lib/api-client"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function loadTags() {
      try {
        setLoading(true)
        console.log("[TagsPage] Fetching tags")
        const tagsData = await fetchTags()
        console.log(`[TagsPage] Fetched ${tagsData.length} tags`)
        setTags(tagsData)
      } catch (err) {
        console.error("Error loading tags page:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  // Group tags by first letter for alphabetical display
  const groupedTags = tags.reduce((acc: Record<string, any[]>, tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase()
    if (!acc[firstLetter]) {
      acc[firstLetter] = []
    }
    acc[firstLetter].push(tag)
    return acc
  }, {})

  // Sort the keys alphabetically
  const sortedLetters = Object.keys(groupedTags).sort()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tags</h1>
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tags...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tags</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to load tags: {error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tags</h1>

      {sortedLetters.length === 0 ? (
        <p className="text-muted-foreground">No tags found</p>
      ) : (
        <div className="space-y-8">
          {sortedLetters.map((letter) => (
            <div key={letter}>
              <h2 className="text-2xl font-bold mb-4">{letter}</h2>
              <div className="flex flex-wrap gap-3">
                {groupedTags[letter].map((tag) => (
                  <Link href={`/tags/${encodeURIComponent(tag.name)}`} key={tag.name}>
                    <Badge
                      variant="outline"
                      className="hover:bg-secondary cursor-pointer text-sm py-1 px-3"
                      style={{ borderColor: `#${tag.color}` }}
                    >
                      {tag.name} ({tag.count})
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
