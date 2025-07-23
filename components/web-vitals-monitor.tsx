'use client'

import { useEffect } from 'react'

// 宣告全域類型
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// 簡化的性能監控組件
export function WebVitalsMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // 基本性能監控
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`⚡ Performance entry:`, {
            名稱: entry.name,
            類型: entry.entryType,
            持續時間: `${entry.duration?.toFixed(2)}ms`,
            開始時間: `${entry.startTime?.toFixed(2)}ms`
          })
        }
      })

      // 監控導航和資源載入
      try {
        observer.observe({ entryTypes: ['navigation', 'resource'] })
      } catch (error) {
        console.warn('Performance Observer 不支援:', error)
      }

      return () => observer.disconnect()
    }
  }, [])

  return null // 這是一個純監控組件，不渲染任何 UI
}

// 性能建議組件（僅在開發環境顯示）
export function PerformanceInsights() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        console.log(`
🎯 性能優化建議：

1. 圖片優化：
   ✅ 使用 Next.js Image 組件
   ✅ 啟用 WebP/AVIF 格式
   ✅ 適當的 loading="lazy"

2. JavaScript 優化：
   ✅ 使用動態導入分割代碼
   ✅ 使用 React.memo 避免不必要的重渲染
   ✅ 使用 useCallback 和 useMemo

3. CSS 優化：
   ✅ 關鍵 CSS 內聯
   ✅ 使用 Tailwind CSS 的 purge 功能
   ✅ 避免渲染阻塞樣式

4. 網路優化：
   ✅ 啟用 gzip/brotli 壓縮
   ✅ 使用 CDN
   ✅ 資源預載入

5. 監控建議：
   ✅ 設置 Web Vitals 監控
   ✅ 使用 Lighthouse 定期測試
   ✅ 監控 bundle 大小變化
        `)
      }, 3000)
    }
  }, [])

  return null
}
