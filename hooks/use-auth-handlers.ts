"use client" // Custom hooks that use other client hooks like useRouter need this

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useLogoutHandler() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        })
        router.push("/admin/login")
        // Optionally, refresh the current route or parent to clear client-side cache if needed
        // router.refresh(); // Uncomment if state needs to be aggressively cleared post-logout
      } else {
        const data = await response.json().catch(() => ({ message: "An unknown error occurred during logout." }))
        toast({
          title: "Logout Failed",
          description: data.message || "An error occurred during logout.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Logout error:", error) // Keep this console.error for debugging unexpected issues
      toast({
        title: "Logout Error",
        description: "An unexpected network or client error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return handleLogout
}
