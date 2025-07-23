import { useEffect, useRef } from 'react'

// 性能監控 Hook
export function usePerformanceMonitor(componentName: string) {
  const renderStart = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    renderStart.current = performance.now()
    renderCount.current += 1
  })

  useEffect(() => {
    const renderEnd = performance.now()
    const renderTime = renderEnd - renderStart.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 ${componentName} 渲染性能:`, {
        渲染時間: `${renderTime.toFixed(2)}ms`,
        渲染次數: renderCount.current,
        平均渲染時間: `${(renderTime / renderCount.current).toFixed(2)}ms`
      })
    }
  })

  return { renderCount: renderCount.current }
}

// 組件載入時間監控
export function useLoadTime(componentName: string) {
  useEffect(() => {
    const loadStart = performance.now()
    
    return () => {
      const loadEnd = performance.now()
      const loadTime = loadEnd - loadStart
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${componentName} 載入時間: ${loadTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
}

// 記憶體使用監控
export function useMemoryMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory
        if (memory) {
          console.log('🧠 記憶體使用情況:', {
            使用中: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            總計: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            限制: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
          })
        }
      }

      const interval = setInterval(checkMemory, 10000) // 每10秒檢查一次
      return () => clearInterval(interval)
    }
  }, [])
}

// Bundle 大小分析
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      
      console.log('📦 Bundle 分析:')
      console.log('JavaScript 檔案:', scripts.length)
      console.log('CSS 檔案:', styles.length)
      
      // 計算總體資源大小（這需要 Resource Timing API）
      if ('getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource')
        const totalSize = resources.reduce((acc, resource: any) => {
          return acc + (resource.transferSize || 0)
        }, 0)
        
        console.log(`總資源大小: ${(totalSize / 1024).toFixed(2)}KB`)
      }
    })
  }
}
