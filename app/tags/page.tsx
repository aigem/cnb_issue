"use client"

import { Suspense } from "react"
import TagsPageContent from "./TagsPageContent"

export default function TagsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading tags...</div>}>
      <TagsPageContent />
    </Suspense>
  )
}
