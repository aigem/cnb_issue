"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface SystemStatus {
    api: "healthy" | "warning" | "error"
    settings: "healthy" | "warning" | "error"
    auth: "healthy" | "warning" | "error"
    timestamp: string
}

export default function SystemStatus() {
    const [status, setStatus] = useState<SystemStatus | null>(null)
    const [loading, setLoading] = useState(false)

    const checkSystemStatus = async () => {
        setLoading(true)
        try {
            const [healthResponse, settingsResponse, authResponse] = await Promise.allSettled([
                fetch('/api/health-check'),
                fetch('/api/settings/file'),
                fetch('/api/auth/status'),
            ])

            const newStatus: SystemStatus = {
                api: healthResponse.status === 'fulfilled' && healthResponse.value.ok ? 'healthy' : 'error',
                settings: settingsResponse.status === 'fulfilled' && settingsResponse.value.ok ? 'healthy' : 'error',
                auth: authResponse.status === 'fulfilled' && authResponse.value.ok ? 'healthy' : 'error',
                timestamp: new Date().toLocaleString(),
            }

            setStatus(newStatus)
        } catch (error) {
            console.error('Failed to check system status:', error)
            setStatus({
                api: 'error',
                settings: 'error',
                auth: 'error',
                timestamp: new Date().toLocaleString(),
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkSystemStatus()
    }, [])

    const getStatusIcon = (status: SystemStatus[keyof SystemStatus]) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    const getStatusBadge = (status: SystemStatus[keyof SystemStatus]) => {
        switch (status) {
            case 'healthy':
                return <Badge variant="default" className="bg-green-500">Healthy</Badge>
            case 'warning':
                return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>
            case 'error':
                return <Badge variant="destructive">Error</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>System Status</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={checkSystemStatus}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {status ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.api)}
                                <span className="text-sm">API Connection</span>
                            </div>
                            {getStatusBadge(status.api)}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.settings)}
                                <span className="text-sm">Settings Storage</span>
                            </div>
                            {getStatusBadge(status.settings)}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(status.auth)}
                                <span className="text-sm">Authentication</span>
                            </div>
                            {getStatusBadge(status.auth)}
                        </div>

                        <div className="text-xs text-muted-foreground mt-4">
                            Last checked: {status.timestamp}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        {loading ? 'Checking system status...' : 'Click refresh to check status'}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}