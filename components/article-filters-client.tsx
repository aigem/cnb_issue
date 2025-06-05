"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface Tag {
  id: number
  name: string
  color: string
  count: number
}

interface ArticleFiltersClientProps {
  tags: Tag[]
  selectedLabels?: string
  selectedAuthors?: string
  searchQuery?: string
}

export default function ArticleFiltersClient({
  tags,
  selectedLabels = "",
  selectedAuthors = "",
  searchQuery = "",
}: ArticleFiltersClientProps) {
  const router = useRouter()
  const [query, setQuery] = useState(searchQuery)
  const [labels, setLabels] = useState<string[]>(selectedLabels ? selectedLabels.split(",") : [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const handleTagToggle = (tagName: string) => {
    setLabels((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((t) => t !== tagName)
      } else {
        return [...prev, tagName]
      }
    })
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (labels.length > 0) {
      params.set("labels", labels.join(","))
    }

    if (query) {
      params.set("keyword", query)
    }

    router.push(`/articles?${params.toString()}`)
  }

  const clearFilters = () => {
    setLabels([])
    setQuery("")
    router.push("/articles")
  }

  const hasActiveFilters = labels.length > 0 || query

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Search</h3>
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10"
          />
          <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Topics</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {tags.map((tag) => (
            <div key={tag.name} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.name}`}
                checked={labels.includes(tag.name)}
                onCheckedChange={() => handleTagToggle(tag.name)}
              />
              <Label htmlFor={`tag-${tag.name}`} className="text-sm cursor-pointer flex items-center">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: `#${tag.color}` }}
                ></span>
                {tag.name} ({tag.count})
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )
}
