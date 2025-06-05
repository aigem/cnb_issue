export interface Author {
  username: string
  nickname: string
  avatar_url?: string
}

export interface Label {
  id?: number
  name: string
  description?: string
  color: string
}

export interface Assignee {
  username: string
  nickname: string
  avatar_url?: string
}

export interface Issue {
  number: string
  state: string
  state_reason: string
  title: string
  body?: string
  author: Author
  assignees: Assignee[]
  labels: Label[]
  comment_count: number
  priority: string // p0, p1, p2, p3
  created_at: string
  updated_at: string
  last_acted_at: string
  reference_count?: number // 引用计数，可用于热度排序
}

export interface IssueComment {
  id: number
  body: string
  author: Author
  created_at: string
  updated_at: string
}

export interface IssueDetail extends Issue {
  body: string
  body_html?: string
  reactions?: {
    total_count: number
    "+1": number
    "-1": number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
  }
}

// 新增：优先级枚举
export enum Priority {
  P0 = "p0", // 最高优先级
  P1 = "p1", // 高优先级
  P2 = "p2", // 中优先级
  P3 = "p3", // 低优先级
}

// 新增：文章状态
export enum ArticleStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
