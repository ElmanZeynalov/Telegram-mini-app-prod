"use client"

import type React from "react"

interface CenteredContentLayoutProps {
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Simple layout for screens with centered content
 * Used for: Home screen, Welcome screens, etc.
 */
export function CenteredContentLayout({ children, footer }: CenteredContentLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Centered content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {children}
      </main>

      {/* Optional footer */}
      {footer && (
        <footer className="flex-shrink-0 pb-8 pt-4 px-6">
          {footer}
        </footer>
      )}
    </div>
  )
}
