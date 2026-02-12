"use client"

import { useState, useEffect, Suspense } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/features/admin/components/ui/confirm-dialog"
import { FlowSidebar } from "@/features/admin/components/flow-builder/flow-sidebar"
import { TranslationModal } from "@/features/admin/components/modals/translation-modal"
import { ReorderModal } from "@/features/admin/components/modals/reorder-modal"
import { FlowHeader } from "@/features/admin/components/flow-builder/flow-header"
import { QuestionList } from "@/features/admin/components/flow-builder/question-list"
import { AddQuestionForm } from "@/features/admin/components/flow-builder/add-question-form"
import { EmptyState } from "@/features/admin/components/flow-builder/empty-state"
import {
    AVAILABLE_LANGUAGES,
    Category,
    Question,
    Breadcrumb,
    ActivePanel,
    User
} from "@/features/admin/types"
import { t } from "@/features/admin/utils"
import { useFlowData } from "@/features/admin/hooks/use-flow-data"
import { useFlowActions } from "@/features/admin/hooks/use-flow-actions"
import { useDragDrop } from "@/features/admin/hooks/use-drag-drop"


interface FlowBuilderProps {
    user: User
}

/**
 * Main Flow Builder component that provides a comprehensive interface for managing
 * conversational flows, categories, questions, and answers for the legal aid bot.
 * 
 * Features:
 * - Category management with drag-and-drop reordering
 * - Multi-level question hierarchy with breadcrumb navigation
 * - Rich text editing for questions and answers
 * - Multi-language support with translation management
 * - File attachment support
 * - Search functionality with scroll-to-question
 * - Real-time preview and editing panels
 * 
 * @param {FlowBuilderProps} props - Component props
 * @param {User} props.user - Currently authenticated user
 */
