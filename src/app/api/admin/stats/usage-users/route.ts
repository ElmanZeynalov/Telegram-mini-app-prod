import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dateStr = searchParams.get('date')
        const type = searchParams.get('type') || 'active'
        const language = searchParams.get('language') || 'all'

        if (!dateStr) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 })
        }

        const date = parseISO(dateStr)
        const startDate = startOfDay(date)
        const endDate = endOfDay(date)

        let users = []

        if (type === 'new') {
            users = await prisma.user.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...(language !== 'all' ? { language } : {})
                },
                select: {
                    id: true,
                    telegramId: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    language: true,
                    region: true,
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' }
            })
        } else {
            // Active users: Users who had sessions on that day
            const sessions = await prisma.session.findMany({
                where: {
                    startTime: {
                        gte: startDate,
                        lte: endDate
                    },
                    ...(language !== 'all' ? { user: { language } } : {})
                },
                select: {
                    user: {
                        select: {
                            id: true,
                            telegramId: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            language: true,
                            region: true,
                            createdAt: true
                        }
                    }
                }
            })

            // Deduplicate users and count sessions
            const userMap = new Map<string, any>()
            sessions.forEach(s => {
                if (s.user) {
                    const existing = userMap.get(s.user.id)
                    if (existing) {
                        existing.sessionCount++
                    } else {
                        userMap.set(s.user.id, {
                            ...s.user,
                            sessionCount: 1
                        })
                    }
                }
            })
            users = Array.from(userMap.values())
        }

        return NextResponse.json(users)

    } catch (error) {
        console.error('Usage Users Error:', error)
        return NextResponse.json({ error: 'Failed to fetch usage users' }, { status: 500 })
    }
}
