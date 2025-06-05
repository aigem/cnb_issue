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
import Link from "next/link"
import {
  type PriorityLabel,
  PRIORITY_LABELS,
  togglePriorityLabelInString,
  isPriorityLabelActive,
} from "@/lib/article-form-utils"

export default function AdminDashboard() {
  const [publishedArticles, setPublishedArticles] = useState([])
  const [draftArticles, setDraftArticles] = useState([])
  const [archivedArticles, setArchivedArticles] = useState([])
  const [tagsList, setTagsList] = useState([]) // Renamed to avoid conflict with html tags
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
      try {
        const tagsData = await tagApi.getTags()
        setTagsList(tagsData || [])
      } catch (error) {
        // console.error("Error loading tags:", error); // Toast is shown by the overall catch
        setTagsList([])
      }
      try {
        const published = await articleApi.getPublishedArticles({ pageSize: 100 })
        setPublishedArticles(published || [])
      } catch (error) {
        // console.error("Error loading published articles:", error); // Toast is shown by the overall catch
        setPublishedArticles([])
      }
      try {
        const drafts = await articleApi.getDraftArticles({ pageSize: 100 })
        setDraftArticles(drafts || [])
      } catch (error) {
        // console.error("Error loading draft articles:", error); // Toast is shown by the overall catch
        setDraftArticles([])
      }
      try {
        const archived = await articleApi.getArchivedArticles({ pageSize: 100 })
        setArchivedArticles(archived || [])
      } catch (error) {
        // console.error("Error loading archived articles:", error); // Toast is shown by the overall catch
        setArchivedArticles([])
      }
    } catch (error) {
      // console.error("Error loading dashboard data:", error); // This is the main error, toast is shown
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
        .split(/[\s,]+/)
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

  const getArticleExcerpt = (article) => {
    if (!article || !article.body) return "No content available"
    return typeof article.body === "string"
      ? article.body.substring(0, 100) + "..."
      : "Content not available in text format"
  }

  const renderPriorityBadge = (labelName: string) => {
    if (!PRIORITY_LABELS.includes(labelName as PriorityLabel)) return null

    const priorityColors: Record<PriorityLabel, string> = {
      P0: "hsl(var(--destructive))",
      P1: "hsl(var(--primary))",
      P2: "hsl(var(--primary) / 0.7)",
      P3: "hsl(var(--muted-foreground))",
    }
    return {
      backgroundColor: priorityColors[labelName as PriorityLabel],
      color: "hsl(var(--destructive-foreground))",
    }
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
            <div className="text-2xl font-bold">{tagsList.length}</div>
          </CardContent>
        </Card>
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
              <Label htmlFor="labels">Tags (space or comma-separated)</Label>
              <Input
                id="labels"
                value={newArticle.labels}
                onChange={(e) => setNewArticle({ ...newArticle, labels: e.target.value })}
                placeholder="nextjs react P0 P1"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {PRIORITY_LABELS.map((priority) => (
                  <Button
                    key={priority}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newLabelsString = togglePriorityLabelInString(newArticle.labels, priority);
                      setNewArticle({ ...newArticle, labels: newLabelsString });
                    }}
                    className={
                      isPriorityLabelActive(newArticle.labels, priority)
                        ? "border-primary text-primary ring-2 ring-primary"
                        : ""
                    }
                  >
                    {priority}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use P0, P1, P2, or P3 for priority. Only one can be active.
              </p>
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

        {[publishedArticles, draftArticles, archivedArticles].map((articleSet, index) => (
          <TabsContent
            key={["published", "drafts", "archived"][index]}
            value={["published", "drafts", "archived"][index]}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {["Published Articles", "Draft Articles", "Archived Articles"][index]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articleSet.length === 0 ? (
                    <p className="text-muted-foreground">
                      No {["published", "draft", "archived"][index]} articles found.
                    </p>
                  ) : (
                    articleSet.map((article) => (
                      <div
                        key={article?.id || `article-set-${index}-${Math.random()}`}
                        className="flex justify-between items-start p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            <Link
                              href={
                                index === 0
                                  ? `/articles/${article?.number}`
                                  : `/articles/${article?.number}/preview`
                              }
                              className="hover:underline"
                            >
                              {article?.title || "Untitled Article"}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{getArticleExcerpt(article)}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {article?.labels?.slice(0, 5).map((label) => {
                              const priorityStyle = renderPriorityBadge(label?.name)
                              return (
                                <Badge
                                  key={label?.id || label?.name || `label-item-${Math.random()}`}
                                  variant={priorityStyle ? "default" : "outline"}
                                  style={priorityStyle || { borderColor: `#${label?.color || "888888"}` }}
                                >
                                  {label?.name || "Unlabeled"}
                                </Badge>
                              )
                            })}
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
        ))}
      </Tabs>
    </div>
  )
}
