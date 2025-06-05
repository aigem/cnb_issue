import type { Metadata } from "next"
import TagPageClient from "./TagPageClient"

// Generate metadata for the page
export function generateMetadata({ params }: { params: { tag: string } }): Metadata {
  const tag = decodeURIComponent(params.tag)

  return {
    title: `${tag} - Tag`,
    description: `Articles tagged with ${tag}`,
    openGraph: {
      title: `${tag} - Tag`,
      description: `Articles tagged with ${tag}`,
    },
  }
}

export default function TagPage({ params }: { params: { tag: string } }) {
  return <TagPageClient params={params} />
}
