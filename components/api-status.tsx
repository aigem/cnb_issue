"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const checkApiStatus = async () => {
    try {
      setStatus("checking")

      const response = await fetch(`/api/health-check`)

      if (response.ok) {
        const data = await response.json()
        setDetails(data)
        setStatus("connected")
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        setStatus("error")
        setError(errorData.error || `API returned ${response.status}`)
      }
    } catch (err) {
      setStatus("error")
      setError(err.message || "Failed to connect to API")
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  if (status === "checking") {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Checking API connection...</AlertDescription>
      </Alert>
    )
  }

  if (status === "error") {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>API Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <div>{error}</div>
          <Button size="sm" variant="outline" onClick={checkApiStatus}>
            Retry Connection
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>API Connected</AlertTitle>
      <AlertDescription>
        <div>Server: {details?.apiVersion || "Unknown"}</div>
        {details?.itemCount !== null && <div>Found {details.itemCount} items in test query</div>}
      </AlertDescription>
    </Alert>
  )
}
