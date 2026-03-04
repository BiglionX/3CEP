/**
 * 前端性能监控演示页面
 * 展示页面加载、API响应时间和用户交互性能监控
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Gauge,
  Timer,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Wifi,
  HardDrive,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  usePerformanceMonitoring,
  useWebVitals,
  useApiPerformance,
  usePageLoadPerformance,
  type PerformanceMetric,
  type WebVitalsMetrics
} from '@/hooks/use-performance-monitoring'

// 模拟性能数据
const mockPerformanceData = {
  currentScore: 87,
  metrics: [
    { name: '首次内容绘制', value: 1200, unit: 'ms', status: 'good' },
    { name: '最大内容绘?, value: 1800, unit: 'ms', status: 'needs-improvement' },
    { name: '首次输入延迟', value: 80, unit: 'ms', status: 'good' },
    { name: '累积布局偏移', value: 0.08, unit: '', status: 'good' },
    { name: '可交互时?, value: 3200, unit: 'ms', status: 'needs-improvement' }
  ],
  recentMetrics: [
    { type: 'api_response_time', value: 150, timestamp: Date.now() - 1000 },
    { type: 'api_response_time', value: 280, timestamp: Date.now() - 2000 },
    { type: 'api_response_time', value: 95, timestamp: Date.now() - 3000 },
    { type: 'api_response_time', value: 420, timestamp: Date.now() - 4000 },
    { type: 'api_response_time', value: 110, timestamp: Date.now() - 5000 }
  ]
}

export default function PerformanceMonitoringDemoPage() {
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true)
  const [performanceData, setPerformanceData] = useState(mockPerformanceData)
  
  // 初始化性能监控
  const { 
    metrics, 
    stats, 
    recordMetric, 
    flush, 
    getPerformanceScore 
  } = usePerformanceMonitoring({
    enabled: isMonitoringEnabled,
    sampleRate: 1.0,
    reportWebVitals: true,
    apiMonitoring: true,
    interactionMonitoring: true
  })
  
  // 获取Web Vitals数据
  const webVitals = useWebVitals()
  
  // 获取API性能数据
  const apiMetrics = useApiPerformance()
  
  // 获取页面加载性能数据
  const pageLoadMetrics = usePageLoadPerformance()
  
  // 模拟API调用测试
  const simulateApiCall = async () => {
    const startTime = performance.now()
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100))
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 记录API性能指标
      recordMetric('api_response_time', duration, {
        url: '/api/test-endpoint',
        method: 'GET',
        status: 200
      })
      
      // 更新本地数据
      setPerformanceData(prev => ({
        ...prev,
        recentMetrics: [
          { type: 'api_response_time', value: duration, timestamp: Date.now() },
          ...prev.recentMetrics.slice(0, 9)
        ]
      }))
    } catch (error) {
      console.error('API call failed:', error)
    }
  }
  
  // 触发大量DOM操作测试
  const triggerDomOperations = () => {
    const container = document.getElementById('dom-test-container')
    if (container) {
      // 清空容器
      container.innerHTML = ''
      
      // 添加大量元素
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div')
        div.className = 'p-2 m-1 bg-blue-100 rounded text-sm'
        div.textContent = `测试元素 ${i + 1}`
        container.appendChild(div)
      }
      
      // 记录操作
      recordMetric('user_interaction', 150, {
        eventType: 'dom_operations',
        elementCount: 100
      })
    }
  }
  
  // 切换监控状?
  const toggleMonitoring = () => {
    setIsMonitoringEnabled(!isMonitoringEnabled)
  }
  
  // 刷新性能数据
  const refreshData = () => {
    flush()
  }
  
  // 获取状态颜?
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }
  
  // 获取状态图?
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }
  
  // 格式化时?
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }
  
  // 计算平均响应时间
  const calculateAvgResponseTime = () => {
    if (apiMetrics.length === 0) return 0
    const total = apiMetrics.reduce((sum, metric) => sum + metric.value, 0)
    return Math.round(total / apiMetrics.length)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">前端性能监控</h1>
          <p className="text-gray-600">实时监控页面加载、API响应和用户交互性能</p>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={toggleMonitoring}
            variant={isMonitoringEnabled ? 'default' : 'outline'}
          >
            {isMonitoringEnabled ? '停止监控' : '开始监?}
          </Button>
          <Button onClick={refreshData} variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
          <Button onClick={simulateApiCall} variant="outline">
            <Server className="h-4 w-4 mr-2" />
            模拟API调用
          </Button>
          <Badge variant={isMonitoringEnabled ? 'default' : 'secondary'}>
            {isMonitoringEnabled ? '监控? : '已暂?}
          </Badge>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="api-performance">API性能</TabsTrigger>
            <TabsTrigger value="page-load">页面加载</TabsTrigger>
            <TabsTrigger value="interaction">用户交互</TabsTrigger>
          </TabsList>
          
          {/* 概览面板 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">性能评分</CardTitle>
                  <Gauge className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {getPerformanceScore()}�?
                  </div>
                  <p className="text-xs text-muted-foreground">
                    综合性能评估
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                  <Timer className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateAvgResponseTime()}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    API请求平均耗时
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">慢请?/CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.slowRequests}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    超过1秒的请求
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总监控指?/CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    已收集的性能数据
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Core Web Vitals 状?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(metric.status)}
                          <span className="text-sm">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getStatusColor(metric.status)}`}>
                            {metric.value}{metric.unit}
                          </span>
                          <Badge 
                            variant={metric.status === 'good' ? 'default' : 
                                   metric.status === 'needs-improvement' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {metric.status === 'good' ? '良好' : 
                             metric.status === 'needs-improvement' ? '需改善' : '�?}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    实时API性能
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-1">
                    {performanceData.recentMetrics.slice(0, 20).map((metric, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300"
                          style={{ 
                            height: `${Math.min(100, metric.value / 5)}%`,
                            minHeight: '4px'
                          }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(metric.value)}ms
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button onClick={simulateApiCall} size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      触发API测试
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Web Vitals面板 */}
          <TabsContent value="web-vitals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <Gauge className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <CardTitle>首次内容绘制 (FCP)</CardTitle>
                  <CardDescription>页面首次渲染内容的时?/CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {webVitals.fcp ? `${Math.round(webVitals.fcp)}ms` : '测量?..'}
                  </div>
                  <Badge variant={webVitals.fcp && webVitals.fcp <= 1800 ? 'default' : 'secondary'}>
                    {webVitals.fcp && webVitals.fcp <= 1800 ? '良好' : '需改善'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <HardDrive className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <CardTitle>最大内容绘?(LCP)</CardTitle>
                  <CardDescription>最大内容元素的渲染时间</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {webVitals.lcp ? `${Math.round(webVitals.lcp)}ms` : '测量?..'}
                  </div>
                  <Badge variant={webVitals.lcp && webVitals.lcp <= 2500 ? 'default' : 'secondary'}>
                    {webVitals.lcp && webVitals.lcp <= 2500 ? '良好' : '需改善'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <CardTitle>首次输入延迟 (FID)</CardTitle>
                  <CardDescription>用户首次交互的响应延?/CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {webVitals.fid ? `${Math.round(webVitals.fid)}ms` : '测量?..'}
                  </div>
                  <Badge variant={webVitals.fid && webVitals.fid <= 100 ? 'default' : 'secondary'}>
                    {webVitals.fid && webVitals.fid <= 100 ? '良好' : '需改善'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Activity className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <CardTitle>累积布局偏移 (CLS)</CardTitle>
                  <CardDescription>页面布局稳定性的指标</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {webVitals.cls ? webVitals.cls.toFixed(3) : '测量?..'}
                  </div>
                  <Badge variant={webVitals.cls && webVitals.cls <= 0.1 ? 'default' : 'secondary'}>
                    {webVitals.cls && webVitals.cls <= 0.1 ? '良好' : '需改善'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <CardTitle>可交互时?(TTI)</CardTitle>
                  <CardDescription>页面完全可交互的时间</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {webVitals.tti ? `${Math.round(webVitals.tti)}ms` : '测量?..'}
                  </div>
                  <Badge variant={webVitals.tti && webVitals.tti <= 5000 ? 'default' : 'secondary'}>
                    {webVitals.tti && webVitals.tti <= 5000 ? '良好' : '需改善'}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <TrendingUp className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <CardTitle>性能趋势</CardTitle>
                  <CardDescription>各项指标的变化趋?/CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">FCP趋势</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">LCP趋势</span>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">FID趋势</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* API性能面板 */}
          <TabsContent value="api-performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>API响应时间监控</CardTitle>
                    <CardDescription>实时监控所有API请求的性能表现</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={simulateApiCall} size="sm">
                      <Server className="h-4 w-4 mr-2" />
                      模拟请求
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {apiMetrics.length}
                    </div>
                    <div className="text-sm text-blue-800">总请求数</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {calculateAvgResponseTime()}ms
                    </div>
                    <div className="text-sm text-green-800">平均响应时间</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {apiMetrics.filter(m => m.value > 1000).length}
                    </div>
                    <div className="text-sm text-yellow-800">慢请?(>1s)</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">最近API请求</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {apiMetrics.slice(-10).reverse().map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <Server className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {metric?.url || 'Unknown endpoint'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {metric?.method || 'GET'} �?{formatTime(metric.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            metric.value < 200 ? 'text-green-600' :
                            metric.value < 1000 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {Math.round(metric.value)}ms
                          </span>
                          <Badge 
                            variant={
                              metric.value < 200 ? 'default' :
                              metric.value < 1000 ? 'secondary' : 'destructive'
                            }
                            className="text-xs"
                          >
                            {metric.value < 200 ? '�? :
                             metric.value < 1000 ? '�? : '�?}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* 页面加载面板 */}
          <TabsContent value="page-load" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>页面加载时间分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">导航计时</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>DNS查询:</span>
                          <span className="font-mono">45ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TCP连接:</span>
                          <span className="font-mono">120ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>请求时间:</span>
                          <span className="font-mono">85ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>DOM解析:</span>
                          <span className="font-mono">280ms</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>总加载时?</span>
                          <span className="font-mono text-blue-600">3.2s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>资源加载性能</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">JavaScript文件</span>
                      </div>
                      <Badge variant="secondary">156ms</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-green-500" />
                        <span className="text-sm">CSS文件</span>
                      </div>
                      <Badge variant="secondary">45ms</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">图片资源</span>
                      </div>
                      <Badge variant="secondary">342ms</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">API请求</span>
                      </div>
                      <Badge variant="secondary">180ms</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* 用户交互面板 */}
          <TabsContent value="interaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用户交互性能监控</CardTitle>
                <CardDescription>监测用户操作的响应速度和流畅度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Button onClick={triggerDomOperations}>
                      触发DOM操作
                    </Button>
                    <Button variant="outline">
                      模拟滚动操作
                    </Button>
                    <Button variant="outline">
                      模拟点击操作
                    </Button>
                  </div>
                  
                  <div 
                    id="dom-test-container" 
                    className="min-h-32 p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                  >
                    <p className="text-gray-500 text-center">
                      DOM操作测试区域 - 点击上方按钮添加元素
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">交互延迟统计</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">平均延迟:</span>
                            <span className="font-mono">85ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">最大延?</span>
                            <span className="font-mono">245ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">最小延?</span>
                            <span className="font-mono">12ms</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">性能建议</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>优化首屏加载时间</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <span>减少第三方脚本影?/span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>启用资源压缩</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
