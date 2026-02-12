export interface UsageStat {
    date: string
    fullDate: string
    users: number
    sessions: number
    newUsers?: number
}

export interface ContentStat {
    name: string
    views: number
}

export interface SafetyStat {
    totalEmergencyExits: number
    totalSessions: number
    totalUsers: number
    emergencyExitUsers?: {
        user: {
            id: string
            firstName: string | null
            lastName: string | null
            username: string | null
            telegramId: string | null
        } | undefined
        count: number
    }[]
}

export interface RegionStat {
    name: string
    value: number
}

export interface AnalyticsStats {
    usage: UsageStat[]
    content: ContentStat[]
    questions: ContentStat[]
    safety: SafetyStat
    regions: RegionStat[]
    feedback?: {
        question: string
        yes: number
        no: number
        total: number
    }[]
}

export type StatsPeriod = '7d' | '30d' | '90d' | 'lifetime'
