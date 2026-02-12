"use client"

import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { NavigableContentLayout } from "../layout/navigable-content-layout"
import { Button } from "@/components/ui/button"
import { FileQuestion, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { AnswerFeedback } from "../feedback/answer-feedback"

import { useTelegram } from "@/features/telegram/hooks/use-telegram"
import { processEmojiChildren } from "../../utils/emoji-utils"

export function AnswerScreen() {
  const { currentAnswer, currentAttachment, breadcrumbs, goToCategories, t, selectedCategory, getText } = useLegalGuidance()
  const { webApp } = useTelegram()

  const questionLabel = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ""

  const footer = (
    <Button
      onClick={goToCategories}
      className="w-full h-14 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 gap-2"
      size="lg"
    >
      <RotateCcw className="w-4 h-4" />
      {t("askAnotherQuestion")}
    </Button>
  )

  return (
    <NavigableContentLayout footer={footer}>
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          {selectedCategory && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {getText(selectedCategory.name)}
            </p>
          )}
          <h1 className="text-xl font-semibold text-foreground tracking-tight leading-snug">{questionLabel}</h1>
          <p className="text-sm text-muted-foreground">{t("answer")}</p>
        </div>

        {currentAnswer ? (
          <>
            {/* Answer card */}
            <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
              <div className="prose-answer text-card-foreground">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="leading-relaxed mb-4 last:mb-0">{processEmojiChildren(children)}</p>,
                    li: ({ children }) => <li>{processEmojiChildren(children)}</li>,
                    h1: ({ children }) => <h1>{processEmojiChildren(children)}</h1>,
                    h2: ({ children }) => <h2>{processEmojiChildren(children)}</h2>,
                    h3: ({ children }) => <h3>{processEmojiChildren(children)}</h3>,
                    a: ({ node, href, children, ...props }) => {
                      const handleClick = (e: React.MouseEvent) => {
                        e.preventDefault()
                        e.stopPropagation()

                        if (href) {
                          if (webApp) {
                            webApp.openLink(href, { try_instant_view: true })
                          } else {
                            // Fallback for browser testing
                            window.open(href, "_blank", "noreferrer")
                          }
                        }
                      }

                      // We render a span instead of 'a' to guarantee no default browser behavior
                      // But style it exactly like a link
                      return (
                        <span
                          onClick={handleClick}
                          className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-words cursor-pointer"
                          {...props}
                        >
                          {processEmojiChildren(children)}
                        </span>
                      )
                    }
                  }}
                >
                  {currentAnswer}
                </ReactMarkdown>
              </div>

              {/* Attachment Section */}
              {currentAttachment && (
                <div className="pt-3 border-t border-border/50">
                  {/* Image Preview */}
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(currentAttachment.name) ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                        <img
                          src={currentAttachment.url}
                          alt={currentAttachment.name}
                          className="w-full h-auto max-h-[400px] object-contain"
                          loading="lazy"
                        />
                      </div>
                      {/* Optional: Keep download button or small link for full size */}
                      {/* Download Button for Image */}
                      <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 h-auto py-3 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
                        onClick={() => {
                          if (webApp) {
                            webApp.openLink(currentAttachment.url)
                          } else {
                            window.open(currentAttachment.url, "_blank")
                          }
                        }}
                      >
                        <div className="bg-background p-2 rounded-lg shadow-sm">
                          {/* Download Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-foreground">{currentAttachment.name}</p>
                          <p className="text-xs text-muted-foreground">{t("downloadFile") || "Yüklə"}</p>
                        </div>
                      </Button>
                    </div>
                  ) : (
                    /* Default Download Button for non-images */
                    <Button
                      variant="secondary"
                      className="w-full justify-start gap-3 h-auto py-3 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all"
                      onClick={() => {
                        if (webApp) {
                          webApp.openLink(currentAttachment.url)
                        } else {
                          window.open(currentAttachment.url, "_blank")
                        }
                      }}
                    >
                      <div className="bg-background p-2 rounded-lg shadow-sm">
                        <span className="text-xl">📎</span>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-foreground">{currentAttachment.name}</p>
                        <p className="text-xs text-muted-foreground">{t("downloadFile")}</p>
                      </div>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Feedback section - appears after the answer */}
            <AnswerFeedback
              questionId={breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : undefined}
              questionText={questionLabel}
              answerText={currentAnswer}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground">{t("noAnswer")}</p>
          </div>
        )}
      </div>
    </NavigableContentLayout>
  )
}
