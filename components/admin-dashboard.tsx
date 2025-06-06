"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Tags, AlertTriangle, Archive, FileEdit, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { articleApi, tagApi } from "@/lib/api-unified"
import { isApiConfigured } from "@/lib/api"
import SystemStatus from "@/components/system-status"
import Link from "next/link"

export default function AdminDashboard() {
  const [publishedArticles, setPublishedArticles] = useState<any[]>([])
  const [draftArticles, setDraftArticles] = useState<any[]>([])
  const [archivedArticles, setArchivedArticles] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newArticle, setNewArticle] = useState({
    title: "",
    body: "",
    labels: "",
    isDraft: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (!isApiConfigured()) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Load tags first as they're simpler
      try {
        const tagsData = await tagApi.getTags()
        setTags(tagsData || [])
      } catch (error) {
        console.error("Error loading tags:", error)
        setTags([])
      }

      // Try to load articles with error handling for each type
      try {
        const published = await articleApi.getPublishedArticles({ pageSize: 100 })
        setPublishedArticles(published || [])
      } catch (error) {
        console.error("Error loading published articles:", error)
        setPublishedArticles([])
      }

      try {
        const drafts = await articleApi.getDraftArticles({ pageSize: 100 })
        setDraftArticles(drafts || [])
      } catch (error) {
        console.error("Error loading draft articles:", error)
        setDraftArticles([])
      }

      try {
        const archived = await articleApi.getArchivedArticles({ pageSize: 100 })
        setArchivedArticles(archived || [])
      } catch (error) {
        console.error("Error loading archived articles:", error)
        setArchivedArticles([])
      }
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
  }

  const handleCreateArticle = async (e: React.FormEvent) => {
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
      const labels = newArticle.labels
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      if (newArticle.isDraft) {
        await articleApi.createDraft(newArticle.title, newArticle.body, labels)
      } else {
        await articleApi.createArticle(newArticle.title, newArticle.body, labels)
      }

      setNewArticle({ title: "", body: "", labels: "", isDraft: true })
      await loadData()

      toast({
        title: "Success",
        description: `Article ${newArticle.isDraft ? "draft" : ""} created successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create article",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Helper function to safely get article excerpt
  const getArticleExcerpt = (article) => {
    if (!article || !article.body) return "No content available"
    return typeof article.body === "string"
      ? article.body.substring(0, 100) + "..."
      : "Content not available in text format"
  }

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
            <div className="text-2xl font-bold">{publishedArticles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftArticles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived Articles</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archivedArticles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
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
              <CardTitle>Published Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publishedArticles.length === 0 ? (
                  <p className="text-muted-foreground">No published articles found.</p>
                ) : (
                  publishedArticles.map((article) => (
                    <div
                      key={article?.id || `article-${Math.random()}`}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          <Link href={`/articles/${article?.number}`} className="hover:underline">
                            {article?.title || "Untitled Article"}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{getArticleExcerpt(article)}</p>
                        <div className="flex gap-2 mt-2">
                          {article?.labels?.slice(0, 3).map((label) => (
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
                      <div className="text-sm text-muted-foreground">#{article?.number || "N/A"}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <Card>
            <CardHeader>
              <CardTitle>Draft Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {draftArticles.length === 0 ? (
                  <p className="text-muted-foreground">No draft articles found.</p>
                ) : (
                  draftArticles.map((article) => (
                    <div
                      key={article?.id || `draft-${Math.random()}`}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          <Link href={`/articles/${article?.number}/preview`} className="hover:underline">
                            {article?.title || "Untitled Draft"}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{getArticleExcerpt(article)}</p>
                        <div className="flex gap-2 mt-2">
                          {article?.labels?.slice(0, 3).map((label) => (
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
                      <div className="text-sm text-muted-foreground">#{article?.number || "N/A"}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card>
            <CardHeader>
              <CardTitle>Archived Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {archivedArticles.length === 0 ? (
                  <p className="text-muted-foreground">No archived articles found.</p>
                ) : (
                  archivedArticles.map((article) => (
                    <div
                      key={article?.id || `archived-${Math.random()}`}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          <Link href={`/articles/${article?.number}/preview`} className="hover:underline">
                            {article?.title || "Untitled Archive"}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{getArticleExcerpt(article)}</p>
                        <div className="flex gap-2 mt-2">
                          {article?.labels?.slice(0, 3).map((label) => (
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
                      <div className="text-sm text-muted-foreground">#{article?.number || "N/A"}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
