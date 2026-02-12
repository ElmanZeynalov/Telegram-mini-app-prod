import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const period = searchParams.get('period') || '7d'

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const validPeriods: Record<string, number> = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        }
        const periodKey = Object.keys(validPeriods).includes(period) ? period : '7d'
        const daysToLookBack = validPeriods[periodKey]
        const startDate = subDays(new Date(), daysToLookBack)

        const events = await prisma.analyticsEvent.findMany({
            where: {
                eventType: 'emergency_exit',
                userId: userId,
                createdAt: { gte: startDate }
            },
            select: {
                id: true,
                createdAt: true,
                metadata: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(events)

    } catch (error) {
        console.error('Emergency Exit Details Error:', error)
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 })
    }
}
