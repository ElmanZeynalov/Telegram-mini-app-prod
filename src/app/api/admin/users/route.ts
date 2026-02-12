import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const region = searchParams.get('region')
        const search = searchParams.get('search')

        const whereClause: any = {}

        if (region) {
            whereClause.region = {
                contains: region,
                mode: 'insensitive'
            }
        }

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { telegramId: { contains: search, mode: 'insensitive' } }
            ]
        }

        const sortBy = searchParams.get('sortBy') || 'lastOnline'
        const order = searchParams.get('order') || 'desc'

        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: { sessions: true }
                },
                sessions: {
                    orderBy: { startTime: 'desc' },
                    take: 1,
                    select: { startTime: true }
                }
            }
        })

        const formattedUsers = users.map(user => ({
            id: user.id,
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            language: user.language,
            region: user.region,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            sessionCount: user._count.sessions,
            lastOnline: user.sessions[0]?.startTime || user.createdAt
        }))

        // In-memory sorting for more complex fields like "name" or because Prisma doesn't support sorting by relations easily in this setup
        if (sortBy) {
            formattedUsers.sort((a: any, b: any) => {
                let valA: any, valB: any;

                switch (sortBy) {
                    case 'name':
                        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
                        break;
                    case 'lastOnline':
                        valA = new Date(a.lastOnline).getTime();
                        valB = new Date(b.lastOnline).getTime();
                        break;
                    case 'createdAt':
                        valA = new Date(a.createdAt).getTime();
                        valB = new Date(b.createdAt).getTime();
                        break;
                    default:
                        valA = (a as any)[sortBy] || '';
                        valB = (b as any)[sortBy] || '';
                }

                if (valA < valB) return order === 'asc' ? -1 : 1;
                if (valA > valB) return order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return NextResponse.json(formattedUsers)
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
