import { NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename') || "file"

        if (!request.body) {
            return NextResponse.json({ error: "No body" }, { status: 400 })
        }

        // Convert ReadableStream to Buffer
        const reader = request.body.getReader()
        const chunks = []
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
        }
        const buffer = Buffer.concat(chunks)

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = filename.split('.').pop()
        const baseName = filename.split('.').slice(0, -1).join('.')
        const safeFilename = `${baseName}-${uniqueSuffix}.${ext}`
        const filePath = join(uploadDir, safeFilename)

        // Write file to disk
        await writeFile(filePath, buffer)

        // Return URL relative to public folder
        const url = `/uploads/${safeFilename}`

        return NextResponse.json({
            url,
            pathname: safeFilename,
            contentType: request.headers.get('content-type') || 'application/octet-stream',
            contentDisposition: `attachment; filename="${safeFilename}"`
        })
    } catch (error) {
        console.error("Upload error details:", error)
        return NextResponse.json({ error: "Upload failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const urlToCheck = searchParams.get('url')

        if (!urlToCheck) {
            return NextResponse.json({ error: "Url required" }, { status: 400 })
        }

        // Extract filename from URL (assuming /uploads/filename.ext)
        const filename = urlToCheck.split('/').pop()
        if (!filename) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
        }

        const filePath = join(process.cwd(), 'public', 'uploads', filename)

        if (existsSync(filePath)) {
            await unlink(filePath)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete failed:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
