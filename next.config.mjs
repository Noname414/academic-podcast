/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
  },
  // 允許開發環境跨域訪問
  allowedDevOrigins: [
    '192.168.50.152',
    'localhost',
    '127.0.0.1',
  ],
  // 啟用實驗性功能
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    webpackBuildWorker: true,
  },
  // Bundle 分析
  compress: true,
  webpack: (config, { isServer }) => {
    // 處理 WebSocket 相關的依賴問題
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
    }
    return config;
  },
};

export default nextConfig;
