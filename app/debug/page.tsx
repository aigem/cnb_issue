"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [results, setResults] = useState<any>({})

  const testEndpoint = async (endpoint: string, name: string) => {
    try {
      console.log(`Testing ${endpoint}`)
      const response = await fetch(endpoint)

      let data
      try {
        data = await response.json()
      } catch (parseError) {
        data = { parseError: parseError.message }
      }

      setResults((prev) => ({
        ...prev,
        [name]: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data: data,
          headers: Object.fromEntries(response.headers.entries()),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message,
          errorType: error.constructor.name,
        },
      }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug API Endpoints</h1>

      <div className="space-y-4 mb-8">
        <Button onClick={() => testEndpoint("/api/test", "test")}>Test Simple API</Button>
        <Button onClick={() => testEndpoint("/api/health-check", "health")}>Test Health Check</Button>
        <Button onClick={() => testEndpoint("/api/articles/list", "articles")}>Test Articles List</Button>
        <Button onClick={() => testEndpoint("/api/articles/list?page=1&pageSize=5", "articlesWithParams")}>
          Test Articles List (with params)
        </Button>
        <Button onClick={() => testEndpoint("/api/articles/1", "singleArticle")}>Test Single Article</Button>
        <Button onClick={() => testEndpoint("/api/tags", "tags")}>Test Tags</Button>
      </div>

      <div className="space-y-6">
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {name}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.success ? "SUCCESS" : "ERROR"}
                </span>
                {result.status && (
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {result.status} {result.statusText}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "Not set"}</div>
            <div>REPO_NAME: {process.env.NEXT_PUBLIC_REPO_NAME || "blog"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
