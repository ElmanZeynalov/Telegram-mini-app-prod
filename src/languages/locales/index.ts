import type { Locale } from "@/types"

// Import all locale JSON files
import azCommon from "./az/common.json"
import azLegalGuidance from "./az/legal-guidance.json"

import ruCommon from "./ru/common.json"
import ruLegalGuidance from "./ru/legal-guidance.json"

// Merge all translations per locale
const mergeTranslations = (...sources: Record<string, string>[]) => {
  return sources.reduce((acc, source) => ({ ...acc, ...source }), {})
}

export const translations: Record<Locale, Record<string, string>> = {
  az: mergeTranslations(azCommon, azLegalGuidance),
  ru: mergeTranslations(ruCommon, ruLegalGuidance),
}
