import { ChevronLeft, ChevronRight, Globe, User as UserIcon, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Breadcrumb, AVAILABLE_LANGUAGES, Category, Question, User } from "../../types"
import { QuestionSearch } from "./question-search"

interface FlowHeaderProps {
    breadcrumbs: Breadcrumb[]
    navigateToBreadcrumb: (index: number) => void
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    user: User
    questions: Question[]
    categories: Category[]
    currentLang: string
    onSelectSearch: (question: Question, categoryId: string, path: Breadcrumb[]) => void
}

/**
 * Header component for the Flow Builder.
 * Displays breadcrumbs navigation and user profile/settings actions.
 * 
 * @param {FlowHeaderProps} props
 */
{/* ... existing imports */ }

export function FlowHeader({
    breadcrumbs,
    navigateToBreadcrumb,
    currentLangInfo,
    user,
    questions,
    categories,
    currentLang,
    onSelectSearch
}: FlowHeaderProps) {
    if (breadcrumbs.length === 0) {
        return (
            <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
                <div className="text-muted-foreground text-sm font-medium">Başlamaq üçün kateqoriya seçin</div>
                <div className="flex items-center gap-2">
                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/40 p-0 shrink-0 overflow-hidden hover:bg-muted/50 transition-all">
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {user?.email?.charAt(0).toUpperCase() || "A"}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {user?.role === 'admin' ? 'Administrator' : user?.role || 'İstifadəçi'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user?.role === 'admin' && (
                                <DropdownMenuItem asChild>
                                    <Link href="/miniapp/admin/users" className="cursor-pointer w-full flex items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Tənzimləmələr</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' })
                                    window.location.href = '/login'
                                } catch (error) {
                                    console.error('Sistemden çıxış zamanı xəta:', error)
                                }
                            }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Çıxış</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        )
    }

    return (
        <div className="border-b border-border bg-card px-6 py-4">
            <div className="flex items-center gap-2 flex-wrap">
                {breadcrumbs.length > 1 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateToBreadcrumb(breadcrumbs.length - 2)}
                                    className="gap-1.5 h-8 rounded-lg border-border/60 hover:bg-muted transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Geri</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{breadcrumbs[breadcrumbs.length - 2]?.label || "əvvəlki səviyyə"}-ə qayıt</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <div className="flex items-center gap-1 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/60" />}
                            <button
                                onClick={() => navigateToBreadcrumb(index)}
                                className={`px-2.5 py-1.5 rounded-lg hover:bg-muted transition-all text-sm ${index === breadcrumbs.length - 1
                                    ? "font-semibold text-foreground bg-muted/30 shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {crumb.label}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help shrink-0 py-1.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                                    <Globe className="w-4 h-4" />
                                    <span className="hidden md:inline">Redaktə dili:</span>
                                    <span className="font-semibold text-foreground">
                                        {currentLangInfo.flag} {currentLangInfo.name}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-medium">Məlumatlar {currentLangInfo.name} dilindədir</p>
                                <p className="text-xs text-muted-foreground">Dili yan paneldəki bölmədən dəyişə bilərsiniz</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <div className="hidden lg:flex flex-1 max-w-sm ml-4">
                        <QuestionSearch
                            questions={questions}
                            categories={categories}
                            currentLang={currentLang}
                            onSelect={onSelectSearch}
                        />
                    </div>

                    <div className="h-6 w-px bg-border/60 mx-1 shrink-0" />

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/40 p-0 shrink-0 overflow-hidden hover:bg-muted/50 transition-all active:scale-95 shadow-sm">
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {user?.email?.charAt(0).toUpperCase() || "A"}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {user?.role === 'admin' ? 'Administrator' : user?.role || 'İstifadəçi'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user?.role === 'admin' && (
                                <DropdownMenuItem asChild>
                                    <Link href="/miniapp/admin/users" className="cursor-pointer w-full flex items-center">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Tənzimləmələr</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' })
                                    window.location.href = '/login'
                                } catch (error) {
                                    console.error('Logout failed:', error)
                                }
                            }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Çıxış</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
