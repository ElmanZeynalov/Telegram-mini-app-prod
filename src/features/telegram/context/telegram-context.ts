"use client"

import { createContext } from "react"

export interface TelegramContextValue {
  /**
   * Whether the Telegram SDK has been initialized
   */
  isInitialized: boolean
  /**
   * Whether the app is running inside Telegram
   */
  isTelegram: boolean
  /**
   * Error that occurred during initialization, if any
   */
  error: Error | null
  /**
   * The raw WebApp object from the Telegram SDK
   */
  webApp?: Window["Telegram"]["WebApp"]
}

export const TelegramContext = createContext<TelegramContextValue | null>(null)

