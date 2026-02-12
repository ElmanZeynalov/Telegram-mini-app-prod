import { MessageSquare } from "lucide-react"
import { Question, ActivePanel, AVAILABLE_LANGUAGES } from "../../types"
import { QuestionItem } from "./question-item"

interface QuestionListProps {
    questions: Question[]
    currentLang: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    activePanel: ActivePanel | null

    // Drag and Drop State
    draggedQuestionId: string | null
    dragOverQuestionId: string | null

    // Handlers
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragOver: (e: React.DragEvent, id: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
    onDragHandleDown: (allow: boolean) => void

    onOpenTranslation: (type: "question", id: string, field: "name" | "question" | "answer") => void
    onDelete: (id: string, text: string) => void
    onDeleteAttachment: (id: string, url: string) => void
    onNavigateInto: (question: Question) => void
    onPanelAction: (id: string, action: "answer" | "subquestion" | "edit", question: Question) => void
    onClosePanel: () => void

    // Forms State & Handlers
    answerForm: string
    setAnswerForm: (val: string) => void
    subQuestionForm: string
    setSubQuestionForm: (val: string) => void
    editForm: { question: string; answer: string; order: number }
    setEditForm: (val: { question: string; answer: string; order: number }) => void

    // Attachments State
    answerAttachment: { url: string; name: string } | null
    setAnswerAttachment: (val: { url: string; name: string } | null) => void
    editAttachment: { url: string; name: string } | null
    setEditAttachment: (val: { url: string; name: string } | null) => void

    // Logic Handlers
    onSaveAnswer: (id: string) => void
    onAddSubQuestion: (id: string) => void
    onSaveEdit: (id: string) => void
    handleFileUpload: (file: File) => Promise<{ url: string; name: string } | null>
    onReorder: (id: string) => void
}

export function QuestionList({
    questions,
    currentLang,
    currentLangInfo,
    activePanel,
    draggedQuestionId,
    dragOverQuestionId,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onDragHandleDown,
    onOpenTranslation,
    onDelete,
    onDeleteAttachment,
    onNavigateInto,
    onPanelAction,
    onClosePanel,

    answerForm,
    setAnswerForm,
    subQuestionForm,
    setSubQuestionForm,
    editForm,
    setEditForm,
    answerAttachment,
    setAnswerAttachment,
    editAttachment,
    setEditAttachment,
    onSaveAnswer,
    onAddSubQuestion,
    onSaveEdit,
    handleFileUpload,
    onReorder
}: QuestionListProps) {
    if (questions.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-muted/20 border border-dashed border-border/60 rounded-2xl animate-in fade-in duration-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">Hələlik sual yoxdur. İlk sualı yuxarıdan əlavə edin.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <QuestionItem
                    key={question.id}
                    index={index + 1}
                    question={question}
                    currentLang={currentLang}
                    currentLangInfo={currentLangInfo}
                    activePanel={activePanel}
                    isDragging={draggedQuestionId === question.id}
                    isDragOver={dragOverQuestionId === question.id}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onDragEnd={onDragEnd}
                    onDragHandleDown={onDragHandleDown}
                    onOpenTranslation={onOpenTranslation}
                    onDelete={onDelete}
                    onDeleteAttachment={onDeleteAttachment}
                    onNavigateInto={onNavigateInto}
                    onPanelAction={onPanelAction}
                    onClosePanel={onClosePanel}

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
                    onSaveAnswer={onSaveAnswer}
                    onAddSubQuestion={onAddSubQuestion}
                    onSaveEdit={onSaveEdit}
                    handleFileUpload={handleFileUpload}
                    onReorder={onReorder}
                />
            ))}
        </div>
    )
}
