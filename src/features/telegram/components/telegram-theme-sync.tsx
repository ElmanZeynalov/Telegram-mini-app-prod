"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useSignal } from "@telegram-apps/sdk-react"
import { themeParams } from "@telegram-apps/sdk-react"
import { useTelegram } from "../hooks/use-telegram"

/**
 * Component that syncs Telegram's theme with next-themes
 * Place this inside both TelegramProvider and ThemeProvider
 */
export function TelegramThemeSync() {
  const { isTelegram, isInitialized } = useTelegram()
  const { setTheme, resolvedTheme } = useTheme()
  
  // Subscribe to Telegram's isDark signal
  const isDark = useSignal(themeParams.isDark, () => false)

  useEffect(() => {
    if (!isInitialized || !isTelegram) return

    // Sync theme based on Telegram's color scheme
    const newTheme = isDark ? "dark" : "light"
    
    if (resolvedTheme !== newTheme) {
      setTheme(newTheme)
    }
  }, [isDark, isTelegram, isInitialized, setTheme, resolvedTheme])

  // This component doesn't render anything
  return null
}

