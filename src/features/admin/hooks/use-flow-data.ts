import { useState, useEffect } from "react"
import { Category, Question } from "../types"

export function useFlowData() {
    const [flows, setFlows] = useState<{ categories: Category[]; questions: Question[] }>({
        categories: [],
        questions: [],
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, questionsRes] = await Promise.all([
                    fetch('/api/categories', { cache: 'no-store' }),
                    fetch('/api/questions', { cache: 'no-store' })
                ])

                if (!catsRes.ok || !questionsRes.ok) throw new Error(`Failed to fetch data: Categories ${catsRes.status} / Questions ${questionsRes.status}`)

                const categories = await catsRes.json()
                const flatQuestions = await questionsRes.json()

                // Pre-process: Rescue orphaned questions (parentId points to non-existent ID)
                const allQuestionIds = new Set(flatQuestions.map((q: any) => q.id))
                const validQuestions = flatQuestions.map((q: any) => {
                    if (q.parentId && !allQuestionIds.has(q.parentId)) {
                        return { ...q, parentId: null } // Treat orphan as root
                    }
                    return q
                })

                // Build Tree from valid list
                const buildTree = (questions: any[], parentId: string | null = null): Question[] => {
                    return questions
                        .filter(q => {
                            if (parentId === null) return !q.parentId
                            return q.parentId === parentId
                        })
                        .map(q => ({
                            ...q,
                            subQuestions: buildTree(questions, q.id)
                        }))
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                }

                const questions = buildTree(validQuestions, null)
                setFlows({ categories, questions })
            } catch (e) {
                console.error("Failed to fetch data:", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const findQuestionById = (id: string): Question | null => {
        const findRecursive = (questions: Question[]): Question | null => {
            for (const q of questions) {
                if (q.id === id) return q
                if (q.subQuestions) {
                    const found = findRecursive(q.subQuestions)
                    if (found) return found
                }
            }
            return null
        }
        return findRecursive(flows.questions)
    }

    return {
        flows,
        setFlows,
        isLoading,
        findQuestionById
    }
}
