import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Article Not Found</h1>
      <p className="text-muted-foreground mb-6">The article you're looking for could not be found.</p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/articles">Browse Articles</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
