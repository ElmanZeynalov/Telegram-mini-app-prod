
// Re-compilation trigger: 2026-02-01 02:44
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                translations: true,
            },
            orderBy: {
                order: "asc",
            },
        })

        const formattedCategories = categories.map((c) => ({
            id: c.id,
            order: c.order,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            createdBy: c.createdBy,
            updatedBy: c.updatedBy,
            name: (c as any).translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.name }), {}),
        }))

        return NextResponse.json(formattedCategories)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { translations } = body // Expecting translations array or object

        if (!translations || !Array.isArray(translations) || translations.length === 0) {
            return NextResponse.json({ error: "Translations are required" }, { status: 400 })
        }

        const session = await getSession()
        const userEmail = session?.user?.email

        // Create category
        const category = await prisma.category.create({
            data: {
                createdBy: userEmail,
                updatedBy: userEmail,
                translations: {
                    create: translations, // [{ language: 'az', name: '...' }, ...]
                },
            },
            include: {
                translations: true
            }
        })

        const formattedCategory = {
            ...category,
            name: (category as any).translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.name }), {}),
        }

        return NextResponse.json(formattedCategory)
    } catch (error: any) {
        console.error("POST Category Error:", error)
        return NextResponse.json({
            error: "Failed to create category",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, translations } = body

        const session = await getSession()
        const userEmail = session?.user?.email

        if (translations) {
            // Update updatedBy on parent category
            await prisma.category.update({
                where: { id },
                data: { updatedBy: userEmail }
            })

            for (const t of translations) {
                await prisma.categoryTranslation.upsert({
                    where: {
                        categoryId_language: { categoryId: id, language: t.language }
                    },
                    update: { name: t.name },
                    create: { categoryId: id, language: t.language, name: t.name }
                })
            }
        }

        const category = await prisma.category.findUnique({
            where: { id },
            include: { translations: true }
        })

        if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 })

        const formattedCategory = {
            ...category,
            name: category.translations.reduce((acc, t) => ({ ...acc, [t.language]: t.name }), {}),
        }

        return NextResponse.json(formattedCategory)
    } catch (error) {
        console.error("PUT Category Error:", error)
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        await prisma.category.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
