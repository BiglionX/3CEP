/**
 * 前端性能监控系统核心
 * 实时监控页面加载、API响应、用户交互等性能指标
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// 性能指标类型定义
export interface PerformanceMetrics {
  // 页面加载指标
  navigationStart: number
  domContentLoaded: number
  loadEventEnd: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint: number

  // 核心Web Vitals
  cumulativeLayoutShift: number
  firstInputDelay: number
  interactionToNextPaint: number

  // 网络性能
  dnsLookup: number
  tcpConnection: number
  requestDuration: number
  responseDuration: number

  // JavaScript执行
  scriptExecution: number
  domParsing: number

  // 用户体验指标
  timeToInteractive: number
  totalBlockingTime: number

  // 自定义指?
  apiResponseTimes: Record<string, number[]>
  componentRenderTimes: Record<string, number[]>
  userInteractionDelays: number[]
}

// 监控配置
interface PerformanceConfig {
  enabled?: boolean
  sampleRate?: number
  reportWebVitals?: boolean
  monitorApiCalls?: boolean
  monitorComponentRenders?: boolean
  monitorUserInteractions?: boolean
  reportingEndpoint?: string
  maxEntries?: number
  bufferTimeout?: number
}

// 默认配置
const DEFAULT_CONFIG: Required<PerformanceConfig> = {
  enabled: true,
  sampleRate: 1.0,
  reportWebVitals: true,
  monitorApiCalls: true,
  monitorComponentRenders: true,
  monitorUserInteractions: true,
  reportingEndpoint: '/api/performance/metrics',
  maxEntries: 50,
  bufferTimeout: 5000
}

// 性能条目类型
interface PerformanceEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
  [key: string]: any
}

// 性能监控器主?
export class PerformanceMonitor {
  private config: Required<PerformanceConfig>
  private metrics: PerformanceMetrics
  private entries: PerformanceEntry[] = []
  private isInitialized = false
  private bufferTimer: NodeJS.Timeout | null = null

  constructor(config: PerformanceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.metrics = this.initializeMetrics()
  }

  private initializeMetrics(): PerformanceMetrics {
    const timing = performance.timing
    const navigationStart = timing.navigationStart

    return {
      navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
      loadEventEnd: timing.loadEventEnd - navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      interactionToNextPaint: 0,
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      requestDuration: timing.responseStart - timing.requestStart,
      responseDuration: timing.responseEnd - timing.responseStart,
      scriptExecution: timing.domContentLoadedEventEnd - timing.domLoading,
      domParsing: timing.domInteractive - timing.domLoading,
      timeToInteractive: 0,
      totalBlockingTime: 0,
      apiResponseTimes: {},
      componentRenderTimes: {},
      userInteractionDelays: []
    }
  }

  // 初始化监控器
  init(): void {
    if (this.isInitialized || !this.config.enabled) return

    // 采样率控?
    if (Math.random() > this.config.sampleRate) return

    this.setupNavigationTiming()
    this.setupPaintTiming()
    this.setupLargestContentfulPaint()
    this.setupLayoutShift()
    this.setupFirstInputDelay()

    if (this.config.monitorApiCalls) {
      this.setupApiMonitoring()
    }

    if (this.config.monitorUserInteractions) {
      this.setupInteractionMonitoring()
    }

    this.isInitialized = true
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[PerformanceMonitor] Initialized successfully')}

  // 导航时间监控
  private setupNavigationTiming(): void {
    if ('timing' in performance) {
      const timing = performance.timing
      const navigationStart = timing.navigationStart

      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - navigationStart
      this.metrics.loadEventEnd = timing.loadEventEnd - navigationStart
      this.metrics.dnsLookup = timing.domainLookupEnd - timing.domainLookupStart
      this.metrics.tcpConnection = timing.connectEnd - timing.connectStart
      this.metrics.requestDuration = timing.responseStart - timing.requestStart
      this.metrics.responseDuration = timing.responseEnd - timing.responseStart
      this.metrics.scriptExecution = timing.domContentLoadedEventEnd - timing.domLoading
      this.metrics.domParsing = timing.domInteractive - timing.domLoading
    }
  }

  // 绘制时间监控
  private setupPaintTiming(): void {
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint')

      paintEntries.forEach((entry: PerformanceEntry) => {
        if (entry.name === 'first-paint') {
          this.metrics.firstPaint = entry.startTime
        } else if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime
        }
      })
    }
  }

  // 最大内容绘制监?
  private setupLargestContentfulPaint(): void {
    if ('LargeContentfulPaint' in window) {
      const observer = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }

  // 布局偏移监控
  private setupLayoutShift(): void {
    if ('LayoutShift' in window) {
      let clsValue = 0
      const observer = new (window as any).PerformanceObserver((list: any) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }

  // 首次输入延迟监控
  private setupFirstInputDelay(): void {
    if ('first-input' in window) {
      const observer = new (window as any).PerformanceObserver((list: any) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          const firstEntry = entries[0]
          this.metrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
    }
  }

  // API调用监控
  private setupApiMonitoring(): void {
    const originalFetch = window.fetch
    const monitor = this

    window.fetch = function(...args) {
      const startTime = performance.now()
      const url = typeof args[0] === 'string' ? args[0] : args[0].url

      return originalFetch.apply(this, args as any).then((response: Response) => {
        const endTime = performance.now()
        const duration = endTime - startTime

        monitor.recordApiResponse(url, duration)
        return response
      }).catch((error: Error) => {
        const endTime = performance.now()
        const duration = endTime - startTime
        monitor.recordApiResponse(url, duration, true)
        throw error
      })
    }
  }

  // 用户交互监控
  private setupInteractionMonitoring(): void {
    const interactions = ['click', 'keydown', 'touchstart']
    const monitor = this

    interactions.forEach(eventType => {
      document.addEventListener(eventType, (event: Event) => {
        const startTime = performance.now()

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const endTime = performance.now()
            const delay = endTime - startTime
            monitor.recordUserInteraction(delay)
          })
        })
      }, true)
    })
  }

  // 记录API响应时间
  recordApiResponse(url: string, duration: number, isError: boolean = false): void {
    const cleanUrl = this.cleanUrl(url)

    if (!this.metrics.apiResponseTimes[cleanUrl]) {
      this.metrics.apiResponseTimes[cleanUrl] = []
    }

    this.metrics.apiResponseTimes[cleanUrl].push(duration)

    // 保持数组长度限制
    if (this.metrics.apiResponseTimes[cleanUrl].length > this.config.maxEntries) {
      this.metrics.apiResponseTimes[cleanUrl].shift()
    }

    this.addToBuffer({
      type: 'api_response',
      url: cleanUrl,
      duration,
      isError,
      timestamp: Date.now()
    })
  }

  // 记录组件渲染时间
  recordComponentRender(componentName: string, duration: number): void {
    if (!this.metrics.componentRenderTimes[componentName]) {
      this.metrics.componentRenderTimes[componentName] = []
    }

    this.metrics.componentRenderTimes[componentName].push(duration)

    if (this.metrics.componentRenderTimes[componentName].length > this.config.maxEntries) {
      this.metrics.componentRenderTimes[componentName].shift()
    }

    this.addToBuffer({
      type: 'component_render',
      componentName,
      duration,
      timestamp: Date.now()
    })
  }

  // 记录用户交互延迟
  recordUserInteraction(delay: number): void {
    this.metrics.userInteractionDelays.push(delay)

    if (this.metrics.userInteractionDelays.length > this.config.maxEntries) {
      this.metrics.userInteractionDelays.shift()
    }

    this.addToBuffer({
      type: 'user_interaction',
      delay,
      timestamp: Date.now()
    })
  }

  // 添加到缓冲区
  private addToBuffer(entry: any): void {
    this.entries.push(entry)

    if (this.entries.length >= this.config.maxEntries) {
      this.flush()
    } else if (!this.bufferTimer) {
      this.bufferTimer = setTimeout(() => {
        this.flush()
      }, this.config.bufferTimeout)
    }
  }

  // 清理URL（移除敏感信息）
  private cleanUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin)
      // 移除查询参数中的敏感信息
      urlObj.search = ''
      return urlObj.pathname
    } catch {
      return url
    }
  }

  // 获取当前性能指标
  getMetrics(): PerformanceMetrics {
    // 计算衍生指标
    this.calculateDerivedMetrics()
    return { ...this.metrics }
  }

  // 计算衍生指标
  private calculateDerivedMetrics(): void {
    // 计算Time to Interactive
    if (this.metrics.firstContentfulPaint && this.metrics.domContentLoaded) {
      this.metrics.timeToInteractive = Math.max(
        this.metrics.firstContentfulPaint,
        this.metrics.domContentLoaded
      )
    }

    // 计算Total Blocking Time
    const fcp = this.metrics.firstContentfulPaint
    const interactive = this.metrics.timeToInteractive
    if (fcp && interactive && interactive > fcp) {
      this.metrics.totalBlockingTime = interactive - fcp
    }
  }

  // 获取性能分数
  getPerformanceScore(): number {
    const metrics = this.getMetrics()
    let score = 100

    // 基于Core Web Vitals计算分数
    if (metrics.firstContentfulPaint > 1800) score -= 20
    if (metrics.largestContentfulPaint > 2500) score -= 25
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15
    if (metrics.firstInputDelay > 100) score -= 20
    if (metrics.totalBlockingTime > 200) score -= 20

    return Math.max(0, score)
  }

  // 刷新数据到服务器
  flush(): void {
    if (this.entries.length === 0) return

    const entriesToSend = [...this.entries]
    this.entries = []

    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer)
      this.bufferTimer = null
    }

    this.sendMetrics(entriesToSend)
  }

  // 发送指标数?
  private async sendMetrics(entries: any[]): Promise<void> {
    if (!this.config.reportingEndpoint) return

    try {
      const response = await fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.getMetrics(),
          entries,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      })

      if (!response.ok) {
        console.error('[PerformanceMonitor] Failed to send metrics')
      }
    } catch (error) {
      console.error('[PerformanceMonitor] Error sending metrics:', error)
    }
  }

  // 销毁监控器
  destroy(): void {
    this.flush()
    this.isInitialized = false
  }
}

// React Hook封装
export function usePerformanceMonitor(config: PerformanceConfig = {}) {
  const monitorRef = useRef<PerformanceMonitor | null>(null)

  useEffect(() => {
    if (!monitorRef.current) {
      monitorRef.current = new PerformanceMonitor(config)
      monitorRef.current.init()
    }

    return () => {
      if (monitorRef.current) {
        monitorRef.current.destroy()
        monitorRef.current = null
      }
    }
  }, [config])

  const getMetrics = useCallback(() => {
    return monitorRef?.getMetrics() || null
  }, [])

  const getPerformanceScore = useCallback(() => {
    return monitorRef?.getPerformanceScore() || 0
  }, [])

  const recordComponentRender = useCallback((componentName: string, duration: number) => {
    monitorRef?.recordComponentRender(componentName, duration)
  }, [])

  const flush = useCallback(() => {
    monitorRef?.flush()
  }, [])

  return {
    getMetrics,
    getPerformanceScore,
    recordComponentRender,
    flush
  }
}

// 性能监控高阶组件
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const { recordComponentRender } = usePerformanceMonitor()
    const startTimeRef = useRef<number>(0)

    useEffect(() => {
      startTimeRef.current = performance.now()

      return () => {
        const endTime = performance.now()
        const duration = endTime - startTimeRef.current
        recordComponentRender(componentName, duration)
      }
    }, [recordComponentRender])

    return <WrappedComponent {...props} />
  }
}

// 性能监控上下?
export const PerformanceContext = React.createContext<{
  monitor: PerformanceMonitor | null
  metrics: PerformanceMetrics | null
  score: number
}>({
  monitor: null,
  metrics: null,
  score: 0
})

// 性能监控Provider
export function PerformanceProvider({
  children,
  config
}: {
  children: React.ReactNode
  config?: PerformanceConfig
}) {
  const { getMetrics, getPerformanceScore } = usePerformanceMonitor(config)

  const contextValue = {
    monitor: null, // 可以扩展为全局实例
    metrics: getMetrics(),
    score: getPerformanceScore()
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  )
}

// 预设配置
export const PerformancePresets = {
  LIGHT: {
    sampleRate: 0.1,
    monitorApiCalls: false,
    monitorComponentRenders: false,
    maxEntries: 20
  },

  STANDARD: {
    sampleRate: 0.5,
    monitorApiCalls: true,
    monitorComponentRenders: true,
    maxEntries: 50
  },

  DETAILED: {
    sampleRate: 1.0,
    monitorApiCalls: true,
    monitorComponentRenders: true,
    monitorUserInteractions: true,
    maxEntries: 100
  }
}
