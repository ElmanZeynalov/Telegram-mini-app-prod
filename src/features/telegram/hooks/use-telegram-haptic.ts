"use client"

import { useCallback } from "react"
import { hapticFeedback } from "@telegram-apps/sdk-react"
import { useTelegram } from "./use-telegram"

type ImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft"
type NotificationType = "error" | "success" | "warning"

/**
 * Hook to trigger haptic feedback on supported devices
 */
export function useTelegramHaptic() {
  const { isTelegram, isInitialized } = useTelegram()

  /**
   * Trigger impact haptic feedback
   */
  const impactOccurred = useCallback(
    (style: ImpactStyle = "medium") => {
      if (!isTelegram || !isInitialized) return
      if (hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred(style)
      }
    },
    [isTelegram, isInitialized]
  )

  /**
   * Trigger notification haptic feedback
   */
  const notificationOccurred = useCallback(
    (type: NotificationType) => {
      if (!isTelegram || !isInitialized) return
      if (hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred(type)
      }
    },
    [isTelegram, isInitialized]
  )

  /**
   * Trigger selection change haptic feedback (light tap)
   */
  const selectionChanged = useCallback(() => {
    if (!isTelegram || !isInitialized) return
    if (hapticFeedback.selectionChanged.isAvailable()) {
      hapticFeedback.selectionChanged()
    }
  }, [isTelegram, isInitialized])

  return {
    impactOccurred,
    notificationOccurred,
    selectionChanged,
    isAvailable: isTelegram && isInitialized,
  }
}

