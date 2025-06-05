"use client" // Required for useRouter and event handlers

import { Suspense } from "react"
import SettingsForm from "@/components/settings-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
// useRouter and useToast are no longer needed directly here
import { useLogoutHandler } from "@/hooks/use-auth-handlers" // Import the new hook

function SettingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const handleLogout = useLogoutHandler()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Configure your website appearance, behavior, and content settings.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Suspense fallback={<SettingsLoading />}>
        <SettingsForm />
      </Suspense>
    </div>
  )
}
