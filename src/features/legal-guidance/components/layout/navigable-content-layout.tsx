"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { useTelegram } from "@/features/telegram"
import { useAnalytics } from "@/features/analytics/context/analytics-context"

interface NavigableContentLayoutProps {
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Layout for screens that have back navigation
 * Used by categories, questions, and answer screens
 * 
 * Note: In Telegram, the native back button is used instead of our own
 */
import { motion } from "framer-motion"
import { XCircle } from "lucide-react"

export function NavigableContentLayout({ children, footer }: NavigableContentLayoutProps) {
  const { goBack, goHome, t } = useLegalGuidance()

  const { track } = useAnalytics()

  const handleEmergencyExit = async () => {
    // Attempt to track, but don't block exit for too long (max 500ms)
    try {
      await Promise.race([
        track('emergency_exit'),
        new Promise(resolve => setTimeout(resolve, 500))
      ])
    } catch (e) {
      console.error("Failed to track emergency exit", e)
    }

    if (typeof window !== "undefined") {
      // If inside Telegram
      if (window.Telegram?.WebApp?.initData) {
        window.Telegram.WebApp.close()
      } else {
        // If PWA / Browser
        try {
          window.close()
        } catch (e) {
          console.error("Cannot close window", e)
        }
        // Fallback: Return to main language screen (Restart app)
        goHome()
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Navigation Bar with increased top padding to avoid Telegram UI overlap */}
      <div className="flex items-center justify-between px-4 pb-3 pt-[calc(3.5rem+env(safe-area-inset-top))] border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t("navigationBack")}</span>
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleEmergencyExit}
          className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white rounded-lg px-3"
        >
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{t("navigationExit")}</span>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-y-auto"
      >
        {children}
      </motion.div>

      {/* Optional footer */}
      {
        footer && (
          <footer className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border/30">
            {footer}
          </footer>
        )
      }
    </div>
  )
}
