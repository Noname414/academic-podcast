import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"
import { WebVitalsMonitor, PerformanceInsights } from "@/components/web-vitals-monitor"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // 性能優化：字型交換策略
  preload: true,
})

export const metadata: Metadata = {
  title: "AI 論文播客 - 自動化學術播客平台",
  description: "自動化學術播客平台，為你摘要並朗讀最前沿的 AI 論文",
  generator: "v0.dev",
  keywords: "AI, 論文, 播客, 學術, 人工智慧, 研究",
  authors: [{ name: "AI 論文播客團隊" }],
  openGraph: {
    title: "AI 論文播客 - 自動化學術播客平台",
    description: "自動化學術播客平台，為你摘要並朗讀最前沿的 AI 論文",
    type: "website",
    locale: "zh_TW",
  },
  robots: {
    index: true,
    follow: true,
  },
}

// 分離 viewport 配置
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        {/* 性能優化：預載入關鍵資源 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {/* 性能監控組件 */}
            <WebVitalsMonitor />
            <PerformanceInsights />
            
            <Header />
            {children}
            <footer className="border-t py-6 md:py-8">
              <div className="container flex flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">© 2025 AI 論文播客. 保留所有權利.</p>
              </div>
            </footer>
            <Toaster />
            <SonnerToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
