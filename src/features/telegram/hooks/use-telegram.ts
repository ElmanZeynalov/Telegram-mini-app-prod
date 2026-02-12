"use client"

import { useContext } from "react"
import { TelegramContext, type TelegramContextValue } from "../context/telegram-context"

/**
 * Hook to access basic Telegram context (initialization status, environment check)
 */
export function useTelegram(): TelegramContextValue {
  const context = useContext(TelegramContext)
  
  if (context === null) {
    throw new Error("useTelegram must be used within a TelegramProvider")
  }
  
  return context
}

