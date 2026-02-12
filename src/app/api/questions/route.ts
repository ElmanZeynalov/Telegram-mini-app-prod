
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const parentId = searchParams.get('parentId')

    try {
        const where: Prisma.QuestionWhereInput = {}
        if (categoryId) where.categoryId = categoryId
        if (parentId) where.parentId = parentId
        else if (categoryId) where.parentId = null // Get root questions for category

        const questions = await prisma.question.findMany({
            where,
            include: {
                translations: true,
                subQuestions: {
                    include: { translations: true }
                }
            },
            orderBy: {
                order: "asc",
            },
        })

        type QuestionWithRelations = Prisma.QuestionGetPayload<{
            include: { translations: true, subQuestions: { include: { translations: true } } }
        }>

        // Helper to format question
        const formatQuestion = (q: QuestionWithRelations): any => ({
            ...q,
            question: q.translations.reduce((acc: Record<string, string>, t) => ({ ...acc, [t.language]: t.question }), {}),
            answer: q.translations.reduce((acc: Record<string, string | null>, t) => ({ ...acc, [t.language]: t.answer }), {}),
            attachments: q.translations.reduce((acc: Record<string, { url: string, name: string } | null>, t) => ({
                ...acc,
                [t.language]: t.attachmentUrl ? { url: t.attachmentUrl, name: t.attachmentName || 'Attachment' } : null
            }), {}),
            subQuestions: q.subQuestions?.map((sq) => formatQuestion(sq as unknown as QuestionWithRelations)) || []
        })

        return NextResponse.json(questions.map(formatQuestion))
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { categoryId, parentId, translations } = body

        if (!translations || !Array.isArray(translations) || translations.length === 0) {
            return NextResponse.json({ error: "Translations are required" }, { status: 400 })
        }

        // Find the lowest order among siblings to put this one first
        const where: any = {}
        if (categoryId) where.categoryId = categoryId
        if (parentId) where.parentId = parentId
        else if (categoryId) where.parentId = null

        const firstQuestion = await prisma.question.findFirst({
            where,
            orderBy: { order: 'asc' },
            select: { order: true }
        })

        const newOrder = firstQuestion ? firstQuestion.order - 1 : 0

        const session = await getSession()
        const userEmail = session?.user?.email

        const question = await prisma.question.create({
            data: {
                ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
                ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
                order: newOrder,
                createdBy: userEmail,
                updatedBy: userEmail,
                translations: {
                    create: translations,
                },
            },
            include: {
                translations: true
            }
        })

        const formattedQuestion = {
            ...question,
            question: question.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}),
            answer: question.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}),
            subQuestions: []
        }

        return NextResponse.json(formattedQuestion)
    } catch (error) {
        console.error("POST Question Error:", error)
        return NextResponse.json({ error: "Failed to create question", details: String(error) }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, translations, order } = body

        const session = await getSession()
        const userEmail = session?.user?.email

        // Basic fields update
        await prisma.question.update({
            where: { id },
            data: {
                updatedBy: userEmail,
                ...(typeof order === 'number' ? { order } : {})
            }
        })

        if (translations) {

            // Fetch existing translations to find a fallback title (e.g. AZ)
            const existingQ = await prisma.question.findUnique({
                where: { id },
                include: { translations: true }
            })

            if (!existingQ) return NextResponse.json({ error: "Question not found" }, { status: 404 })

            const fallbackTitle = existingQ.translations.find(t => t.language === 'az')?.question
                || existingQ.translations.find(t => t.question?.length > 0)?.question
                || "New Question"

            for (const t of translations) {
                // Determine valid question text:
                // 1. If provided in payload and not empty, use it.
                // 2. If creating new record, MUST use fallback if provided is empty.
                const titleForCreate = (t.question && t.question.trim().length > 0) ? t.question : fallbackTitle

                // Safest: If payload question is empty/falsy, do NOT update the DB field (use undefined).
                const titleForUpdate = (t.question && t.question.trim().length > 0) ? t.question : undefined

                const session = await getSession()
                const userEmail = session?.user?.email

                // Also update the parent Question's updatedBy field
                await prisma.question.update({
                    where: { id },
                    data: { updatedBy: userEmail }
                })

                await prisma.questionTranslation.upsert({
                    where: {
                        questionId_language: { questionId: id, language: t.language }
                    },
                    update: {
                        answer: t.answer,
                        ...(t.attachmentUrl !== undefined ? { attachmentUrl: t.attachmentUrl } : {}),
                        ...(t.attachmentName !== undefined ? { attachmentName: t.attachmentName } : {}),
                        ...(titleForUpdate ? { question: titleForUpdate } : {})
                    },
                    create: {
                        questionId: id,
                        language: t.language,
                        question: titleForCreate,
                        answer: t.answer,
                        attachmentUrl: t.attachmentUrl,
                        attachmentName: t.attachmentName
                    }
                })
            }
        }

        // Fetch updated
        const question = await prisma.question.findUnique({
            where: { id },
            include: { translations: true, subQuestions: { include: { translations: true } } }
        })

        if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 })

        const formatQuestion = (q: any) => ({
            ...q,
            question: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}),
            answer: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}),
            attachments: q.translations.reduce((acc: any, t: any) => ({
                ...acc,
                [t.language]: t.attachmentUrl ? { url: t.attachmentUrl, name: t.attachmentName } : null
            }), {}),
            subQuestions: q.subQuestions?.map(formatQuestion) || []
        })

        return NextResponse.json(formatQuestion(question))
    } catch (error) {
        console.error("PUT Error:", error)
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        await prisma.question.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
    }
}
