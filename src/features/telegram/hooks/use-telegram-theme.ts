"use client"

import { useSignal } from "@telegram-apps/sdk-react"
import { themeParams, miniApp } from "@telegram-apps/sdk-react"
import { useTelegram } from "./use-telegram"

/**
 * Hook to access Telegram theme parameters
 */
export function useTelegramTheme() {
  const { isTelegram, isInitialized } = useTelegram()

  // Use signals from the SDK - these will automatically update when theme changes
  const isDark = useSignal(themeParams.isDark, () => false)
  const backgroundColor = useSignal(themeParams.backgroundColor, () => undefined)
  const textColor = useSignal(themeParams.textColor, () => undefined)
  const hintColor = useSignal(themeParams.hintColor, () => undefined)
  const linkColor = useSignal(themeParams.linkColor, () => undefined)
  const buttonColor = useSignal(themeParams.buttonColor, () => undefined)
  const buttonTextColor = useSignal(themeParams.buttonTextColor, () => undefined)
  const secondaryBackgroundColor = useSignal(themeParams.secondaryBackgroundColor, () => undefined)
  const headerBackgroundColor = useSignal(themeParams.headerBackgroundColor, () => undefined)
  const accentTextColor = useSignal(themeParams.accentTextColor, () => undefined)
  const sectionBackgroundColor = useSignal(themeParams.sectionBackgroundColor, () => undefined)
  const sectionHeaderTextColor = useSignal(themeParams.sectionHeaderTextColor, () => undefined)
  const subtitleTextColor = useSignal(themeParams.subtitleTextColor, () => undefined)
  const destructiveTextColor = useSignal(themeParams.destructiveTextColor, () => undefined)

  return {
    isTelegram,
    isInitialized,
    isDark,
    // Theme colors
    backgroundColor,
    textColor,
    hintColor,
    linkColor,
    buttonColor,
    buttonTextColor,
    secondaryBackgroundColor,
    headerBackgroundColor,
    accentTextColor,
    sectionBackgroundColor,
    sectionHeaderTextColor,
    subtitleTextColor,
    destructiveTextColor,
  }
}

/**
 * Hook to access the color scheme (light/dark)
 */
export function useTelegramColorScheme(): "light" | "dark" {
  const { isTelegram } = useTelegram()
  const isDark = useSignal(themeParams.isDark, () => false)

  if (!isTelegram) {
    // Return system preference when not in Telegram
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
  }

  return isDark ? "dark" : "light"
}

