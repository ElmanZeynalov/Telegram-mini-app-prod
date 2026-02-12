"use client"

import { useState } from "react"
import { useStats } from "@/features/analytics/hooks/use-stats"
import { StatsHeader } from "@/features/analytics/components/stats-header"
import { KPIGrid } from "@/features/analytics/components/kpi-grid"
import { UsageChart } from "@/features/analytics/components/usage-chart"
import { RegionChart } from "@/features/analytics/components/region-chart"
import { ContentChart } from "@/features/analytics/components/content-chart"
import { QuestionInterestChart } from "@/features/analytics/components/question-interest-chart"
import { UserListTable } from "@/features/analytics/components/user-list-table"
import { FeedbackStatsTable } from "@/features/analytics/components/feedback-stats-table"
import { EmergencyExitList } from "@/features/analytics/components/emergency-exit-list"
import { StatsPeriod } from "@/features/analytics/types"
import { UserDetailDialog } from "@/features/analytics/components/user-detail-dialog"

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<StatsPeriod>('7d')
    const [language, setLanguage] = useState<string>('all')
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const { stats, loading, error, refetch } = useStats(period, language, 30000)



    const handleExcelExport = async () => {
        if (!stats) return

        try {
            const XLSX = await import('xlsx')

            const wb = XLSX.utils.book_new()

            // Helper function to style worksheet
            const styleWorksheet = (ws: any, headerColor: string = '4472C4') => {
                const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

                // Auto-size columns
                const colWidths: any[] = []
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    let maxWidth = 10
                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
                        const cell = ws[cellAddress]
                        if (cell && cell.v) {
                            const cellLength = String(cell.v).length
                            maxWidth = Math.max(maxWidth, cellLength)
                        }
                    }
                    colWidths.push({ wch: Math.min(maxWidth + 2, 50) })
                }
                ws['!cols'] = colWidths

                // Style header row
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const headerCell = XLSX.utils.encode_cell({ r: 0, c: C })
                    if (!ws[headerCell]) continue

                    ws[headerCell].s = {
                        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 12 },
                        fill: { fgColor: { rgb: headerColor } },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: '000000' } },
                            bottom: { style: 'thin', color: { rgb: '000000' } },
                            left: { style: 'thin', color: { rgb: '000000' } },
                            right: { style: 'thin', color: { rgb: '000000' } }
                        }
                    }
                }

                // Add borders to all cells
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
                        if (!ws[cellAddress]) continue

                        if (!ws[cellAddress].s) ws[cellAddress].s = {}
                        ws[cellAddress].s.border = {
                            top: { style: 'thin', color: { rgb: 'D3D3D3' } },
                            bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
                            left: { style: 'thin', color: { rgb: 'D3D3D3' } },
                            right: { style: 'thin', color: { rgb: 'D3D3D3' } }
                        }

                        // Alternate row colors (except header)
                        if (R > 0 && R % 2 === 0) {
                            ws[cellAddress].s.fill = { fgColor: { rgb: 'F2F2F2' } }
                        }
                    }
                }
            }

            // 1. Usage Sheet
            const usageData = stats.usage.map(row => ({
                "Tarix": row.fullDate,
                "Aktiv İstifadəçilər": row.users,
                "Sessiyalar": row.sessions,
                "Yeni İstifadəçilər": row.newUsers
            }))
            const wsUsage = XLSX.utils.json_to_sheet(usageData)
            styleWorksheet(wsUsage, '4472C4')
            XLSX.utils.book_append_sheet(wb, wsUsage, "Ümumi")

            // 2. Content Sheet
            const contentData = stats.content.map(row => ({
                "Kateqoriya Adı": row.name,
                "Baxış Sayı": row.views
            }))
            const wsContent = XLSX.utils.json_to_sheet(contentData)
            styleWorksheet(wsContent, '70AD47')
            XLSX.utils.book_append_sheet(wb, wsContent, "Kateqoriyalar")

            // 3. Questions Sheet
            const questionData = stats.questions.map(row => ({
                "Sual": row.name,
                "Baxış Sayı": row.views
            }))
            const wsQuestions = XLSX.utils.json_to_sheet(questionData)
            styleWorksheet(wsQuestions, 'FFC000')
            XLSX.utils.book_append_sheet(wb, wsQuestions, "Suallar")

            // 4. Regions Sheet
            const regionData = stats.regions.map(row => ({
                "Region": row.name,
                "İstifadəçi Sayı": row.value
            }))
            const wsRegions = XLSX.utils.json_to_sheet(regionData)
            styleWorksheet(wsRegions, 'ED7D31')
            XLSX.utils.book_append_sheet(wb, wsRegions, "Regionlar")

            // 5. Feedback Sheet
            if (stats.feedback) {
                const feedbackData = stats.feedback.map(row => ({
                    "Sual": row.question,
                    "Bəli (Faydalı)": row.yes,
                    "Xeyr (Faydasız)": row.no,
                    "Cəmi": row.total
                }))
                const wsFeedback = XLSX.utils.json_to_sheet(feedbackData)
                styleWorksheet(wsFeedback, '5B9BD5')
                XLSX.utils.book_append_sheet(wb, wsFeedback, "Rəylər")
            }

            // Generate and download
            XLSX.writeFile(wb, `analytics_${period}_${language}.xlsx`, { cellStyles: true })
        } catch (err) {
            console.error("Excel export failed", err)
            alert("Excel ixracı zamanı xəta baş verdi.")
        }
    }

    // ... loading and error states ...

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center text-red-500">
                {error || "Failed to load statistics."}
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <StatsHeader
                period={period}
                setPeriod={(val) => setPeriod(val as StatsPeriod)}
                language={language}
                setLanguage={setLanguage}
                onExcelExport={handleExcelExport}
                onRefresh={refetch}
            />

            <KPIGrid
                safety={stats.safety}
                totalRegions={stats.regions.length}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-7">
                <UserListTable
                    regionFilter={selectedRegion}
                    onClearFilter={() => setSelectedRegion(null)}
                    onSelectUser={setSelectedUserId}
                    className="col-span-1 md:col-span-2 lg:col-span-5"
                />
                <RegionChart
                    data={stats.regions}
                    onRegionSelect={(region) => setSelectedRegion(region === selectedRegion ? null : region)}
                    selectedRegion={selectedRegion}
                    className="col-span-1 md:col-span-1 lg:col-span-2"
                />

                <div className="col-span-1 md:col-span-3 lg:col-span-7 grid grid-cols-1 lg:grid-cols-7 gap-4">
                    <div className="lg:col-span-5">
                        <UsageChart
                            data={stats.usage}
                            language={language}
                            onSelectUser={setSelectedUserId}
                        />
                    </div>
                    <EmergencyExitList
                        users={stats.safety.emergencyExitUsers}
                        className="lg:col-span-2 h-full"
                    />
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <ContentChart data={stats.content} className="col-span-1" />
                <QuestionInterestChart data={stats.questions} className="col-span-1" />
            </div>

            <FeedbackStatsTable
                data={stats.feedback}
                period={period}
                language={language}
            />

            <UserDetailDialog
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    )
}
