"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, RotateCcw, Download, Upload, FileJson } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SiteSettings } from "@/types/settings"

export default function SettingsForm() {
  const { settings, isLoading, error, saveSettings, resetSettings } = useSettings()
  const [formData, setFormData] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Sync form data when settings change
  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const success = await saveSettings(formData)
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your site settings have been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      setIsResetting(true)
      try {
        const success = await resetSettings()
        if (success) {
          setFormData(settings) // Update form with new settings
          toast({
            title: "Settings reset",
            description: "Your site settings have been reset to default values.",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to reset settings. Please try again.",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        })
      } finally {
        setIsResetting(false)
      }
    }
  }

  // Export settings to JSON file
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(formData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `site-settings-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Settings exported",
        description: "Your settings have been exported to a JSON file.",
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export settings.",
        variant: "destructive",
      })
    }
  }

  // Import settings from JSON file
  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text) as SiteSettings

      // Validate imported settings structure
      if (!importedSettings.siteName || !importedSettings.siteDescription) {
        throw new Error("Invalid settings format")
      }

      setFormData(importedSettings)
      toast({
        title: "Settings imported",
        description: "Settings have been imported successfully. Don't forget to save!",
      })
    } catch (err) {
      toast({
        title: "Import failed",
        description: "Failed to import settings. Please check the file format.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      {/* Import/Export Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Import/Export Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button type="button" variant="outline" onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import JSON
                </>
              )}
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Export your current settings or import settings from a JSON file.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" name="siteName" value={formData.siteName} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={formData.siteDescription}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="siteKeywords">Keywords (comma separated)</Label>
                  <Input
                    id="siteKeywords"
                    name="siteKeywords"
                    value={formData.siteKeywords.join(", ")}
                    onChange={(e) => {
                      const keywords = e.target.value.split(",").map((k) => k.trim())
                      setFormData((prev) => ({ ...prev, siteKeywords: keywords }))
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      name="primaryColor"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      name="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={handleChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.accentColor}
                      onChange={handleChange}
                      name="accentColor"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" name="logoUrl" value={formData.logoUrl} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input id="faviconUrl" name="faviconUrl" value={formData.faviconUrl} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter || ""}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.socialLinks.github || ""}
                    onChange={(e) => handleSocialLinkChange("github", e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.socialLinks.linkedin || ""}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialLinks.facebook || ""}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialLinks.instagram || ""}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="articlesPerPage">Articles Per Page</Label>
                  <Input
                    id="articlesPerPage"
                    name="articlesPerPage"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.articlesPerPage}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setFormData((prev) => ({ ...prev, articlesPerPage: value }))
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="featuredTags">Featured Tags (comma separated)</Label>
                  <Input
                    id="featuredTags"
                    value={formData.featuredTags.join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value.split(",").map((t) => t.trim())
                      setFormData((prev) => ({ ...prev, featuredTags: tags }))
                    }}
                    placeholder="nextjs, react, tutorial"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showAuthorInfo">Show Author Information</Label>
                  <Switch
                    id="showAuthorInfo"
                    checked={formData.showAuthorInfo}
                    onCheckedChange={(checked) => handleSwitchChange("showAuthorInfo", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableComments">Enable Comments</Label>
                  <Switch
                    id="enableComments"
                    checked={formData.enableComments}
                    onCheckedChange={(checked) => handleSwitchChange("enableComments", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    name="googleAnalyticsId"
                    value={formData.googleAnalyticsId || ""}
                    onChange={handleChange}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    name="customCss"
                    value={formData.customCss || ""}
                    onChange={handleChange}
                    rows={5}
                    placeholder="/* Add your custom CSS here */"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="customHeaderHtml">Custom Header HTML</Label>
                  <Textarea
                    id="customHeaderHtml"
                    name="customHeaderHtml"
                    value={formData.customHeaderHtml || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="<!-- Add custom HTML to include in the header -->"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="customFooterHtml">Custom Footer HTML</Label>
                  <Textarea
                    id="customFooterHtml"
                    name="customFooterHtml"
                    value={formData.customFooterHtml || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="<!-- Add custom HTML to include in the footer -->"
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isResetting || isSaving}>
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </>
            )}
          </Button>
          <Button type="submit" disabled={isSaving || isResetting}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
