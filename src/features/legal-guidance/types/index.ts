// Legal Guidance feature types
import type { TranslatedString } from "@/types"

export interface Language {
  code: "az" | "ru" | "en"
  name: string
  nativeName: string
}

export interface Category {
  id: string
  name: TranslatedString
  icon?: string
  createdAt: string
}

export interface Question {
  id: string
  categoryId?: string
  question: TranslatedString
  answer?: TranslatedString
  attachments?: Record<string, { url: string; name: string } | null>
  keywords?: string[]
  subQuestions?: Question[]
  createdAt: string
}

export interface LegalGuidanceData {
  version: string
  exportedAt?: string
  languages: Language[]
  categories: Category[]
  questions: Question[]
}

// Navigation types
export type Screen = "home" | "categories" | "questions" | "answer"

export interface BreadcrumbItem {
  id: string
  label: string
  type: "category" | "question"
}

export interface NavigationHistoryItem {
  questions: Question[]
  question: Question | null
}

export interface GuidanceNavigationState {
  data: LegalGuidanceData
  screen: Screen
  selectedCategory: Category | null
  currentQuestions: Question[]
  currentQuestion: Question | null
  currentAnswer: string | null
  currentAttachment: { url: string; name: string } | null
  breadcrumbs: BreadcrumbItem[]
  navigationHistory: NavigationHistoryItem[]
  lastSelectedQuestionId: string | null
}

export interface GuidanceNavigationActions {
  setScreen: (screen: Screen) => void
  selectCategory: (category: Category, getText: (text: any) => string) => void
  selectQuestion: (question: Question, getText: (text: any) => string) => void
  goBack: () => void
  goHome: () => void
  goToCategories: () => void
  initialize: (baseUrl?: string) => Promise<void>
}

export type GuidanceNavigationStore = GuidanceNavigationState & GuidanceNavigationActions
