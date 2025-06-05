"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { postComment } from "@/lib/api-client"
import type { IssueComment } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface CommentSectionProps {
  comments: IssueComment[]
  articleNumber: string
}

export default function CommentSection({ comments, articleNumber }: CommentSectionProps) {
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim()) return

    try {
      setIsSubmitting(true)
      await postComment(articleNumber, commentText)
      setCommentText("")
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      })
      // Refresh the page to show the new comment
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <Textarea
          placeholder="Leave a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="mb-4 min-h-[100px]"
        />
        <Button type="submit" disabled={isSubmitting || !commentText.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.author?.avatar_url || "/placeholder.svg"} alt={comment.author?.nickname} />
                  <AvatarFallback>{comment.author?.nickname?.substring(0, 2) || "???"}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{comment.author?.nickname || "Anonymous"}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: comment.body || "" }} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
