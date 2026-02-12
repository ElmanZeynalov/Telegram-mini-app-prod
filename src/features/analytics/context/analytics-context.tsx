"use client"

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useTelegram } from "@/features/telegram/hooks/use-telegram"
import { useLocaleStore } from "@/languages/stores/locale-store"

interface AnalyticsContextType {
    track: (eventType: string, metadata?: any) => Promise<void>
    sessionId: string | null
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    track: async () => { },
    sessionId: null,
})

export const useAnalytics = () => useContext(AnalyticsContext)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const { webApp, isInitialized: isTelegramInitialized } = useTelegram()
    const user = webApp?.initDataUnsafe?.user
    const locale = useLocaleStore((state) => state.locale)

    const userRef = useRef(user)
    const localeRef = useRef(locale)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const eventQueue = useRef<{ eventType: string, metadata?: any }[]>([])
    const isTrackingInitialized = useRef(false)

    // Keep refs in sync
    useEffect(() => { userRef.current = user }, [user])
    useEffect(() => { localeRef.current = locale }, [locale])

    // Initialize Session
    useEffect(() => {
        // Wait for Telegram SDK to initialize before starting session
        if (!isTelegramInitialized) return

        // Prevent double tracking
        if (isTrackingInitialized.current) return
        isTrackingInitialized.current = true

        const initSession = async () => {
            try {
                // Wait a tiny bit to ensure user object is definitely populated from webApp
                // if it's a telegram environment but user is not yet there
                if (!userRef.current && isTelegramInitialized) {
                    await new Promise(r => setTimeout(r, 100));
                }

                const currentUser = userRef.current;
                const currentLocale = localeRef.current;

                // Track 'session_start' which handles creation
                const res = await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        eventType: "session_start",
                        telegramId: currentUser?.id ? String(currentUser.id) : undefined,
                        firstName: currentUser?.first_name,
                        lastName: currentUser?.last_name,
                        username: currentUser?.username,
                        metadata: { language: currentLocale }
                    }),
                    keepalive: true
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.sessionId) {
                        sessionIdRef.current = data.sessionId
                        setSessionId(data.sessionId)

                        // Process queue - Use a small delay to ensure state has settled
                        setTimeout(() => {
                            const queue = eventQueue.current
                            eventQueue.current = []
                            queue.forEach(item => {
                                trackInternal(item.eventType, item.metadata)
                            })
                        }, 50);
                    }
                }
            } catch (e) {
                console.error("Failed to init analytics session", e)
            }
        }

        initSession()
    }, [isTelegramInitialized]) // Only depend on initialization

    const trackInternal = useCallback(async (eventType: string, metadata?: any) => {
        const currentSessionId = sessionIdRef.current;
        const currentUser = userRef.current;
        const currentLocale = localeRef.current;

        // If no session yet and not session_start, queue it
        if (!currentSessionId && eventType !== 'session_start') {
            eventQueue.current.push({ eventType, metadata });
            return;
        }

        try {
            // Priority: Telegram ID -> Guest ID
            const activeId = currentUser?.id ? String(currentUser.id) : (localStorage.getItem("guest_analytics_id") || (() => {
                const newId = `guest_${Math.random().toString(36).slice(2, 11)}`
                localStorage.setItem("guest_analytics_id", newId)
                return newId
            })())

            const res = await fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventType,
                    sessionId: currentSessionId,
                    existingSessionId: currentSessionId,
                    telegramId: activeId,
                    metadata: {
                        ...metadata,
                        language: currentLocale
                    },
                    region: metadata?.region || undefined
                }),
                keepalive: true
            })

            if (!res.ok) {
                console.error(`[Analytics] Track Failed (${eventType}):`, res.status, await res.text())
            }
        } catch (e) {
            console.error(`[Analytics] Track Exception (${eventType}):`, e)
        }
    }, [])

    const track = useCallback((eventType: string, metadata?: any) => {
        return trackInternal(eventType, metadata);
    }, [trackInternal]);

    const handleSessionEnd = useCallback(() => {
        const currentSessionId = sessionIdRef.current;
        const currentUser = userRef.current;
        if (!currentSessionId) return

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventType: 'session_end',
                existingSessionId: currentSessionId,
                telegramId: currentUser?.id ? String(currentUser.id) : undefined
            }),
            keepalive: true
        }).catch(console.error);
    }, [])

    // Handle Session End on Unload / Hide
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleSessionEnd()
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)
        return () => document.removeEventListener('visibilitychange', onVisibilityChange)
    }, [handleSessionEnd])

    const value = useMemo(() => ({ track, sessionId }), [track, sessionId])

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    )
}
