// Shared types used across the application

// Locale types
export type Locale = "az" | "ru"

// Translated string type
export interface TranslatedString {
  az: string
  ru?: string
}

// Telegram WebApp types for global window object
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
        close: () => void
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        platform: string
        version: string
        initData: string
        initDataUnsafe: Record<string, unknown>
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        isFullscreen?: boolean
        requestFullscreen?: () => void
        exitFullscreen?: () => void
        disableVerticalSwipes?: () => void
        enableVerticalSwipes?: () => void
        safeAreaInset?: {
          top: number
          bottom: number
          left: number
          right: number
        }
        contentSafeAreaInset?: {
          top: number
          bottom: number
          left: number
          right: number
        }
        onEvent?: (eventType: string, callback: () => void) => void
        offEvent?: (eventType: string, callback: () => void) => void
        sendData?: (data: string) => void
        MainButton?: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          setText: (text: string) => void
          setParams: (params: Record<string, unknown>) => void
        }
        BackButton?: {
          isVisible: boolean
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
      }
    }
  }
}
