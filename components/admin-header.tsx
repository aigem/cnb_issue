"use client"

import { Button } from "@/components/ui/button"
import { Settings, BookOpen, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AdminHeader() {
    const { authenticated, user, logout } = useAuth()
    const { toast } = useToast()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        toast({
            title: "Logged out",
            description: "You have been logged out successfully.",
        })
        router.push("/")
    }

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your blog content and settings</p>
            </div>
            <div className="flex items-center gap-2">
                {authenticated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                        <User className="h-4 w-4" />
                        <span>Welcome, {user?.username}</span>
                    </div>
                )}
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
                {authenticated && (
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                )}
            </div>
        </div>
    )
}