"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, Heading2, Code, HelpCircle, Paperclip, Smile, Link } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import dynamic from "next/dynamic"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  compact?: boolean
  onSubmit?: () => void
  rows?: number
  onFileSelect?: (file: File) => void
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  compact = false,
  onSubmit,
  rows = 4,
  onFileSelect,
}: RichTextEditorProps) {
  const [showHelp, setShowHelp] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.selectionStart = start + before.length
      textarea.selectionEnd = start + before.length + selectedText.length
      textarea.focus()
    }, 0)
  }

  const insertEmoji = (emojiData: any) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const emoji = emojiData.emoji
    const newText = value.substring(0, start) + emoji + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.selectionStart = start + emoji.length
      textarea.selectionEnd = start + emoji.length
      textarea.focus()
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onSubmit && e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      onSubmit()
      return
    }

    if (e.key === "Enter") {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const value = textarea.value
      // Get current line up to cursor
      const lastNewLine = value.lastIndexOf("\n", start - 1)
      const currentLine = value.substring(lastNewLine + 1, start)

      // Check for list patterns: "- ", "* ", "1. "
      const match = currentLine.match(/^(\s*)([-*]|\d+\.)\s/)
      if (match) {
        if (currentLine.trim() === match[0].trim()) {
          // If line is empty list item (just marker), remove it
          e.preventDefault()
          const newLineStart = lastNewLine + 1
          const newValue = value.substring(0, newLineStart) + value.substring(start)
          onChange(newValue)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = newLineStart
          }, 0)
        } else {
          // Continue list
          e.preventDefault()
          const insertion = "\n" + match[0]
          const newValue = value.substring(0, start) + insertion + value.substring(start)
          onChange(newValue)
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + insertion.length
          }, 0)
        }
      }
    }
  }

  if (compact) {
    return (
      <div className="space-y-1">
        <TooltipProvider>
          <div className="flex items-center gap-0.5 bg-input/50 px-2 py-1 rounded-t-md border border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => insertMarkdown("**", "**")}
                  className="h-7 w-7 p-0"
                  type="button"
                >
                  <Bold className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Bold (**text**)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => insertMarkdown("*", "*")}
                  className="h-7 w-7 p-0"
                  type="button"
                >
                  <Italic className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Italic (*text*)</p>
              </TooltipContent>
            </Tooltip>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      type="button"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Insert Emoji</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="p-0 border-none w-auto" align="start">
                <EmojiPicker onEmojiClick={insertEmoji} width={300} height={400} />
              </PopoverContent>
            </Popover>

            <div className="flex-1" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Ctrl+Enter to submit</span>
          </div>
        </TooltipProvider>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Enter text with markdown formatting..."}
          rows={rows}
          className="w-full px-3 py-2 bg-input border border-t-0 border-border rounded-b-md text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>
    )
  }

  // Full editor for answers
  return (
    <div className="space-y-2">
      <TooltipProvider>
        <div className="flex gap-1 flex-wrap bg-input/50 p-2 rounded-t-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("**", "**")}
                className="h-8 w-8 p-0"
                type="button"
              >
                <Bold className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("*", "*")}
                className="h-8 w-8 p-0"
                type="button"
              >
                <Italic className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("## ", "")}
                className="h-8 w-8 p-0"
                type="button"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Heading</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const textarea = textareaRef.current
                  if (textarea) {
                    const start = textarea.selectionStart
                    const value = textarea.value
                    // If not at start of line, add newline
                    const prefix = (start > 0 && value[start - 1] !== "\n") ? "\n- " : "- "
                    insertMarkdown(prefix)
                  }
                }}
                className="h-8 w-8 p-0"
                type="button"
              >
                <List className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Bullet List</p>
            </TooltipContent>
          </Tooltip>

          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    type="button"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Insert Emoji</p>
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="p-0 border-none w-auto" align="start">
              <EmojiPicker onEmojiClick={insertEmoji} width={300} height={400} />
            </PopoverContent>
          </Popover>


          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("`", "`")}
                className="h-8 w-8 p-0"
                type="button"
              >
                <Code className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Inline Code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => insertMarkdown("[", "](url)")}
                className="h-8 w-8 p-0"
                type="button"
              >
                <Link className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Add Link</p>
            </TooltipContent>
          </Tooltip>

          {onFileSelect && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                  type="button"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Attach File</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs h-8 gap-1"
            type="button"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHelp ? "Hide" : "Help"}
          </Button>
        </div>
      </TooltipProvider>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && onFileSelect) {
            onFileSelect(file)
          }
          // Reset value so same file can be selected again
          if (e.target) e.target.value = ""
        }}
      />

      {
        showHelp && (
          <div className="bg-input/30 p-3 rounded-md text-xs text-muted-foreground border border-border/50 mb-2">
            <div className="font-semibold mb-2 text-foreground">Markdown Syntax:</div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <code className="bg-input px-1 rounded">**bold**</code> for bold text
              </div>
              <div>
                <code className="bg-input px-1 rounded">*italic*</code> for italic
              </div>
              <div>
                <code className="bg-input px-1 rounded">## Heading</code> for headings
              </div>
              <div>
                <code className="bg-input px-1 rounded">- Item</code> for bullet lists
              </div>

              <div>
                <code className="bg-input px-1 rounded">`code`</code> for inline code
              </div>
              <div>
                <code className="bg-input px-1 rounded">[text](url)</code> for links
              </div>
            </div>
          </div>
        )
      }

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder || "Enter your answer here. Use markdown for formatting (bold, italic, links, lists, etc.)"
        }
        className="w-full h-32 px-3 py-2 bg-input border border-t-0 border-border rounded-b-md text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div >
  )
}
