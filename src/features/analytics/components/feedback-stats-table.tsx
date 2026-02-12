"use client"

import { useState, useMemo } from "react"
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Loader2, User as UserIcon, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"


interface FeedbackStat {
    question: string
    yes: number
    no: number
    total: number
}

interface FeedbackDetail {
    id: string
    vote: 'yes' | 'no'
    count: number
    user: {
        id: string
        firstName: string | null
        lastName: string | null
        username: string | null
        telegramId: string | null
    }
}

interface FeedbackStatsTableProps {
    data?: FeedbackStat[]
    period?: string
    language?: string
}

type SortConfig = {
    key: keyof FeedbackStat | 'score' | null
    direction: 'asc' | 'desc'
}

export function FeedbackStatsTable({ data = [], period = '7d', language = 'all' }: FeedbackStatsTableProps) {
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
    const [details, setDetails] = useState<FeedbackDetail[]>([])
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'desc' })

    const handleSort = (key: keyof FeedbackStat | 'score') => {
        setSortConfig((current) => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
        }))
    }

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            let aValue: number
            let bValue: number

            if (sortConfig.key === 'score') {
                aValue = a.total > 0 ? (a.yes / a.total) : 0
                bValue = b.total > 0 ? (b.yes / b.total) : 0
            } else if (sortConfig.key === 'question') {
                return sortConfig.direction === 'asc'
                    ? a.question.localeCompare(b.question)
                    : b.question.localeCompare(a.question)
            } else {
                aValue = a[sortConfig.key as keyof FeedbackStat] as number
                bValue = b[sortConfig.key as keyof FeedbackStat] as number
            }

            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
        })
    }, [data, sortConfig])

    const handleRowClick = async (question: string) => {
        if (selectedQuestion === question) {
            setSelectedQuestion(null)
            setDetails([])
            return
        }

        setSelectedQuestion(question)
        setLoadingDetails(true)
        try {
            const queryParams = new URLSearchParams({
                question,
                period,
                language
            })
            const res = await fetch(`/api/analytics/feedback-details?${queryParams.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setDetails(data)
            }
        } catch (error) {
            console.error("Failed to fetch details", error)
        } finally {
            setLoadingDetails(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 col-span-4 lg:col-span-7">
            {/* Main Table */}
            <Card className={`transition-all duration-300 ease-in-out ${selectedQuestion ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                <CardHeader>
                    <CardTitle>Rəy Statistikası (Ən Çox Soruşulan)</CardTitle>
                    <CardDescription>Detallara baxmaq üçün sətrə klikləyin</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar relative">
                        <table className="w-full caption-bottom text-sm text-left">
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead
                                        className="bg-card w-[40%] cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('question')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Sual
                                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="bg-card text-center cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('yes')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ThumbsUp className="w-4 h-4 text-primary" />
                                            Faydalı
                                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="bg-card text-center cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('no')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                                            Faydasız
                                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="bg-card text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('total')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Cəmi
                                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="bg-card text-right cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('score')}
                                    >
                                        <div className="flex items-center justify-end gap-1">
                                            Xal
                                            <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Hələ ki rəy məlumatı yoxdur.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedData.map((item, index) => {
                                        const satisfaction = item.total > 0 ? Math.round((item.yes / item.total) * 100) : 0
                                        const isSelected = selectedQuestion === item.question
                                        return (
                                            <TableRow
                                                key={index}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                                                onClick={() => handleRowClick(item.question)}
                                            >
                                                <TableCell className="font-medium truncate max-w-[200px]" title={item.question}>
                                                    {item.question}
                                                </TableCell>
                                                <TableCell className="text-center text-primary font-medium">
                                                    {item.yes}
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground">
                                                    {item.no}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.total}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={`font-bold ${satisfaction >= 80 ? 'text-green-500' : satisfaction >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {satisfaction}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Details Panel */}
            {selectedQuestion && (
                <Card className="lg:col-span-1 animate-in slide-in-from-right-10 duration-300 h-fit max-h-[500px] flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg truncate" title={selectedQuestion}>
                            Rəy Detalları
                        </CardTitle>
                        <CardDescription className="truncate">
                            {selectedQuestion}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                        {loadingDetails ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : details.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground">
                                Detal tapılmadı.
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[400px]">
                                {details.map((detail) => (
                                    <div key={detail.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/20">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
                                                <UserIcon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {detail.user.firstName ? `${detail.user.firstName} ${detail.user.lastName || ''}` : 'Naməlum İstifadəçi'}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {detail.user.username && `@${detail.user.username}`}
                                                    {detail.user.username && <span className="mx-1">•</span>}
                                                    ID: {detail.user.telegramId || 'ID Yoxdur'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {detail.vote === 'yes' ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                        <ThumbsUp className="w-3 h-3" /> Hə
                                                    </span>
                                                    {detail.count > 1 && (
                                                        <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full shadow-sm">
                                                            x{detail.count}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                                        <ThumbsDown className="w-3 h-3" /> Yox
                                                    </span>
                                                    {detail.count > 1 && (
                                                        <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full shadow-sm">
                                                            x{detail.count}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
