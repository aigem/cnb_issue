import type { IssueDetail, Issue, IssueComment } from "@/types"

// 配置管理
export class ApiConfig {
  private static instance: ApiConfig

  private constructor(
    public readonly apiBaseUrl: string,
    public readonly apiToken: string,
    public readonly repoName: string,
  ) {}

  static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      const apiToken = process.env.API_TOKEN
      const repoName = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

      if (!apiBaseUrl) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required")
      }

      ApiConfig.instance = new ApiConfig(apiBaseUrl, apiToken || "", repoName)
    }
    return ApiConfig.instance
  }

  get isServerSide(): boolean {
    return typeof window === "undefined" && !!this.apiToken
  }

  get isConfigured(): boolean {
    return !!this.apiBaseUrl && (this.isServerSide ? !!this.apiToken : true)
  }
}

// 通用请求处理器
class ApiClient {
  private config: ApiConfig

  constructor() {
    this.config = ApiConfig.getInstance()
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.config.isServerSide ? `${this.config.apiBaseUrl}/${this.config.repoName}${endpoint}` : endpoint

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.config.isServerSide && this.config.apiToken) {
      headers.Authorization = `Bearer ${this.config.apiToken}`
    }

    return fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(15000),
    })
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.makeRequest(endpoint)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Resource not found")
      }
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to post: ${response.status}`)
    }

    return response.json()
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.makeRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to update: ${response.status}`)
    }

    return response.json()
  }
}

// 文章相关 API
export class ArticleApi {
  private client = new ApiClient()

  async getArticles(
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
    const config = ApiConfig.getInstance()

    if (config.isServerSide) {
      return this.getArticlesServer(params)
    } else {
      return this.getArticlesClient(params)
    }
  }

  private async getArticlesServer(params: any): Promise<Issue[]> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "pageSize") {
          searchParams.append("page_size", value.toString())
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    try {
      const data = await this.client.get<Issue[]>(`/-/issues?${searchParams.toString()}`)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error fetching articles:", error)
      return []
    }
  }

  private async getArticlesClient(params: any): Promise<Issue[]> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })

    try {
      const data = await this.client.get<Issue[]>(`/api/articles/list?${searchParams.toString()}`)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error fetching articles:", error)
      return []
    }
  }

  async getArticle(number: string | number): Promise<IssueDetail | null> {
    const config = ApiConfig.getInstance()

    try {
      if (config.isServerSide) {
        return await this.client.get<IssueDetail>(`/-/issues/${number}`)
      } else {
        return await this.client.get<IssueDetail>(`/api/articles/${number}`)
      }
    } catch (error) {
      if (error.message.includes("not found")) {
        return null
      }
      throw error
    }
  }

  async createArticle(title: string, body: string, labels?: string[]): Promise<IssueDetail> {
    return this.client.post<IssueDetail>("/api/articles", { title, body, labels })
  }

  async updateArticle(
    number: string | number,
    updates: { title?: string; body?: string; state?: string },
  ): Promise<IssueDetail> {
    return this.client.patch<IssueDetail>("/api/articles", { number, ...updates })
  }

  async publishArticle(number: string | number): Promise<IssueDetail> {
    return this.updateArticle(number, { state: "open" })
  }

  async unpublishArticle(number: string | number): Promise<IssueDetail> {
    return this.updateArticle(number, { state: "closed" })
  }

  async getDraftArticles(params: any = {}): Promise<Issue[]> {
    return this.getArticles({
      ...params,
      state: "closed",
      labels: "draft",
    })
  }

  async getPublishedArticles(params: any = {}): Promise<Issue[]> {
    return this.getArticles({
      ...params,
      state: "open",
    })
  }

  async getArchivedArticles(params: any = {}): Promise<Issue[]> {
    return this.getArticles({
      ...params,
      state: "closed",
      labels: "archived",
    })
  }

  async createDraft(title: string, body: string, labels: string[] = []): Promise<IssueDetail> {
    return this.client.post<IssueDetail>("/api/articles", {
      title,
      body,
      labels: [...labels, "draft"],
      state: "closed",
    })
  }

  async archiveArticle(number: string | number): Promise<IssueDetail> {
    // First add the archived label
    await this.client.post<any>(`/api/articles/${number}/labels`, {
      labels: ["archived"],
    })

    // Then close the issue
    return this.updateArticle(number, { state: "closed" })
  }
}

// 评论相关 API
export class CommentApi {
  private client = new ApiClient()

  async getComments(number: string | number, page = 1, pageSize = 30): Promise<IssueComment[]> {
    const config = ApiConfig.getInstance()

    try {
      if (config.isServerSide) {
        const data = await this.client.get<IssueComment[]>(
          `/-/issues/${number}/comments?page=${page}&page_size=${pageSize}`,
        )
        return Array.isArray(data) ? data : []
      } else {
        const data = await this.client.get<IssueComment[]>(
          `/api/articles/${number}/comments?page=${page}&pageSize=${pageSize}`,
        )
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      return []
    }
  }

  async createComment(issueNumber: string | number, body: string): Promise<IssueComment> {
    return this.client.post<IssueComment>("/api/comments", { issueNumber, body })
  }
}

// 标签相关 API
export class TagApi {
  private client = new ApiClient()

  async getTags(): Promise<any[]> {
    const config = ApiConfig.getInstance()

    try {
      if (config.isServerSide) {
        // 服务端获取所有文章来提取标签
        const articleApi = new ArticleApi()
        const articles = await articleApi.getArticles({ pageSize: 100, state: "open" })
        return this.extractTagsFromArticles(articles)
      } else {
        const data = await this.client.get<any[]>("/api/tags")
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
      return []
    }
  }

  private extractTagsFromArticles(articles: Issue[]): any[] {
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
  }
}

// 导出统一的 API 实例
export const articleApi = new ArticleApi()
export const commentApi = new CommentApi()
export const tagApi = new TagApi()

// 向后兼容的函数导出
export const getArticles = articleApi.getArticles.bind(articleApi)
export const getArticle = articleApi.getArticle.bind(articleApi)
export const createArticle = articleApi.createArticle.bind(articleApi)
export const updateArticle = articleApi.updateArticle.bind(articleApi)
export const getArticleComments = commentApi.getComments.bind(commentApi)
export const postComment = commentApi.createComment.bind(commentApi)
export const getAllTags = tagApi.getTags.bind(tagApi)

// 配置检查函数
export const isApiConfigured = () => ApiConfig.getInstance().isConfigured
