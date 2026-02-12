"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { RegionStat } from "../types"


interface RegionChartProps {
    data: RegionStat[]
    onRegionSelect?: (region: string) => void
    selectedRegion?: string | null
    className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function RegionChart({ data, onRegionSelect, selectedRegion, className }: RegionChartProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>İstifadəçi Şəhərləri</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] overflow-y-auto pr-2 space-y-2">
                    {data.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-10">No city data available</div>
                    ) : (
                        data.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => onRegionSelect?.(item.name)}
                                className={`flex justify-between items-center p-2 rounded-md transition-colors border cursor-pointer ${selectedRegion === item.name
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-muted/50 border-transparent hover:border-border"
                                    }`}
                            >
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="font-bold text-primary">{item.value}</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
