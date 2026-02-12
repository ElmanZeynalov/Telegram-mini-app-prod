import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, User, Calendar, Clock, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"


interface EmergencyExitUser {
    user: {
        id: string
        firstName: string | null
        lastName: string | null
        username: string | null
        telegramId: string | null
    } | undefined
    count: number
}

interface EmergencyExitEvent {
    id: string
    createdAt: string
    metadata: any
}

interface EmergencyExitListProps {
    users: EmergencyExitUser[] | undefined
    className?: string
}

export function EmergencyExitList({ users, className }: EmergencyExitListProps) {
    const [selectedUser, setSelectedUser] = useState<EmergencyExitUser | null>(null)
    const [events, setEvents] = useState<EmergencyExitEvent[]>([])
    const [loading, setLoading] = useState(false)

    const handleUserClick = async (user: EmergencyExitUser) => {
        if (!user.user) return
        setSelectedUser(user)
        setLoading(true)
        try {
            const res = await fetch(`/api/analytics/emergency-exits/details?userId=${user.user.id}`)
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error("Failed to fetch emergency exit details", error)
        } finally {
            setLoading(false)
        }
    }

    if (!users || users.length === 0) {
        return (
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Təcili Çıxışlar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-4">
                        Təcili çıxış qeydə alınmayıb.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <Card className={className}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Təcili Çıxışlar
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">Top {users.length}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {users.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                                onClick={() => handleUserClick(item)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <User className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {item.user ? (
                                                <>
                                                    {item.user.firstName} {item.user.lastName}
                                                </>
                                            ) : 'Anonymous'}
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-1 flex flex-col gap-0.5">
                                            {item.user?.username && (
                                                <span className="text-blue-500 font-medium">@{item.user.username}</span>
                                            )}
                                            <span className="font-mono opacity-70">
                                                ID: {item.user?.telegramId || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold bg-secondary px-2 py-1 rounded-md">
                                    {item.count}x
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Emergency Exits for {selectedUser?.user?.firstName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No specific records found.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {events.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {format(new Date(event.createdAt), "MMM d, yyyy")}
                                                </p>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(event.createdAt), "HH:mm:ss")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
