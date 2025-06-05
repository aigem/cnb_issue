"use client" // Required for useRouter and event handlers

import type { Metadata } from "next"
import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import { Button } from "@/components/ui/button"
import { Settings, BookOpen, LogOut } from "lucide-react" // Added LogOut
import Link from "next/link"
import { useRouter } from "next/navigation" // Added useRouter
import { useToast } from "@/hooks/use-toast" // For error handling

// Metadata can remain here or be moved to a layout if this becomes a client component primarily
// For now, keeping it as is, assuming this page is still primarily server-rendered with client interactions.
// If build errors occur, this might need adjustment.
// export const metadata: Metadata = {
// title: "Admin Dashboard",
// description: "Manage your blog content and settings",
// robots: {
// index: false,
//  },
// }

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        toast({ title: "Logged out", description: "You have been successfully logged out." })
        router.push("/admin/login")
      } else {
        const data = await response.json()
        toast({
          title: "Logout Failed",
          description: data.message || "An error occurred during logout.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
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
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
