import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { eventType, metadata, telegramId, region, existingSessionId, firstName, lastName, username } = body

        // 1. Identity Resolution: Find or Create User
        let user = null
        const telegramIdStr = telegramId ? String(telegramId) : undefined

        // Extract Location from Headers (Vercel Geolocation)
        const city = request.headers.get('x-vercel-ip-city') || undefined

        // Extract language from metadata if available (for language_select event or similar)
        // OR rely on 'region' param in body if frontend sends language there (legacy compatibility)
        // Ideally frontend should send language explicitly.
        const language = metadata?.language

        if (telegramIdStr) {
            user = await prisma.user.upsert({
                where: { telegramId: telegramIdStr },
                update: {
                    ...(city ? { region: city } : {}),
                    ...(language ? { language } : {}),
                    ...(firstName ? { firstName } : {}),
                    ...(lastName ? { lastName } : {}),
                    ...(username ? { username } : {})
                },
                create: {
                    telegramId: telegramIdStr,
                    region: city,
                    language: language,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    username: username || null
                }
            })
        }

        // 2. Session Management
        let sessionId = existingSessionId
        let session = null

        if (sessionId) {
            session = await prisma.session.findUnique({
                where: { id: sessionId },
                include: { user: true }
            })
        }

        if (!session) {
            session = await prisma.session.create({
                data: {
                    userId: user?.id
                },
                include: { user: true }
            })
            sessionId = session.id
        }

        // Always ensure session is linked to current user if found (and not guest if already real)
        if (user && session && session.userId !== user.id) {
            // Don't overwrite a real user with a guest ID if possible
            const isRealNewUser = user.telegramId && !user.telegramId.startsWith('guest_')
            const isCurrentGuest = session.user?.telegramId?.startsWith('guest_') || !session.userId

            if (isRealNewUser || isCurrentGuest) {
                await prisma.session.update({
                    where: { id: session.id },
                    data: { userId: user.id }
                })
            }
        }

        // 3. Inherit Identity: If request has no user, but session does, use session's user
        const finalUserId = user?.id || session?.userId

        // Handle Session End
        if (eventType === 'session_end' && sessionId) {
            await prisma.session.update({
                where: { id: sessionId },
                data: { endTime: new Date() }
            })
        }

        // 4. Log Event
        const event = await prisma.analyticsEvent.create({
            data: {
                sessionId,
                userId: finalUserId,
                eventType,
                metadata: metadata || {}
            }
        })

        return NextResponse.json({ success: true, sessionId })
    } catch (error) {
        console.error('Analytics Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
