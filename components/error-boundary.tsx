"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error details for debugging
    console.error("Error boundary caught:", error)

    // If error is not a proper Error object, log additional details
    if (typeof error === "object" && error !== null) {
      console.error("Error object details:", JSON.stringify(error, null, 2))
      console.error("Error keys:", Object.keys(error))
      console.error("Error prototype:", Object.getPrototypeOf(error))
    }
  }, [error])

  // Extract error message safely
  const getErrorMessage = (err: any): string => {
    // Handle different error types
    if (typeof err === "string") return err
    if (err instanceof Error) return err.message

    // Handle React error objects
    if (err && typeof err === "object") {
      // Check for common error properties
      if (err.message) return String(err.message)
      if (err.error) return String(err.error)
      if (err.name) return `${err.name}: ${err.message || "Unknown error"}`

      // Handle React component errors
      if (err.node && err.node.props) {
        return "React component rendering error"
      }

      // Fallback to stringified object
      try {
        return JSON.stringify(err)
      } catch {
        return "Complex error object (cannot stringify)"
      }
    }

    return "An unexpected error occurred"
  }

  const errorMessage = getErrorMessage(error)

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <div className="text-muted-foreground mb-6">
          <p className="mb-2">{errorMessage}</p>
          {error?.digest && <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm">Technical Details</summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </details>
        </div>
        <div className="space-x-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
