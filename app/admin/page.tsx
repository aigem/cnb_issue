import type { Metadata } from "next"
import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import AdminHeader from "@/components/admin-header"

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
      <AdminHeader />

      <Suspense fallback={<div>Loading dashboard...</div>}>
        <AdminDashboard />
      </Suspense>
    </div>
  )
}
