'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ContentItem {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  confidence: number;
  detectedIssues: string[];
  processedAt: string;
}

export default function AutoModerationPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: 'content-001',
      content: '这是一段正常的内容，没有任何违规信息',
      type: 'text',
      status: 'approved',
      confidence: 95,
      detectedIssues: [],
      processedAt: new Date().toISOString(),
    },
    {
      id: 'content-002',
      content: '包含一些敏感词汇的内容需要被标记',
      type: 'text',
      status: 'flagged',
      confidence: 85,
      detectedIssues: ['敏感词检测', '潜在违规'],
      processedAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'content-003',
      content: '完全合规的内容示例',
      type: 'text',
      status: 'approved',
      confidence: 98,
      detectedIssues: [],
      processedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [stats, setStats] = useState({
    totalProcessed: 1247,
    approved: 1189,
    rejected: 34,
    flagged: 24,
    accuracy: 96.8,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const processContent = async (content: string) => {
    // 模拟自动审核处理
    await new Promise(resolve => setTimeout(resolve, 1000));

    const random = Math.random();
    let status: ContentItem['status'] = 'approved';
    let confidence = 90 + Math.random() * 10;
    let issues: string[] = [];

    if (random < 0.05) {
      status = 'rejected';
      confidence = 80 + Math.random() * 15;
      issues = ['违反社区规范', '不当内容'];
    } else if (random < 0.15) {
      status = 'flagged';
      confidence = 70 + Math.random() * 20;
      issues = ['需要人工复核', '潜在敏感内容'];
    }

    const newItem: ContentItem = {
      id: `content-${Date.now()}`,
      content,
      type: 'text',
      status,
      confidence,
      detectedIssues: issues,
      processedAt: new Date().toISOString(),
    };

    setContentItems(prev => [newItem, ...prev]);

    // 更新统计数据
    setStats(prev => ({
      ...prev,
      totalProcessed: prev.totalProcessed + 1,
      approved: status === 'approved'  prev.approved + 1 : prev.approved,
      rejected: status === 'rejected'  prev.rejected + 1 : prev.rejected,
      flagged: status === 'flagged'  prev.flagged + 1 : prev.flagged,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bot className="w-10 h-10 text-purple-600" />
            自动审核系统
          </h1>
          <p className="text-gray-600">基于AI的智能内容审核和风险识别平台</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总处理量</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalProcessed}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">通过</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">拒绝</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">标记</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.flagged}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">准确率</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.accuracy}%
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 内容测试区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                内容审核测试
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    输入测试内容
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="请输入要审核的内容..."
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        const target = e.target as HTMLTextAreaElement;
                        processContent(target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    提示: Ctrl+Enter 快速提交审核
                  </p>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    const textarea = document.querySelector(
                      'textarea'
                    ) as HTMLTextAreaElement;
                    if (textarea.value) {
                      processContent(textarea.value);
                      textarea.value = '';
                    }
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  立即审核
                </Button>

                {/* 快捷测试按钮 */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      processContent(
                        '这是一段正常的测试内容，用于验证审核系统'
                      )
                    }
                  >
                    正常内容
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      processContent('包含违规词汇的测试内容需要被拦截')
                    }
                  >
                    敏感内容
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 审核结果展示 */}
          <Card>
            <CardHeader>
              <CardTitle>最新审核结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {contentItems.slice(0, 10).map(item => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'approved' && '通过'}
                          {item.status === 'rejected' && '拒绝'}
                          {item.status === 'flagged' && '标记'}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.confidence.toFixed(1)}% 置信度
                      </span>
                    </div>

                    <p className="text-gray-800 text-sm mb-2 line-clamp-2">
                      {item.content}
                    </p>

                    {item.detectedIssues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.detectedIssues.map((issue, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(item.processedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 审核规则说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              审核规则说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">文本审核</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 敏感词过滤</li>
                  <li>• 语义分析</li>
                  <li>• 上下文理解</li>
                  <li>• 多语言支持</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">图像审核</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 内容识别</li>
                  <li>• 场景分析</li>
                  <li>• OCR文字提取</li>
                  <li>• NSFW检测</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">视频审核</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 帧级分析</li>
                  <li>• 音频识别</li>
                  <li>• 实时流处理</li>
                  <li>• 关键时刻标记</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
