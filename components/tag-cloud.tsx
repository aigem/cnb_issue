"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface Tag {
  id: number
  name: string
  color: string
  count: number
}

interface TagCloudProps {
  maxTags?: number
  showCount?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "secondary"
}

export default function TagCloud({ maxTags = 20, showCount = true, size = "md", variant = "outline" }: TagCloudProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/tags")
        if (!response.ok) {
          throw new Error("Failed to fetch tags")
        }

        const fetchedTags = await response.json()
        setTags(Array.isArray(fetchedTags) ? fetchedTags : [])
      } catch (error) {
        console.error("Error fetching tags:", error)
        setError("Failed to load tags")
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  // 根据标签使用频率计算字体大小
  const getTagSize = (count: number, maxCount: number, minCount: number) => {
    const ratio = (count - minCount) / (maxCount - minCount) || 0

    switch (size) {
      case "sm":
        return `${0.75 + ratio * 0.5}rem` // 0.75rem - 1.25rem
      case "lg":
        return `${1 + ratio * 1}rem` // 1rem - 2rem
      default:
        return `${0.875 + ratio * 0.75}rem` // 0.875rem - 1.625rem
    }
  }

  // 获取标签颜色透明度
  const getTagOpacity = (count: number, maxCount: number, minCount: number) => {
    const ratio = (count - minCount) / (maxCount - minCount) || 0
    return 0.6 + ratio * 0.4 // 60% - 100% 透明度
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!tags.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tags found</p>
      </div>
    )
  }

  // 按使用频率排序并限制数量
  const sortedTags = [...tags].sort((a, b) => b.count - a.count).slice(0, maxTags)

  const maxCount = Math.max(...sortedTags.map((tag) => tag.count))
  const minCount = Math.min(...sortedTags.map((tag) => tag.count))

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {sortedTags.map((tag) => {
        const fontSize = getTagSize(tag.count, maxCount, minCount)
        const opacity = getTagOpacity(tag.count, maxCount, minCount)

        return (
          <Link
            href={`/tags/${encodeURIComponent(tag.name)}`}
            key={tag.name}
            className="transition-all duration-200 hover:scale-110"
          >
            <Badge
              variant={variant}
              className="hover:bg-secondary cursor-pointer transition-colors"
              style={{
                borderColor: `#${tag.color}`,
                fontSize,
                opacity,
                color: `#${tag.color}`,
              }}
            >
              {tag.name}
              {showCount && <span className="ml-1 text-xs opacity-75">({tag.count})</span>}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

// 服务端渲染版本的标签云
export async function TagCloudServer({
  maxTags = 20,
  showCount = true,
  size = "md",
  variant = "outline",
}: TagCloudProps) {
  try {
    // 这里应该调用服务端 API 函数
    // 但由于我们需要保持客户端兼容性，暂时返回客户端版本
    return <TagCloud maxTags={maxTags} showCount={showCount} size={size} variant={variant} />
  } catch (error) {
    console.error("Error loading tags:", error)
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load tags</AlertDescription>
      </Alert>
    )
  }
}
