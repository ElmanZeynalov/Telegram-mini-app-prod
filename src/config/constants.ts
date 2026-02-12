// Global configurations and constants
import type { Locale } from "@/types"

export const APP_CONFIG = {
  name: "Legal Help",
  version: "1.0.0",
} as const

export const DEFAULT_LOCALE: Locale = "az"
export const SUPPORTED_LOCALES: Locale[] = ["az", "ru"]
