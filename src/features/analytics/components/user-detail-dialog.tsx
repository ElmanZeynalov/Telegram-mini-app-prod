"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { UserDetailData, AnalyticsEvent } from "@/types/analytics"
import { UserProfileSidebar } from "./user-detail/user-profile-sidebar"
import { EventsTab } from "./user-detail/events-tab"
import { SessionsTab } from "./user-detail/sessions-tab"
import { FeedbackTab } from "./user-detail/feedback-tab"

interface UserDetailDialogProps {
    userId: string | null
    onClose: () => void
}

export function UserDetailDialog({ userId, onClose }: UserDetailDialogProps) {
    const [data, setData] = useState<UserDetailData | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("events")
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
    const [sessionEventsCache, setSessionEventsCache] = useState<Record<string, AnalyticsEvent[]>>({}) // Cache for full session histories

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/users/${userId}`)
                if (!res.ok) throw new Error('Failed')
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    const handleSelectSession = async (sessionId: string) => {
        setSelectedSessionId(sessionId)
        setActiveTab("events")

        // Fetch full history if not in cache
        if (!sessionEventsCache[sessionId]) {
            try {
                const res = await fetch(`/api/admin/sessions/${sessionId}/events`)
                if (res.ok) {
                    const sessionEvents = await res.json()
                    setSessionEventsCache(prev => ({ ...prev, [sessionId]: sessionEvents }))
                }
            } catch (e) {
                console.error("Failed to fetch session events", e)
            }
        }
    }

    const { sessions, events, feedback } = data || {}

    // If filtering by session, use cached full history if available, otherwise current partial list
    const displayedEvents = selectedSessionId
        ? (sessionEventsCache[selectedSessionId] || events)
        : events

    return (
        <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-[80vw] !w-[80vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background">
                <DialogTitle className="sr-only">User Details</DialogTitle>
                <DialogDescription className="sr-only">Detailed analytics for the selected user.</DialogDescription>
                {/* Left Sidebar: User Identity */}
                <UserProfileSidebar loading={loading} data={data} onClose={onClose} />

                {/* Right Content: Activity */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                    {data && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 py-4 border-b flex items-center justify-between bg-background sticky top-0 z-10 pr-14">
                                <h3 className="font-semibold text-lg">Fəaliyyət Tarixçəsi</h3>
                                <TabsList>
                                    <TabsTrigger value="events">Hadisələr</TabsTrigger>
                                    <TabsTrigger value="sessions">Sessiyalar</TabsTrigger>
                                    <TabsTrigger value="feedback">Rəylər</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                <TabsContent value="events" className="h-full m-0 absolute inset-0">
                                    <EventsTab
                                        events={displayedEvents}
                                        selectedSessionId={selectedSessionId}
                                        onClearFilter={() => setSelectedSessionId(null)}
                                    />
                                </TabsContent>

                                <TabsContent value="sessions" className="h-full m-0 absolute inset-0">
                                    <SessionsTab
                                        sessions={sessions}
                                        onSelectSession={handleSelectSession}
                                    />
                                </TabsContent>

                                <TabsContent value="feedback" className="h-full m-0 absolute inset-0">
                                    <FeedbackTab feedback={feedback} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}
                </div>

                <div className="absolute right-4 top-4 z-50">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}
