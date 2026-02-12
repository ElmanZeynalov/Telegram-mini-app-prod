"use client"

import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { NavigableContentLayout } from "../layout/navigable-content-layout"
import { HelpCircle, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useTelegram } from "@/features/telegram/hooks/use-telegram"
import ReactMarkdown from "react-markdown"
import { AnswerFeedback } from "../feedback/answer-feedback"
import { Button } from "@/components/ui/button"

export function QuestionsScreen() {
  const { currentQuestions, currentQuestion, selectedCategory, selectQuestion, getText, t, navigationHistory, locale, lastSelectedQuestionId } =
    useLegalGuidance()
  const [searchQuery, setSearchQuery] = useState("")

  const isNested = navigationHistory.length > 0
  const { webApp } = useTelegram()

  // Scroll restoration
  useEffect(() => {
    if (lastSelectedQuestionId && !searchQuery) {
      setTimeout(() => {
        const element = document.getElementById(`question-${lastSelectedQuestionId}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          // Optional: Highlight effect
          element.classList.add("ring-2", "ring-primary")
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary")
          }, 1500)
        }
      }, 100) // Small delay to ensure rendering
    }
  }, [lastSelectedQuestionId, searchQuery])

  const filteredQuestions = currentQuestions.filter((question) =>
    getText(question.question).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const parentAnswer = isNested && currentQuestion?.answer ? getText(currentQuestion.answer) : null

  const parentAttachment = isNested && currentQuestion?.attachments ? (() => {
    // We already have locale from the top-level hook
    const attachments = currentQuestion.attachments
    if (!attachments) return null
    return attachments[locale] || attachments.az || null
  })() : null

  return (
    <NavigableContentLayout>
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          {selectedCategory && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {getText(selectedCategory.name)}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {isNested && currentQuestion?.question ? getText(currentQuestion.question) : t("questions")}
          </h1>
          {/* Show parent answer description/text only if NO answer content is displayed? 
              The original code showed "Select a question" here. 
              We should probably keep "Select a question" but maybe below the answer? 
              Or replace it? 
          */}
          {!parentAnswer && <p className="text-sm text-muted-foreground">{t("selectQuestion")}</p>}
        </div>

        {/* Parent Question Answer Section */}
        {parentAnswer && (
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-4 space-y-3">
            <div className="prose-answer text-card-foreground text-sm">
              <ReactMarkdown
                components={{
                  a: ({ node, href, children, ...props }) => {
                    const handleClick = (e: React.MouseEvent) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (href) {
                        if (webApp) {
                          webApp.openLink(href, { try_instant_view: true })
                        } else {
                          window.open(href, "_blank", "noreferrer")
                        }
                      }
                    }
                    return (
                      <span
                        onClick={handleClick}
                        className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-words cursor-pointer"
                        {...props}
                      >
                        {children}
                      </span>
                    )
                  }
                }}
              >
                {parentAnswer}
              </ReactMarkdown>
            </div>

            {/* Attachment for Parent Question */}
            {parentAttachment && (
              <div className="pt-3 border-t border-border/50">
                {/\.(jpg|jpeg|png|gif|webp)$/i.test(parentAttachment.name) ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                      <img
                        src={parentAttachment.url}
                        alt={parentAttachment.name}
                        className="w-full h-auto max-h-[300px] object-contain"
                        loading="lazy"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-3 h-auto py-2.5 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
                      onClick={() => {
                        if (webApp) {
                          webApp.openLink(parentAttachment.url)
                        } else {
                          window.open(parentAttachment.url, "_blank")
                        }
                      }}
                    >
                      <div className="bg-background p-1.5 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">{parentAttachment.name}</p>
                        <p className="text-xs text-muted-foreground">{t("downloadFile") || "Yüklə"}</p>
                      </div>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full justify-start gap-3 h-auto py-2.5 px-3 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
                    onClick={() => {
                      if (webApp) {
                        webApp.openLink(parentAttachment.url)
                      } else {
                        window.open(parentAttachment.url, "_blank")
                      }
                    }}
                  >
                    <div className="bg-background p-1.5 rounded-lg shadow-sm">
                      <span className="text-lg">📎</span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{parentAttachment.name}</p>
                      <p className="text-xs text-muted-foreground">{t("downloadFile")}</p>
                    </div>
                  </Button>
                )}
              </div>
            )}

            {/* Feedback section for Parent Question */}
            <AnswerFeedback
              questionId={currentQuestion?.id}
              questionText={currentQuestion?.question ? getText(currentQuestion.question) : undefined}
            />
          </div>
        )}

        {/* Separator / Sub-questions Header if needed */}
        {parentAnswer && (
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{t("relatedQuestions") || "Suallar"}</span>
            <div className="h-px bg-border flex-1" />
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder={t("searchQuestions")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>

        <div className="space-y-2.5">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground">{searchQuery ? t("noSearchResults") : t("noQuestions")}</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <button
                key={question.id}
                id={`question-${question.id}`}
                onClick={() => selectQuestion(question)}
                className="w-full p-4 text-left bg-card hover:bg-accent/50 rounded-xl border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex gap-3.5 items-center">
                  <span className="flex-1 text-foreground leading-relaxed">{getText(question.question)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </NavigableContentLayout>
  )
}
