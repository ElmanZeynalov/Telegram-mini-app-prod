import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const question = searchParams.get('question')
        const period = searchParams.get('period') || '7d'
        const language = searchParams.get('language') || 'all'

        if (!question) {
            return NextResponse.json({ error: 'Question parameter is required' }, { status: 400 })
        }

        const validPeriods: Record<string, number> = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        }
        const periodKey = Object.keys(validPeriods).includes(period) ? period : '7d'
        const daysToLookBack = validPeriods[periodKey]
        const startDate = subDays(new Date(), daysToLookBack)

        const eventFilter = language !== 'all'
            ? {
                OR: [
                    { metadata: { path: ['language'], equals: language } },
                    { user: { language: language } }
                ]
            }
            : undefined

        const feedbackEvents = await prisma.analyticsEvent.findMany({
            where: {
                eventType: { in: ['feedback_yes', 'feedback_no'] },
                createdAt: { gte: startDate },
                user: { isNot: null },
                ...eventFilter
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        telegramId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Filter in memory to match the question text
        const matchedEvents = feedbackEvents.filter(event => {
            const meta = event.metadata as any

            const extractName = (val: any) => {
                if (!val) return 'Unknown'
                if (typeof val === 'string') return val
                if (typeof val === 'object') {
                    if (language !== 'all' && val[language]) return val[language]
                    return val.az || val.en || val.ru || Object.values(val)[0] || 'Unknown'
                }
                return String(val)
            }

            // Match exactly what stats endpoint produces
            const name = extractName(meta?.questionText || meta?.question || 'Unknown Question')
            return name === question
        })

        const detailedFeedback: Record<string, {
            id: string,
            vote: 'yes' | 'no',
            count: number,
            user: any
        }> = {}

        matchedEvents.forEach(event => {
            const userId = event.user?.id
            if (!userId) return

            const vote = event.eventType === 'feedback_yes' ? 'yes' : 'no'
            const key = `${userId}-${vote}`

            if (detailedFeedback[key]) {
                detailedFeedback[key].count++
            } else {
                detailedFeedback[key] = {
                    id: event.id, // Keep one ID for key
                    vote,
                    count: 1,
                    user: event.user
                }
            }
        })

        return NextResponse.json(Object.values(detailedFeedback))

    } catch (error) {
        console.error('Feedback Details Error:', error)
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 })
    }
}
