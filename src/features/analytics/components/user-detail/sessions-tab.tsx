import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { az } from "date-fns/locale"

// ... imports

export function SessionsTab({ sessions, onSelectSession }: SessionsTabProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-3">
                {sessions?.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSelectSession?.(session.id)}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] group-hover:scale-125 transition-transform" />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm group-hover:text-primary transition-colors">Sessiya Başladı</span>
                                <span className="text-xs text-muted-foreground font-mono">Ref: {session.id.slice(0, 8)}</span>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground font-mono">
                            {format(new Date(session.startTime), "PP p", { locale: az })}
                        </div>
                    </div>
                ))}
                {(!sessions || sessions.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <Clock className="h-8 w-8 mb-2 opacity-20" />
                        <p>Sessiya tapılmadı</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
