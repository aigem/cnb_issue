"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface AuthUser {
    username: string
    role: "admin"
}

interface AuthState {
    authenticated: boolean
    user: AuthUser | null
    loading: boolean
    error: string | null
}

// Auth cache in memory
let authCache: { data: AuthState; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>(() => {
        // Initialize with cached auth state if available and not expired
        if (authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
            return authCache.data
        }
        return {
            authenticated: false,
            user: null,
            loading: true,
            error: null,
        }
    })

    const abortControllerRef = useRef<AbortController | undefined>(undefined)

    useEffect(() => {
        checkAuthStatus()

        // Cleanup on unmount
        return () => {
            abortControllerRef.current?.abort()
        }
    }, [])

    const checkAuthStatus = useCallback(async (force = false) => {
        // Use cache if available and not expired, unless forced
        if (!force && authCache && Date.now() - authCache.timestamp < CACHE_DURATION) {
            setAuthState(authCache.data)
            return
        }

        // Cancel previous request
        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()

        try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }))

            const response = await fetch("/api/auth/status", {
                credentials: "include",
                signal: abortControllerRef.current.signal,
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            const newState: AuthState = {
                authenticated: data.authenticated,
                user: data.user,
                loading: false,
                error: null,
            }

            setAuthState(newState)

            // Update cache
            authCache = {
                data: newState,
                timestamp: Date.now(),
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return // Request was cancelled
            }

            console.error("Failed to check auth status:", error)
            const errorState: AuthState = {
                authenticated: false,
                user: null,
                loading: false,
                error: error instanceof Error ? error.message : "Authentication check failed",
            }

            setAuthState(errorState)

            // Cache the error state briefly to avoid repeated failed requests
            authCache = {
                data: errorState,
                timestamp: Date.now(),
            }
        }
    }, [])

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                credentials: "include",
            })

            if (response.ok) {
                await checkAuthStatus()
                return true
            } else {
                return false
            }
        } catch (error) {
            console.error("Login failed:", error)
            return false
        }
    }

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })
            setAuthState({
                authenticated: false,
                user: null,
                loading: false,
                error: null,
            })
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return {
        ...authState,
        login,
        logout,
        refresh: checkAuthStatus,
    }
}