function FlowBuilderContent({ user }: FlowBuilderProps) {
    const { flows, setFlows, isLoading, findQuestionById } = useFlowData()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Changed from string to string | null
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
    const [targetQuestionId, setTargetQuestionId] = useState<string | null>(null)
    const [currentLang, setCurrentLang] = useState("az") // Renamed to currentLang
    const currentLangInfo = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0]

    const {
        // State
        activePanel,
        deleteConfirm,
        setDeleteConfirm,
        newQuestionText,
        setNewQuestionText,
        answerForm,
        setAnswerForm,
        answerAttachment,
        setAnswerAttachment,
        subQuestionForm,
        setSubQuestionForm,
        editForm,
        setEditForm,
        editAttachment,
        setEditAttachment,
        translationModal,
        setTranslationModal,
        translationForms,
        setTranslationForms,
        isUploading,
        // allowDragRef removed from here, coming from useDragDrop

        // Actions
        handleFileUpload,
        addCategory,
        updateCategory,
        handleDeleteCategory,
        deleteCategory,
        confirmDelete,
        reorderCategory,
        handleDeleteQuestion,
        deleteQuestion,
        addQuestion,
        saveAnswer,
        addSubQuestion,
        saveEdit,
        deleteAttachment,
        openPanel,
        closePanel,
        navigateInto,
        navigateToBreadcrumb,
        openTranslationModal,
        saveTranslations,
        getMissingTranslationsCount,
        reorderModal,
        closeReorderModal,
        openReorderModal,
        reorderQuestionManual,
        openReorderCategoryModal,
        reorderCategoryManual
    } = useFlowActions({
        flows,
        setFlows,
        currentLang,
        selectedCategory,
        setSelectedCategory,
        breadcrumbs,
        setBreadcrumbs,
        findQuestionById
    })

    // Destructure DragDrop hook
    const {
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
    } = useDragDrop({ flows, setFlows, selectedCategory })


    /**
     * Effect: Manage breadcrumb initialization when category changes
     * 
     * When a category is selected, this effect initializes the breadcrumbs with
     * the category name. It prevents overwriting search-set breadcrumbs by checking
     * if valid breadcrumbs already exist for the selected category.
     */
    useEffect(() => {
        if (selectedCategory) {
            // Only auto-initialize breadcrumbs if we don't have a valid path for this category yet
            // This prevents search results (which set a full path) from being overwritten
            const hasValidPath = breadcrumbs.length > 0 && breadcrumbs[0].id === selectedCategory

            if (!hasValidPath) {
                const category = flows.categories.find((c) => c.id === selectedCategory)
                if (category) {
                    setBreadcrumbs([
                        {
                            id: selectedCategory,
                            label: t(category.name, currentLang),
                            type: "category",
                        },
                    ])
                }
            }
        } else {
            if (breadcrumbs.length > 0) {
                setBreadcrumbs([])
            }
        }
    }, [selectedCategory, flows.categories, currentLang])

    /**
     * Helper: Get questions at current breadcrumb level
     * 
     * Returns questions for the current view based on breadcrumb navigation.
     * If at root level, returns category questions. If navigated into a question,
     * returns its sub-questions.
     */
    const getQuestionsAtLevel = (): Question[] => {
        if (!selectedCategory) return []

        const parentId = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].id : null

        if (parentId) {
            const parentQuestion = findQuestionById(parentId)
            return (parentQuestion?.subQuestions || []).sort((a, b) => a.order - b.order)
        } else {
            return flows.questions.filter((q) => q.categoryId === selectedCategory).sort((a, b) => a.order - b.order)
        }
    }

    const currentQuestions = getQuestionsAtLevel()

    /**
     * Effect: Handle scroll-to-question after search selection
     * 
     * When a question is selected from search results, this effect:
     * 1. Waits for navigation and list rendering to stabilize
     * 2. Smoothly scrolls the target question into view
     * 3. Briefly highlights the question with a visual effect
     * 4. Removes the highlight after 2 seconds
     */
    useEffect(() => {
        if (targetQuestionId) {
            const element = document.getElementById(`question-${targetQuestionId}`)
            if (element) {
                // Wait a bit for navigation/list rendering to stabilize
                const timeoutId = setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "center" })

                    // Add highlight effect
                    element.classList.add("ring-offset-2", "ring-4", "ring-primary", "transition-all", "duration-500", "scale-[1.02]", "shadow-2xl", "z-10")

                    // Remove highlight after a delay
                    setTimeout(() => {
                        element.classList.remove("ring-offset-2", "ring-4", "ring-primary", "scale-[1.02]", "shadow-2xl", "z-10")
                        setTargetQuestionId(null) // Reset target after scrolling
                    }, 2000)
                }, 300)

                return () => clearTimeout(timeoutId)
            }
        }
    }, [targetQuestionId, currentQuestions])

    const missingCount = getMissingTranslationsCount()
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }





    return (
        <TooltipProvider>
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title={deleteConfirm?.type === "category" ? "Kateqoriyanı sil" : "Sualı sil"}
                description={
                    deleteConfirm?.type === "category"
                        ? `"${deleteConfirm?.name}" kateqoriyasını silmək istədiyinizə əminsiniz? Bu kateqoriyadakı bütün suallar da silinəcək. Bu əməliyyat geri qaytarıla bilməz.`
                        : `Bu sualı silmək istədiyinizə əminsiniz? ${deleteConfirm?.name ? `"${deleteConfirm.name}"` : ""} Suala aid bütün alt suallar da silinəcək. Bu əməliyyat geri qaytarıla bilməz.`
                }
                confirmText="Sil"
                variant="danger"
            />

            <div className="flex h-screen bg-background text-foreground">
                {/* Left Sidebar - Categories */}
                <FlowSidebar
                    categories={flows.categories}
                    selectedCategory={selectedCategory}
                    currentLang={currentLang}
                    currentLangInfo={currentLangInfo}
                    missingTranslationsCount={missingCount}
                    onSetCurrentLang={setCurrentLang}
                    onSelectCategory={(id) => {
                        if (id === selectedCategory && id !== null) {
                            // If selecting the same category, reset to root
                            closePanel()
                            const category = flows.categories.find((c) => c.id === id)
                            if (category) {
                                setBreadcrumbs([
                                    {
                                        id: id,
                                        label: t(category.name, currentLang),
                                        type: "category",
                                    },
                                ])
                            }
                        } else {
                            setSelectedCategory(id)
                        }
                    }}
                    onAddCategory={addCategory}
                    onUpdateCategory={updateCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onReorderCategory={reorderCategory}
                    onOpenTranslationModal={openTranslationModal}
                    onReorderManual={openReorderCategoryModal}
                    draggedCategoryId={draggedCategoryId}
                    dragOverCategoryId={dragOverCategoryId}
                    onDragStart={handleCategoryDragStart}
                    onDragOver={handleCategoryDragOver}
                    onDragLeave={handleCategoryDragLeave}
                    onDrop={handleCategoryDrop}
                    onDragEnd={handleCategoryDragEnd}
                />


                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Breadcrumbs Header */}
                    <FlowHeader
                        breadcrumbs={breadcrumbs}
                        navigateToBreadcrumb={navigateToBreadcrumb}
                        currentLangInfo={currentLangInfo}
                        user={user}
                        questions={flows.questions}
                        categories={flows.categories}
                        currentLang={currentLang}
                        onSelectSearch={(question, categoryId, path) => {
                            setSelectedCategory(categoryId)
                            // Navigate to the parent path so the question is visible in the list
                            const parentPath = path.slice(0, -1)
                            setBreadcrumbs(parentPath)
                            closePanel()

                            // Trigger scroll
                            setTargetQuestionId(question.id)
                        }}
                    />

                    {/* Questions Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedCategory ? (
                            <div className="max-w-4xl mx-auto space-y-4">
                                {breadcrumbs.length <= 1 && (
                                    <AddQuestionForm
                                        newQuestionText={newQuestionText}
                                        setNewQuestionText={setNewQuestionText}
                                        onAddQuestion={addQuestion}
                                        selectedCategory={selectedCategory}
                                        currentLangInfo={currentLangInfo}
                                    />
                                )}

                                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 flex justify-between">
                                    <span>Bazadakı suallar: {flows.questions.length}</span>
                                </div>
                                <QuestionList
                                    questions={currentQuestions}
                                    currentLang={currentLang}
                                    currentLangInfo={currentLangInfo}
                                    activePanel={activePanel}
                                    draggedQuestionId={draggedQuestionId}
                                    dragOverQuestionId={dragOverQuestionId}
                                    onDragStart={handleQuestionDragStart}
                                    onDragOver={handleQuestionDragOver}
                                    onDragLeave={handleQuestionDragLeave}
                                    onDrop={(e, id) => handleQuestionDrop(e, id, breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].id : undefined)}
                                    onDragEnd={handleQuestionDragEnd}
                                    onDragHandleDown={(allow) => { allowDragRef.current = allow }}
                                    onOpenTranslation={openTranslationModal}
                                    onDelete={handleDeleteQuestion}
                                    onDeleteAttachment={deleteAttachment}
                                    onReorder={openReorderModal}
                                    onNavigateInto={navigateInto}
                                    onPanelAction={openPanel}
                                    onClosePanel={closePanel}
                                    answerForm={answerForm}
                                    setAnswerForm={setAnswerForm}
                                    subQuestionForm={subQuestionForm}
                                    setSubQuestionForm={setSubQuestionForm}
                                    editForm={editForm}
                                    setEditForm={setEditForm}
                                    answerAttachment={answerAttachment}
                                    setAnswerAttachment={setAnswerAttachment}
                                    editAttachment={editAttachment}
                                    setEditAttachment={setEditAttachment}
                                    onSaveAnswer={saveAnswer}
                                    onAddSubQuestion={addSubQuestion}
                                    onSaveEdit={saveEdit}
                                    handleFileUpload={handleFileUpload}
                                />
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div >
                </div >

                {translationModal && (
                    <TranslationModal
                        isOpen={!!translationModal}
                        onClose={() => setTranslationModal(null)}
                        onSave={saveTranslations}
                        type={translationModal.type}
                        field={translationModal.field}
                        id={translationModal.id}
                        translationForms={translationForms}
                        setTranslationForms={setTranslationForms}
                        handleFileUpload={handleFileUpload}
                        getAttachment={(langCode) => {
                            const question = findQuestionById(translationModal.id)
                            const t = question?.translations?.find((tr: any) => tr.language === langCode)
                            if (t?.attachmentName) {
                                return { url: t.attachmentUrl, name: t.attachmentName }
                            }
                            return null
                        }}
                    />
                )}

                {reorderModal && (
                    <ReorderModal
                        isOpen={!!reorderModal}
                        onClose={closeReorderModal}
                        onConfirm={(newIndex) => {
                            if (reorderModal.type === 'category') {
                                reorderCategoryManual(newIndex - 1)
                            } else {
                                reorderQuestionManual(newIndex - 1)
                            }
                        }}
                        currentOrder={reorderModal.order}
                        totalItems={reorderModal.total}
                        itemName={reorderModal.name}
                    />
                )}
            </div >

        </TooltipProvider >
    )
}

export default function FlowBuilder({ user }: FlowBuilderProps) {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center bg-background">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            }
        >
            <FlowBuilderContent user={user} />
        </Suspense>
    )
}
