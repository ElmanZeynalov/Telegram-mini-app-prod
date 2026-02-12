"use client"

import { useEffect, useCallback } from "react"
import { backButton } from "@telegram-apps/sdk-react"
import { useTelegram } from "./use-telegram"

interface UseTelegramBackButtonOptions {
  /**
   * Whether the back button should be visible
   */
  visible?: boolean
  /**
   * Callback when back button is pressed
   */
  onBack?: () => void
}

/**
 * Hook to control Telegram's native back button
 */
export function useTelegramBackButton({
  visible = false,
  onBack,
}: UseTelegramBackButtonOptions = {}) {
  const { isTelegram, isInitialized } = useTelegram()

  const handleBack = useCallback(() => {
    onBack?.()
  }, [onBack])

  useEffect(() => {
    if (!isInitialized || !isTelegram) return

    // Show or hide the back button based on the visible prop
    if (visible) {
      if (backButton.show.isAvailable()) {
        backButton.show()
      }
    } else {
      if (backButton.hide.isAvailable()) {
        backButton.hide()
      }
    }
  }, [visible, isTelegram, isInitialized])

  useEffect(() => {
    if (!isInitialized || !isTelegram || !onBack) return

    // Subscribe to back button clicks
    if (backButton.onClick.isAvailable()) {
      const off = backButton.onClick(handleBack)
      return off
    }
  }, [handleBack, isTelegram, isInitialized, onBack])

  return {
    show: useCallback(() => {
      if (isTelegram && backButton.show.isAvailable()) {
        backButton.show()
      }
    }, [isTelegram]),
    hide: useCallback(() => {
      if (isTelegram && backButton.hide.isAvailable()) {
        backButton.hide()
      }
    }, [isTelegram]),
  }
}

