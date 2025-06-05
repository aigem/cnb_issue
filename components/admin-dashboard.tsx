"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { createArticle, isApiConfigured } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, FileText, Tags, Users, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboard() {
  const [articles, setArticles] = useState([])
  const [tags, setTags] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newArticle, setNewArticle] = useState({
    title: "",
    body: "",
    labels: "",
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

      const [articlesResponse, tagsResponse] = await Promise.all([fetch("/api/admin/articles"), fetch("/api/tags")])

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json()
        setArticles(articlesData)
      }

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json()
        setTags(tagsData)
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

      await createArticle(newArticle.title, newArticle.body, labels)

      setNewArticle({ title: "", body: "", labels: "" })
      await loadData()

      toast({
        title: "Success",
        description: "Article created successfully",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {articles.reduce((sum, article) => sum + (article.comments || 0), 0)}
            </div>
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

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Article"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.length === 0 ? (
              <p className="text-muted-foreground">No articles found. Create your first article above!</p>
            ) : (
              articles.slice(0, 10).map((article) => (
                <div key={article.id} className="flex justify-between items-start p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{article.body.substring(0, 100)}...</p>
                    <div className="flex gap-2 mt-2">
                      {article.labels?.slice(0, 3).map((label) => (
                        <Badge key={label.id} variant="outline" style={{ borderColor: `#${label.color}` }}>
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">#{article.number}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
