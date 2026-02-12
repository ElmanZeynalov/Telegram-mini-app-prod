import { useState, useRef } from "react"
import { Category, Question } from "../types"
import { updateQuestionRecursively } from "../utils"

interface UseDragDropProps {
    flows: { categories: Category[]; questions: Question[] }
    setFlows: React.Dispatch<React.SetStateAction<{ categories: Category[]; questions: Question[] }>>
    selectedCategory: string | null
}

export function useDragDrop({ flows, setFlows, selectedCategory }: UseDragDropProps) {
    const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
    const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)
    const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null)
    const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null)

    const dragCategoryOverIndex = useRef<number | null>(null)
    const dragQuestionOverIndex = useRef<number | null>(null)
    const allowDragRef = useRef(false)

    const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
        setDraggedCategoryId(categoryId)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
        e.preventDefault()
        if (draggedCategoryId && draggedCategoryId !== categoryId) {
            setDragOverCategoryId(categoryId)
            const targetElement = e.target as HTMLElement
            const overElement = targetElement.closest('[draggable="true"]') as HTMLElement
            if (overElement) {
                const index = Array.from(overElement.parentNode!.children).indexOf(overElement)
                dragCategoryOverIndex.current = index
            }
        }
    }

    const handleCategoryDragLeave = () => {
        setDragOverCategoryId(null)
        dragCategoryOverIndex.current = null
    }

    const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
        e.preventDefault()
        if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
            setDraggedCategoryId(null)
            setDragOverCategoryId(null)
            dragCategoryOverIndex.current = null
            return
        }

        setFlows((prev) => {
            const sorted = [...prev.categories].sort((a, b) => a.order - b.order)
            const draggedIndex = sorted.findIndex((c) => c.id === draggedCategoryId)
            const targetIndex =
                dragCategoryOverIndex.current !== null
                    ? dragCategoryOverIndex.current
                    : sorted.findIndex((c) => c.id === targetCategoryId)

            if (draggedIndex === -1 || targetIndex === -1) return prev

            const newSorted = [...sorted]
            const [removed] = newSorted.splice(draggedIndex, 1)
            newSorted.splice(targetIndex, 0, removed)

            const updatedCategories = newSorted.map((cat, idx) => ({ ...cat, order: idx }))

            // Save order to backend
            const saveReorder = async (items: { id: string; order: number }[]) => {
                try {
                    await fetch('/api/categories/reorder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items })
                    })
                } catch (e) {
                    console.error("Failed to save category order", e)
                }
            }

            saveReorder(updatedCategories.map(c => ({ id: c.id, order: c.order })))

            return { ...prev, categories: updatedCategories }
        })

        setDraggedCategoryId(null)
        setDragOverCategoryId(null)
        dragCategoryOverIndex.current = null
    }

    const handleCategoryDragEnd = () => {
        setDraggedCategoryId(null)
        setDragOverCategoryId(null)
        dragCategoryOverIndex.current = null
    }

    const handleQuestionDragStart = (e: React.DragEvent, questionId: string) => {
        if (!allowDragRef.current) {
            e.preventDefault()
            return
        }
        setDraggedQuestionId(questionId)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleQuestionDragOver = (e: React.DragEvent, questionId: string) => {
        e.preventDefault()
        if (draggedQuestionId && draggedQuestionId !== questionId) {
            setDragOverQuestionId(questionId)
            const targetElement = e.target as HTMLElement
            const overElement = targetElement.closest('[draggable="true"]') as HTMLElement
            if (overElement) {
                const index = Array.from(overElement.parentNode!.children).indexOf(overElement)
                dragQuestionOverIndex.current = index
            }
        }
    }

    const handleQuestionDragLeave = () => {
        setDragOverQuestionId(null)
        dragQuestionOverIndex.current = null
    }

    const handleQuestionDrop = (e: React.DragEvent, targetQuestionId: string, parentQuestionId?: string) => {
        e.preventDefault()
        if (!draggedQuestionId || draggedQuestionId === targetQuestionId) {
            setDraggedQuestionId(null)
            setDragOverQuestionId(null)
            dragQuestionOverIndex.current = null
            return
        }

        const saveReorder = async (items: { id: string; order: number }[]) => {
            try {
                await fetch('/api/questions/reorder', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items })
                })
            } catch (e) {
                console.error("Failed to save order", e)
            }
        }

        if (parentQuestionId) {
            // Reorder within subQuestions
            let reorderedItems: { id: string; order: number }[] = []

            setFlows((prev) => ({
                ...prev,
                questions: updateQuestionRecursively(prev.questions, parentQuestionId, (parent) => {
                    if (!parent.subQuestions) return parent

                    const sorted = [...parent.subQuestions].sort((a, b) => a.order - b.order)
                    const draggedIndex = sorted.findIndex((q) => q.id === draggedQuestionId)
                    const targetIndex =
                        dragQuestionOverIndex.current !== null
                            ? dragQuestionOverIndex.current
                            : sorted.findIndex((q) => q.id === targetQuestionId)

                    if (draggedIndex === -1 || targetIndex === -1) return parent

                    const newSorted = [...sorted]
                    const [removed] = newSorted.splice(draggedIndex, 1)
                    newSorted.splice(targetIndex, 0, removed)

                    const updatedSubQuestions = newSorted.map((q, idx) => ({ ...q, order: idx }))
                    reorderedItems = updatedSubQuestions.map((q) => ({ id: q.id, order: q.order }))

                    return { ...parent, subQuestions: updatedSubQuestions }
                }) as Question[]
            }))

            if (reorderedItems.length > 0) saveReorder(reorderedItems)

        } else {
            // Root level reorder
            if (!selectedCategory) return

            const currentCategoryQuestions = flows.questions
                .filter((q) => q.categoryId === selectedCategory)
                .sort((a, b) => a.order - b.order)

            const draggedIndex = currentCategoryQuestions.findIndex((q) => q.id === draggedQuestionId)
            const targetIndex =
                dragQuestionOverIndex.current !== null
                    ? dragQuestionOverIndex.current
                    : currentCategoryQuestions.findIndex((q) => q.id === targetQuestionId)

            if (draggedIndex !== -1 && targetIndex !== -1) {
                const newSorted = [...currentCategoryQuestions]
                const [removed] = newSorted.splice(draggedIndex, 1)
                newSorted.splice(targetIndex, 0, removed)

                const updatedCategoryQuestions = newSorted.map((q, idx) => ({ ...q, order: idx }))
                const reorderedItems = updatedCategoryQuestions.map(q => ({ id: q.id, order: q.order }))

                // Merge back into main list
                setFlows((prev) => {
                    const updatedQuestions = prev.questions.map(q => {
                        if (q.categoryId !== selectedCategory) return q
                        const updated = updatedCategoryQuestions.find(uq => uq.id === q.id)
                        return updated || q
                    })
                    return { ...prev, questions: updatedQuestions }
                })

                saveReorder(reorderedItems)
            }
        }

        setDraggedQuestionId(null)
        setDragOverQuestionId(null)
        dragQuestionOverIndex.current = null
    }

    const handleQuestionDragEnd = () => {
        setDraggedQuestionId(null)
        setDragOverQuestionId(null)
        dragQuestionOverIndex.current = null
    }

    return {
        draggedCategoryId,
        dragOverCategoryId,
        draggedQuestionId,
        dragOverQuestionId,
        allowDragRef,

        handleCategoryDragStart,
        handleCategoryDragOver,
        handleCategoryDragLeave,
        handleCategoryDrop,
        handleCategoryDragEnd,

        handleQuestionDragStart,
        handleQuestionDragOver,
        handleQuestionDragLeave,
        handleQuestionDrop,
        handleQuestionDragEnd
    }
}
