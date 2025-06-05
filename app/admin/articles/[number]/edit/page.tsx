"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { articleApi } from "@/lib/api-unified"
import type { IssueDetail } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"
import Link from "next/link"
import { arraysEqual } from "@/lib/utils"
import {
  type PriorityLabel,
  PRIORITY_LABELS,
  togglePriorityLabelInString,
  isPriorityLabelActive,
} from "@/lib/article-form-utils"

interface ArticleFormState {
  title: string;
  body: string;
  labels: string; // Comma or space-separated string
}

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const articleNumber = params.number as string

  const [article, setArticle] = useState<IssueDetail | null>(null)
  const [formData, setFormData] = useState<ArticleFormState>({ title: "", body: "", labels: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (articleNumber) {
      setIsLoading(true)
      articleApi.getArticle(articleNumber)
        .then(data => {
          if (data) {
            setArticle(data)
            setFormData({
              title: data.title || "",
              body: data.body || "",
              labels: data.labels?.map(l => l.name).join(", ") || ""
            })
          } else {
            notFound()
          }
        })
        .catch(err => {
          // console.error("Failed to fetch article for editing:", err) // Toast is shown
          toast({ title: "Error", description: "Failed to load article data.", variant: "destructive" })
          notFound()
        })
        .finally(() => setIsLoading(false))
    }
  }, [articleNumber, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!article) return

    setIsSaving(true)
    try {
      let mainContentUpdated = false
      if (formData.title !== article.title || formData.body !== article.body) {
        await articleApi.updateArticle(article.number, { title: formData.title, body: formData.body });
        mainContentUpdated = true;
      }

      const newLabelsArray = formData.labels.split(/[\s,]+/).map(l => l.trim()).filter(l => l)
      const currentLabelsArray = article.labels?.map(l => l.name).sort() || []
      const sortedNewLabelsArray = [...newLabelsArray].sort()

      let labelsUpdated = false;
      if (!arraysEqual(sortedNewLabelsArray, currentLabelsArray)) {
        await articleApi.setArticleLabels(article.number, newLabelsArray)
        labelsUpdated = true;
      }

      if (!mainContentUpdated && !labelsUpdated) {
        toast({ title: "No Changes", description: "No changes detected to save." })
      } else {
        toast({ title: "Success", description: "Article updated successfully." })
        router.push(`/articles/${article.number}`)
        // It's good practice to refresh data that might be stale.
        // router.refresh() might cause a full reload of server components on the current page if any part of layout uses it.
        // For redirecting and then wanting fresh data on the *new* page, Next.js <Link> navigation often handles this.
        // If the target page /articles/[article.number] uses client-side fetching in useEffect, it will refetch.
        // If it's server-rendered with cached data, revalidatePath on the server (done by APIs) is key.
        // For this client-side navigation, router.push is usually sufficient if target page fetches fresh data.
      }
    } catch (error) {
      // console.error("Error updating article:", error) // Toast is shown
      toast({ title: "Error", description: `Failed to update article: ${error.message}`, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
        Loading article for editing...
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Article not found or failed to load. Ensure the article number is valid.
        <Link href="/admin" className="block mt-4 text-blue-500 hover:underline">
          Go to Admin Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href={`/articles/${article.number}`} className="text-sm text-blue-500 hover:underline">
            &larr; Back to Article
          </Link>
          <h1 className="text-3xl font-bold mt-1">Edit Article</h1>
        </div>
        <p className="text-sm text-muted-foreground truncate max-w-xs">Editing: {article.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="labels">Tags (space or comma-separated)</Label>
          <Input
            id="labels"
            name="labels"
            value={formData.labels}
            onChange={handleChange}
            placeholder="e.g., nextjs, react, P0"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {PRIORITY_LABELS.map((priority) => (
              <Button
                key={priority}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newLabelsString = togglePriorityLabelInString(formData.labels, priority);
                  setFormData(prev => ({ ...prev, labels: newLabelsString }));
                }}
                className={
                  isPriorityLabelActive(formData.labels, priority)
                    ? "border-primary text-primary ring-2 ring-primary"
                    : ""
                }
              >
                {priority}
              </Button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Use P0, P1, P2, or P3 for priority. Only one can be active.
          </p>
        </div>
        <div>
          <Label htmlFor="body">Content (Markdown)</Label>
          <Textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows={15}
            required
            className="font-mono text-sm"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
