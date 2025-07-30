/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 允許開發環境跨域訪問
  allowedDevOrigins: [
    '192.168.50.152',
    'localhost',
    '127.0.0.1',
  ],
  // 改善圖片處理性能
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // 啟用實驗性功能
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    webpackBuildWorker: true,
    // 減少 webpack 快取序列化警告
    webpackMemoryOptimizations: true,
  },
  // Bundle 分析和優化
  compress: true,
  webpack: (config, { isServer }) => {
    // 進階 bundle 優化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        ws: false,
      };

      // 細化代碼分割策略
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 150000,
          cacheGroups: {
            // React 相關庫單獨分離
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 10,
            },
            // UI 組件庫分離
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: 'ui-vendor',
              chunks: 'all',
              priority: 9,
            },
            // 圖表庫分離
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: 'charts-vendor',
              chunks: 'all',
              priority: 8,
            },
            // Supabase 相關分離
            supabase: {
              test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
              name: 'supabase-vendor',
              chunks: 'all',
              priority: 7,
            },
            // 其他第三方庫
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 5,
              maxSize: 100000,
            },
          },
        },
      };
    }

    // Bundle 分析支援
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
