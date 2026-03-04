// 图片和静态资源优化器
// 实现图片压缩、懒加载和CDN优化方案

interface ImageOptimizationConfig {
  // 图片优化配置
  quality: number; // JPEG质量 1-100
  maxWidth: number; // 最大宽?
  maxHeight: number; // 最大高?
  enableWebP: boolean; // 是否启用WebP格式
  enableAvif: boolean; // 是否启用AVIF格式
  lazyLoadThreshold: number; // 懒加载阈?px)
  placeholderColor: string; // 占位符颜?
}

interface StaticResourceConfig {
  // 静态资源优化配?
  enableCompression: boolean; // 启用压缩
  compressionLevel: number; // 压缩级别 1-9
  enableMinification: boolean; // 启用代码压缩
  enableCaching: boolean; // 启用缓存
  cacheTTL: number; // 缓存时间(�?
}

interface CDNConfig {
  // CDN配置
  baseUrl: string; // CDN基础URL
  enableImageResizing: boolean; // 启用图片动态调整大?
  enableFormatConversion: boolean; // 启用格式转换
  defaultQuality: number; // 默认图片质量
}

export class ImageStaticOptimizer {
  private imageConfig: ImageOptimizationConfig;
  private staticConfig: StaticResourceConfig;
  private cdnConfig: CDNConfig;
  private observer: IntersectionObserver | null = null;
  private loadingImages: Set<HTMLImageElement> = new Set();

  constructor(
    imageConfig: Partial<ImageOptimizationConfig> = {},
    staticConfig: Partial<StaticResourceConfig> = {},
    cdnConfig: Partial<CDNConfig> = {}
  ) {
    this.imageConfig = {
      quality: 80,
      maxWidth: 1920,
      maxHeight: 1080,
      enableWebP: true,
      enableAvif: true,
      lazyLoadThreshold: 300,
      placeholderColor: '#f0f0f0',
      ...imageConfig,
    };

    this.staticConfig = {
      enableCompression: true,
      compressionLevel: 6,
      enableMinification: true,
      enableCaching: true,
      cacheTTL: 31536000, // 1�?
      ...staticConfig,
    };

    this.cdnConfig = {
      baseUrl: '',
      enableImageResizing: true,
      enableFormatConversion: true,
      defaultQuality: 80,
      ...cdnConfig,
    };

    this.initIntersectionObserver();
  }

  // 初始化交叉观察器用于懒加?
  private initIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this?.unobserve(img);
            }
          });
        },
        {
          rootMargin: `${this.imageConfig.lazyLoadThreshold}px`,
        }
      );
    }
  }

  // 优化图片URL
  optimizeImageUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
    } = {}
  ): string {
    // 如果没有CDN配置，返回原始URL
    if (!this.cdnConfig.baseUrl) {
      return originalUrl;
    }

    // 构建CDN优化URL
    const url = new URL(originalUrl, this.cdnConfig.baseUrl);

    // 添加优化参数
    if (this.cdnConfig.enableImageResizing) {
      if (options.width) url.searchParams.set('w', options.width.toString());
      if (options.height) url.searchParams.set('h', options.height.toString());
    }

    if (this.cdnConfig.enableFormatConversion) {
      const format = options.format || this.getBestImageFormat();
      url.searchParams.set('f', format);
    }

    const quality = options.quality || this.cdnConfig.defaultQuality;
    url.searchParams.set('q', quality.toString());

    return url.toString();
  }

  // 获取最佳图片格?
  private getBestImageFormat(): 'webp' | 'avif' | 'jpeg' {
    const canvas = document.createElement('canvas');

    // 检查AVIF支持
    if (this.imageConfig.enableAvif) {
      canvas.toDataURL('image/avif').startsWith('data:image/avif');
      return 'avif';
    }

    // 检查WebP支持
    if (
      this.imageConfig.enableWebP &&
      canvas.toDataURL('image/webp').startsWith('data:image/webp')
    ) {
      return 'webp';
    }

    return 'jpeg';
  }

  // 设置图片懒加?
  setupLazyLoading(image: HTMLImageElement, placeholderSrc?: string): void {
    // 设置占位?
    if (placeholderSrc) {
      image.src = placeholderSrc;
    } else {
      // 使用纯色占位?
      const placeholder = this.createPlaceholderImage(
        image.width || 300,
        image.height || 200,
        this.imageConfig.placeholderColor
      );
      image.src = placeholder;
    }

    // 存储原始src
    const originalSrc = image.dataset.src || image.src;
    image.dataset.originalSrc = originalSrc;

    // 清除src以防止立即加?
    image.removeAttribute('src');

    // 开始观?
    if (this.observer) {
      this.observer.observe(image);
    } else {
      // 降级到简单的时间延迟加载
      setTimeout(() => this.loadImage(image), 100);
    }
  }

  // 加载图片
  private loadImage(image: HTMLImageElement): void {
    if (this.loadingImages.has(image)) return;

    this.loadingImages.add(image);

    const originalSrc = image.dataset.originalSrc || '';
    const optimizedSrc = this.optimizeImageUrl(originalSrc);

    // 创建新的图片元素来预加载
    const preloadImg = new Image();

    preloadImg.onload = () => {
      image.src = optimizedSrc;
      image.classList.add('loaded');
      this.loadingImages.delete(image);

      // 触发自定义事?
      image.dispatchEvent(
        new CustomEvent('imageLoaded', {
          detail: { originalSrc, optimizedSrc },
        })
      );
    };

    preloadImg.onerror = () => {
      // 回退到原始图?
      image.src = originalSrc;
      image.classList.add('error');
      this.loadingImages.delete(image);

      image.dispatchEvent(
        new CustomEvent('imageError', {
          detail: { originalSrc, error: 'Failed to load optimized image' },
        })
      );
    };

    preloadImg.src = optimizedSrc;
  }

  // 创建占位符图?
  private createPlaceholderImage(
    width: number,
    height: number,
    color: string
  ): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }

    return canvas.toDataURL();
  }

  // 批量设置懒加?
  setupBatchLazyLoading(selector: string = 'img[data-src]'): void {
    const images = document.querySelectorAll<HTMLImageElement>(selector);
    images.forEach(img => this.setupLazyLoading(img));
  }

  // 预加载关键图?
  preloadCriticalImages(imageUrls: string[]): Promise<void[]> {
    const promises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = this.optimizeImageUrl(url);
      });
    });

    return Promise.all(promises);
  }

  // 获取资源优化统计
  getResourceStats() {
    const images = document.querySelectorAll('img');
    const lazyImages = document.querySelectorAll('img[data-src]');
    const loadedImages = document.querySelectorAll('img.loaded');
    const errorImages = document.querySelectorAll('img.error');

    return {
      totalImages: images.length,
      lazyLoadImages: lazyImages.length,
      loadedImages: loadedImages.length,
      errorImages: errorImages.length,
      webpSupport: this.getBestImageFormat() === 'webp',
      avifSupport: this.getBestImageFormat() === 'avif',
      cdnEnabled: !!this.cdnConfig.baseUrl,
    };
  }

  // 清理资源
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadingImages.clear();
  }
}

