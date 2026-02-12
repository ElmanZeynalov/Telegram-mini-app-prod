import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const sessionId = params.id

        const events = await prisma.analyticsEvent.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(events)

    } catch (error) {
        console.error('Session Events Error:', error)
        return NextResponse.json({ error: 'Failed to fetch session events' }, { status: 500 })
    }
}
