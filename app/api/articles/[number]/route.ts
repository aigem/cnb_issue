import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_TOKEN = process.env.API_TOKEN
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME || "blog"

export async function GET(request: NextRequest, { params }: { params: { number: string } }) {
  console.log(`[Article Detail] Route called for article ${params.number}`)

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const apiUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues/${params.number}`
    console.log(`[Article Detail] Fetching from: ${apiUrl}`)

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: API_TOKEN,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    })

    console.log(`[Article Detail] API responded with status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 })
      }
      const errorText = await response.text()
      console.error(`[Article Detail] API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        { error: `Failed to fetch article: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[Article Detail] Article data loaded successfully`)

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[Article Detail] Error fetching article ${params.number}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { number: string } }) {
  console.log(`[Article Detail PATCH] Route called for article ${params.number}`)

  try {
    if (!API_BASE_URL || !API_TOKEN) {
      return NextResponse.json({ error: "API configuration missing" }, { status: 500 })
    }

    const { number } = params
    const updates = await request.json()

    // Basic validation for updates (optional, but good practice)
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 })
    }
    // Gitea API doesn't allow changing labels via this endpoint, only title, body, state, etc.
    // Labels are managed via /labels endpoint.
    // Ensure 'labels' field is not part of the 'updates' payload if it's not supported by Gitea's PATCH issue endpoint.
    // Or, if your Gitea version/API supports it, this check might not be needed.
    // For now, assuming standard Gitea API where labels are separate.
    if (updates.labels) {
        console.warn("[Article Detail PATCH] 'labels' field present in update payload. Gitea's PATCH issue endpoint might not support direct label updates. Labels should be updated via the /labels endpoint.")
        // delete updates.labels; // Optionally remove it if it causes errors
    }


    const apiUrl = `${API_BASE_URL}/${REPO_NAME}/-/issues/${number}`
    console.log(`[Article Detail PATCH] Patching to: ${apiUrl} with data:`, updates)

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(updates),
    })

    console.log(`[Article Detail PATCH] API responded with status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Article Detail PATCH] API Error: ${response.status} ${response.statusText}`, errorText)
      return NextResponse.json(
        { error: `Failed to update article: ${response.status} ${response.statusText} - ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[Article Detail PATCH] Article updated successfully`)

    // Revalidate relevant paths
    // This should ideally be done by the calling client or a more specific revalidation strategy
    // For instance, the edit page itself might revalidate or redirect.
    // However, if direct API calls are made, revalidating here can be useful.
    // import { revalidatePath } from "next/cache"
    // revalidatePath(`/articles/${number}`)
    // revalidatePath("/") // if article list on homepage changes (e.g. title)

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[Article Detail PATCH] Error updating article ${params.number}:`, error)
    if (error instanceof SyntaxError) { // From await request.json()
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
