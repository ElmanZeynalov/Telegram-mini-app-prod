"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { useTelegramHaptic } from "@/features/telegram"
import { useAnalytics } from "@/features/analytics/context/analytics-context"

type FeedbackState = "idle" | "positive" | "negative" | "submitted"

interface AnswerFeedbackProps {
  questionId?: string
  questionText?: string
  answerText?: string
}

export function AnswerFeedback({ questionId, questionText, answerText }: AnswerFeedbackProps) {
  const { t, locale } = useLegalGuidance()
  const haptic = useTelegramHaptic()
  const { track } = useAnalytics()
  const [state, setState] = useState<FeedbackState>("idle")

  const handlePositive = () => {
    try { haptic.impactOccurred("medium") } catch { }

    track("feedback_yes", {
      questionId,
      questionText: questionText?.substring(0, 100), // Truncate if too long
      answerText: answerText?.substring(0, 200),
      language: locale || 'az'
    })

    setState("positive")
    setTimeout(() => setState("submitted"), 1200)
  }

  const handleNegative = () => {
    try { haptic.impactOccurred("light") } catch { }

    track("feedback_no", {
      questionId,
      questionText: questionText?.substring(0, 100),
      answerText: answerText?.substring(0, 200),
      language: locale || 'az'
    })

    setState("negative")
    setTimeout(() => setState("submitted"), 1200)
  }

  // Already submitted - thank you with animation
  if (state === "submitted") {
    return (
      <div className="mt-8 py-4 flex items-center justify-center">
        <div className="flex items-center gap-2 text-primary/80 animate-smooth-in">
          <Sparkles className="w-4 h-4 animate-sparkle" />
          <span className="text-sm font-medium">{t("feedbackThanks")}</span>
        </div>
      </div>
    )
  }

  // Positive feedback - celebrating animation
  if (state === "positive") {
    return (
      <div className="mt-8 py-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 text-primary animate-pop-in">
          <ThumbsUp className="w-5 h-5 animate-thumb-up" />
          <span className="text-sm font-semibold">{t("feedbackYes")}!</span>
        </div>
      </div>
    )
  }

  // Negative feedback - similar to positive but with different styling
  if (state === "negative") {
    return (
      <div className="mt-8 py-4 flex items-center justify-center">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-muted/50 text-muted-foreground animate-pop-in">
          <ThumbsDown className="w-5 h-5" />
          <span className="text-sm font-medium">{t("feedbackNo")}</span>
        </div>
      </div>
    )
  }

  // Initial state - subtle card highlight
  return (
    <div className="mt-8 py-5 px-4 rounded-2xl bg-muted/20 border border-border/20 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{t("feedbackQuestion")}</span>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePositive}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
                       text-muted-foreground/70 bg-muted/30
                       hover:text-primary hover:bg-primary/10 
                       active:scale-90 transition-all duration-200 ease-out"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t("feedbackYes")}</span>
          </button>

          <button
            onClick={handleNegative}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full
                       text-muted-foreground/70 bg-muted/30
                       hover:text-orange-400 hover:bg-orange-500/10 
                       active:scale-90 transition-all duration-200 ease-out"
          >
            <ThumbsDown className="w-4 h-4" />
            <span className="text-xs font-medium">{t("feedbackNo")}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

