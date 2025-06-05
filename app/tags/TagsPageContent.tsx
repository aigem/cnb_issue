"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import TagCloud from "@/components/tag-cloud"
import { tagApi } from "@/lib/api-unified"

export default function TagsPageContent() {
  const searchParams = useSearchParams()
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const sortBy = searchParams.get("sort") || "name"

  useEffect(() => {
    async function loadTags() {
      try {
        setLoading(true)
        const tagsData = await tagApi.getTags()
        setTags(tagsData)
        setError("")
      } catch (err) {
        console.error("Error loading tags:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tags</h1>
        <p className="text-red-500">Error loading tags: {error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Tags</h1>
      <TagCloud tags={tags} loading={loading} size="lg" />
    </div>
  )
}
