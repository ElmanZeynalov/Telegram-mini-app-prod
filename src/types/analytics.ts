export interface AnalyticsUser {
    id: string
    telegramId: string
    firstName: string | null
    lastName: string | null
    username: string | null
    language: string
    region: string | null
    createdAt: string
    _count?: {
        sessions: number
    }
}

export interface AnalyticsEvent {
    id: string
    userId: string
    sessionId: string | null
    eventType: string
    metadata: Record<string, any>
    createdAt: string
}

export interface AnalyticsSession {
    id: string
    userId: string
    startTime: string
    endTime: string | null
}

export interface SessionGroup {
    sessionId: string
    sessionIndex: number
    processedEvents: AnalyticsEvent[]
    sessionDate: string
}

export interface UserDetailData {
    user: AnalyticsUser
    sessions: AnalyticsSession[]
    events: AnalyticsEvent[]
    feedback: AnalyticsEvent[]
}
