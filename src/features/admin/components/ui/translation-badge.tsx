import { Globe, AlertCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { TranslatedString } from "../../types"
import { getTranslationStatus } from "../../utils"

interface TranslationBadgeProps {
    translations: TranslatedString | undefined
    onClick?: () => void
}

export function TranslationBadge({ translations, onClick }: TranslationBadgeProps) {
    const status = getTranslationStatus(translations)
    const isComplete = status.complete === status.total

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={onClick}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${isComplete
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                        }`}
                >
                    <Globe className="w-3 h-3" />
                    {status.complete}/{status.total}
                    {!isComplete && <AlertCircle className="w-3 h-3" />}
                </button>
            </TooltipTrigger>
            <TooltipContent side="top">
                <p className="font-medium">
                    {isComplete ? "All translations complete" : `${status.missing.length} translation(s) missing`}
                </p>
                <p className="text-xs text-muted-foreground">Click to manage translations for all languages</p>
            </TooltipContent>
        </Tooltip>
    )
}
