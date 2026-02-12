import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Languages } from "lucide-react"
import RichTextEditor from "@/features/admin/components/ui/rich-text-editor"
import { AVAILABLE_LANGUAGES, TranslatedString } from "../../types"

interface TranslationModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    type: "category" | "question"
    field: "name" | "question" | "answer"
    id: string
    translationForms: TranslatedString
    setTranslationForms: (forms: TranslatedString) => void
    handleFileUpload: (file: File) => Promise<{ url: string; name: string } | null>
    // Helper to find existing attachments if needed. 
    // For simplicity, we can pass a map or function to check attachments status from parent if needed, 
    // OR we can make the parent flatten the data before passing.
    // The original code used `findQuestionById(translationModal.id)`. 
    // To avoid prop drilling `findQuestionById`, let's pass a `getAttachment` prop.
    getAttachment: (langCode: string) => { url: string; name: string } | null
}

export function TranslationModal({
    isOpen,
    onClose,
    onSave,
    type,
    field,
    id,
    translationForms,
    setTranslationForms,
    handleFileUpload,
    getAttachment
}: TranslationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-border/40 shadow-2xl rounded-2xl">
                <DialogHeader className="px-6 py-5 border-b bg-muted/20">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-black">
                        <Languages className="w-5 h-5 text-primary" />
                        Tərcümələri idarə et
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                        const value = translationForms[lang.code] || ""
                        const isMissing = !value.trim()

                        const attachmentNameKey = `${lang.code}_attachmentName`
                        const existingAttachment = getAttachment(lang.code)
                        const currentAttachmentName = translationForms[attachmentNameKey] || existingAttachment?.name

                        return (
                            <div key={lang.code} className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl shadow-sm rounded-md leading-none">{lang.flag}</span>
                                        <span className="font-bold text-foreground">{lang.name}</span>
                                    </div>
                                    {isMissing && (
                                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0">
                                            Yoxdur
                                        </Badge>
                                    )}
                                </div>
                                {field === "answer" ? (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-border/60 overflow-hidden focus-within:border-primary/50 transition-colors shadow-sm">
                                            <RichTextEditor
                                                value={value}
                                                onChange={(val) => setTranslationForms({ ...translationForms, [lang.code]: val })}
                                                placeholder={`${lang.name} dilində tərcüməni daxil edin...`}
                                                onFileSelect={async (file) => {
                                                    if (!file) return
                                                    const result = await handleFileUpload(file)
                                                    if (result) {
                                                        setTranslationForms({
                                                            ...translationForms,
                                                            [`${lang.code}_attachmentUrl`]: result.url,
                                                            [`${lang.code}_attachmentName`]: result.name
                                                        })
                                                    }
                                                }}
                                            />
                                        </div>
                                        {/* Show if file exists */}
                                        {currentAttachmentName && (
                                            <div className="text-[11px] text-blue-600 flex items-center justify-between bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
                                                <span className="flex items-center gap-2 font-bold">
                                                    📎 {currentAttachmentName}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                                                    onClick={() => {
                                                        setTranslationForms({
                                                            ...translationForms,
                                                            [`${lang.code}_attachmentUrl`]: "", // Mark for deletion
                                                            [`${lang.code}_attachmentName`]: ""
                                                        })
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        placeholder={`${lang.name} dilində tərcüməni daxil edin...`}
                                        value={value}
                                        onChange={(e) => setTranslationForms({ ...translationForms, [lang.code]: e.target.value })}
                                        className="h-10 text-sm font-medium border-border/60 focus-visible:ring-primary/20 bg-card rounded-lg"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-end gap-3 p-5 border-t bg-muted/10">
                    <Button variant="ghost" onClick={onClose} className="font-semibold text-xs h-9">
                        Ləğv et
                    </Button>
                    <Button onClick={onSave} className="font-bold text-xs h-9 px-6 shadow-md shadow-primary/20">
                        Bütün tərcümələri yadda saxla
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
