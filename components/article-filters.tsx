"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"
import { tagApi } from "@/lib/api-unified"

interface Tag {
  id: number
  name: string
  color: string
  count: number
}

interface ArticleFiltersProps {
  selectedLabels?: string
  selectedAuthors?: string
  selectedPriority?: string
  selectedAssignees?: string
  searchQuery?: string
  orderBy?: string
}

export default function ArticleFilters({
  selectedLabels = "",
  selectedAuthors = "",
  selectedPriority = "",
  selectedAssignees = "",
  searchQuery = "",
  orderBy = "-created_at",
}: ArticleFiltersProps) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  // 过滤器状态
  const [query, setQuery] = useState(searchQuery)
  const [labels, setLabels] = useState<string[]>(selectedLabels ? selectedLabels.split(",") : [])
  const [priority, setPriority] = useState(selectedPriority)
  const [sortOrder, setSortOrder] = useState(orderBy)

  useEffect(() => {
    async function loadTags() {
      try {
        const tagsData = await tagApi.getTags()
        setTags(tagsData)
      } catch (error) {
        console.error("Error loading tags:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

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

    if (priority) {
      params.set("priority", priority)
    }

    if (sortOrder !== "-created_at") {
      params.set("orderBy", sortOrder)
    }

    router.push(`/articles?${params.toString()}`)
  }

  const clearFilters = () => {
    setLabels([])
    setQuery("")
    setPriority("")
    setSortOrder("-created_at")
    router.push("/articles")
  }

  const hasActiveFilters = labels.length > 0 || query || priority || sortOrder !== "-created_at"

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* 搜索框 */}
      <div>
        <Label htmlFor="search" className="text-sm font-medium">
          Search
        </Label>
        <form onSubmit={handleSearch} className="relative mt-2">
          <Input
            id="search"
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

      {/* 排序选择 */}
      <div>
        <Label className="text-sm font-medium">Sort by</Label>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">Newest first</SelectItem>
            <SelectItem value="created_at">Oldest first</SelectItem>
            <SelectItem value="-updated_at">Recently updated</SelectItem>
            <SelectItem value="updated_at">Least recently updated</SelectItem>
            <SelectItem value="-reference_count">Most referenced</SelectItem>
            <SelectItem value="reference_count">Least referenced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 优先级过滤 */}
      <div>
        <Label className="text-sm font-medium">Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="p0">Critical (P0)</SelectItem>
            <SelectItem value="p1">High (P1)</SelectItem>
            <SelectItem value="p2">Medium (P2)</SelectItem>
            <SelectItem value="p3">Low (P3)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 标签过滤 */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Topics</Label>

        {/* 已选择的标签 */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {labels.map((labelName) => (
              <Badge
                key={labelName}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleTagToggle(labelName)}
              >
                {labelName}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}

        {/* 可选择的标签 */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : (
            tags.map((tag) => (
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
            ))
          )}
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )
}
