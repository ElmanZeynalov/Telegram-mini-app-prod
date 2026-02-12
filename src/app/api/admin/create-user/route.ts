import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
    try {
        // Verify session
        const session = await getSession()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { email, password, role } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const existingUser = await prisma.adminUser.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await hash(password, 12)

        const newUser = await prisma.adminUser.create({
            data: {
                email,
                password: hashedPassword,
                role: role || 'user'
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json({ success: true, user: newUser })
    } catch (error) {
        console.error("Create user error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
