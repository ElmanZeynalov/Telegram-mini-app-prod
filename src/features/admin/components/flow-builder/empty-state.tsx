import { FolderTree } from "lucide-react"

/**
 * Empty state component shown when no category is selected
 */
export function EmptyState() {
    return (
        <div className="flex items-center justify-center h-full text-muted-foreground animate-in fade-in duration-500">
            <div className="text-center max-w-sm">
                <div className="mb-6 inline-flex p-6 rounded-full bg-muted/50 border border-border/40">
                    <FolderTree className="w-16 h-16 opacity-30" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Kateqoriya seçin</h2>
                <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
                    İdarə etmək üçün sol paneldən kateqoriya seçin və ya yenisini yaradın
                </p>
            </div>
        </div>
    )
}
