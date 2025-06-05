"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { articleApi } from "@/lib/api-unified"
import { Eye, Archive, FileEdit, Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface ArticlePublishingProps {
  articleNumber: string
  articleState: string
  articleLabels: string[]
}

export default function ArticlePublishing({ articleNumber, articleState, articleLabels }: ArticlePublishingProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUnpublishing, setIsUnpublishing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isDraft = articleState === "closed" && articleLabels.includes("draft")
  const isPublished = articleState === "open"
  const isArchived = articleState === "closed" && articleLabels.includes("archived")

  const getStatusBadge = () => {
    if (isPublished) {
      return <Badge className="bg-green-500">Published</Badge>
    } else if (isDraft) {
      return <Badge variant="outline">Draft</Badge>
    } else if (isArchived) {
      return <Badge variant="secondary">Archived</Badge>
    } else {
      return <Badge variant="outline">Closed</Badge>
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await articleApi.publishArticle(articleNumber)
      toast({
        title: "Article published",
        description: "The article has been published successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error publishing article:", error)
      toast({
        title: "Error",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
      setShowPublishDialog(false)
    }
  }

  const handleUnpublish = async () => {
    setIsUnpublishing(true)
    try {
      await articleApi.unpublishArticle(articleNumber)
      toast({
        title: "Article unpublished",
        description: "The article has been moved to drafts.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error unpublishing article:", error)
      toast({
        title: "Error",
        description: "Failed to unpublish article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUnpublishing(false)
      setShowUnpublishDialog(false)
    }
  }

  const handleArchive = async () => {
    setIsArchiving(true)
    try {
      await articleApi.archiveArticle(articleNumber)
      toast({
        title: "Article archived",
        description: "The article has been archived successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error archiving article:", error)
      toast({
        title: "Error",
        description: "Failed to archive article. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsArchiving(false)
      setShowArchiveDialog(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>
        <div className="flex space-x-2">
          {isDraft && (
            <Button variant="default" size="sm" onClick={() => setShowPublishDialog(true)} disabled={isPublishing}>
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Publish
                </>
              )}
            </Button>
          )}

          {isPublished && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnpublishDialog(true)}
                disabled={isUnpublishing}
              >
                {isUnpublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <FileEdit className="h-4 w-4 mr-1" />
                    Move to Draft
                  </>
                )}
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setShowArchiveDialog(true)} disabled={isArchiving}>
                {isArchiving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </>
                )}
              </Button>
            </>
          )}

          {(isDraft || isArchived) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/articles/${articleNumber}/preview`, "_blank")}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
        </div>
      </div>

      {/* Publish Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Article</AlertDialogTitle>
            <AlertDialogDescription>
              This will make the article visible to all visitors. Are you sure you want to publish this article?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unpublish Dialog */}
      <AlertDialog open={showUnpublishDialog} onOpenChange={setShowUnpublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Draft</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the article back to drafts and make it invisible to visitors. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnpublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish} disabled={isUnpublishing}>
              {isUnpublishing ? "Moving to Draft..." : "Move to Draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Article</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the article and make it invisible to visitors. Archived articles can still be accessed
              via direct link by administrators. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isArchiving}>
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
