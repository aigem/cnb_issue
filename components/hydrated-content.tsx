"use client"

import { useSettings } from "@/contexts/settings-context"

interface HydratedContentProps {
    children: (settings: any, isHydrated: boolean) => React.ReactNode
    fallback?: React.ReactNode
}

export default function HydratedContent({ children, fallback }: HydratedContentProps) {
    const { settings, isHydrated } = useSettings()

    if (!isHydrated) {
        return fallback || null
    }

    return <>{children(settings, isHydrated)}</>
}