/**
 * 性能测试验证演示页面
 * 执行完整的性能测试套件并展示测试结果
 */

'use client';

import { useState } from 'react';
import {
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Play,
  RotateCcw,
  BarChart3,
  Zap,
  HardDrive,
  Cpu,
  FileCode,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceReport {
  timestamp: number;
  summary: {
    overallScore: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  results: TestResult[];
  baselines: {
    loadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
    bundleSize: number;
    cpuUsage: number;
  };
  recommendations: string[];
}

interface TestResult {
  testName: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  metrics: Record<string, any>;
  errorMessage?: string;
}

export default function PerformanceTestingDemoPage() {
  const [testHistory, setTestHistory] = useState<PerformanceReport[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<PerformanceReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 模拟执行性能测试
  const executePerformanceTests = async () => {
    setIsRunning(true);

    // 模拟测试延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockReport: PerformanceReport = {
      timestamp: Date.now(),
      summary: {
        overallScore: 85,
        totalTests: 8,
        passedTests: 6,
        failedTests: 2,
      },
      results: [
        {
          testName: '页面加载时间测试',
          status: 'pass',
          duration: 2450,
          metrics: { loadTime: 2450, FCP: 1200, LCP: 2100 },
        },
        {
          testName: 'API响应时间测试',
          status: 'pass',
          duration: 320,
          metrics: { avgResponseTime: 320, p95: 450, p99: 520 },
        },
        {
          testName: '内存使用测试',
          status: 'fail',
          duration: 500,
          metrics: { memoryUsage: 120, peakMemory: 150 },
          errorMessage: '内存使用超过阈值 (120MB > 100MB)',
        },
        {
          testName: 'CPU使用率测试',
          status: 'pass',
          duration: 400,
          metrics: { avgCpu: 45, peakCpu: 72 },
        },
        {
          testName: 'Bundle大小测试',
          status: 'pass',
          duration: 200,
          metrics: { bundleSize: 480, gzipSize: 150 },
        },
        {
          testName: '首次内容绘制测试',
          status: 'pass',
          duration: 1200,
          metrics: { FCP: 1200, threshold: 1800 },
        },
        {
          testName: '最大内容绘制测试',
          status: 'fail',
          duration: 2100,
          metrics: { LCP: 2800, threshold: 2500 },
          errorMessage: 'LCP超过阈值 (2800ms > 2500ms)',
        },
        {
          testName: '累积布局偏移测试',
          status: 'pass',
          duration: 300,
          metrics: { CLS: 0.08, threshold: 0.1 },
        },
      ],
      baselines: {
        loadTime: 2450,
        apiResponseTime: 320,
        memoryUsage: 120,
        bundleSize: 480,
        cpuUsage: 45,
      },
      recommendations: [
        '优化图片资源加载,考虑使用WebP格式',
        '实施代码分割以减少初始加载时间',
        '减少内存使用,优化大对象处理',
        '优化API响应,添加缓存策略',
      ],
    };

    setTestHistory(prev => [mockReport, ...prev.slice(0, 9)]);
    setSelectedReport(mockReport);
    setIsRunning(false);
  };

  // 导出测试报告
  const exportReport = () => {
    if (!selectedReport) return;

    const reportData = {
      ...selectedReport,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 获取测试状态图标
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skip':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取测试状态文本
  const getTestStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return '通过';
      case 'fail':
        return '失败';
      case 'skip':
        return '跳过';
      default:
        return '未知';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            性能测试验证
          </h1>
          <p className="text-gray-600">执行完整的性能测试套件，验证优化效果</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={executePerformanceTests}
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                测试执行中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                执行性能测试
              </>
            )}
          </Button>

          <Button
            onClick={() => setSelectedReport(null)}
            variant="outline"
            disabled={!selectedReport}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置视图
          </Button>

          {selectedReport && (
            <Button onClick={exportReport} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Button>
          )}

          <Badge variant={isRunning ? 'default' : 'secondary'}>
            {isRunning ? '执行中' : '就绪'}
          </Badge>
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">当前测试</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
            <TabsTrigger value="baseline">性能基线</TabsTrigger>
          </TabsList>

          {/* 当前测试结果 */}
          <TabsContent value="current" className="space-y-6">
            {selectedReport ? (
              <>
                {/* 测试摘要 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总体评分
                      </CardTitle>
                      <TestTube className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600">
                        {selectedReport.summary.overallScore}
                      </div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{
                            width: `${selectedReport.summary.overallScore}%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        通过测试
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedReport.summary.passedTests}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        总计 {selectedReport.summary.totalTests} 个测试
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        失败测试
                      </CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {selectedReport.summary.failedTests}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        需要优化的项目
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        测试时间
                      </CardTitle>
                      <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {new Date(
                          selectedReport.timestamp
                        ).toLocaleTimeString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        测试执行时间
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 详细测试结果 */}
                <Card>
                  <CardHeader>
                    <CardTitle>详细测试结果</CardTitle>
                    <CardDescription>
                      各项性能指标的详细测试结果
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedReport.results.map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getTestStatusIcon(result.status)}
                            <div>
                              <h3 className="font-medium">{result.testName}</h3>
                              <p className="text-sm text-gray-500">
                                执行时间: {result.duration.toFixed(2)}ms
                              </p>
                              {Object.entries(result.metrics).map(
                                ([key, value]) => (
                                  <p
                                    key={key}
                                    className="text-xs text-gray-400"
                                  >
                                    {key}:{' '}
                                    {typeof value === 'number'
                                      ? value.toFixed(2)
                                      : value}
                                  </p>
                                )
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                result.status === 'pass'
                                  ? 'default'
                                  : result.status === 'fail'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {getTestStatusText(result.status)}
                            </Badge>

                            {result.errorMessage && (
                              <div className="max-w-xs">
                                <p className="text-xs text-red-600">
                                  {result.errorMessage}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 性能基线对比 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        性能基线数据
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">页面加载时间</span>
                          <span className="font-mono">
                            {selectedReport.baselines.loadTime.toFixed(2)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">API响应时间</span>
                          <span className="font-mono">
                            {selectedReport.baselines.apiResponseTime.toFixed(
                              2
                            )}
                            ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">内存使用</span>
                          <span className="font-mono">
                            {selectedReport.baselines.memoryUsage}MB
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">CPU使用率</span>
                          <span className="font-mono">
                            {selectedReport.baselines.cpuUsage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">打包大小</span>
                          <span className="font-mono">
                            {selectedReport.baselines.bundleSize.toFixed(2)}KB
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        优化建议
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedReport.recommendations.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedReport.recommendations.map(
                            (recommendation, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                                <span className="text-sm">
                                  {recommendation}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>恭喜！当前性能表现良好</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>性能测试准备就绪</CardTitle>
                  <CardDescription>
                    点击上方按钮开始执行性能测试
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-medium">加载性能</h3>
                      <p className="text-sm text-gray-600">
                        测试页面加载和渲染速度
                      </p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <HardDrive className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h3 className="font-medium">API性能</h3>
                      <p className="text-sm text-gray-600">
                        验证API响应时间和稳定性
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Cpu className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h3 className="font-medium">资源使用</h3>
                      <p className="text-sm text-gray-600">
                        监控内存和CPU使用情况
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 历史记录 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>测试历史记录</CardTitle>
                <CardDescription>查看以往的性能测试结果</CardDescription>
              </CardHeader>
              <CardContent>
                {testHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无测试记录</p>
                    <p className="text-sm mt-1">执行测试后将在此显示历史记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testHistory.map((report, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {report.summary.overallScore}
                            </div>
                            <div className="text-xs text-gray-500">
                              总体评分
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium">
                              测试 #{testHistory.length - index}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatTime(report.timestamp)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default" className="text-xs">
                                通过: {report.summary.passedTests}
                              </Badge>
                              <Badge variant="destructive" className="text-xs">
                                失败: {report.summary.failedTests}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {report.summary.totalTests} 个测试
                          </div>
                          <Button variant="outline" size="sm" className="mt-2">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 性能基线 */}
          <TabsContent value="baseline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>性能基线参数</CardTitle>
                  <CardDescription>行业标准和最佳实践参考</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Core Web Vitals
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>FCP (首次内容绘制): &lt; 1.8s</li>
                        <li>LCP (最大内容绘制): &lt; 2.5s</li>
                        <li>FID (首次输入延迟): &lt; 100ms</li>
                        <li>CLS (累积布局偏移): &lt; 0.1</li>
                        <li>TTI (可交互时间): &lt; 5s</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">
                        移动端性能
                      </h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>首屏加载: &lt; 3s</li>
                        <li>交互延迟: &lt; 50ms</li>
                        <li>内存使用: &lt; 50MB</li>
                        <li>Bundle大小: &lt; 200KB</li>
                        <li>API响应: &lt; 300ms</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>优化目标设定</CardTitle>
                  <CardDescription>根据测试结果设定改进目标</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        短期目标 (1-2周)
                      </h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>减少首页加载时间 20%</li>
                        <li>优化关键API响应时间</li>
                        <li>实施基本的代码分割</li>
                        <li>添加资源压缩</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">
                        长期目标 (1-3月)
                      </h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>实现SSG/ISR静态生成</li>
                        <li>建立完整的性能监控体系</li>
                        <li>优化图片和媒体资源</li>
                        <li>实施服务端缓存策略</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>性能测试配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">测试参数</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>迭代次数:</span>
                        <span className="font-mono">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>预热次数:</span>
                        <span className="font-mono">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>超时时间:</span>
                        <span className="font-mono">15s</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">性能阈值</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>加载时间:</span>
                        <span className="font-mono">&lt; 3000ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API响应:</span>
                        <span className="font-mono">&lt; 500ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>内存使用:</span>
                        <span className="font-mono">&lt; 100MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPU使用率:</span>
                        <span className="font-mono">&lt; 80%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
