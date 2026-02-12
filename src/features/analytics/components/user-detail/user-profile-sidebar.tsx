import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Globe, X } from "lucide-react"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { az } from "date-fns/locale"

// ... imports

export function UserProfileSidebar({ loading, data, onClose }: UserProfileSidebarProps) {
    const { user } = data || {}

    return (
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-muted/10 p-6 flex flex-col gap-6 shrink-0 relative">
            <DialogHeader className="p-0 flex flex-row items-center justify-between">
                <DialogTitle className="text-xl">İstifadəçi Profili</DialogTitle>
            </DialogHeader>

            <div className="absolute top-4 right-4 md:hidden">
                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : !data || !user ? (
                <div className="text-center text-muted-foreground">İstifadəçi tapılmadı</div>
            ) : (
                <>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary ring-4 ring-background shadow-sm">
                            {user.firstName?.[0] || user.username?.[0] || "?"}
                        </div>
                        <div className="space-y-1 w-full">
                            <h3 className="font-semibold text-lg truncate" title={`${user.firstName} ${user.lastName}`}>
                                {user.firstName} {user.lastName}
                            </h3>
                            {user.username && (
                                <Badge variant="secondary" className="font-mono text-xs">
                                    @{user.username}
                                </Badge>
                            )}
                            <p className="text-xs text-muted-foreground pt-1 font-mono">ID: {user.telegramId}</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4" /> Dil
                            </div>
                            <div className="font-medium text-right uppercase">{user.language}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Region
                            </div>
                            <div className="font-medium text-right truncate">{user.region || 'Naməlum'}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Qoşuldu
                            </div>
                            <div className="font-medium text-right">{format(new Date(user.createdAt), "d MMM, yyyy", { locale: az })}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Sessiyalar
                            </div>
                            <div className="font-medium text-right">{user._count?.sessions || 0}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
