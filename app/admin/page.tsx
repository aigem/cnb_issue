import type { Metadata } from "next"
import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Settings, BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your blog content and settings",
  robots: {
    index: false,
  },
}

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your blog content and settings</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/guide">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Quick Start
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Site Settings
            </Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
