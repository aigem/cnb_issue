import type { IssueDetail, Issue } from "@/types"

// Server-side only configuration
function getServerConfig() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const API_TOKEN = process.env.API_TOKEN
  const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

  return { API_BASE_URL, API_TOKEN, REPO_NAME }
}

// Client-side configuration check
function getClientConfig() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

  return { API_BASE_URL, REPO_NAME }
}

type GetArticlesParams = {
  page?: number
  pageSize?: number
  state?: string
  keyword?: string
  labels?: string
  authors?: string
  assignees?: string
  priority?: string
  updatedTimeBegin?: string
  updatedTimeEnd?: string
  closeTimeBegin?: string
  closeTimeEnd?: string
  orderBy?: string // 新增更多排序选项：created_at, -updated_at, reference_count, -reference_count
}

export async function getArticles(params: GetArticlesParams = {}): Promise<Issue[]> {
  // Ensure this is running on the server
  if (typeof window !== "undefined") {
    throw new Error("getArticles should only be called on the server side")
  }

  // Additional check for server environment
  if (!process.env.API_TOKEN) {
    throw new Error("This function can only be called in a server environment")
  }

  const { API_BASE_URL, API_TOKEN, REPO_NAME } = getServerConfig()

  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required")
  }

  if (!API_TOKEN) {
    throw new Error("API_TOKEN environment variable is required")
  }

  const {
    page = 1,
    pageSize = 10,
    state = "open",
    keyword,
    labels,
    authors,
    assignees,
    priority,
    updatedTimeBegin,
    updatedTimeEnd,
    closeTimeBegin,
    closeTimeEnd,
    orderBy = "-created_at",
  } = params

  const searchParams = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    state,
    order_by: orderBy,
  })

  if (keyword) searchParams.append("keyword", keyword)
  if (labels) searchParams.append("labels", labels)
  if (authors) searchParams.append("authors", authors)
  if (assignees) searchParams.append("assignees", assignees)
  if (priority) searchParams.append("priority", priority)
  if (updatedTimeBegin) searchParams.append("updated_time_begin", updatedTimeBegin)
  if (updatedTimeEnd) searchParams.append("updated_time_end", updatedTimeEnd)
  if (closeTimeBegin) searchParams.append("close_time_begin", closeTimeBegin)
  if (closeTimeEnd) searchParams.append("close_time_end", closeTimeEnd)

  try {
    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues?${searchParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { tags: ["articles"], revalidate: 300 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching articles:", error)
    throw error
  }
}

export async function getArticle(number: string | number): Promise<IssueDetail | null> {
  // Ensure this is running on the server
  if (typeof window !== "undefined") {
    throw new Error("getArticle should only be called on the server side")
  }

  // Additional check for server environment
  if (!process.env.API_TOKEN) {
    throw new Error("This function can only be called in a server environment")
  }

  const { API_BASE_URL, API_TOKEN, REPO_NAME } = getServerConfig()

  if (!API_BASE_URL || !API_TOKEN) {
    throw new Error("API configuration missing")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { tags: [`article-${number}`], revalidate: 300 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching article ${number}:`, error)
    throw error
  }
}

export async function getArticleComments(number: string | number, page = 1, pageSize = 30) {
  // Ensure this is running on the server
  if (typeof window !== "undefined") {
    throw new Error("getArticleComments should only be called on the server side")
  }

  // Additional check for server environment
  if (!process.env.API_TOKEN) {
    throw new Error("This function can only be called in a server environment")
  }

  const { API_BASE_URL, API_TOKEN, REPO_NAME } = getServerConfig()

  if (!API_BASE_URL || !API_TOKEN) {
    throw new Error("API configuration missing")
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/${REPO_NAME}/-/issues/${number}/comments?page=${page}&page_size=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        next: { tags: [`article-${number}-comments`], revalidate: 60 },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`Error fetching comments for article ${number}:`, error)
    throw error
  }
}

export async function getArticleTags(number: string | number) {
  // Ensure this is running on the server
  if (typeof window !== "undefined") {
    throw new Error("getArticleTags should only be called on the server side")
  }

  // Additional check for server environment
  if (!process.env.API_TOKEN) {
    throw new Error("This function can only be called in a server environment")
  }

  const { API_BASE_URL, API_TOKEN, REPO_NAME } = getServerConfig()

  if (!API_BASE_URL || !API_TOKEN) {
    throw new Error("API configuration missing")
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${REPO_NAME}/-/issues/${number}/labels`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { tags: [`article-${number}-tags`], revalidate: 300 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error(`Error fetching tags for article ${number}:`, error)
    throw error
  }
}

export async function getAllTags() {
  // Ensure this is running on the server
  if (typeof window !== "undefined") {
    throw new Error("getAllTags should only be called on the server side")
  }

  // Additional check for server environment
  if (!process.env.API_TOKEN) {
    throw new Error("This function can only be called in a server environment")
  }

  try {
    // Get all articles to extract unique tags
    const articles = await getArticles({ pageSize: 100, state: "open" })
    const tagsMap = new Map()

    articles.forEach((article) => {
      if (article.labels) {
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

    return Array.from(tagsMap.values())
  } catch (error) {
    console.error("Error fetching all tags:", error)
    throw error
  }
}

// Client-side API functions that use API routes
export async function postComment(issueNumber: string | number, body: string) {
  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ issueNumber, body }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to post comment")
    }

    return await response.json()
  } catch (error) {
    console.error("Error posting comment:", error)
    throw error
  }
}

export async function createArticle(title: string, body: string, labels?: string[]) {
  try {
    const response = await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body, labels }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create article")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating article:", error)
    throw error
  }
}

export async function updateArticle(number: string | number, title?: string, body?: string, state?: string) {
  try {
    const response = await fetch("/api/articles", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, title, body, state }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update article")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating article:", error)
    throw error
  }
}

// Check if API is configured (client-side safe)
export function isApiConfigured() {
  const { API_BASE_URL } = getClientConfig()
  return !!API_BASE_URL
}
