// 性能優化配置
export const PERFORMANCE_CONFIG = {
  // 圖片優化設定
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },

  // 字型優化設定
  fonts: {
    preload: true,
    display: 'swap' as const,
    fallback: ['system-ui', 'arial', 'sans-serif'],
  },

  // Bundle 分割設定
  bundleSplitting: {
    chunks: 'all' as const,
    minSize: 20000,
    maxSize: 244000,
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        enforce: true,
      },
    },
  },

  // 性能預算
  budgets: {
    maxJSBundleSize: 200, // KB
    maxCSSBundleSize: 50, // KB
    maxImageSize: 100, // KB
    maxInitialLoadTime: 3000, // ms
  },

  // 快取策略
  caching: {
    staticAssets: '1y', // 靜態資源快取一年
    dynamicContent: '1d', // 動態內容快取一天
    apiResponses: '5m', // API 回應快取5分鐘
  },

  // 效能監控設定
  monitoring: {
    enableWebVitals: true,
    enablePerformanceAPI: true,
    enableBundleAnalysis: process.env.NODE_ENV === 'development',
    sampleRate: 0.1, // 10% 取樣率
  },
}

// 效能最佳化建議
export const PERFORMANCE_RECOMMENDATIONS = {
  // 關鍵渲染路徑優化
  criticalRenderingPath: [
    '內聯關鍵 CSS',
    '延遲載入非關鍵資源',
    '使用 rel="preload" 預載入關鍵資源',
    '最小化渲染阻塞資源',
  ],

  // JavaScript 優化
  javascriptOptimization: [
    '使用動態 import() 進行代碼分割',
    '實施 React.memo 和 useMemo',
    '避免不必要的重新渲染',
    '使用 Web Workers 處理重計算',
  ],

  // 資源優化
  resourceOptimization: [
    '壓縮圖片並使用現代格式 (WebP, AVIF)',
    '啟用 gzip/brotli 壓縮',
    '使用 CDN 分發靜態資源',
    '實施適當的快取策略',
  ],

  // 載入策略
  loadingStrategy: [
    '首屏內容優先載入',
    '懶載入非關鍵圖片和組件',
    '預載入可能需要的資源',
    '使用 Service Worker 實現離線支援',
  ],
}
