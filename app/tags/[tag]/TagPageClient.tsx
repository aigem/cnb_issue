"use client"

import { Suspense } from "react"
import TagPageContent from "./TagPageContent"
import TagPageLoading from "./loading"

export default function TagPageClient({ params }: { params: { tag: string } }) {
  return (
    <Suspense fallback={<TagPageLoading />}>
      <TagPageContent params={params} />
    </Suspense>
  )
}
