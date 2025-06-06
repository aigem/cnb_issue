"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { postComment } from "@/lib/api-client"
import type { IssueComment } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { LogIn, LogOut } from "lucide-react"

interface CommentSectionProps {
  comments: IssueComment[]
  articleNumber: string
}

export default function CommentSection({ comments, articleNumber }: CommentSectionProps) {
  // Get repo info from environment
  const repoName = process.env.NEXT_PUBLIC_REPO_NAME || 'cnb.ai/testblog'

  // Get original article URL
  const getOriginalUrl = () => {
    return `https://cnb.cool/${repoName}/-/issues/${articleNumber}`
  }
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { authenticated, user, loading, login, logout } = useAuth()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim()) return

    if (!authenticated) {
      toast({
        title: "Authentication required",
        description: "Please login as admin to post comments.",
        variant: "destructive",
      })
      return
    }

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      const success = await login(loginData.username, loginData.password)
      if (success) {
        toast({
          title: "Login successful",
          description: "You are now logged in as admin.",
        })
        setLoginData({ username: "", password: "" })
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An error occurred during login.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    })
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      {/* Comment Notice */}
      <div className="mb-6 p-4 bg-muted/50 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          如果你想要评论，请到{' '}
          <a
            href={getOriginalUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            原文
          </a>
          {' '}中发布。
        </p>
      </div>

      {/* Authentication Status and Login/Logout */}
      <div className="mb-6">
        {authenticated ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Logged in as {user?.username}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogIn className="h-4 w-4 mr-2" />
                Admin Login Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter admin username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground mt-2">
                Only admin users can post comments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comment Form */}
      {authenticated && (
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
      )}

      {/* Comments List */}
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
