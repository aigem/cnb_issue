import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, Clock, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Issue, Assignee } from "@/types"

interface ArticleMetaProps {
  article: Issue
  showAssignees?: boolean
  showPriority?: boolean
  showUpdatedTime?: boolean
}

export default function ArticleMeta({
  article,
  showAssignees = true,
  showPriority = true,
  showUpdatedTime = true,
}: ArticleMetaProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "p0":
        return "bg-red-100 text-red-800 border-red-200"
      case "p1":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "p2":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "p3":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "p0":
        return "Critical"
      case "p1":
        return "High"
      case "p2":
        return "Medium"
      case "p3":
        return "Low"
      default:
        return "Normal"
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {/* Priority Badge */}
      {showPriority && article.priority && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className={`${getPriorityColor(article.priority)} flex items-center gap-1`}>
                <Star className="h-3 w-3" />
                {getPriorityLabel(article.priority)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Priority: {article.priority.toUpperCase()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Updated Time */}
      {showUpdatedTime && article.updated_at && article.updated_at !== article.created_at && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {new Date(article.updated_at).toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Assignees */}
      {showAssignees && article.assignees && article.assignees.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <div className="flex -space-x-1">
                  {article.assignees.slice(0, 3).map((assignee: Assignee, index: number) => (
                    <Avatar key={assignee.username} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={assignee.avatar_url || "/placeholder.svg"} alt={assignee.nickname} />
                      <AvatarFallback className="text-xs">{assignee.nickname.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {article.assignees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                      +{article.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <p className="font-medium">Assignees:</p>
                {article.assignees.map((assignee: Assignee) => (
                  <p key={assignee.username} className="text-sm">
                    {assignee.nickname}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Reference Count (if available) */}
      {article.reference_count && article.reference_count > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="flex items-center gap-1">
                <span>🔗</span>
                {article.reference_count}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{article.reference_count} references</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
