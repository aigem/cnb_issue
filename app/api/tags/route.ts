import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET() {
  console.log("[Tags API] Route called")

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      console.log("[Tags API] Missing configuration")
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    // 获取所有文章来提取标签
    console.log(`[Tags API] Fetching articles to extract tags`)
    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues?page=1&page_size=100&state=open`, {
      headers: {
        Authorization: API_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    console.log(`[Tags API] Articles API responded with status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Tags API] API Error: ${response.status} ${response.statusText}`, errorText)

      // If no articles found, return empty array
      if (response.status === 404) {
        console.log(`[Tags API] No articles found, returning empty tags array`)
        return NextResponse.json([])
      }

      return NextResponse.json({ error: "Failed to fetch tags" }, { status: response.status })
    }

    const articles = await response.json()
    console.log(`[Tags API] Received ${Array.isArray(articles) ? articles.length : 0} articles`)

    const tagsMap = new Map()

    if (Array.isArray(articles)) {
      articles.forEach((article) => {
        if (article.labels && Array.isArray(article.labels)) {
          article.labels.forEach((label) => {
            if (tagsMap.has(label.name)) {
              tagsMap.set(label.name, {
                ...label,
                count: tagsMap.get(label.name).count + 1,
              })
            } else {
              tagsMap.set(label.name, { ...label, count: 1 })
            }
          })
        }
      })
    }

    const tags = Array.from(tagsMap.values())
    console.log(`[Tags API] Extracted ${tags.length} unique tags`)

    return NextResponse.json(tags)
  } catch (error) {
    console.error("[Tags API] Error fetching tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
