import { LegalGuidanceApp } from "@/features/legal-guidance/components/legal-guidance-app"
import { AnalyticsProvider } from "@/features/analytics/context/analytics-context"

export default function Home() {
  return (
    <AnalyticsProvider>
      <LegalGuidanceApp />
    </AnalyticsProvider>
  )
}
