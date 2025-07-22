/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove build error ignoring for better code quality
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true,
  },
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
