import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Plus } from "lucide-react"
import RichTextEditor from "@/features/admin/components/ui/rich-text-editor"
import type { AVAILABLE_LANGUAGES } from "@/features/admin/types"

interface AddQuestionFormProps {
    newQuestionText: string
    setNewQuestionText: (text: string) => void
    onAddQuestion: (text: string, categoryId: string) => void
    selectedCategory: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
}

/**
 * Form component for adding new questions at the root level of a category
 */
export function AddQuestionForm({
    newQuestionText,
    setNewQuestionText,
    onAddQuestion,
    selectedCategory,
    currentLangInfo
}: AddQuestionFormProps) {
    return (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/[0.02] shadow-sm hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Yeni sual əlavə et ({currentLangInfo.flag} {currentLangInfo.name})
                    </label>
                </div>
                <RichTextEditor
                    value={newQuestionText}
                    onChange={setNewQuestionText}
                    placeholder="Yeni sualın mətnini bura daxil edin..."
                    compact
                    rows={2}
                    onSubmit={() => {
                        if (newQuestionText.trim()) {
                            onAddQuestion(newQuestionText, selectedCategory)
                        }
                    }}
                />
                <div className="flex justify-end">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={() => onAddQuestion(newQuestionText, selectedCategory)}
                                    disabled={!newQuestionText.trim()}
                                    className="gap-2 font-bold px-6 shadow-md shadow-primary/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Sual əlavə et
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Sual yaradır - cavab və ya alt sualları sonra əlavə edə bilərsiniz</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    )
}
