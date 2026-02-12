"use client"

import { type PropsWithChildren, useEffect, useMemo, useState, useLayoutEffect } from "react"
import {
  init,
  backButton,
  viewport,
  miniApp,
  themeParams,
  swipeBehavior,
  closingBehavior,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react"
import { TelegramContext, type TelegramContextValue } from "../context/telegram-context"
import { useLocaleStore } from "@/languages/stores/locale-store"

export interface TelegramProviderProps extends PropsWithChildren {
  /**
   * If true, disables vertical swipes to prevent accidental app close.
   * @default false
   */
  disableVerticalSwipes?: boolean
  /**
   * If true, enables closing confirmation dialog.
   * @default false
   */
  enableClosingConfirmation?: boolean
}

/**
 * Check if we're running inside Telegram's WebView
 */
function checkIsTelegramEnvironment(): boolean {
  if (typeof window === "undefined") return false

  // Check if Telegram WebApp object exists
  const webApp = window.Telegram?.WebApp
  if (webApp?.initData && webApp.initData.length > 0) {
    return true
  }

  // Check for launch params in URL
  const hasHashParams = window.location.hash.includes("tgWebAppData")
  const hasQueryParams = new URLSearchParams(window.location.search).has("tgWebAppData")

  if (hasHashParams || hasQueryParams) {
    return true
  }

  // Try to retrieve launch params
  try {
    const params = retrieveLaunchParams()
    return Boolean(params?.tgWebAppPlatform || params?.platform)
  } catch {
    return false
  }
}

/**
 * Expand the app immediately using native API
 */
function expandImmediately() {
  if (typeof window === "undefined") return

  const webApp = window.Telegram?.WebApp
  if (!webApp) return

  try {
    webApp.ready()
    webApp.expand()

    if (typeof webApp.disableVerticalSwipes === "function") {
      webApp.disableVerticalSwipes()
    }


  } catch (e) {
    console.warn("[Telegram] Early expand failed:", e)
  }
}

export function TelegramProvider({
  children,
  disableVerticalSwipes = false,
  enableClosingConfirmation = false,
}: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTelegram, setIsTelegram] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initializeFromTelegram = useLocaleStore((state) => state.initializeFromTelegram)

  // Expand as early as possible
  useLayoutEffect(() => {
    expandImmediately()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    let cleanup: VoidFunction | undefined

    const isTelegramEnv = checkIsTelegramEnvironment()
    setIsTelegram(isTelegramEnv)

    if (!isTelegramEnv) {
      setIsInitialized(true)
      return
    }

    // Async initialization function
    const initializeTelegram = async () => {
      try {
        // Initialize SDK
        cleanup = init({ acceptCustomStyles: true })

        // Mount viewport
        if (viewport.mount.isAvailable()) {
          viewport.mount()
        }

        if (viewport.expand.isAvailable()) {
          viewport.expand()
        }

        // Mount mini app
        if (miniApp.mountSync.isAvailable()) {
          miniApp.mountSync()
        }

        if (miniApp.bindCssVars.isAvailable()) {
          miniApp.bindCssVars()
        }

        // Mount theme params
        if (themeParams.mount.isAvailable()) {
          themeParams.mount()
        }

        if (themeParams.bindCssVars.isAvailable()) {
          themeParams.bindCssVars()
        }

        // Mount back button
        if (backButton.mount.isAvailable()) {
          backButton.mount()
        }

        // Configure swipe behavior
        if (swipeBehavior.mount.isAvailable()) {
          swipeBehavior.mount()
        }

        if (disableVerticalSwipes && swipeBehavior.disableVertical.isAvailable()) {
          swipeBehavior.disableVertical()
        }

        // Configure closing behavior
        if (closingBehavior.mount.isAvailable()) {
          closingBehavior.mount()
        }

        if (enableClosingConfirmation && closingBehavior.enableConfirmation.isAvailable()) {
          closingBehavior.enableConfirmation()
        }

        // Bind viewport CSS variables
        if (viewport.bindCssVars.isAvailable()) {
          viewport.bindCssVars()
        }

        // Initialize locale from Telegram Cloud Storage or user's language
        // This must be after SDK init so cloud storage is available
        await initializeFromTelegram()

        // Signal ready
        if (miniApp.ready.isAvailable()) {
          miniApp.ready()
        }

        setIsInitialized(true)
      } catch (err) {
        console.error("[Telegram] Initialization error:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsInitialized(true)
      }
    }

    initializeTelegram()

    return () => {
      cleanup?.()
    }
  }, [disableVerticalSwipes, enableClosingConfirmation, initializeFromTelegram])

  const contextValue = useMemo<TelegramContextValue>(
    () => ({
      isInitialized,
      isTelegram,
      error,
      webApp: typeof window !== "undefined" ? window.Telegram?.WebApp : undefined,
    }),
    [isInitialized, isTelegram, error]
  )

  if (!isInitialized) {
    return null
  }

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}
