import { AVAILABLE_LANGUAGES, TranslatedString, Question } from "../types"

export const getTranslationStatus = (
    translations: TranslatedString | undefined,
): { complete: number; total: number; missing: string[] } => {
    if (!translations)
        return { complete: 0, total: AVAILABLE_LANGUAGES.length, missing: AVAILABLE_LANGUAGES.map((l) => l.code) }
    const missing = AVAILABLE_LANGUAGES.filter((lang) => !translations[lang.code]?.trim()).map((l) => l.code)
    return {
        complete: AVAILABLE_LANGUAGES.length - missing.length,
        total: AVAILABLE_LANGUAGES.length,
        missing,
    }
}

export const t = (translations: TranslatedString | undefined, currentLang: string, fallback = "Untitled"): string => {
    if (!translations) return fallback
    return translations[currentLang] || translations.en || Object.values(translations)[0] || fallback
}

export const updateQuestionRecursively = (
    questions: Question[],
    targetId: string,
    updateFn: (question: Question) => Question,
): Question[] => {
    return questions.map((q) => {
        if (q.id === targetId) {
            return updateFn(q)
        }
        if (q.subQuestions) {
            return { ...q, subQuestions: updateQuestionRecursively(q.subQuestions, targetId, updateFn) }
        }
        return q
    })
}
