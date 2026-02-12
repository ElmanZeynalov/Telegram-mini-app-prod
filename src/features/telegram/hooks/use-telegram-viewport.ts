"use client"

import { useSignal } from "@telegram-apps/sdk-react"
import { viewport } from "@telegram-apps/sdk-react"
import { useTelegram } from "./use-telegram"

/**
 * Hook to access Telegram viewport information including safe areas
 */
export function useTelegramViewport() {
  const { isTelegram, isInitialized } = useTelegram()

  // Viewport dimensions
  const height = useSignal(viewport.height, () => typeof window !== "undefined" ? window.innerHeight : 0)
  const width = useSignal(viewport.width, () => typeof window !== "undefined" ? window.innerWidth : 0)
  const stableHeight = useSignal(viewport.stableHeight, () => typeof window !== "undefined" ? window.innerHeight : 0)
  const isExpanded = useSignal(viewport.isExpanded, () => true)
  const isStable = useSignal(viewport.isStable, () => true)

  // Safe area insets (for notches, home indicators, etc.)
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop, () => 0)
  const safeAreaInsetBottom = useSignal(viewport.safeAreaInsetBottom, () => 0)
  const safeAreaInsetLeft = useSignal(viewport.safeAreaInsetLeft, () => 0)
  const safeAreaInsetRight = useSignal(viewport.safeAreaInsetRight, () => 0)

  // Content safe area insets (accounts for Telegram UI elements)
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop, () => 0)
  const contentSafeAreaInsetBottom = useSignal(viewport.contentSafeAreaInsetBottom, () => 0)
  const contentSafeAreaInsetLeft = useSignal(viewport.contentSafeAreaInsetLeft, () => 0)
  const contentSafeAreaInsetRight = useSignal(viewport.contentSafeAreaInsetRight, () => 0)

  return {
    isTelegram,
    isInitialized,
    // Dimensions
    height,
    width,
    stableHeight,
    isExpanded,
    isStable,
    // Device safe areas
    safeAreaInsets: {
      top: safeAreaInsetTop,
      bottom: safeAreaInsetBottom,
      left: safeAreaInsetLeft,
      right: safeAreaInsetRight,
    },
    // Content safe areas (includes Telegram chrome)
    contentSafeAreaInsets: {
      top: contentSafeAreaInsetTop,
      bottom: contentSafeAreaInsetBottom,
      left: contentSafeAreaInsetLeft,
      right: contentSafeAreaInsetRight,
    },
  }
}

