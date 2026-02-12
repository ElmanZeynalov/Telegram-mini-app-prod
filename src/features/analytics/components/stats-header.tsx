import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface StatsHeaderProps {
    period: string
    setPeriod: (val: string) => void
    language: string
    setLanguage: (val: string) => void
    onExcelExport: () => void
    onRefresh: () => void
}

export function StatsHeader({ period, setPeriod, language, setLanguage, onExcelExport, onRefresh }: StatsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <Link href="/miniapp/admin">
                    <Button variant="outline" className="mb-4 gap-2 h-10 px-4 text-base font-medium border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <ArrowLeft className="h-5 w-5" />
                        Geri
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Analitika Paneli</h1>
                <p className="text-muted-foreground">
                    Real vaxt statistikası və istifadəçi davranışı.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Dil seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Bütün Dillər</SelectItem>
                        <SelectItem value="az">Azərbaycan</SelectItem>
                        <SelectItem value="ru">Rus</SelectItem>
                    </SelectContent>
                </Select>

                <Tabs value={period} onValueChange={setPeriod} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="7d">Son 7 gün</TabsTrigger>
                        <TabsTrigger value="30d">Son 30 gün</TabsTrigger>
                        <TabsTrigger value="90d">Son 90 gün</TabsTrigger>
                        <TabsTrigger value="lifetime">Bütün dövr</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={onRefresh} className="hidden sm:flex" title="Məlumatı yenilə">
                    <span className="text-xl">↻</span>
                </Button>

                <Button variant="outline" size="sm" onClick={onExcelExport} className="hidden sm:flex">
                    <Download className="mr-2 h-4 w-4" />
                    Excel-ə ixrac
                </Button>
            </div>
        </div>
    )
}
