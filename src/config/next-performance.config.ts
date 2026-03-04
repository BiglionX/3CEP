/**
 * Next.js性能优化配置
 * 针对打包体积和加载性能的专项优? */

// Next.js配置对象
export const nextConfig = {
  // 启用React严格模式
  reactStrictMode: true,

  // 启用SWC压缩（更快的压缩?  swcMinify: true,

  // 图片优化配置
  images: {
    // 支持的域?    domains: [
      'localhost',
      'your-domain.com',
      'images.unsplash.com',
      'placehold.co',
    ],
    // 设备尺寸配置
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 图片尺寸配置
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小缓存时?    minimumCacheTTL: 60,
    // 启用AVIF格式支持
    formats: ['image/webp', 'image/avif'],
  },

  // 实验性特?  experimental: {
    // 启用React Server Components
    serverComponents: true,
    // 启用并发特?    concurrentFeatures: true,
    // 启用中间?    middleware: true,
    // 优化CSS
    optimizeCss: true,
    // 启用新的Next.js编译?    newNextLinkBehavior: true,
  },

  // Webpack配置优化
  webpack: (config, { dev, isServer }) => {
    // 生产环境优化
    if (!dev) {
      // 代码分割优化
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // 第三方库分组
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          // React相关?          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
            name: 'react-vendor',
            priority: 20,
            chunks: 'all',
          },
          // 工具库分?          utilities: {
            test: /[\\/]node_modules[\\/](lodash|moment|axios|classnames)[\\/]/,
            name: 'utilities',
            priority: 15,
            chunks: 'all',
          },
          // 公共代码
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            reuseExistingChunk: true,
          },
        },
        // 限制最大chunk大小
        maxSize: 244000, // 244KB
        maxInitialRequests: 10,
        maxAsyncRequests: 15,
      };

      // 启用作用域提?      config.optimization.concatenateModules = true;

      // 启用副作用优?      config.optimization.sideEffects = true;
    }

    // 服务器端配置
    if (isServer) {
      // 减少服务器端bundle大小
      config.externals = [
        ...(config.externals || []),
        // 外部化大型依?        'sharp',
        'canvas',
      ];
    }

    // 添加别名优化
    config.resolve.alias = {
      ...config.resolve.alias,
      // 优化常用库的导入路径
      '@components': '/src/components',
      '@lib': '/src/lib',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@services': '/src/services',
    };

    // 添加模块联邦支持（可选）
    /*
    config.plugins.push(
      new webpack.container.ModuleFederationPlugin({
        name: 'shell',
        remotes: {
          // 远程模块配置
        },
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
      })
    );
    */

    return config;
  },

  // 环境变量配置
  env: {
    // 启用生产环境优化
    NEXT_PUBLIC_ENABLE_PERFORMANCE_OPTIMIZATION: 'true',
    // 启用资源预加?    NEXT_PUBLIC_ENABLE_RESOURCE_PRELOAD: 'true',
    // 启用图像优化
    NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION: 'true',
  },

  // 头部配置（缓存和安全?  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // 重定向配?  async redirects() {
    return [
      // 旧路径重定向到新路径
      {
        source: '/old-path/:slug*',
        destination: '/new-path/:slug*',
        permanent: true,
      },
    ];
  },

  // 重写配置
  async rewrites() {
    return [
      // API代理重写
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // 静态资源重?      {
        source: '/assets/:path*',
        destination: '/_next/static/assets/:path*',
      },
    ];
  },

  // 自定义页面扩?  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 启用增量静态再?  revalidate: 60, // 60秒重新验?
  // 启用gzip压缩
  compress: true,

  // 启用HTTP/2支持
  httpAgentOptions: {
    keepAlive: true,
  },

  // 启用流式渲染
  experimental: {
    ...nextConfig.experimental,
    runtime: 'edge',
  },
};

// 导出默认配置
export default nextConfig;

// 性能监控中间?export function performanceMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // 记录性能指标
    console.log(
      `[PERFORMANCE] ${req.method} ${req.url} - ${statusCode} - ${duration}ms`
    );

    // 发送到监控系统
    if (process.env.PERFORMANCE_MONITORING_ENABLED) {
      // 实现性能数据上报逻辑
    }
  });

  next();
}

// 资源预加载配?export const resourcePreloadConfig = {
  // 关键资源预加?  criticalResources: [
    '/fonts/main-font.woff2',
    '/icons/sprite.svg',
    '/css/critical.css',
  ],

  // 预连接域?  preconnectDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdn.your-domain.com',
  ],

  // DNS预解?  dnsPrefetch: ['your-analytics-domain.com', 'your-cdn-domain.com'],
};

// 打包分析配置
export const bundleAnalysisConfig = {
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html',
};
