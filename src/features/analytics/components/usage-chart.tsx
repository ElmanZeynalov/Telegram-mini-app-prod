import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { UsageStat } from "../types"
import { UsageUserListDialog } from "./usage-user-list-dialog"

interface UsageChartProps {
    data: UsageStat[]
    language: string
    onSelectUser: (userId: string) => void
}

export function UsageChart({ data, language, onSelectUser }: UsageChartProps) {
    const [view, setView] = useState<'active' | 'new' | 'sessions'>('active')
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handlePointClick = (data: any) => {
        if (data && data.activePayload && data.activePayload[0]) {
            const payload = data.activePayload[0].payload
            setSelectedDate(payload.fullDate)
            setIsDialogOpen(true)
        }
    }

    const getTitle = () => {
        switch (view) {
            case 'active': return "Aktiv İstifadəçilər"
            case 'sessions': return "Cəmi Sessiyalar"
            case 'new': return "Yeni İstifadəçilər"
            default: return ''
        }
    }

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-normal">
                    {getTitle()}
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <button
                        onClick={() => setView('active')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'active'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Aktiv
                    </button>
                    <button
                        onClick={() => setView('sessions')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'sessions'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Sessiyalar
                    </button>
                    <button
                        onClick={() => setView('new')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'new'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Yeni
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                        data={data}
                        onClick={handlePointClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                                backgroundColor: '#020617',
                                color: '#f8fafc',
                                padding: '8px 12px',
                            }}
                            itemStyle={{
                                fontSize: '12px',
                                fontWeight: '500',
                            }}
                            labelStyle={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginBottom: '4px',
                                color: '#94a3b8'
                            }}
                            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={view === 'active' ? 'users' : view === 'sessions' ? 'sessions' : 'newUsers'}
                            stroke={view === 'active' ? '#8884d8' : view === 'sessions' ? '#f59e0b' : '#10b981'}
                            fillOpacity={1}
                            fill={`url(#${view === 'active' ? 'colorActive' : view === 'sessions' ? 'colorSessions' : 'colorNew'})`}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>

            <UsageUserListDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                date={selectedDate}
                type={view}
                language={language}
                onSelectUser={(userId) => {
                    setIsDialogOpen(false)
                    onSelectUser(userId)
                }}
            />
        </Card>
    )
}
