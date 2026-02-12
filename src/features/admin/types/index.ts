export const AVAILABLE_LANGUAGES = [
    { code: "az", name: "Azərbaycan", flag: "🇦🇿" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
]

export type TranslatedString = { [langCode: string]: string }

export interface Category {
    id: string
    name: TranslatedString
    order: number
    createdAt: string
    createdBy?: string | null
    updatedBy?: string | null
    updatedAt?: string
}

export interface Question {
    id: string
    categoryId?: string
    question: TranslatedString
    answer?: TranslatedString
    attachments?: Record<string, { url: string; name: string } | null>
    keywords?: string[]
    subQuestions?: Question[]
    translations?: any[]
    createdBy?: string | null
    updatedBy?: string | null
    order: number
    createdAt: string
    updatedAt?: string
}

export interface Breadcrumb {
    id: string
    label: string
    type: "category" | "question"
}

export type ActivePanel = {
    questionId: string
    panel: "answer" | "subquestion" | "edit" | null
}

export interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: "admin" | "user"
}

