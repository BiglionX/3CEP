'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  message?: string;
  timestamp: Date;
}

const TestComponentDemo = () => {
  // @ts-ignore
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // 测试用例定义
  const testCases = [
    {
      id: 'tc-001',
      name: '搜索无结果友好提示测?,
      description: '验证当搜索无匹配结果时显示友好的提示信息',
    },
    {
      id: 'tc-002',
      name: '预约时间冲突处理测试',
      description: '测试多个用户预约同一时间段时的冲突处理机?,
    },
    {
      id: 'tc-003',
      name: '连续时间段预约测?,
      description: '验证用户可以连续预约多个相邻时间段的功能',
    },
    {
      id: 'tc-004',
      name: '点赞功能边界测试',
      description: '测试点赞次数限制和重复点击防?,
    },
    {
      id: 'tc-005',
      name: '文件上传大小限制测试',
      description: '验证文件上传的大小限制和格式检?,
    },
  ];

  // 运行单个测试
  const runSingleTest = async (
    testCase: (typeof testCases)[0]
  ): Promise<TestResult> => {
    return new Promise(resolve => {
      const startTime = Date.now();

      // 模拟测试执行时间
      setTimeout(
        () => {
          const duration = Date.now() - startTime;
          const isSuccess = Math.random() > 0.2; // 80%成功?
          resolve({
            id: testCase.id,
            name: testCase.name,
            status: isSuccess ? 'passed' : 'failed',
            duration,
            message: isSuccess
              ? '测试通过 �?
              : '测试失败 �?- 预期结果与实际不?,
            timestamp: new Date(),
          });
        },
        1000 + Math.random() * 2000
      ); // 1-3秒随机延?    });
  };

  // 运行所有测?  const runAllTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setTestResults([]);

    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await runSingleTest(testCase);
      results.push(result);
      setTestResults([...results]);
      setProgress(((i + 1) / testCases.length) * 100);
    }

    setIsRunning(false);
  };

  // 重置测试
  const resetTests = () => {
    setTestResults([]);
    setProgress(0);
    setIsRunning(false);
  };

  // 获取状态图?  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // 获取状态文?  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return '通过';
      case 'failed':
        return '失败';
      case 'running':
        return '运行?;
      default:
        return '等待';
    }
  };

  // 获取状态颜?  const getStatusColor = (status: TestResult['status']) => {
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

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>测试控制面板</span>
            <Badge variant="secondary">
              {testResults.filter(r => r.status === 'passed').length}/
              {testCases.length} 通过
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? '测试进行?..' : '运行所有测?}
            </Button>

            <Button
              onClick={resetTests}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
          </div>

          {isRunning && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>进度: {Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试用例列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testCases.map(testCase => {
          const result = testResults.find(r => r.id === testCase.id);

          return (
            <Card
              key={testCase.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-start justify-between">
                  <span>{testCase.name}</span>
                  {result && (
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1">
                        {getStatusText(result.status)}
                      </span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">
                  {testCase.description}
                </p>

                {result && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">执行时间:</span>
                      <span className="font-medium">{result.duration}ms</span>
                    </div>
                    {result.message && (
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span
                          className={
                            result.status === 'failed'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }
                        >
                          {result.message}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 测试结果摘要 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.length}
                </div>
                <div className="text-sm text-gray-600">总测试数</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-sm text-gray-600">通过</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">失败</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round(
                    (testResults.filter(r => r.status === 'passed').length /
                      testResults.length) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">通过?/div>
              </div>
            </div>

            {testResults.some(r => r.status === 'failed') && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    注意：部分测试失败，请检查相关功能实?                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestComponentDemo;

