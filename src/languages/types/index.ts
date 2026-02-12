// i18n feature types
import type { Locale } from "@/types"

export interface Language {
  code: Locale
  name: string
  nativeName: string
}

export interface LocaleState {
  locale: Locale
}

export interface LocaleActions {
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  getText: (text: { az: string; ru?: string; en?: string }) => string
  /** Initialize locale from Telegram Cloud Storage or user's language (only on first load) */
  initializeFromTelegram: () => Promise<void>
}

export type LocaleStore = LocaleState & LocaleActions
