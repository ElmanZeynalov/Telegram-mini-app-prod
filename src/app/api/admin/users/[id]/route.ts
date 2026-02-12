import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const userId = params.id

        const [user, sessions, events, feedback] = await Promise.all([
            // User Profile
            prisma.user.findUnique({
                where: { id: userId },
                include: {
                    _count: {
                        select: { sessions: true }
                    }
                }
            }),
            // Recent Sessions
            prisma.session.findMany({
                where: { userId },
                orderBy: { startTime: 'desc' },
                take: 50
            }),
            // Recent Events
            prisma.analyticsEvent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 200
            }),
            // User Feedback
            prisma.analyticsEvent.findMany({
                where: {
                    userId,
                    eventType: { in: ['feedback_yes', 'feedback_no'] }
                },
                orderBy: { createdAt: 'desc' }
            })
        ])

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            user,
            sessions,
            events,
            feedback
        })

    } catch (error) {
        console.error('User Details Error:', error)
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
    }
}
