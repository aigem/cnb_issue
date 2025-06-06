import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Calendar } from "lucide-react"
import ArticleMeta from "@/components/article-meta"
import type { Issue } from "@/types"

interface ArticleListProps {
  articles: Issue[]
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {articles.map((article) => (
        <Card key={article.number} className="flex flex-col h-full shadow-modern hover:shadow-modern-lg">
          <CardHeader>
            <Link href={`/articles/${article.number}`}>
              <CardTitle className="line-clamp-2 hover:underline cursor-pointer">{article.title}</CardTitle>
            </Link>

            {/* Article Meta Information */}
            <ArticleMeta article={article} showAssignees={true} showPriority={true} showUpdatedTime={false} />
          </CardHeader>

          <CardContent className="flex-grow">
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {article.body ? article.body.substring(0, 150) : "No content preview available"}
              {article.body && article.body.length > 150 ? "..." : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {article.labels &&
                article.labels.slice(0, 3).map((label, index) => (
                  <Link href={`/tags/${encodeURIComponent(label.name)}`} key={`${label.name}-${index}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-secondary cursor-pointer"
                      style={{ borderColor: label.color ? `#${label.color}` : undefined }}
                    >
                      {label.name}
                    </Badge>
                  </Link>
                ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={article.author.avatar_url || "/placeholder.svg"} alt={article.author.nickname} />
                <AvatarFallback>{article.author.nickname.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{article.author.nickname}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                <span>{formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="mr-1 h-3 w-3" />
                <span>{article.comment_count}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
