import { create } from "zustand"
import type { LocaleStore } from "../types"
import type { Locale, TranslatedString } from "@/types"
import { translations } from "../locales"
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/config/constants"
import {
  initDataUser,
  cloudStorage,
  isCloudStorageSupported
} from "@telegram-apps/sdk-react"

const CLOUD_STORAGE_KEY = "user_locale"

/**
 * Parse a BCP 47 language tag and extract the primary language
 * Uses native Intl.Locale API (supported in all modern browsers)
 * @example "en-US" -> "en", "ru-RU" -> "ru", "az" -> "az"
 */
function getPrimaryLanguage(languageTag: string): string {
  try {
    // Intl.Locale properly parses BCP 2 language tags
    const locale = new Intl.Locale(languageTag)
    return locale.language.toLowerCase()
  } catch {
    // Fallback for invalid tags - just return lowercase
    return languageTag.toLowerCase()
  }
}

/**
 * Get supported locale from a language code
 * Returns the locale if supported, otherwise returns default (az)
 */
function getSupportedLocale(languageCode: string | undefined): Locale {
  if (!languageCode) return DEFAULT_LOCALE

  const primaryLang = getPrimaryLanguage(languageCode)

  // Check if supported
  if (SUPPORTED_LOCALES.includes(primaryLang as Locale)) {
    return primaryLang as Locale
  }

  return DEFAULT_LOCALE
}

/**
 * Save locale to Telegram Cloud Storage
 */
async function saveToCloudStorage(locale: Locale): Promise<void> {
  try {
    if (isCloudStorageSupported()) {
      await cloudStorage.setItem(CLOUD_STORAGE_KEY, locale)

    }
  } catch (e) {
    console.warn("[Locale] Failed to save to Cloud Storage:", e)
  }
}

/**
 * Load locale from Telegram Cloud Storage
 */
async function loadFromCloudStorage(): Promise<Locale | null> {
  try {
    if (isCloudStorageSupported()) {
      const saved = await cloudStorage.getItem(CLOUD_STORAGE_KEY)
      if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {

        return saved as Locale
      }
    }
  } catch (e) {
    console.warn("[Locale] Failed to load from Cloud Storage:", e)
  }
  return null
}

// Track if we've already initialized
let hasInitialized = false

export const useLocaleStore = create<LocaleStore>()((set, get) => ({
  // State
  locale: DEFAULT_LOCALE,

  // Actions
  setLocale: (locale: Locale) => {
    set({ locale })
    // Save to Telegram Cloud Storage (fire and forget)
    saveToCloudStorage(locale)
  },

  t: (key: string) => {
    const { locale } = get()
    return translations[locale][key] || translations.az[key] || key
  },

  getText: (text: TranslatedString) => {
    const { locale } = get()
    return text[locale] || text.az || ""
  },

  /**
   * Initialize locale from Telegram Cloud Storage or user's language
   * Priority: 1) Cloud Storage (user's saved preference)
   *          2) Telegram user's language_code  
   *          3) Default (az)
   */
  initializeFromTelegram: async () => {
    if (hasInitialized) return
    hasInitialized = true



    // First, try to load from Telegram Cloud Storage
    const savedLocale = await loadFromCloudStorage()
    if (savedLocale) {

      set({ locale: savedLocale })
      return
    }

    // No saved preference, detect from Telegram user's language
    try {
      // Try SDK's initDataUser signal
      const user = initDataUser()


      if (user?.language_code) {
        const telegramLocale = getSupportedLocale(user.language_code)

        set({ locale: telegramLocale })
        saveToCloudStorage(telegramLocale)
        return
      }

      // Fallback: Try native Telegram WebApp API
      const webAppUser = window.Telegram?.WebApp?.initDataUnsafe?.user as { language_code?: string } | undefined


      if (webAppUser?.language_code) {
        const telegramLocale = getSupportedLocale(webAppUser.language_code)

        set({ locale: telegramLocale })
        saveToCloudStorage(telegramLocale)
        return
      }

      // No language detected, use default
      // No language detected, using default
      set({ locale: DEFAULT_LOCALE })
    } catch (e) {
      console.warn("[Locale] Failed to detect language, using default:", e)
      set({ locale: DEFAULT_LOCALE })
    }
  },
}))
