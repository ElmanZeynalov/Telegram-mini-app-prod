import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Users } from "lucide-react"
import { SafetyStat } from "../types"


interface KPIGridProps {
    safety: SafetyStat
    totalRegions: number
}

export function KPIGrid({ safety, totalRegions }: KPIGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cəmi İstifadəçilər</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safety.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">İzlənilən unikal istifadəçilər</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cəmi Sessiyalar</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safety.totalSessions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Bütün dövr qarşılıqlı əlaqələr</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Təcili Çıxışlar</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safety.totalEmergencyExits.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">"Təcili Çıxış" sayı</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aktiv Regionlar</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRegions}</div>
                    <p className="text-xs text-muted-foreground">Fərqli dillər/regionlar</p>
                </CardContent>
            </Card>
        </div>
    )
}
