"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Tags, AlertTriangle, Archive, FileEdit, Send, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { articleApi, tagApi } from "@/lib/api-unified"
import { isApiConfigured } from "@/lib/api"
import SystemStatus from "@/components/system-status"
import Link from "next/link"

// 常量配置
const ARTICLES_PER_PAGE = 10
const MAX_ARTICLES_FETCH = 100
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || 'cnb.ai/testblog'

// 类型定义
interface Article {
  id: string | number
  number: string | number
  title: string
  labels?: Array<{ id: string | number; name: string; color?: string }>
}

interface Tag {
  id: string | number
  name: string
  color?: string
}

export default function AdminDashboard() {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([])
  const [draftArticles, setDraftArticles] = useState<Article[]>([])
  const [archivedArticles, setArchivedArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newArticle, setNewArticle] = useState({
    title: "",
    body: "",
    labels: "",
    priority: "",
    assignees: "",
    isDraft: true,
  })

  // Pagination states
  const [publishedPage, setPublishedPage] = useState(1)
  const [draftPage, setDraftPage] = useState(1)
  const [archivedPage, setArchivedPage] = useState(1)

  const { toast } = useToast()

  // Memoized values
  const stats = useMemo(() => ({
    published: publishedArticles.length,
    drafts: draftArticles.length,
    archived: archivedArticles.length,
    tags: tags.length,
  }), [publishedArticles.length, draftArticles.length, archivedArticles.length, tags.length])

  // Optimized pagination helper functions
  const getPaginatedData = useCallback((data: Article[], page: number) => {
    const startIndex = (page - 1) * ARTICLES_PER_PAGE
    const endIndex = startIndex + ARTICLES_PER_PAGE
    return data.slice(startIndex, endIndex)
  }, [])

  const getTotalPages = useCallback((data: Article[]) => {
    return Math.ceil(data.length / ARTICLES_PER_PAGE)
  }, [])

  // Memoized paginated data
  const paginatedPublished = useMemo(() =>
    getPaginatedData(publishedArticles, publishedPage),
    [publishedArticles, publishedPage, getPaginatedData]
  )
  const paginatedDrafts = useMemo(() =>
    getPaginatedData(draftArticles, draftPage),
    [draftArticles, draftPage, getPaginatedData]
  )
  const paginatedArchived = useMemo(() =>
    getPaginatedData(archivedArticles, archivedPage),
    [archivedArticles, archivedPage, getPaginatedData]
  )

  const loadData = useCallback(async () => {
    try {
      if (!isApiConfigured()) {
        setLoading(false)
        return
      }

      setLoading(true)

      // 并行加载所有数据以提高性能
      const [tagsResult, publishedResult, draftsResult, archivedResult] = await Promise.allSettled([
        tagApi.getTags(),
        articleApi.getPublishedArticles({ pageSize: MAX_ARTICLES_FETCH }),
        articleApi.getDraftArticles({ pageSize: MAX_ARTICLES_FETCH }),
        articleApi.getArchivedArticles({ pageSize: MAX_ARTICLES_FETCH })
      ])

      // 处理结果，确保错误不会影响其他数据加载
      setTags(tagsResult.status === 'fulfilled' ? (tagsResult.value || []) : [])
      setPublishedArticles(publishedResult.status === 'fulfilled' ? (publishedResult.value || []) : [])
      setDraftArticles(draftsResult.status === 'fulfilled' ? (draftsResult.value || []) : [])
      setArchivedArticles(archivedResult.status === 'fulfilled' ? (archivedResult.value || []) : [])

      // 记录任何加载错误
      if (tagsResult.status === 'rejected') console.error("Error loading tags:", tagsResult.reason)
      if (publishedResult.status === 'rejected') console.error("Error loading published articles:", publishedResult.reason)
      if (draftsResult.status === 'rejected') console.error("Error loading draft articles:", draftsResult.reason)
      if (archivedResult.status === 'rejected') console.error("Error loading archived articles:", archivedResult.reason)

    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 优化的表单输入处理函数
  const handleInputChange = useCallback((field: keyof typeof newArticle, value: string | boolean) => {
    setNewArticle(prev => ({ ...prev, [field]: value }))
  }, [])

  // 优化的字符串分割函数
  const splitByMultipleSeparators = useCallback((str: string) => {
    return str.split(/[,，\s]+/).map(item => item.trim()).filter(item => item.length > 0)
  }, [])

  // 获取原文URL的memoized函数
  const getOriginalUrl = useCallback((articleNumber: string | number) => {
    return `https://cnb.cool/${REPO_NAME}/-/issues/${articleNumber}`
  }, [])

  // 优化的删除提示函数
  const showDeleteHint = useCallback(() => {
    toast({
      title: "删除提示",
      description: "请到原文中删除文章。点击左侧的链接图标即可跳转到原文。",
    })
  }, [toast])

  const handleCreateArticle = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newArticle.title.trim() || !newArticle.body.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      // 使用优化的分割函数
      const labels = splitByMultipleSeparators(newArticle.labels)
      const assignees = splitByMultipleSeparators(newArticle.assignees)

      // Create article data with additional fields
      const articleData = {
        title: newArticle.title.trim(),
        body: newArticle.body.trim(),
        labels: labels,
        priority: newArticle.priority || undefined,
        assignees: assignees.length > 0 ? assignees : undefined,
      }

      if (newArticle.isDraft) {
        await articleApi.createDraft(articleData.title, articleData.body, articleData.labels)
      } else {
        await articleApi.createArticle(articleData.title, articleData.body, articleData.labels)
      }

      // 重置表单
      setNewArticle({ title: "", body: "", labels: "", priority: "", assignees: "", isDraft: true })

      // 重新加载数据
      await loadData()

      toast({
        title: "Success",
        description: `Article ${newArticle.isDraft ? "draft" : ""} created successfully`,
      })
    } catch (error) {
      console.error("Create article error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }, [newArticle, toast, splitByMultipleSeparators, loadData])

  // 优化的分页导航函数
  const handlePageChange = useCallback((type: 'published' | 'draft' | 'archived', direction: 'prev' | 'next') => {
    const setters = {
      published: setPublishedPage,
      draft: setDraftPage,
      archived: setArchivedPage
    }

    const currentPages = {
      published: publishedPage,
      draft: draftPage,
      archived: archivedPage
    }

    const dataSets = {
      published: publishedArticles,
      draft: draftArticles,
      archived: archivedArticles
    }

    const totalPages = getTotalPages(dataSets[type])
    const currentPage = currentPages[type]

    if (direction === 'prev' && currentPage > 1) {
      setters[type](currentPage - 1)
    } else if (direction === 'next' && currentPage < totalPages) {
      setters[type](currentPage + 1)
    }
  }, [publishedPage, draftPage, archivedPage, publishedArticles, draftArticles, archivedArticles, getTotalPages])

  if (!isApiConfigured()) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          API not configured. Please set NEXT_PUBLIC_API_BASE_URL and API_TOKEN environment variables.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <div>Loading admin dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Articles</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tags}</div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="mb-8">
        <SystemStatus />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Article
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateArticle} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                placeholder="Enter article title..."
              />
            </div>

            <div>
              <Label htmlFor="labels">Tags (comma-separated)</Label>
              <Input
                id="labels"
                value={newArticle.labels}
                onChange={(e) => setNewArticle({ ...newArticle, labels: e.target.value })}
                placeholder="nextjs, react, tutorial"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newArticle.priority}
                  onChange={(e) => setNewArticle({ ...newArticle, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">Select Priority</option>
                  <option value="p0">P0 - Critical</option>
                  <option value="p1">P1 - High</option>
                  <option value="p2">P2 - Medium</option>
                  <option value="p3">P3 - Low</option>
                </select>
              </div>
              <div>
                <Label htmlFor="assignees">Assignees (comma-separated)</Label>
                <Input
                  id="assignees"
                  value={newArticle.assignees}
                  onChange={(e) => setNewArticle({ ...newArticle, assignees: e.target.value })}
                  placeholder="user1, user2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="body">Content (Markdown)</Label>
              <Textarea
                id="body"
                value={newArticle.body}
                onChange={(e) => setNewArticle({ ...newArticle, body: e.target.value })}
                placeholder="Write your article content in Markdown..."
                className="min-h-[200px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDraft"
                checked={newArticle.isDraft}
                onChange={(e) => setNewArticle({ ...newArticle, isDraft: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDraft">Save as draft</Label>
            </div>

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Article"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedArticles.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftArticles.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedArticles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Published Articles
                <span className="text-sm font-normal text-muted-foreground">
                  {publishedArticles.length} total
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {publishedArticles.length === 0 ? (
                  <p className="text-muted-foreground">No published articles found.</p>
                ) : (
                  <>
                    {getPaginatedData(publishedArticles, publishedPage).map((article: any) => (
                      <div
                        key={article?.id || `article-${Math.random()}`}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            <Link href={`/articles/${article?.number}`} className="hover:underline">
                              {article?.title || "Untitled Article"}
                            </Link>
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {article?.labels?.slice(0, 3).map((label: any) => (
                              <Badge
                                key={label?.id || `label-${Math.random()}`}
                                variant="outline"
                                style={{ borderColor: `#${label?.color || "888888"}` }}
                              >
                                {label?.name || "Unlabeled"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{article?.number || "N/A"}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getOriginalUrl(article?.number), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "删除提示",
                                description: "请到原文中删除文章。点击左侧的链接图标即可跳转到原文。",
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination for published articles */}
                    {getTotalPages(publishedArticles) > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPublishedPage(Math.max(1, publishedPage - 1))}
                          disabled={publishedPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          第 {publishedPage} 页，共 {getTotalPages(publishedArticles)} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPublishedPage(Math.min(getTotalPages(publishedArticles), publishedPage + 1))}
                          disabled={publishedPage === getTotalPages(publishedArticles)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Draft Articles
                <span className="text-sm font-normal text-muted-foreground">
                  {draftArticles.length} total
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {draftArticles.length === 0 ? (
                  <p className="text-muted-foreground">No draft articles found.</p>
                ) : (
                  <>
                    {getPaginatedData(draftArticles, draftPage).map((article: any) => (
                      <div
                        key={article?.id || `draft-${Math.random()}`}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            <Link href={`/articles/${article?.number}/preview`} className="hover:underline">
                              {article?.title || "Untitled Draft"}
                            </Link>
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {article?.labels?.slice(0, 3).map((label: any) => (
                              <Badge
                                key={label?.id || `label-${Math.random()}`}
                                variant="outline"
                                style={{ borderColor: `#${label?.color || "888888"}` }}
                              >
                                {label?.name || "Unlabeled"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{article?.number || "N/A"}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getOriginalUrl(article?.number), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "删除提示",
                                description: "请到原文中删除文章。点击左侧的链接图标即可跳转到原文。",
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination for draft articles */}
                    {getTotalPages(draftArticles) > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDraftPage(Math.max(1, draftPage - 1))}
                          disabled={draftPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          第 {draftPage} 页，共 {getTotalPages(draftArticles)} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDraftPage(Math.min(getTotalPages(draftArticles), draftPage + 1))}
                          disabled={draftPage === getTotalPages(draftArticles)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Archived Articles
                <span className="text-sm font-normal text-muted-foreground">
                  {archivedArticles.length} total
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {archivedArticles.length === 0 ? (
                  <p className="text-muted-foreground">No archived articles found.</p>
                ) : (
                  <>
                    {getPaginatedData(archivedArticles, archivedPage).map((article: any) => (
                      <div
                        key={article?.id || `archived-${Math.random()}`}
                        className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            <Link href={`/articles/${article?.number}/preview`} className="hover:underline">
                              {article?.title || "Untitled Archive"}
                            </Link>
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {article?.labels?.slice(0, 3).map((label: any) => (
                              <Badge
                                key={label?.id || `label-${Math.random()}`}
                                variant="outline"
                                style={{ borderColor: `#${label?.color || "888888"}` }}
                              >
                                {label?.name || "Unlabeled"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">#{article?.number || "N/A"}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getOriginalUrl(article?.number), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "删除提示",
                                description: "请到原文中删除文章。点击左侧的链接图标即可跳转到原文。",
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination for archived articles */}
                    {getTotalPages(archivedArticles) > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedPage(Math.max(1, archivedPage - 1))}
                          disabled={archivedPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          第 {archivedPage} 页，共 {getTotalPages(archivedArticles)} 页
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setArchivedPage(Math.min(getTotalPages(archivedArticles), archivedPage + 1))}
                          disabled={archivedPage === getTotalPages(archivedArticles)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
