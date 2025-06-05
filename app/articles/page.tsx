"use client"

import { Suspense } from "react"
import ArticlesPageContent from "./ArticlesPageContent"
import ArticlesLoading from "./loading"

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticlesLoading />}>
      <ArticlesPageContent />
    </Suspense>
  )
}
