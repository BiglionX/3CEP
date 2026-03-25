'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 懒加载图片组件
 *
 * 特性:
 * - Intersection Observer API 检测可见性
 * - 低优先级图片延迟加载
 * - 支持模糊占位
 * - 错误处理和重试
 *
 * @example
 * <LazyImage
 *   src="https://example.com/image.jpg"
 *   alt="示例图片"
 *   width={400}
 *   height={300}
 *   placeholder="blur"
 * />
 */
export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 使用 Intersection Observer 检测图片是否可见
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
        threshold: 0.01, // 1% 可见时触发
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || 'auto',
        height: height || 'auto',
      }}
    >
      {/* 占位符 */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: width || '100%',
            height: height || '100%',
          }}
        >
          {placeholder === 'blur' && blurDataURL && (
            <Image
              src={blurDataURL}
              alt=""
              width={width || 10}
              height={height || 10}
              className="w-full h-full object-cover opacity-50 blur-xl"
            />
          )}
        </div>
      )}

      {/* 实际图片 */}
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={width || 0}
          height={height || 0}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          quality={75}
        />
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * 响应式懒加载图片
 *
 * 自动根据容器大小调整尺寸
 */
interface ResponsiveLazyImageProps extends Omit<
  LazyImageProps,
  'width' | 'height'
> {
  aspectRatio?: number; // 宽高比，如 16/9, 4/3
}

export function ResponsiveLazyImage({
  src,
  alt,
  aspectRatio,
  className = '',
  ...props
}: ResponsiveLazyImageProps) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        paddingTop: aspectRatio ? `${(1 / aspectRatio) * 100}%` : 'auto',
      }}
    >
      <LazyImage src={src} alt={alt} className="absolute inset-0" {...props} />
    </div>
  );
}
