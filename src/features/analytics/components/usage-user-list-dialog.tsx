"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, User } from "lucide-react"
import { format } from "date-fns"

interface UsageUserListDialogProps {
    isOpen: boolean
    onClose: () => void
    date: string | null
    type: 'active' | 'new' | 'sessions'
    language: string
    onSelectUser: (userId: string) => void
}

export function UsageUserListDialog({
    isOpen,
    onClose,
    date,
    type,
    language,
    onSelectUser
}: UsageUserListDialogProps) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isOpen || !date) return

        const fetchUsers = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/stats/usage-users?date=${date}&type=${type}&language=${language}`)
                if (res.ok) {
                    const data = await res.json()
                    setUsers(data)
                }
            } catch (error) {
                console.error("Failed to fetch usage users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [isOpen, date, type, language])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] w-[90vw] sm:max-w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-primary/20">
                <DialogHeader className="p-6 pb-2 border-b bg-muted/5">
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-xl">
                                {viewTitle(type)} - {date}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Total of <span className="text-foreground font-bold">{users.length}</span> users tracked during this period.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 pt-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                                <p className="text-sm text-muted-foreground animate-pulse">Loading user data...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-24 bg-muted/5 rounded-xl border-2 border-dashed border-muted">
                                <User className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                                <h3 className="text-lg font-medium text-foreground">No data recorded</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-1 text-sm">
                                    No user interactions were captured for the selected date and filters.
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-xl shadow-sm overflow-x-auto custom-scrollbar">
                                <Table className="min-w-[1000px]">
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[280px]">User Profile</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Telegram ID</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead className="text-center">Active Sessions</TableHead>
                                            <TableHead>Joined Date</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-muted/20 transition-colors group">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">
                                                            {(user.firstName?.[0] || user.username?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-semibold text-foreground text-sm truncate max-w-[180px]">
                                                                {user.firstName} {user.lastName}
                                                            </span>
                                                            <div className="flex gap-1 items-center">
                                                                <Badge variant="secondary" className="text-[9px] uppercase font-bold px-1.5 h-4 bg-primary/5 text-primary border-primary/10">
                                                                    {user.language || '??'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {user.username ? (
                                                        <span className="text-blue-600 dark:text-blue-400 font-medium">@{user.username}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic text-xs">No username</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="bg-muted/50 px-2 py-0.5 rounded text-[11px] font-mono text-muted-foreground border">
                                                        {user.telegramId}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-medium">
                                                        {user.region || <span className="text-muted-foreground/50">-</span>}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={`font-mono text-sm ${user.sessionCount > 0 ? 'bg-emerald-500/5 text-emerald-600 border-emerald-200' : 'bg-muted text-muted-foreground'}`}>
                                                        {user.sessionCount || 0}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-xs">
                                                        <span className="font-medium">{format(new Date(user.createdAt), "MMM d, yyyy")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <button
                                                        onClick={() => onSelectUser(user.id)}
                                                        className="h-8 px-4 rounded-md bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 transition-all text-xs font-bold"
                                                    >
                                                        Details
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

function viewTitle(type: string) {
    if (type === 'active') return 'Active Users'
    if (type === 'sessions') return 'User Participation'
    return 'Newly Registered Users'
}
