import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/providers/theme-provider"
import { TelegramProvider } from "@/features/telegram"
import { TelegramThemeSync } from "@/features/telegram/components/telegram-theme-sync"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin", "cyrillic", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Legal Help Guide",
  description: "Simple answers to your legal questions",
  generator: "v0.app",
  // Telegram Mini App specific meta
  applicationName: "Legal Help Guide",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Legal Help",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Use viewport-fit=cover for proper safe area support
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Telegram WebApp SDK - loaded synchronously for immediate access */}
        <script src="https://telegram.org/js/telegram-web-app.js" />
        {/* Immediately expand to fullscreen before React hydrates */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initTelegram() {
                  try {
                    var tg = window.Telegram && window.Telegram.WebApp;
                    if (!tg) return false;
                    
                    // Signal app is ready first
                    if (tg.ready) tg.ready();
                    
                    // Expand to full height
                    if (tg.expand) tg.expand();
                    
                    // Request fullscreen mode (Bot API 8.0+)
                    if (typeof tg.requestFullscreen === 'function') {
                      // Check version if possible, or try catch wrapper
                      try {
                          tg.requestFullscreen();
                      } catch (e) {

                      }
                    }
                    
                    // Disable vertical swipes to prevent accidental close
                    if (typeof tg.disableVerticalSwipes === 'function') {
                      tg.disableVerticalSwipes();
                    }
                    
                    // Also try via postEvent for older clients
                    if (tg.postEvent) {
                      tg.postEvent('web_app_expand');
                      // Only request fullscreen if explicitly supported/desired, otherwise skip to avoid version errors
                      // tg.postEvent('web_app_request_fullscreen'); 
                    }
                    
                    return true;
                  } catch(e) { 
                    console.warn('TG init error:', e); 
                    return false;
                  }
                }
                
                // Try immediately
                if (!initTelegram()) {
                  // Retry after a short delay if SDK not ready
                  setTimeout(initTelegram, 0);
                  setTimeout(initTelegram, 100);
                  setTimeout(initTelegram, 500);
                }
                
                // Also try on DOMContentLoaded
                document.addEventListener('DOMContentLoaded', initTelegram);
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased min-h-dvh tg-notification-container`}
      >
        <TelegramProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TelegramThemeSync />
            {children}
          </ThemeProvider>
        </TelegramProvider>
        <Toaster />
      </body>
    </html>
  )
}
