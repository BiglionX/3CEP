'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Wrench,
  Smartphone,
  Tablet,
  Laptop,
  Battery,
  Wifi,
  Camera,
  Volume2,
  Power,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react';

interface DiagnosticTest {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  duration?: number;
}

export default function DiagnosticsPage() {
  const router = useRouter();
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceType, setDeviceType] = useState('smartphone');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<DiagnosticTest[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  const deviceTypes = [
    { id: 'smartphone', name: '智能手机', icon: Smartphone },
    { id: 'tablet', name: '平板电脑', icon: Tablet },
    { id: 'laptop', name: '笔记本电?, icon: Laptop },
  ];

  const diagnosticTests: DiagnosticTest[] = [
    {
      id: 'power_test',
      name: '电源测试',
      category: '硬件检?,
      description: '检测电池状态和充电功能',
      status: 'pending',
    },
    {
      id: 'display_test',
      name: '显示屏测?,
      category: '硬件检?,
      description: '检测屏幕显示和触控功能',
      status: 'pending',
    },
    {
      id: 'wifi_test',
      name: 'WiFi连接测试',
      category: '网络检?,
      description: '检测无线网络连接功?,
      status: 'pending',
    },
    {
      id: 'camera_test',
      name: '摄像头测?,
      category: '硬件检?,
      description: '检测前后摄像头功能',
      status: 'pending',
    },
    {
      id: 'audio_test',
      name: '音频测试',
      category: '硬件检?,
      description: '检测扬声器和麦克风功能',
      status: 'pending',
    },
    {
      id: 'storage_test',
      name: '存储测试',
      category: '性能检?,
      description: '检测存储空间和读写速度',
      status: 'pending',
    },
  ];

  const startDiagnostic = async () => {
    if (!deviceModel.trim()) {
      alert('请输入设备型?);
      return;
    }

    setIsTesting(true);
    setTestResults(diagnosticTests);
    setCurrentTestIndex(0);

    // 模拟逐步执行测试
    for (let i = 0; i < diagnosticTests.length; i++) {
      // 更新当前测试状态为运行?      setTestResults(prev =>
        prev.map((test, index) =>
          index === i ? { ...test, status: 'running' } : test
        )
      );

      // 模拟测试执行时间
      await new Promise(resolve =>
        setTimeout(resolve, 2000 + Math.random() * 3000)
      );

      // 随机确定测试结果?0%通过率）
      const isSuccess = Math.random() > 0.2;

      // 更新测试结果
      setTestResults(prev =>
        prev.map((test, index) =>
          index === i
            ? {
                ...test,
                status: isSuccess ? 'passed' : 'failed',
                result: isSuccess ? '测试通过' : '发现问题',
                duration: 1500 + Math.random() * 1000,
              }
            : test
        )
      );

      setCurrentTestIndex(i + 1);
    }

    setIsTesting(false);
  };

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
    }
  };

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverallStatus = () => {
    if (testResults.length === 0) return null;

    const failedCount = testResults.filter(t => t.status === 'failed').length;
    const passedCount = testResults.filter(t => t.status === 'passed').length;

    if (failedCount === 0)
      return { status: 'excellent', text: '优秀', color: 'text-green-600' };
    if (failedCount <= 2)
      return { status: 'good', text: '良好', color: 'text-yellow-600' };
    return { status: 'poor', text: '较差', color: 'text-red-600' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                �?返回
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                设备诊断工具
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 设备信息输入 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              设备信息
            </CardTitle>
            <CardDescription>输入要诊断的设备信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deviceType">设备类型</Label>
                <div className="grid grid-cols-3 gap-2">
                  {deviceTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={deviceType === type.id ? 'default' : 'outline'}
                        onClick={() => setDeviceType(type.id)}
                        className="flex flex-col items-center gap-1 h-20"
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{type.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceModel">设备型号 *</Label>
                <Input
                  id="deviceModel"
                  value={deviceModel}
                  onChange={e => setDeviceModel(e.target.value)}
                  placeholder="例如: iPhone 14 Pro"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={startDiagnostic}
                  disabled={isTesting || !deviceModel.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isTesting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      诊断?.. ({currentTestIndex}/{diagnosticTests.length})
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      开始诊?                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 诊断结果 */}
        {testResults.length > 0 && (
          <>
            {/* 总体评估 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>总体评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {overallStatus && (
                      <>
                        <div
                          className={`text-3xl font-bold ${overallStatus.color}`}
                        >
                          {overallStatus.text}
                        </div>
                        <div className="text-gray-600">
                          {
                            testResults.filter(t => t.status === 'passed')
                              .length
                          }{' '}
                          项通过?                          {
                            testResults.filter(t => t.status === 'failed')
                              .length
                          }{' '}
                          项失?                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">诊断完成时间</div>
                    <div className="font-medium">
                      {new Date().toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 详细测试结果 */}
            <Card>
              <CardHeader>
                <CardTitle>详细测试结果</CardTitle>
                <CardDescription>各项功能的详细诊断结?/CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((test, index) => (
                    <div
                      key={test.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(test.status)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {test.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {test.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <Badge variant="secondary">{test.category}</Badge>
                            {test.duration && (
                              <span>耗时: {Math.round(test.duration)}ms</span>
                            )}
                          </div>

                          {test.result && (
                            <div
                              className={`mt-2 text-sm font-medium ${
                                test.status === 'passed'
                                  ? 'text-green-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {test.result}
                            </div>
                          )}
                        </div>

                        <Badge className={getStatusColor(test.status)}>
                          {test.status === 'passed'
                            ? '通过'
                            : test.status === 'failed'
                              ? '失败'
                              : test.status === 'running'
                                ? '进行?
                                : '待测?}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 建议和报?*/}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>维修建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      发现的问?                    </h4>
                    <ul className="space-y-2">
                      {testResults
                        .filter(test => test.status === 'failed')
                        .map(test => (
                          <li key={test.id} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {test.name}: {test.result}
                            </span>
                          </li>
                        ))}
                      {testResults.filter(test => test.status === 'failed')
                        .length === 0 && (
                        <li className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span>未发现明显硬件问?/span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">处理建议</h4>
                    <Textarea
                      placeholder="根据诊断结果输入维修建议..."
                      rows={4}
                      className="mb-4"
                    />
                    <div className="flex gap-3">
                      <Button variant="outline">保存报告</Button>
                      <Button>生成报价</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 使用说明 */}
        {!isTesting && testResults.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    1. 输入设备信息
                  </h3>
                  <p className="text-sm text-gray-600">
                    选择设备类型并输入准确的设备型号
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    2. 开始诊?                  </h3>
                  <p className="text-sm text-gray-600">
                    点击开始诊断按钮，系统将自动运行多项测?                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    3. 查看结果
                  </h3>
                  <p className="text-sm text-gray-600">
                    根据诊断结果制定维修方案和报?                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