// 静态资源压缩器
export class StaticResourceCompressor {
  private config: StaticResourceConfig;

  constructor(config: Partial<StaticResourceConfig> = {}) {
    this.config = {
      enableCompression: true,
      compressionLevel: 6,
      enableMinification: true,
      enableCaching: true,
      cacheTTL: 31536000,
      ...config,
    };
  }

  // 压缩CSS
  async compressCSS(cssContent: string): Promise<string> {
    if (!this.config.enableMinification) return cssContent;

    // 移除注释和多余空?
    return cssContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
      .replace(/\s+/g, ' ') // 合并空白字符
      .replace(/\s*([{}:;,])\s*/g, '$1') // 移除符号周围的空?
      .trim();
  }

  // 压缩JavaScript
  async compressJS(jsContent: string): Promise<string> {
    if (!this.config.enableMinification) return jsContent;

    // 简单的JS压缩（生产环境建议使用terser等专业工具）
    return jsContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/\/\/.*$/gm, '') // 移除单行注释
      .replace(/\s+/g, ' ') // 合并空白字符
      .replace(/\s*([{}();,:])\s*/g, '$1') // 移除符号周围的空?
      .trim();
  }

  // 生成资源指纹
  generateResourceHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换?2位整?
    }
    return Math.abs(hash).toString(36);
  }

  // 添加缓存?
  addCacheHeaders(headers: Record<string, string>): Record<string, string> {
    if (this.config.enableCaching) {
      return {
        ...headers,
        'Cache-Control': `public, max-age=${this.config.cacheTTL}`,
        Expires: new Date(
          Date.now() + this.config.cacheTTL * 1000
        ).toUTCString(),
      };
    }
    return headers;
  }
}

// 默认导出实例
export const imageOptimizer = new ImageStaticOptimizer();
export const resourceCompressor = new StaticResourceCompressor();

// React Hook封装
export function useImageOptimization() {
  const setupLazyLoading = (image: HTMLImageElement, placeholder?: string) => {
    imageOptimizer.setupLazyLoading(image, placeholder);
  };

  const setupBatchLazyLoading = (selector?: string) => {
    imageOptimizer.setupBatchLazyLoading(selector);
  };

  const preloadCriticalImages = async (urls: string[]) => {
    await imageOptimizer.preloadCriticalImages(urls);
  };

  const getStats = () => imageOptimizer.getResourceStats();

  return {
    setupLazyLoading,
    setupBatchLazyLoading,
    preloadCriticalImages,
    getStats,
  };
}
