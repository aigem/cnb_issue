import type { Metadata } from "next"
import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your blog content",
  robots: {
    index: false,
  },
}

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Suspense fallback={<div>Loading admin dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
