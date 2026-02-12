"use client"

import { Button } from "@/components/ui/button"
import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { ArrowRight } from "lucide-react"
import { useAnalytics } from "@/features/analytics/context/analytics-context"
import { CenteredContentLayout } from "../layout/centered-content-layout"
import { FeministIcon } from "@/assets/icons"

export function HomeScreen() {
  const { setScreen, t, setLocale } = useLegalGuidance()
  const { track } = useAnalytics()

  // Handler for language selection + navigation
  const handleStart = (lang: "az" | "ru") => {
    track('language_select', { language: lang })
    setLocale(lang)
    setScreen("categories")
  }

  return (
    <CenteredContentLayout>
      {/* App icon - Feminist Venus symbol */}
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 shadow-sm">
        <FeministIcon className="w-12 h-12 text-primary" />
      </div>

      {/* Welcome text */}
      <h1 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
        {t("welcome")}
      </h1>

      <p className="text-muted-foreground mb-10 max-w-xs leading-relaxed">
        {t("welcomeSubtitle")}
      </p>

      {/* Language Actions Stack */}
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        {/* AZ Button */}
        <Button
          size="lg"
          onClick={() => handleStart("az")}
          className="w-full h-14 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 gap-2 justify-start px-6"
        >
          <span className="text-xl">🇦🇿</span>
          <span className="flex-1 text-left">Başla</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
        </Button>

        {/* RU Button */}
        <Button
          size="lg"
          variant="secondary"
          onClick={() => handleStart("ru")}
          className="w-full h-14 text-base font-medium rounded-xl hover:bg-muted/80 transition-all duration-200 gap-2 justify-start px-6"
        >
          <span className="text-xl">🇷🇺</span>
          <span className="flex-1 text-left">Начать</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
        </Button>
      </div>
    </CenteredContentLayout>
  )
}
