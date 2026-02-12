
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { items } = body // Expects Array of { id: string, order: number }

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Items array is required" }, { status: 400 })
        }

        // Transaction to update all
        await prisma.$transaction(
            items.map((item: any) =>
                prisma.question.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Reorder Error:", error)
        return NextResponse.json({ error: "Failed to reorder questions" }, { status: 500 })
    }
}
