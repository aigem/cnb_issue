import type { Metadata } from "next"

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
