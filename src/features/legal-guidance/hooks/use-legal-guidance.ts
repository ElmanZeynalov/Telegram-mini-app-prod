"use client"

import { useLocaleStore } from "@/languages/stores/locale-store"
import { useGuidanceNavigationStore } from "../stores/guidance-navigation-store"
import { useCallback } from "react"
import type { Category, Question } from "../types"

/**
 * Custom hook that combines locale and navigation stores
 * Provides a unified API for legal guidance feature components
 */
export function useLegalGuidance() {
  const localeStore = useLocaleStore()
  const navigationStore = useGuidanceNavigationStore()

  const selectCategory = useCallback(
    (category: Category) => {
      navigationStore.selectCategory(category, localeStore.getText)
    },
    [navigationStore, localeStore.getText],
  )

  const selectQuestion = useCallback(
    (question: Question) => {
      navigationStore.selectQuestion(question, localeStore.getText)
    },
    [navigationStore, localeStore.getText],
  )

  return {
    // Locale
    locale: localeStore.locale,
    setLocale: localeStore.setLocale,
    t: localeStore.t,
    getText: localeStore.getText,

    // Navigation
    data: navigationStore.data,
    screen: navigationStore.screen,
    setScreen: navigationStore.setScreen,
    selectedCategory: navigationStore.selectedCategory,
    currentQuestions: navigationStore.currentQuestions,
    currentQuestion: navigationStore.currentQuestion,
    currentAnswer: navigationStore.currentAnswer,
    currentAttachment: navigationStore.currentAttachment,
    breadcrumbs: navigationStore.breadcrumbs,
    navigationHistory: navigationStore.navigationHistory,
    lastSelectedQuestionId: navigationStore.lastSelectedQuestionId,
    selectCategory,
    selectQuestion,
    goBack: navigationStore.goBack,
    goHome: navigationStore.goHome,
    goToCategories: navigationStore.goToCategories,
    initialize: navigationStore.initialize,
  }
}
