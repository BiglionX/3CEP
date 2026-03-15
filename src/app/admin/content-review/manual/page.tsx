'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Edit,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  Tag,
  MessageSquare,
  History,
  Shield,
  Award,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  autoModerationService,
  ContentItem,
  ModerationResult,
} from '@/lib/auto-moderation-service';

interface ReviewTask {
  id: string;
  content: ContentItem;
  autoResult: ModerationResult;
  status: 'pending' | 'reviewing' | 'completed';
  assignedTo: string;
  assignedAt: number;
  completedAt: number;
  reviewerNotes: string;
  finalDecision: 'approve' | 'reject' | 'modify';
}

interface Reviewer {
  id: string;
  name: string;
  level: 'junior' | 'senior' | 'expert';
  specialization: string[];
  performance: {
    accuracy: number;
    speed: number;
    workload: number;
  };
}

const ContentPreview: React.FC<{
  content: ContentItem;
  className: string;
}> = ({ content, className = '' }) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="space-y-3">
        {content.title && (
          <h3 className="font-semibold text-gray-900">{content.title}</h3>
        )}

        {content.type === 'text' && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">
              {content.content}
            </p>
          </div>
        )}

        {content.description && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">描述:</span> {content.description}
          </div>
        )}

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
          <User className="w-3 h-3 mr-1" />
          作者 {content.authorId.substring(0, 8)}
          <Clock className="w-3 h-3 ml-3 mr-1" />
          {new Date(content.submittedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const AutoReviewResult: React.FC<{ result: ModerationResult }> = ({
  result,
}) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'severe':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-yellow-500" />;
      case 'manual_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm">
          {getStatusIcon(result.status)}
          <span className="ml-2">自动审核结果</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">风险等级</span>
            <Badge className={`${getRiskColor(result.riskLevel)} font-medium`}>
              {result.riskLevel.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">审核分数</span>
            <span className="text-sm font-medium">
              {(result.score * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">置信度</span>
            <span className="text-sm font-medium">
              {(result.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">建议操作</span>
            <Badge variant="outline" className="text-xs capitalize">
              {result.recommendation}
            </Badge>
          </div>

          {result.issues.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                检测到的问题
              </div>
              <div className="space-y-2">
                {result.issues.map((issue, index) => (
                  <div key={index} className="text-xs bg-red-50 p-2 rounded">
                    <div className="font-medium text-red-800">{issue.type}</div>
                    <div className="text-red-700">{issue.description}</div>
                    {issue.snippet && (
                      <div className="font-mono text-red-600 mt-1">
                        "{issue.snippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ReviewDecisionPanel: React.FC<{
  taskId: string;
  onDecision: (
    decision: 'approve' | 'reject' | 'modify',
    notes: string
  ) => void;
}> = ({ taskId, onDecision }) => {
  const [decision, setDecision] = useState<'approve' | 'reject' | 'modify'>(
    'approve'
  );
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onDecision(decision, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          审核决策
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">审核决定</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={decision === 'approve'  'default' : 'outline'}
              className={
                decision === 'approve'  'bg-green-600 hover:bg-green-700' : ''
              }
              onClick={() => setDecision('approve')}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              通过
            </Button>
            <Button
              variant={decision === 'modify'  'default' : 'outline'}
              className={
                decision === 'modify'  'bg-yellow-600 hover:bg-yellow-700' : ''
              }
              onClick={() => setDecision('modify')}
            >
              <Edit className="w-4 h-4 mr-2" />
              修改
            </Button>
            <Button
              variant={decision === 'reject'  'default' : 'outline'}
              className={
                decision === 'reject'  'bg-red-600 hover:bg-red-700' : ''
              }
              onClick={() => setDecision('reject')}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              拒绝
            </Button>
          </div>
        </div>

        <div>
          <Label
            htmlFor="review-notes"
            className="text-sm font-medium mb-2 block"
          >
            审核备注
          </Label>
          <Textarea
            id="review-notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="请输入审核意见和建议..."
            rows={4}
          />
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          提交审核决定
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ManualReviewTool() {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30 秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 模拟获取待审核任务
      const mockTasks: ReviewTask[] = [
        {
          id: 'task_1',
          content: {
            id: 'content_1',
            type: 'text',
            content:
              '这是一个关于人工智能发展的深度分析文章，探讨了 AI 技术在各个领域的应用前景...',
            title: 'AI 技术发展趋势分析',
            description: '专业级 AI 技术分析文章',
            tags: ['人工智能', '技术分析', '未来发展'],
            authorId: 'user_abc123',
            submittedAt: Date.now() - 3600000,
          },
          autoResult: {
            id: 'mod_1',
            contentId: 'content_1',
            status: 'flagged',
            riskLevel: 'medium',
            score: 0.65,
            issues: [
              {
                type: 'sensitive_topic',
                description: '涉及敏感技术话题讨论',
                severity: 'medium',
                confidence: 0.8,
              },
            ],
            recommendation: 'review',
            moderatedAt: Date.now() - 3500000,
            moderator: 'auto_moderator_v1.0',
            confidence: 0.85,
          },
          status: 'pending',
        },
        {
          id: 'task_2',
          content: {
            id: 'content_2',
            type: 'text',
            content:
              '免费领取iPhone 15 Pro Max，点击链接立即获取！限时优惠，错过不再！',
            title: '免费领iPhone',
            authorId: 'user_xyz789',
            submittedAt: Date.now() - 7200000,
          },
          autoResult: {
            id: 'mod_2',
            contentId: 'content_2',
            status: 'rejected',
            riskLevel: 'high',
            score: 0.85,
            issues: [
              {
                type: 'spam_content',
                description: '检测到典型的垃圾营销内容',
                severity: 'high',
                confidence: 0.95,
              },
            ],
            recommendation: 'reject',
            moderatedAt: Date.now() - 7100000,
            moderator: 'auto_moderator_v1.0',
            confidence: 0.95,
          },
          status: 'pending',
        },
      ];

      // 模拟审核员数据
      const mockReviewers: Reviewer[] = [
        {
          id: 'rev_1',
          name: '张审核员',
          level: 'senior',
          specialization: ['技术内容', '专业文章'],
          performance: {
            accuracy: 0.95,
            speed: 0.88,
            workload: 12,
          },
        },
        {
          id: 'rev_2',
          name: '李审核员',
          level: 'expert',
          specialization: ['营销内容', '广告审核'],
          performance: {
            accuracy: 0.92,
            speed: 0.91,
            workload: 8,
          },
        },
      ];

      setTasks(mockTasks);
      setReviewers(mockReviewers);
    } catch (error) {
      console.error('加载审核数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task: ReviewTask) => {
    setSelectedTask(task);
  };

  const handleDecision = async (
    taskId: string,
    decision: 'approve' | 'reject' | 'modify',
    notes: string
  ) => {
    // 更新任务状态
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
           {
              ...task,
              status: 'completed',
              finalDecision: decision,
              reviewerNotes: notes,
              completedAt: Date.now(),
            }
          : task
      )
    );

    setSelectedTask(null);
  
    // 实际应用中会调用 API 保存审核结果
    // TODO: 移除调试日志
    console.log(`Task ${taskId} decided: ${decision}`, { notes });
  };
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.content.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;
    const showCompletedFilter = showCompleted || task.status !== 'completed';

    return matchesSearch && matchesStatus && showCompletedFilter;
  });

  const getTaskPriority = (task: ReviewTask) => {
    if (task.autoResult.riskLevel === 'severe') return 'high';
    if (task.autoResult.riskLevel === 'high') return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部区域 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Eye className="w-8 h-8 mr-3 text-blue-600" />
              人工审核工具
            </h1>
            <p className="mt-2 text-gray-600">专业内容审核和质量把控平台</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-completed"
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
              <Label htmlFor="show-completed" className="text-sm text-gray-600">
                显示已完成
              </Label>
            </div>

            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">待审核</p>
                  <p className="text-xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-2 mr-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">审核中</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {tasks.filter(t => t.status === 'reviewing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">已完成</p>
                  <p className="text-xl font-bold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">审核员</p>
                  <p className="text-xl font-bold text-purple-600">
                    {reviewers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 任务列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  审核任务列表
                </span>
                <span className="text-sm text-gray-500">
                  {filteredTasks.length} 个任务
                </span>
              </CardTitle>

              {/* 搜索和筛选 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索内容..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="reviewing">审核中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有优先级</SelectItem>
                    <SelectItem value="high">高优先级</SelectItem>
                    <SelectItem value="medium">中优先级</SelectItem>
                    <SelectItem value="low">低优先级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredTasks.map(task => {
                  const priority = getTaskPriority(task);
                  return (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(priority)}`}
                      onClick={() => handleTaskSelect(task)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant={
                                priority === 'high'
                                   'destructive'
                                  : priority === 'medium'
                                     'default'
                                    : 'secondary'
                              }
                            >
                              {priority.toUpperCase()} 优先级
                            </Badge>

                            <Badge variant="outline" className="text-xs">
                              {task.status === 'pending'
                                 '待审核'
                                : task.status === 'reviewing'
                                   '审核中'
                                  : '已完成'}
                            </Badge>

                            {task.autoResult && (
                              <Badge variant="outline" className="text-xs">
                                AI: {task.autoResult.riskLevel}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1">
                            {task.content.title || '无标题内容'}
                          </h3>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {task.content.content.substring(0, 100)}...
                          </p>

                          <div className="flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            {task.content.authorId.substring(0, 8)}
                            <Clock className="w-3 h-3 ml-3 mr-1" />
                            {new Date(
                              task.content.submittedAt
                            ).toLocaleString()}
                          </div>
                        </div>

                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          审核
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      暂无审核任务
                    </h3>
                    <p className="text-gray-600">所有任务都已处理完成</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细信息面板 */}
        <div className="lg:col-span-1">
          {selectedTask  (
            <div className="space-y-6">
              <ContentPreview content={selectedTask.content} />

              {selectedTask.autoResult && (
                <AutoReviewResult result={selectedTask.autoResult} />
              )}

              <ReviewDecisionPanel
                taskId={selectedTask.id}
                onDecision={(decision, notes) =>
                  handleDecision(selectedTask.id, decision, notes)
                }
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  选择任务开始审核
                </h3>
                <p className="text-gray-600">
                  从左侧列表中选择一个任务进行详细审核
                </p>
              </CardContent>
            </Card>
          )}

          {/* 审核员信息 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                在线审核员
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewers.map(reviewer => (
                  <div
                    key={reviewer.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {reviewer.name}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {reviewer.level} - {reviewer.specialization.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        准确率 {(reviewer.performance.accuracy * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        处理 {reviewer.performance.workload} 个任务
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

