// Provider
export { TelegramProvider, type TelegramProviderProps } from "./providers/telegram-provider"

// Context
export { TelegramContext, type TelegramContextValue } from "./context/telegram-context"

// Components
export { TelegramThemeSync } from "./components/telegram-theme-sync"

// Hooks
export { useTelegram } from "./hooks/use-telegram"
export { useTelegramBackButton } from "./hooks/use-telegram-back-button"
export { useTelegramTheme, useTelegramColorScheme } from "./hooks/use-telegram-theme"
export { useTelegramViewport } from "./hooks/use-telegram-viewport"
export { useTelegramHaptic } from "./hooks/use-telegram-haptic"

// Re-export useful items from the SDK for convenience
export {
  useSignal,
  useLaunchParams,
  useRawLaunchParams,
  useRawInitData,
} from "@telegram-apps/sdk-react"

