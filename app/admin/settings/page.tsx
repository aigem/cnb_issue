import { Suspense } from "react"
import SettingsForm from "@/components/settings-form"
import { Skeleton } from "@/components/ui/skeleton"

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
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Configure your website appearance, behavior, and content settings.</p>
      </div>

      <Suspense fallback={<SettingsLoading />}>
        <SettingsForm />
      </Suspense>
    </div>
  )
}
