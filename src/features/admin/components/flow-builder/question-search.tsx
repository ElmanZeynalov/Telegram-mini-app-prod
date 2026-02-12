"use client"

import { useState, useMemo } from "react"
import { Search, ChevronRight, FileText, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Question, Category, Breadcrumb } from "../../types"
import { t } from "../../utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface QuestionSearchProps {
    questions: Question[]
    categories: Category[]
    currentLang: string
    onSelect: (question: Question, categoryId: string, path: Breadcrumb[]) => void
}

interface SearchResult {
    question: Question
    path: Breadcrumb[]
    categoryId: string
    matchType: 'question' | 'answer'
}

export function QuestionSearch({ questions, categories, currentLang, onSelect }: QuestionSearchProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")

    const results = useMemo(() => {
        if (query.length < 2) return []

        const searchResults: SearchResult[] = []
        const lowercaseQuery = query.toLowerCase()

        const searchRecursive = (qs: Question[], currentPath: Breadcrumb[], categoryId: string) => {
            qs.forEach(q => {
                const questionText = t(q.question, currentLang).toLowerCase()
                const answerText = t(q.answer || {}, currentLang).toLowerCase()

                const questionMatch = questionText.includes(lowercaseQuery)
                const answerMatch = answerText.includes(lowercaseQuery)

                const newPath: Breadcrumb[] = [
                    ...currentPath,
                    { id: q.id, label: t(q.question, currentLang), type: "question" }
                ]

                if (questionMatch || answerMatch) {
                    searchResults.push({
                        question: q,
                        path: newPath,
                        categoryId,
                        matchType: questionMatch ? 'question' : 'answer'
                    })
                }

                if (q.subQuestions && q.subQuestions.length > 0) {
                    searchRecursive(q.subQuestions, newPath, categoryId)
                }
            })
        }

        // Iterate through categories to contextually search
        categories.forEach(cat => {
            const catPath: Breadcrumb[] = [{ id: cat.id, label: t(cat.name, currentLang), type: "category" }]
            const catQuestions = questions.filter(q => q.categoryId === cat.id)
            searchRecursive(catQuestions, catPath, cat.id)
        })

        return searchResults
    }, [questions, categories, query, currentLang])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Sual və ya cavablarda axtar..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            if (e.target.value.length >= 2 && !open) setOpen(true)
                        }}
                        onFocus={() => {
                            if (query.length >= 2) setOpen(true)
                        }}
                        className="pl-9 pr-9 h-9 bg-muted/30 border-border/40 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                        autoComplete="off"
                    />
                    {query && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setQuery("")
                                setOpen(false)
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-[500px] p-0 shadow-2xl border-border/40 rounded-xl overflow-hidden focus:outline-none"
                align="start"
                sideOffset={8}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <div className="bg-muted/30 px-3 py-2 border-b border-border/40 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                        {query.length < 2 ? "Axtarış üçün ən azı 2 hərf daxil edin" : `${results.length} nəticə tapıldı`}
                    </span>
                </div>
                <ScrollArea className="h-[400px]">
                    {results.length > 0 ? (
                        <div className="p-2 space-y-1">
                            {results.map((res) => (
                                <button
                                    key={`${res.question.id}-${res.matchType}`}
                                    onClick={() => {
                                        onSelect(res.question, res.categoryId, res.path)
                                        setOpen(false)
                                        setQuery("")
                                    }}
                                    className="w-full text-left p-3 rounded-lg hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 bg-primary/10 p-1.5 rounded-md group-hover:bg-primary/20 transition-colors">
                                            {res.matchType === 'question' ? (
                                                <Search className="w-3.5 h-3.5 text-primary" />
                                            ) : (
                                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-foreground mb-1 line-clamp-2">
                                                {t(res.question.question, currentLang)}
                                            </div>

                                            {res.matchType === 'answer' && (
                                                <div className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded border border-border/20 mb-2 line-clamp-2 italic">
                                                    <span className="font-bold text-[9px] uppercase tracking-tighter opacity-70 block mb-0.5">Cavabda tapılıb:</span>
                                                    {t(res.question.answer || {}, currentLang).replace(/<[^>]*>/g, '')}
                                                </div>
                                            )}

                                            <div className="flex items-center flex-wrap gap-1 mt-1">
                                                {res.path.map((item, idx) => (
                                                    <div key={item.id} className="flex items-center gap-1">
                                                        {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/40" />}
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${idx === 0 ? "bg-blue-500/10 text-blue-600 font-bold" : "bg-muted text-muted-foreground"
                                                            }`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        query.length >= 2 && (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="bg-muted/50 p-4 rounded-full mb-3">
                                    <Search className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm font-bold text-foreground/70">Nəticə tapılmadı</p>
                                <p className="text-xs text-muted-foreground mt-1 text-balance">
                                    "{query}" mətni ilə uyğunlaşan sual və ya cavab yoxdur.
                                </p>
                            </div>
                        )
                    )}
                </ScrollArea>
                {results.length > 5 && (
                    <div className="p-2 border-t border-border/40 bg-muted/10 text-center">
                        <p className="text-[9px] text-muted-foreground font-medium">Siyahını tam görmək üçün aşağı sürüşdürün</p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
