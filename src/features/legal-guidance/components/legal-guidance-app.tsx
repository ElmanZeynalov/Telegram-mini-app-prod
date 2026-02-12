"use client"

import { useLegalGuidance } from "../hooks/use-legal-guidance"
import { HomeScreen } from "./screens/home-screen"
import { CategoriesScreen } from "./screens/categories-screen"
import { QuestionsScreen } from "./screens/questions-screen"
import { AnswerScreen } from "./screens/answer-screen"
import { AnimatePresence, motion } from "framer-motion"
import { useTelegramBackButton, useTelegramHaptic } from "@/features/telegram"
import { useAnalytics } from "@/features/analytics/context/analytics-context"

import { useEffect } from "react"

export function LegalGuidanceApp() {
  const { screen, goBack, initialize, selectedCategory, currentQuestion, getText, locale } = useLegalGuidance()
  const { selectionChanged } = useTelegramHaptic()
  const { track } = useAnalytics()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Track screen changes
  useEffect(() => {
    // Only track if screen/content actually changes to avoid duplicates
    if (screen === 'categories') {
      track('view_categories', { language: locale })
    } else if (screen === 'home') {
      track('view_home', { language: locale })
    } else if (screen === 'questions') {
      if (currentQuestion) {
        // Viewing sub-questions of a parent question
        track('view_question', {
          id: currentQuestion.id,
          question: getText(currentQuestion.question),
          isParent: true, // Mark as parent/intermediate view
          language: locale
        })
      } else if (selectedCategory) {
        // Viewing root questions of a category
        track('view_category', {
          id: selectedCategory.id,
          name: selectedCategory.name,
          language: locale
        })
      }
    } else if (screen === 'answer' && currentQuestion) {
      track('view_question', {
        id: currentQuestion.id,
        question: getText(currentQuestion.question),
        isAnswer: true, // Mark as data/answer view
        language: locale
      })
    }
  }, [screen, selectedCategory, currentQuestion, track, getText, locale])

  // Show back button on all screens except home
  const showBackButton = screen !== "home"

  // Handle Telegram back button
  useTelegramBackButton({
    visible: showBackButton,
    onBack: () => {
      selectionChanged() // Haptic feedback on back
      goBack()
    },
  })

  return (
    <div className="flex flex-col h-dvh bg-background">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <HomeScreen />
          </motion.div>
        )}
        {screen === "categories" && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <CategoriesScreen />
          </motion.div>
        )}
        {screen === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <QuestionsScreen />
          </motion.div>
        )}
        {screen === "answer" && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <AnswerScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
