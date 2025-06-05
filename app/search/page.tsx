import type { Metadata } from "next"
import { getArticles } from "@/lib/api"
import ArticleList from "@/components/article-list"

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ""

  return {
    title: `Search: ${query}`,
    description: `Search results for "${query}"`,
    robots: {
      index: false,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1

  const articles = await getArticles({
    page,
    pageSize: 12,
    keyword: query,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-8">
        {articles.length > 0 ? `Found ${articles.length} results for "${query}"` : `No results found for "${query}"`}
      </p>

      <ArticleList articles={articles} />
    </div>
  )
}
