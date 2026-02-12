"use client"

import { useEffect, useState } from "react"
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X, Search } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { az } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "use-debounce"
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"

interface User {
    id: string
    telegramId: string
    firstName: string | null
    lastName: string | null
    username: string | null
    language: string
    region: string
    createdAt: string
    sessionCount: number
    lastOnline: string
}

interface UserListTableProps {
    regionFilter?: string | null
    onClearFilter?: () => void
    onSelectUser?: (userId: string) => void
    className?: string
}

type SortField = 'name' | 'telegramId' | 'language' | 'region' | 'lastOnline' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export function UserListTable({ regionFilter, onClearFilter, onSelectUser, className }: UserListTableProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch] = useDebounce(searchQuery, 500)
    const [sort, setSort] = useState<{ field: SortField, order: SortOrder }>({
        field: 'lastOnline',
        order: 'desc'
    })

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams()
            if (regionFilter) params.set('region', regionFilter)
            if (debouncedSearch) params.set('search', debouncedSearch)
            params.set('sortBy', sort.field)
            params.set('order', sort.order)

            const url = `/api/admin/users?${params.toString()}`

            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to fetch users')
            const data = await res.json()
            setUsers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchUsers()

        const interval = setInterval(fetchUsers, 30000)
        return () => clearInterval(interval)
    }, [regionFilter, debouncedSearch, sort])

    const toggleSort = (field: SortField) => {
        if (sort.field === field) {
            setSort({ field, order: sort.order === 'asc' ? 'desc' : 'asc' })
        } else {
            setSort({ field, order: 'desc' })
        }
    }

    const SortHeader = ({ field, children, className = "" }: { field: SortField, children: React.ReactNode, className?: string }) => {
        const isActive = sort.field === field
        return (
            <TableHead
                className={`bg-card cursor-pointer hover:text-foreground transition-colors group ${className}`}
                onClick={() => toggleSort(field)}
            >
                <div className="flex items-center gap-1">
                    {children}
                    {isActive ? (
                        sort.order === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                    ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                </div>
            </TableHead>
        )
    }

    return (
        <Card className={`transition-all duration-300 ease-in-out ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>
                        {regionFilter
                            ? `${regionFilter} üzrə İstifadəçilər (${users.length})`
                            : `İstifadəçilər (${users.length})`
                        }
                    </CardTitle>
                    {regionFilter && (
                        <p className="text-sm text-muted-foreground">
                            region üzrə süzgəclənib
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="İstifadəçi axtar..."
                            className="w-[200px] lg:w-[300px] pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {regionFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilter}
                            className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Təmizlə
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading && users.length === 0 ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar relative border rounded-md">
                        <table className="w-full caption-bottom text-sm text-left">
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent border-b">
                                    <SortHeader field="name">İstifadəçi</SortHeader>
                                    <SortHeader field="telegramId">Telegram ID</SortHeader>
                                    <SortHeader field="region">Region</SortHeader>
                                    <SortHeader field="language">Dil</SortHeader>
                                    <SortHeader field="lastOnline">Son Görülmə</SortHeader>
                                    <SortHeader field="createdAt">Qoşuldu</SortHeader>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            İstifadəçi tapılmadı.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => onSelectUser?.(user.id)}
                                        >
                                            <TableCell className="font-medium p-3">
                                                <div className="flex flex-col">
                                                    <span>{user.firstName} {user.lastName}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        @{user.username || 'istifadəçi_adı_yoxdur'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">{user.telegramId}</TableCell>
                                            <TableCell>{user.region || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase">
                                                    {user.language || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {formatDistanceToNow(new Date(user.lastOnline), { addSuffix: true, locale: az })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground opacity-70">
                                                        {format(new Date(user.lastOnline), "d MMM, HH:mm", { locale: az })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(user.createdAt), "d MMM, yyyy", { locale: az })}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card >
    )
}
