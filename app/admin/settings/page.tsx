import type { Metadata } from "next"
import { Suspense } from "react"
import SettingsForm from "@/components/settings-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Site Settings",
  description: "Configure your blog website settings",
  robots: {
    index: false,
  },
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Configure your website appearance and behavior</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
