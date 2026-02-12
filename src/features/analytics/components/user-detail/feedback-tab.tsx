import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AnalyticsEvent } from "@/types/analytics"
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedbackTabProps {
    feedback: AnalyticsEvent[] | undefined
}

type FeedbackFilter = 'all' | 'helpful' | 'not_helpful'

export function FeedbackTab({ feedback }: FeedbackTabProps) {
    const [filter, setFilter] = useState<FeedbackFilter>('all')

    const helpfulCount = feedback?.filter(f => f.eventType === 'feedback_yes').length || 0
    const notHelpfulCount = feedback?.filter(f => f.eventType === 'feedback_no').length || 0

    const displayedFeedback = feedback?.filter(item => {
        if (filter === 'helpful') return item.eventType === 'feedback_yes'
        if (filter === 'not_helpful') return item.eventType === 'feedback_no'
        return true
    })

    const toggleFilter = (type: FeedbackFilter) => {
        setFilter(prev => prev === type ? 'all' : type)
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
                {/* Summary Stats & Filter Controls */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <Card
                            className={`p-4 transition-all cursor-pointer hover:shadow-md border-2 ${filter === 'helpful' ? 'bg-green-500/10 border-green-500 scale-[1.02]' : 'bg-green-500/5 border-green-500/20 opacity-70 hover:opacity-100'
                                }`}
                            onClick={() => toggleFilter('helpful')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/10 rounded-lg">
                                    <ThumbsUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Faydalı</p>
                                    <p className="text-2xl font-bold text-green-700">{helpfulCount}</p>
                                </div>
                            </div>
                        </Card>
                        <Card
                            className={`p-4 transition-all cursor-pointer hover:shadow-md border-2 ${filter === 'not_helpful' ? 'bg-red-500/10 border-red-500 scale-[1.02]' : 'bg-red-500/5 border-red-500/20 opacity-70 hover:opacity-100'
                                }`}
                            onClick={() => toggleFilter('not_helpful')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <ThumbsDown className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Faydasız</p>
                                    <p className="text-2xl font-bold text-red-700">{notHelpfulCount}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {filter !== 'all' && (
                        <div className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-1">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                {filter === 'helpful' ? <ThumbsUp className="w-3 h-3 text-green-600" /> : <ThumbsDown className="w-3 h-3 text-red-600" />}
                                {filter === 'helpful' ? 'Faydalı' : 'Faydasız'} filtiri aktivdir
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 gap-1 px-2 text-[10px] hover:bg-muted"
                                onClick={() => setFilter('all')}
                            >
                                <X className="w-3 h-3" />
                                Filtiri təmizlə
                            </Button>
                        </div>
                    )}
                </div>

                {/* List */}
                <div className="grid gap-4 grid-cols-1">
                    {displayedFeedback?.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-l-4 transition-all hover:shadow-md cursor-default" style={{ borderLeftColor: item.eventType === 'feedback_yes' ? '#22c55e' : '#ef4444' }}>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <Badge variant={item.eventType === 'feedback_yes' ? 'default' : 'destructive'} className={item.eventType === 'feedback_yes' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                        {item.eventType === 'feedback_yes' ? 'Helpful' : 'Not Helpful'}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                        {format(new Date(item.createdAt), "dd.MM.yyyy HH:mm")}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Sual:</p>
                                        <p className="text-sm font-medium leading-relaxed italic">
                                            "{item.metadata?.questionText || "Naməlum sual"}"
                                        </p>
                                    </div>

                                    {item.metadata?.answerText && (
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Verilən Cavab:</p>
                                            <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50 max-h-32 overflow-y-auto leading-relaxed">
                                                {item.metadata.answerText}
                                            </div>
                                        </div>
                                    )}

                                    {!item.metadata?.answerText && (
                                        <p className="text-[9px] text-muted-foreground/60 italic">
                                            * Bu rəy üçün cavab mətni qeyd olunmayıb (köhnə məlumat).
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {(!displayedFeedback || displayedFeedback.length === 0) && (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
                            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm font-medium">Bu kateqoriya üzrə rəy tapılmadı</p>
                        </div>
                    )}
                </div>
            </div>
        </ScrollArea>
    )
}
