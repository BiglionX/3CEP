/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**', // 允许所有 HTTPS 图片 (生产环境建议限制具体域名)
      },
    ],
    formats: ['image/webp', 'image/avif'], // 现代格式优化
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_N8N_URL: process.env.NEXT_PUBLIC_N8N_URL,
    N8N_API_TOKEN: process.env.N8N_API_TOKEN,
  },

  // 性能优化配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 生产环境移除 console
  },

  // Chunk 加载优化配置
  webpack: (config, { isServer, dev }) => {
    // 为 SSR 环境添加 Node.js 模块的处理
    if (!isServer) {
      // 为客户端添加 polyfill
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }

    // 代码分割优化
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // 分离供应商包
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          // 分离常用库
          common: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // 分离框架包
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 50,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // 增加超时配置
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
