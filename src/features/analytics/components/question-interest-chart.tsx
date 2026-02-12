"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ContentStat } from "../types"


interface QuestionInterestChartProps {
    data: ContentStat[]
    className?: string
}

export function QuestionInterestChart({ data, className }: QuestionInterestChartProps) {
    // Sort by views descending
    const sortedData = [...data].sort((a, b) => b.views - a.views)

    // Calculate height: ensure minimum or grows with data
    const chartHeight = Math.max(300, sortedData.length * 60)

    return (
        <Card className={`col-span-4 transition-all duration-300 ease-in-out ${className || ''}`}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Ən Çox Soruşulan Suallar</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {data.length} cəmi
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                    <div style={{ height: `${chartHeight}px`, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sortedData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={240}
                                    tick={({ x, y, payload }) => (
                                        <g transform={`translate(${x},${y})`}>
                                            <text
                                                x={0}
                                                y={0}
                                                dy={4}
                                                textAnchor="end"
                                                fill="var(--foreground)"
                                                fontSize={11}
                                            >
                                                {payload.value.length > 35
                                                    ? `${payload.value.substring(0, 35)}...`
                                                    : payload.value}
                                            </text>
                                        </g>
                                    )}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #1E293B',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                        backgroundColor: '#020817',
                                        color: '#F8FAFC'
                                    }}
                                    itemStyle={{ color: '#F8FAFC' }}
                                    formatter={(value: number) => [value, "Baxış sayı"]}
                                />
                                <Bar dataKey="views" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
