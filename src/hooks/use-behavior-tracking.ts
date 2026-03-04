/**
 * 用户行为追踪系统
 * 实现用户操作埋点、行为分析和数据收集
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  MousePointer,
  Eye,
  Click,
  Timer,
  Navigation,
  Search,
  ShoppingCart,
  Heart,
  Share2,
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  Copy,
  Paste,
  Scissors,
  Save,
  Trash2,
  Edit,
  Plus,
  Minus
} from 'lucide-react'

// 事件类型枚举
export type EventType = 
  | 'page_view'           // 页面浏览
  | 'click'               // 点击事件
  | 'scroll'              // 滚动事件
  | 'hover'               // 悬停事件
  | 'input'               // 输入事件
  | 'form_submit'         // 表单提交
  | 'navigation'          // 导航事件
  | 'search'              // 搜索事件
  | 'purchase'            // 购买事件
  | 'add_to_cart'         // 添加到购物车
  | 'remove_from_cart'    // 从购物车移除
  | 'wishlist_add'        // 添加到收藏夹
  | 'share'               // 分享事件
  | 'download'            // 下载事件
  | 'upload'              // 上传事件
  | 'video_play'          // 视频播放
  | 'video_pause'         // 视频暂停
  | 'audio_play'          // 音频播放
  | 'audio_pause'         // 音频暂停
  | 'fullscreen_enter'    // 进入全屏
  | 'fullscreen_exit'     // 退出全?
  | 'external_link'       // 外链点击
  | 'copy'                // 复制事件
  | 'paste'               // 粘贴事件
  | 'cut'                 // 剪切事件
  | 'save'                // 保存事件
  | 'delete'              // 删除事件
  | 'edit'                // 编辑事件
  | 'custom'              // 自定义事?

// 用户行为事件接口
export interface UserBehaviorEvent {
  // 基础信息
  eventId: string
  eventType: EventType
  timestamp: number
  sessionId: string
  
  // 用户信息
  userId?: string
  userAgent: string
  language: string
  timezone: string
  
  // 页面信息
  url: string
  referrer: string
  pageTitle: string
  path: string
  
  // 设备信息
  deviceType: 'desktop' | 'tablet' | 'mobile'
  screenWidth: number
  screenHeight: number
  viewportWidth: number
  viewportHeight: number
  
  // 位置信息
  elementSelector?: string
  elementText?: string
  x?: number
  y?: number
  scrollX?: number
  scrollY?: number
  
  // 业务数据
  value?: string | number
  category?: string
  label?: string
  customData?: Record<string, any>
  
  // 性能数据
  duration?: number
  loadTime?: number
  responseTime?: number
}

// 追踪配置接口
export interface TrackingConfig {
  // 基础配置
  enabled: boolean
  debug: boolean
  batchSize: number
  flushInterval: number
  
  // 事件过滤
  excludedEvents?: EventType[]
  excludedSelectors?: string[]
  excludedPaths?: string[]
  
  // 隐私设置
  anonymizeIp: boolean
  respectDNT: boolean
  cookieConsentRequired: boolean
  
  // 数据发?
  endpoint: string
  apiKey?: string
  headers?: Record<string, string>
}

// 默认配置
const DEFAULT_CONFIG: TrackingConfig = {
  enabled: true,
  debug: false,
  batchSize: 10,
  flushInterval: 5000,
  anonymizeIp: true,
  respectDNT: true,
  cookieConsentRequired: false,
  endpoint: '/api/analytics/events'
}

// 获取事件图标函数
const getEventIcon = (eventType: EventType): React.ReactNode => {
  const icons: Record<EventType, React.ReactNode> = {
    page_view: <Eye className="h-4 w-4" />,
    click: <Click className="h-4 w-4" />,
    scroll: <MousePointer className="h-4 w-4" />,
    hover: <MousePointer className="h-4 w-4" />,
    input: <Edit className="h-4 w-4" />,
    form_submit: <Save className="h-4 w-4" />,
    navigation: <Navigation className="h-4 w-4" />,
    search: <Search className="h-4 w-4" />,
    purchase: <ShoppingCart className="h-4 w-4" />,
    add_to_cart: <Plus className="h-4 w-4" />,
    remove_from_cart: <Minus className="h-4 w-4" />,
    wishlist_add: <Heart className="h-4 w-4" />,
    share: <Share2 className="h-4 w-4" />,
    download: <Download className="h-4 w-4" />,
    upload: <Upload className="h-4 w-4" />,
    video_play: <Play className="h-4 w-4" />,
    video_pause: <Pause className="h-4 w-4" />,
    audio_play: <Volume2 className="h-4 w-4" />,
    audio_pause: <VolumeX className="h-4 w-4" />,
    fullscreen_enter: <Maximize className="h-4 w-4" />,
    fullscreen_exit: <Minimize className="h-4 w-4" />,
    external_link: <ExternalLink className="h-4 w-4" />,
    copy: <Copy className="h-4 w-4" />,
    paste: <Paste className="h-4 w-4" />,
    cut: <Scissors className="h-4 w-4" />,
    save: <Save className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4" />,
    edit: <Edit className="h-4 w-4" />,
    custom: <MousePointer className="h-4 w-4" />
  }
  return icons[eventType] || icons.custom
}

// 用户行为追踪Hook
export function useUserBehaviorTracking(config: Partial<TrackingConfig> = {}) {
  const trackingConfig = { ...DEFAULT_CONFIG, ...config }
  const [events, setEvents] = useState<UserBehaviorEvent[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const eventQueue = useRef<UserBehaviorEvent[]>([])
  const flushTimer = useRef<NodeJS.Timeout | null>(null)
  
  // 生成唯一ID
  const generateId = useCallback((): string => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  }, [])
  
  // 获取设备类型
  const getDeviceType = useCallback((): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }, [])
  
  // 检查是否应该追踪事?
  const shouldTrackEvent = useCallback((eventType: EventType, element?: Element): boolean => {
    // 检查全局禁用
    if (!trackingConfig.enabled) return false
    
    // 检查Do Not Track
    if (trackingConfig.respectDNT && navigator.doNotTrack === '1') return false
    
    // 检查Cookie同意（简化实现）
    if (trackingConfig.cookieConsentRequired) {
      const consent = localStorage.getItem('cookie-consent')
      if (consent !== 'granted') return false
    }
    
    // 检查排除的事件类型
    if (trackingConfig?.includes(eventType)) return false
    
    // 检查排除的选择?
    if (element && trackingConfig.excludedSelectors) {
      for (const selector of trackingConfig.excludedSelectors) {
        if (element.matches(selector)) return false
      }
    }
    
    // 检查排除的路径
    if (trackingConfig?.includes(window.location.pathname)) {
      return false
    }
    
    return true
  }, [trackingConfig])
  
  // 创建事件对象
  const createEvent = useCallback((
    eventType: EventType,
    element?: Element,
    customData?: Record<string, any>
  ): UserBehaviorEvent => {
    const rect = element?.getBoundingClientRect()
    const now = Date.now()
    
    return {
      eventId: generateId(),
      eventType,
      timestamp: now,
      sessionId,
      userId: localStorage.getItem('userId') || undefined,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      url: window.location.href,
      referrer: document.referrer,
      pageTitle: document.title,
      path: window.location.pathname,
      deviceType: getDeviceType(),
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      elementSelector: element ? getElementSelector(element) : undefined,
      elementText: element ? getElementText(element) : undefined,
      x: rect ? Math.round(rect.left + rect.width / 2) : undefined,
      y: rect ? Math.round(rect.top + rect.height / 2) : undefined,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      customData
    }
  }, [generateId, sessionId, getDeviceType])
  
  // 获取元素选择?
  const getElementSelector = useCallback((element: Element): string => {
    if (element.id) return `#${element.id}`
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c).join('.')
      return `.${classes}`
    }
    return element.tagName.toLowerCase()
  }, [])
  
  // 获取元素文本内容
  const getElementText = useCallback((element: Element): string => {
    const text = element.textContent || element.getAttribute('aria-label') || ''
    return text.substring(0, 100) // 限制长度
  }, [])
  
  // 添加事件到队?
  const addEvent = useCallback((event: UserBehaviorEvent) => {
    if (trackingConfig.debug) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('[User Behavior Tracking]', event)}
    
    eventQueue.current.push(event)
    setEvents(prev => [...prev, event])
    
    // 检查是否需要立即发?
    if (eventQueue.current.length >= trackingConfig.batchSize) {
      flushEvents()
    } else {
      // 设置定时发?
      if (!flushTimer.current) {
        flushTimer.current = setTimeout(flushEvents, trackingConfig.flushInterval)
      }
    }
  }, [trackingConfig])
  
  // 发送事件数?
  const sendEvents = useCallback(async (eventsToSend: UserBehaviorEvent[]) => {
    if (eventsToSend.length === 0) return
    
    try {
      const response = await fetch(trackingConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(trackingConfig.apiKey && { 'Authorization': `Bearer ${trackingConfig.apiKey}` }),
          ...trackingConfig.headers
        },
        body: JSON.stringify({
          events: eventsToSend,
          metadata: {
            batchId: generateId(),
            timestamp: Date.now()
          }
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      if (trackingConfig.debug) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`[User Behavior Tracking] Sent ${eventsToSend.length} events`)}
    } catch (error) {
      console.error('[User Behavior Tracking] Failed to send events:', error)
      // 保留事件以供重试
      return false
    }
    
    return true
  }, [trackingConfig, generateId])
  
  // 刷新事件队列
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return
    
    const eventsToSend = [...eventQueue.current]
    eventQueue.current = []
    
    // 清除定时?
    if (flushTimer.current) {
      clearTimeout(flushTimer.current)
      flushTimer.current = null
    }
    
    // 发送事?
    await sendEvents(eventsToSend)
  }, [sendEvents])
  
  // 页面浏览追踪
  useEffect(() => {
    if (!shouldTrackEvent('page_view')) return
    
    const handlePageLoad = () => {
      const event = createEvent('page_view')
      addEvent(event)
    }
    
    if (document.readyState === 'complete') {
      handlePageLoad()
    } else {
      window.addEventListener('load', handlePageLoad)
    }
    
    return () => {
      window.removeEventListener('load', handlePageLoad)
    }
  }, [shouldTrackEvent, createEvent, addEvent])
  
  // 点击事件追踪
  useEffect(() => {
    if (!shouldTrackEvent('click')) return
    
    const handleClick = (event: MouseEvent) => {
      const element = event.target as Element
      if (!shouldTrackEvent('click', element)) return
      
      const customData = {
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      }
      
      const trackingEvent = createEvent('click', element, customData)
      addEvent(trackingEvent)
    }
    
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [shouldTrackEvent, createEvent, addEvent])
  
  // 滚动事件追踪
  useEffect(() => {
    if (!shouldTrackEvent('scroll')) return
    
    let scrollTimer: NodeJS.Timeout
    
    const handleScroll = () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        const event = createEvent('scroll')
        addEvent(event)
      }, 100) // 防抖
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimer)
    }
  }, [shouldTrackEvent, createEvent, addEvent])
  
  // 表单提交追踪
  useEffect(() => {
    if (!shouldTrackEvent('form_submit')) return
    
    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      const formData = new FormData(form)
      const customData = {
        formId: form.id,
        formName: form.name,
        formData: Object.fromEntries(formData.entries())
      }
      
      const trackingEvent = createEvent('form_submit', form, customData)
      addEvent(trackingEvent)
    }
    
    document.addEventListener('submit', handleSubmit, true)
    return () => document.removeEventListener('submit', handleSubmit, true)
  }, [shouldTrackEvent, createEvent, addEvent])
  
  // 搜索事件追踪
  useEffect(() => {
    if (!shouldTrackEvent('search')) return
    
    const handleSearch = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.type !== 'search' && !input.closest('form')?.querySelector('button[type="submit"]')) {
        return
      }
      
      const customData = {
        searchTerm: input.value,
        inputId: input.id,
        inputName: input.name
      }
      
      const trackingEvent = createEvent('search', input, customData)
      addEvent(trackingEvent)
    }
    
    document.addEventListener('submit', handleSearch, true)
    return () => document.removeEventListener('submit', handleSearch, true)
  }, [shouldTrackEvent, createEvent, addEvent])
  
  // 初始化会话ID
  useEffect(() => {
    let storedSessionId = sessionStorage.getItem('tracking-session-id')
    if (!storedSessionId) {
      storedSessionId = generateId()
      sessionStorage.setItem('tracking-session-id', storedSessionId)
    }
    setSessionId(storedSessionId)
  }, [generateId])
  
  // 组件卸载时清?
  useEffect(() => {
    return () => {
      if (flushTimer.current) {
        clearTimeout(flushTimer.current)
      }
      // 发送剩余事?
      flushEvents()
    }
  }, [flushEvents])
  
  // 返回公共API
  return {
    // 手动追踪事件
    trackEvent: (eventType: EventType, element?: Element, customData?: Record<string, any>) => {
      if (shouldTrackEvent(eventType, element)) {
        const event = createEvent(eventType, element, customData)
        addEvent(event)
      }
    },
    
    // 获取当前事件数据
    getEvents: () => events,
    
    // 手动刷新事件
    flush: flushEvents,
    
    // 获取事件图标
    getEventIcon: (eventType: EventType) => EVENT_ICONS[eventType] || EVENT_ICONS.custom
  }
}

// 预定义的追踪Hook
export function usePageViewTracking() {
  const { trackEvent } = useUserBehaviorTracking()
  
  useEffect(() => {
    trackEvent('page_view')
  }, [trackEvent])
}

export function useClickTracking(selector: string) {
  const { trackEvent } = useUserBehaviorTracking()
  
  useEffect(() => {
    const handleClick = (event: Event) => {
      const element = event.target as Element
      if (element.matches(selector)) {
        trackEvent('click', element)
      }
    }
    
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [selector, trackEvent])
}

export function useFormTracking(formSelector: string) {
  const { trackEvent } = useUserBehaviorTracking()
  
  useEffect(() => {
    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      if (form.matches(formSelector)) {
        trackEvent('form_submit', form)
      }
    }
    
    document.addEventListener('submit', handleSubmit, true)
    return () => document.removeEventListener('submit', handleSubmit, true)
  }, [formSelector, trackEvent])
}