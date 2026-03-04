/**
 * 图片优化配置和Next.js集成
 * 配置图片压缩、WebP转换和响应式图片处理
 */

// 图片优化配置
export const imageOptimizationConfig = {
  // 基础配置
  quality: {
    jpeg: 80,
    webp: 85,
    avif: 85,
    png: 90,
  },

  // 尺寸限制
  sizing: {
    maxWidth: 1920,
    maxHeight: 1080,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 格式支持
  formats: {
    // 优先级顺?    preferred: ['image/webp', 'image/avif', 'image/jpeg'],
    fallback: 'image/jpeg',
  },

  // 响应式配?  responsive: {
    enabled: true,
    breakpoints: [320, 480, 768, 1024, 1280, 1920],
    generateSrcSet: true,
    generateSizes: true,
  },

  // 缓存配置
  caching: {
    enabled: true,
    directory: './.next/cache/images',
    ttl: 86400000, // 24小时
  },

  // 域名白名?  domains: [
    'localhost',
    'your-domain.com',
    'images.unsplash.com',
    'placehold.co',
  ],

  // 最小缓存时?  minimumCacheTTL: 60,
};

// Next.js图片配置
export const nextImageConfig = {
  // 启用图片优化
  images: {
    // 支持的域?    domains: imageOptimizationConfig.domains,

    // 设备尺寸
    deviceSizes: imageOptimizationConfig.sizing.deviceSizes,

    // 图片尺寸
    imageSizes: imageOptimizationConfig.sizing.imageSizes,

    // 格式支持
    formats: imageOptimizationConfig.formats.preferred,

    // 最小缓存时?    minimumCacheTTL: imageOptimizationConfig.caching.ttl,

    // 启用远程图片优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Webpack插件模拟
class ImageMinimizerPlugin {
  static imageminMinify: any;

  constructor(options: any) {
    // 模拟插件配置
  }
}

// webpack图片优化配置
export const webpackImageConfig = {
  module: {
    rules: [
      // 图片文件处理
      {
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: imageOptimizationConfig.quality.jpeg,
              },
              optipng: {
                enabled: true,
                optimizationLevel: 3,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: imageOptimizationConfig.quality.webp,
              },
              avif: {
                quality: imageOptimizationConfig.quality.avif,
              },
            },
          },
        ],
      },
    ],
  },

  // 插件配置
  plugins: [
    // 图片压缩插件
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            ['svgo', { plugins: [{ name: 'preset-default' }] }],
          ],
        },
      },
    }),
  ],
};
export const responsiveImageConfig = {
  // 断点配置
  breakpoints: imageOptimizationConfig.responsive.breakpoints,

  // 容器查询
  containerQueries: {
    xs: '(max-width: 480px)',
    sm: '(max-width: 768px)',
    md: '(max-width: 1024px)',
    lg: '(max-width: 1280px)',
    xl: '(min-width: 1281px)',
  },

  // 图片密度
  densities: [1, 2], // 1x �?2x

  // 加载策略
  loading: {
    eager: 'eager', // 立即加载
    lazy: 'lazy', // 懒加?  },
};

// 图片优化服务?export class ImageOptimizationService {
  private config = imageOptimizationConfig;

  /**
   * 优化单张图片
   */
  async optimizeImage(
    imagePath: string,
    options: {
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      width?: number;
      height?: number;
    } = {}
  ) {
    console.log(`🖼�?优化图片: ${imagePath}`);

    // 模拟优化过程
    const result = {
      originalPath: imagePath,
      optimizedPath: this.generateOptimizedPath(imagePath, options.format),
      originalSize: this.getRandomSize(100, 2000), // KB
      optimizedSize: 0,
      format: options?.toUpperCase() || 'WEBP',
      width: options.width || 800,
      height: options.height || 600,
      compressionRatio: 0,
    };

    // 计算压缩?    const qualityFactor = (options.quality || 80) / 100;
    const formatFactor = this.getFormatFactor(result.format);
    result.optimizedSize = Math.round(
      result.originalSize * (1 - qualityFactor * formatFactor)
    );
    result.compressionRatio = Math.round(
      (1 - result.optimizedSize / result.originalSize) * 100
    );

    console.log(`�?优化完成:`);
    console.log(`   原始大小: ${result.originalSize}KB`);
    console.log(`   优化后大? ${result.optimizedSize}KB`);
    console.log(`   压缩? ${result.compressionRatio}%`);

    return result;
  }

  /**
   * 批量优化图片
   */
  async optimizeBatch(imagePaths: string[], concurrency: number = 4) {
    console.log(`🚀 批量优化 ${imagePaths.length} 张图?..`);

    const results = [];
    const chunks = this.chunkArray(imagePaths, concurrency);

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(path =>
        this.optimizeImage(path, { format: 'webp' })
      );
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0);
    const avgCompression = Math.round(
      results.reduce((sum, r) => sum + r.compressionRatio, 0) / results.length
    );

    console.log(`📊 批量优化统计:`);
    console.log(`   总原始大? ${totalOriginal}KB`);
    console.log(`   总优化大? ${totalOptimized}KB`);
    console.log(`   平均压缩? ${avgCompression}%`);
    console.log(
      `   节省空间: ${totalOriginal - totalOptimized}KB (${Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100)}%)`
    );

    return results;
  }

  /**
   * 生成响应式图片配?   */
  generateResponsiveConfig(basePath: string) {
    const config = {
      srcSet: [] as string[],
      sizes: '' as string,
      sources: [] as any[],
    };

    // 为每个断点生成配?    this.config.responsive.breakpoints.forEach(breakpoint => {
      const webpPath = basePath.replace(/\.[^.]+$/, `@${breakpoint}w.webp`);
      const jpegPath = basePath.replace(/\.[^.]+$/, `@${breakpoint}w.jpg`);

      config.srcSet.push(`${webpPath} ${breakpoint}w`);
      config.sources.push({
        srcSet: `${webpPath} ${breakpoint}w`,
        type: 'image/webp',
        media: `(max-width: ${breakpoint}px)`,
      });
    });

    // 生成sizes属?    config.sizes = this.config.responsive.breakpoints
      .map((bp, index, arr) => {
        if (index === arr.length - 1) {
          return `(min-width: ${bp}px) ${bp}px`;
        }
        return `(max-width: ${bp - 1}px) ${bp}px`;
      })
      .join(', ');

    return config;
  }

  // 私有辅助方法
  private generateOptimizedPath(originalPath: string, format?: string): string {
    const ext = format || 'webp';
    return originalPath.replace(/\.[^.]+$/, `.${ext}`);
  }

  private getRandomSize(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private getFormatFactor(format: string): number {
    const factors: Record<string, number> = {
      WEBP: 0.75,
      AVIF: 0.8,
      JPEG: 0.7,
      PNG: 0.6,
    };
    return factors[format] || 0.7;
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// 导出实例
export const imageService = new ImageOptimizationService();

// 导出配置
export default {
  imageOptimizationConfig,
  nextImageConfig,
  webpackImageConfig,
  responsiveImageConfig,
};
