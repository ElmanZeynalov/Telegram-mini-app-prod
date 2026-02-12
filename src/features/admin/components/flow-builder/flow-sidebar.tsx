import { useState } from "react"
import {
    FolderTree,
    Languages,
    ChevronDown,
    Check,
    AlertCircle,
    Search,
    Plus,
    X,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Pencil,
    Trash2,
    BarChart2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip"
import { AVAILABLE_LANGUAGES, Category, TranslatedString } from "../../types"
import { t } from "../../utils"
import { TranslationBadge } from "../ui/translation-badge"

interface FlowSidebarProps {
    categories: Category[]
    selectedCategory: string | null
    currentLang: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    missingTranslationsCount: number
    onSetCurrentLang: (code: string) => void
    onSelectCategory: (id: string) => void
    onAddCategory: (name: string) => void
    onUpdateCategory: (id: string, name: string) => void
    onDeleteCategory: (id: string, name: string) => void
    onReorderCategory: (id: string, direction: "up" | "down") => void
    onOpenTranslationModal: (type: "category" | "question", id: string, field: "name" | "question" | "answer") => void
    onReorderManual: (id: string) => void

    // Drag and drop props
    draggedCategoryId: string | null
    dragOverCategoryId: string | null
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragOver: (e: React.DragEvent, id: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
}

/**
 * Sidebar component for the Flow Builder.
 * Manages category list, search, creation, and language selection.
 * Support drag-and-drop reordering of categories.
 * 
 * @param {FlowSidebarProps} props
 */
{/* ... existing imports */ }

export function FlowSidebar({
    categories,
    selectedCategory,
    currentLang,
    currentLangInfo,
    missingTranslationsCount,
    onSetCurrentLang,
    onSelectCategory,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onReorderCategory,
    onOpenTranslationModal,
    onReorderManual,
    draggedCategoryId,
    dragOverCategoryId,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd
}: FlowSidebarProps) {
    const [categorySearch, setCategorySearch] = useState("")
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editingCategoryName, setEditingCategoryName] = useState("")

    const filteredCategories = categories.filter((cat) =>
        t(cat.name, currentLang).toLowerCase().includes(categorySearch.toLowerCase())
    )

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName)
            setNewCategoryName("")
            setShowAddCategoryModal(false)
        }
    }

    const handleUpdateCategory = (id: string) => {
        if (editingCategoryName.trim()) {
            onUpdateCategory(id, editingCategoryName)
            setEditingCategoryId(null)
            setEditingCategoryName("")
        }
    }

    return (
        <div className="w-80 border-r border-border bg-card flex flex-col h-full">
            <div className="p-4 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-primary" />
                        Flow Builder
                    </h1>
                    <Link href="/stats">
                        <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 h-8 text-[11px] font-bold px-3">
                            <BarChart2 className="w-3.5 h-3.5" />
                            Analitika
                        </Button>
                    </Link>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2.5 w-full justify-start bg-card border-border/40 hover:bg-muted/50 transition-all h-9 rounded-lg shadow-sm">
                                                <Languages className="w-4 h-4 text-primary" />
                                                <span className="flex-1 text-left text-xs font-semibold">
                                                    {currentLangInfo.flag} {currentLangInfo.name}
                                                </span>
                                                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-52 rounded-xl shadow-xl border-border/40">
                                            {AVAILABLE_LANGUAGES.map((lang) => (
                                                <DropdownMenuItem
                                                    key={lang.code}
                                                    onClick={() => onSetCurrentLang(lang.code)}
                                                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg mx-1 my-0.5"
                                                >
                                                    <span className="text-sm">{lang.flag}</span>
                                                    <span className="text-sm font-medium">{lang.name}</span>
                                                    {currentLang === lang.code && <Check className="w-4 h-4 ml-auto text-primary" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-bold">Məlumatın redaktə dili</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Müxtəlif dillərdəki məlumatlara baxmaq və redaktə etmək üçün dəyişin
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {missingTranslationsCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 cursor-help h-9 px-2.5 font-bold animate-pulse">
                                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                        {missingTranslationsCount}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs p-3">
                                    <p className="font-bold text-amber-600 flex items-center gap-2 mb-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {missingTranslationsCount} tərcümə çatmır
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Bəzi kateqoriyalar, suallar və ya cavabların bu dildə tərcüməsi yoxdur.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4 border-b border-border">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Kateqoriyalarda axtar..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="pl-9 bg-muted/30 border-border/40 text-foreground text-xs h-9 rounded-lg focus-visible:ring-offset-0 focus-visible:ring-1 transition-all"
                    />
                </div>

                <Button onClick={() => setShowAddCategoryModal(true)} className="w-full font-bold h-9 shadow-md shadow-primary/10 rounded-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni kateqoriya
                </Button>
            </div>

            {showAddCategoryModal && (
                <div className="p-4 border-b border-border bg-primary/[0.03] animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black uppercase tracking-widest text-primary/70">Yeni kateqoriya</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full hover:bg-muted/80"
                            onClick={() => {
                                setShowAddCategoryModal(false)
                                setNewCategoryName("")
                            }}
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <Input
                            placeholder={`Adı (${currentLangInfo.name})`}
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                            className="bg-card border-border/60 text-foreground text-sm h-9 rounded-lg"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="flex-1 font-bold h-8 text-xs" size="sm">
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                Yarat
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-semibold h-8 text-xs"
                                onClick={() => {
                                    setShowAddCategoryModal(false)
                                    setNewCategoryName("")
                                }}
                            >
                                Ləğv et
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-12 px-4 text-muted-foreground animate-in fade-in duration-500">
                        {categorySearch ? (
                            <div className="space-y-3">
                                <div className="p-4 inline-flex rounded-full bg-muted/50">
                                    <Search className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-xs font-medium leading-relaxed">"{categorySearch}" mətni ilə uyğunlaşan kateqoriya tapılmadı</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 inline-flex rounded-full bg-muted/50">
                                    <FolderTree className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-xs font-bold text-foreground/70">Hələlik kateqoriya yoxdur</p>
                                <p className="text-[10px] opacity-70 leading-relaxed font-medium">Başlamaq üçün "Yeni kateqoriya" düyməsinə klikləyin</p>
                            </div>
                        )}
                    </div>
                ) : (
                    filteredCategories.map((category, index) => {
                        const isSelected = selectedCategory === category.id
                        const isDragOver = dragOverCategoryId === category.id
                        const isDragging = draggedCategoryId === category.id

                        return (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, category.id)}
                                onDragOver={(e) => onDragOver(e, category.id)}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, category.id)}
                                onDragEnd={onDragEnd}
                                className={`transition-all duration-200 rounded-xl overflow-hidden ${isDragging ? "opacity-40 scale-95" : ""} ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}
                            >
                                {editingCategoryId === category.id ? (
                                    <div className="flex items-center gap-1.5 p-2 bg-muted/30">
                                        <Input
                                            value={editingCategoryName}
                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(category.id)}
                                            className="h-8 text-xs font-medium rounded-lg"
                                            autoFocus
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-success hover:bg-success/10 rounded-lg transition-colors"
                                            onClick={() => handleUpdateCategory(category.id)}
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            onClick={() => setEditingCategoryId(null)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className={`group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${isSelected
                                            ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                                            : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-1 shrink-0">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted/80 rounded-lg transition-colors drag-handle">
                                                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p className="text-[10px] font-bold">Sıralamaq üçün daşıyın</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0 hover:bg-primary/10 hover:text-primary rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onReorderCategory(category.id, "up")
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp className="w-2.5 h-2.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0 hover:bg-primary/10 hover:text-primary rounded-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onReorderCategory(category.id, "down")
                                                    }}
                                                    disabled={index === filteredCategories.length - 1}
                                                >
                                                    <ArrowDown className="w-2.5 h-2.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0" onClick={() => onSelectCategory(category.id)}>
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className={`truncate text-xs font-bold tracking-tight transition-colors ${isSelected ? "text-primary font-black" : "group-hover:text-foreground"}`}>
                                                                <span className="opacity-50 mr-1.5 font-normal">{index + 1}.</span>
                                                                {t(category.name, currentLang)}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="p-4 rounded-2xl shadow-2xl bg-[#0f172a] border-slate-700/50 min-w-[280px]">
                                                            <div className="space-y-2 py-0.5">
                                                                <p className="text-[10px] font-black uppercase tracking-widest border-b border-border/10 pb-2 mb-2 text-white/90">Audit məlumatları</p>
                                                                <div className="space-y-2">
                                                                    <p className="text-[11px] flex items-center gap-3">
                                                                        <span className="text-white/50 w-20 font-medium">Yaradılıb:</span>
                                                                        <span className="text-sky-400 font-bold truncate flex-1">
                                                                            {category.createdBy || "Sistem"}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-[11px] flex items-center gap-3">
                                                                        <span className="text-white/50 w-20 font-medium">Tarix:</span>
                                                                        <span className="text-white/90 font-medium tabular-nums">
                                                                            {category.createdAt ? new Date(category.createdAt).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Məlum deyil"}
                                                                        </span>
                                                                    </p>

                                                                    {(category.updatedBy || (category.updatedAt && category.updatedAt !== category.createdAt)) && (
                                                                        <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
                                                                            <p className="text-[11px] flex items-center gap-3">
                                                                                <span className="text-white/50 w-20 font-medium">Son redaktə:</span>
                                                                                <span className="text-sky-400 font-bold truncate flex-1">
                                                                                    {category.updatedBy || "Sistem"}
                                                                                </span>
                                                                            </p>
                                                                            {category.updatedAt && category.updatedAt !== category.createdAt && (
                                                                                <p className="text-[11px] flex items-center gap-3">
                                                                                    <span className="text-white/50 w-20 font-medium">Yenilənmə:</span>
                                                                                    <span className="text-white/90 font-medium tabular-nums">
                                                                                        {new Date(category.updatedAt).toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                                    </span>
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TranslationBadge
                                                    translations={category.name}
                                                    onClick={() => onOpenTranslationModal("category", category.id, "name")}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingCategoryId(category.id)
                                                    setEditingCategoryName(t(category.name, currentLang))
                                                }}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const categoryName = t(category.name, currentLang)
                                                    onDeleteCategory(category.id, categoryName)
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

        </div>
    )
}
