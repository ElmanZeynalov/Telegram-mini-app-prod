import {
    GripVertical,
    FileText,
    FolderTree,
    AlertCircle,
    Trash2,
    Plus,
    Edit2,
    ChevronRight,
    Languages
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import MarkdownPreview from "@/features/admin/components/ui/markdown-preview"
import RichTextEditor from "@/features/admin/components/ui/rich-text-editor"
import { TranslationBadge } from "../ui/translation-badge"
import { Question, ActivePanel, AVAILABLE_LANGUAGES, TranslatedString } from "../../types"
import { t } from "../../utils"

interface QuestionItemProps {
    index: number
    question: Question
    currentLang: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    activePanel: ActivePanel | null

    // Drag and Drop
    isDragging: boolean
    isDragOver: boolean
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragOver: (e: React.DragEvent, id: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
    onDragHandleDown: (allow: boolean) => void
    onReorder: (id: string) => void

    // Actions
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
}

export function QuestionItem({
    index,
    question,
    currentLang,
    currentLangInfo,
    activePanel,
    isDragging,
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onDragHandleDown,
    onReorder,
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
    handleFileUpload
}: QuestionItemProps) {
    const hasAnswer = question.answer && Object.values(question.answer).some((v) => v?.trim())
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0
    const currentAnswer = question.answer?.[currentLang] || ""
    const isActive = activePanel?.questionId === question.id

    return (
        <Card
            id={`question-${question.id}`}
            draggable
            onDragStart={(e) => onDragStart(e, question.id)}
            onDragOver={(e) => onDragOver(e, question.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, question.id)}
            onDragEnd={onDragEnd}
            onMouseDown={(e) => {
                const target = e.target as HTMLElement
                if (target.closest(".drag-handle")) {
                    onDragHandleDown(true)
                } else {
                    onDragHandleDown(false)
                }
            }}
            className={`bg-card border-border transition-all duration-200 ${isDragging ? "opacity-50 scale-[0.98]" : ""
                } ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-2">
                        <div className="flex items-center gap-1 pt-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md drag-handle transition-colors">
                                            <GripVertical className="w-4 h-4 text-muted-foreground/60" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sıralamaq üçün daşıyın</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="flex items-center gap-1 pt-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={() => onReorder(question.id)}
                                            className="cursor-pointer flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary transition-colors border border-primary/20"
                                        >
                                            #{index}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sıranı dəyiş</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-[15px] text-foreground leading-snug">{t(question.question, currentLang)}</h3>
                                <TranslationBadge
                                    translations={question.question}
                                    onClick={() => onOpenTranslation("question", question.id, "question")}
                                />
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center gap-2 mt-2.5">
                                {hasAnswer && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" className="text-[10px] font-medium py-0.5 px-2 gap-1.5 cursor-help bg-success/10 text-success border-success/20">
                                                    <FileText className="w-3 h-3" />
                                                    Cavab var
                                                    <TranslationBadge
                                                        translations={question.answer}
                                                        onClick={() => onOpenTranslation("question", question.id, "answer")}
                                                    />
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Bu sual üçün cavab mətni qeyd olunub</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {hasSubQuestions && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" className="text-[10px] font-medium py-0.5 px-2 gap-1.5 cursor-help bg-primary/10 text-primary border-primary/20">
                                                    <FolderTree className="w-3 h-3" />
                                                    {question.subQuestions!.length} Alt sual
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Bu sualın {question.subQuestions!.length} alt sualı var</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Onları idarə etmək üçün "Alt sualları gör" düyməsinə klikləyin
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {!hasAnswer && !hasSubQuestions && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] font-medium py-0.5 px-2 bg-amber-500/10 text-amber-600 border-amber-500/20 cursor-help"
                                                >
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Məzmun yoxdur
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-semibold text-amber-600">Natamam sual</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Tamamlamaq üçün cavab və ya alt suallar əlavə edin
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-full h-8 w-8"
                        onClick={() => {
                            const questionText = question.question[currentLang] || question.question["en"] || ""
                            const truncated =
                                questionText.length > 50 ? questionText.slice(0, 50) + "..." : questionText
                            onDelete(question.id, truncated)
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Show current answer preview if exists */}
                {currentAnswer && activePanel?.questionId !== question.id && (
                    <div className="mb-4 p-4 bg-muted/40 rounded-xl border border-border/50 relative group/answer">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-2 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Cavab ({currentLangInfo.name}):
                        </div>
                        <div className="text-sm text-foreground mb-4 prose-sm max-w-none">
                            <MarkdownPreview content={currentAnswer} />
                        </div>

                        {/* Answer-specific Audit (shares Question audit) */}
                        <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[9px] opacity-60 group-hover/answer:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Yaradılıb:</span>
                                <span className="text-blue-600 font-semibold">{question.createdBy || "Sistem"}</span>
                                <span className="text-muted-foreground/40 mx-0.5">•</span>
                                <span className="text-blue-600">
                                    {question.createdAt ? new Date(question.createdAt).toLocaleDateString('az-AZ') : "—"}
                                </span>
                            </div>
                            {question.updatedBy && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground">Son redaktə:</span>
                                    <span className="text-blue-600 font-semibold">{question.updatedBy}</span>
                                    <span className="text-muted-foreground/40 mx-0.5">•</span>
                                    <span className="text-blue-600">
                                        {question.updatedAt ? new Date(question.updatedAt).toLocaleDateString('az-AZ') : "—"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {question.attachments?.[currentLang] && (
                            <div className="mt-3 flex items-center justify-between bg-card border border-border/40 rounded-lg px-3 py-2 w-full max-w-xs shadow-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-base">📎</span>
                                    <span className="text-[11px] font-semibold truncate text-muted-foreground">{question.attachments[currentLang]?.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1 rounded-full transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (question.attachments?.[currentLang]?.url) {
                                            onDeleteAttachment(question.id, question.attachments[currentLang]!.url)
                                        }
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "answer"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "answer"
                                ? onClosePanel()
                                : onPanelAction(question.id, "answer", question)
                        }
                        className="gap-1.5 h-8 text-xs font-semibold rounded-lg shadow-sm"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        {hasAnswer ? "Cavabı redaktə et" : "Cavab əlavə et"}
                    </Button>

                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "subquestion"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "subquestion"
                                ? onClosePanel()
                                : onPanelAction(question.id, "subquestion", question)
                        }
                        className="gap-1.5 h-8 text-xs font-semibold rounded-lg shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Alt sual əlavə et
                    </Button>

                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "edit"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "edit"
                                ? onClosePanel()
                                : onPanelAction(question.id, "edit", question)
                        }
                        className="gap-1.5 h-8 text-xs font-semibold rounded-lg shadow-sm"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Sualı redaktə et
                    </Button>

                    {hasSubQuestions && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => onNavigateInto(question)}
                            className="gap-1.5 ml-auto h-8 text-xs font-semibold rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                        >
                            Alt sualları gör
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>

                {/* Audit Info */}
                <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-[10px]">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground/80 lowercase">Yaradılıb:</span>
                            <span className="text-blue-600 font-bold">{question.createdBy || "Sistem"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground/80 lowercase">Tarix:</span>
                            <span className="text-blue-600 font-medium">
                                {question.createdAt ? new Date(question.createdAt).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Məlum deyil"}
                            </span>
                        </div>
                    </div>

                    {(question.updatedBy || (question.updatedAt && question.updatedAt !== question.createdAt)) && (
                        <div className="flex flex-col gap-1 items-end ml-auto text-right">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground/80 lowercase">Son redaktə:</span>
                                <span className="text-blue-600 font-bold">{question.updatedBy || "Sistem"}</span>
                            </div>
                            {question.updatedAt && question.updatedAt !== question.createdAt && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-muted-foreground/80 lowercase">Yenilənmə:</span>
                                    <span className="text-blue-600 font-medium">
                                        {new Date(question.updatedAt).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Expandable Panels */}
                {isActive && activePanel && (
                    <div className="mt-5 pt-5 border-t border-primary/20 bg-primary/[0.02] -mx-4 px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {activePanel.panel === "answer" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Cavab ({currentLangInfo.name})
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenTranslation("question", question.id, "answer")}
                                        className="gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                                    >
                                        <Languages className="w-3.5 h-3.5" />
                                        Bütün dilləri idarə et
                                    </Button>
                                </div>
                                <RichTextEditor
                                    value={answerForm}
                                    onChange={setAnswerForm}
                                    onFileSelect={async (file) => {
                                        if (!file) return
                                        const result = await handleFileUpload(file)
                                        if (result) setAnswerAttachment(result)
                                    }}
                                />
                                {answerAttachment && (
                                    <div className="text-xs text-blue-600 flex items-center justify-between bg-blue-50/50 p-2.5 rounded-lg border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2 font-medium">📎 {answerAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setAnswerAttachment(null)}>×</Button>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button variant="ghost" size="sm" onClick={onClosePanel} className="font-semibold">
                                        Ləğv et
                                    </Button>
                                    <Button size="sm" onClick={() => onSaveAnswer(question.id)} className="font-bold px-6 shadow-md shadow-primary/20">
                                        Yadda saxla
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activePanel.panel === "subquestion" && (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" />
                                    Alt sual əlavə et ({currentLangInfo.flag} {currentLangInfo.name})
                                </label>
                                <RichTextEditor
                                    value={subQuestionForm}
                                    onChange={setSubQuestionForm}
                                    placeholder="Alt sualın mətnini daxil edin..."
                                    compact
                                    rows={2}
                                    onSubmit={() => {
                                        if (subQuestionForm.trim()) {
                                            onAddSubQuestion(question.id)
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between pt-2">
                                    {hasSubQuestions && (
                                        <div className="text-xs font-medium text-muted-foreground/80">
                                            {question.subQuestions!.length} alt sual artıq mövcuddur
                                        </div>
                                    )}
                                    <div className="flex gap-3 ml-auto">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClosePanel}
                                            className="font-semibold"
                                        >
                                            Hazır
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => onAddSubQuestion(question.id)}
                                            disabled={!subQuestionForm.trim()}
                                            className="font-bold px-6 shadow-md shadow-primary/20"
                                        >
                                            Əlavə et
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel.panel === "edit" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-foreground">
                                        Sualı redaktə et ({currentLangInfo.flag} {currentLangInfo.name})
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenTranslation("question", question.id, "question")}
                                        className="gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                                    >
                                        <Languages className="w-3.5 h-3.5" />
                                        Bütün dilləri idarə et
                                    </Button>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <RichTextEditor
                                            value={editForm.question}
                                            onChange={(val) => setEditForm({ ...editForm, question: val })}
                                            placeholder="Sualın mətnini buraya yazın..."
                                            compact
                                            rows={2}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">Sıra #</label>
                                        <input
                                            type="number"
                                            value={editForm.order}
                                            onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                                            className="w-full h-9 px-3 bg-muted/50 border border-border/50 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                        />
                                    </div>
                                </div>
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Cavab (istəyə bağlı)
                                </label>
                                <RichTextEditor
                                    value={editForm.answer}
                                    onChange={(v) => setEditForm({ ...editForm, answer: v })}
                                    onFileSelect={async (file) => {
                                        if (!file) return
                                        const result = await handleFileUpload(file)
                                        if (result) setEditAttachment(result)
                                    }}
                                />
                                {editAttachment && (
                                    <div className="text-xs text-blue-600 flex items-center justify-between bg-blue-50/50 p-2.5 rounded-lg border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2 font-medium">📎 {editAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setEditAttachment(null)}>×</Button>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button variant="ghost" size="sm" onClick={onClosePanel} className="font-semibold">
                                        Ləğv et
                                    </Button>
                                    <Button size="sm" onClick={() => onSaveEdit(question.id)} className="font-bold px-6 shadow-md shadow-primary/20">
                                        Dəyişiklikləri yadda saxla
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
