import type { Issue, IssueDetail, IssueComment } from "@/types"

// 客户端 API 调用函数
export async function fetchArticles(
  params: {
    page?: number
    pageSize?: number
    state?: string
    keyword?: string
    labels?: string
    authors?: string
    assignees?: string
    priority?: string
    orderBy?: string
  } = {},
): Promise<Issue[]> {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString())
    }
  })

  try {
    console.log(`[fetchArticles] Calling API with params:`, params)
    const apiUrl = `/api/articles/list?${searchParams.toString()}`
    console.log(`[fetchArticles] API URL: ${apiUrl}`)

    const response = await fetch(apiUrl)
    console.log(`[fetchArticles] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`[fetchArticles] API Error:`, errorData)

      // Don't throw error for 404, just return empty array
      if (response.status === 404) {
        console.log(`[fetchArticles] No articles found, returning empty array`)
        return []
      }

      throw new Error(errorData.error || `Failed to fetch articles: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[fetchArticles] Received data:`, data)

    // 确保返回的是数组
    if (!Array.isArray(data)) {
      console.warn("[fetchArticles] API did not return an array:", data)
      return []
    }

    console.log(`[fetchArticles] Successfully fetched ${data.length} articles`)
    return data
  } catch (error) {
    console.error("Error in fetchArticles:", error)
    // Don't re-throw the error, return empty array instead
    return []
  }
}

export async function fetchArticle(number: string): Promise<IssueDetail | null> {
  if (typeof number !== 'string' || !/^[1-9]\d*$/.test(number)) {
    console.warn(`[fetchArticle] Invalid article number requested: "${number}". Article number must be a positive integer string. Returning null.`);
    return null;
  }
  try {
    console.log(`[fetchArticle] Fetching article ${number}`)
    const response = await fetch(`/api/articles/${number}`)
    console.log(`[fetchArticle] Response status: ${response.status}`)

    if (response.status === 404) {
      console.log(`[fetchArticle] Article ${number} not found`)
      return null
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`[fetchArticle] API Error:`, errorData)
      throw new Error(errorData.error || `Failed to fetch article: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[fetchArticle] Successfully fetched article ${number}`)
    return data
  } catch (error) {
    console.error(`Error in fetchArticle:`, error)
    throw error
  }
}

export async function fetchArticleComments(number: string, page = 1, pageSize = 30): Promise<IssueComment[]> {
  try {
    console.log(`[fetchArticleComments] Fetching comments for article ${number}`)
    const response = await fetch(`/api/articles/${number}/comments?page=${page}&pageSize=${pageSize}`)
    console.log(`[fetchArticleComments] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`[fetchArticleComments] API Error:`, errorData)

      // Return empty array for comments if there's an error
      if (response.status === 404) {
        console.log(`[fetchArticleComments] No comments found for article ${number}`)
        return []
      }

      throw new Error(errorData.error || `Failed to fetch comments: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[fetchArticleComments] Successfully fetched ${Array.isArray(data) ? data.length : 0} comments`)

    // 确保返回的是数组
    if (!Array.isArray(data)) {
      console.warn("[fetchArticleComments] API did not return an array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error(`Error in fetchArticleComments:`, error)
    // Return empty array instead of throwing
    return []
  }
}

export async function fetchTags() {
  try {
    console.log(`[fetchTags] Fetching tags`)
    const response = await fetch("/api/tags")
    console.log(`[fetchTags] Response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error(`[fetchTags] API Error:`, errorData)

      // Return empty array for tags if there's an error
      if (response.status === 404) {
        console.log(`[fetchTags] No tags found`)
        return []
      }

      throw new Error(errorData.error || `Failed to fetch tags: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[fetchTags] Successfully fetched ${Array.isArray(data) ? data.length : 0} tags`)

    // 确保返回的是数组
    if (!Array.isArray(data)) {
      console.warn("[fetchTags] API did not return an array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error in fetchTags:", error)
    // Return empty array instead of throwing
    return []
  }
}

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
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to post comment: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in postComment:", error)
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
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to create article: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in createArticle:", error)
    throw error
  }
}
