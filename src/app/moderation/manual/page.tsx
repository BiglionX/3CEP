import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Flag,
} from 'lucide-react';

interface ReviewTask {
  id: string;
  content: string;
  contentType: 'text' | 'image' | 'video';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reviewer?: string;
  reason?: string;
}

export default function ManualReviewPage() {
  const [tasks, setTasks] = useState<ReviewTask[]>([
    {
      id: 'task-001',
      content: '这是一个测试内容，需要人工审核确认是否符合社区规范?,
      contentType: 'text',
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-002',
      content: '另一个待审核的内容示例，包含一些敏感词汇需要仔细检查?,
      contentType: 'text',
      status: 'pending',
      priority: 'high',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const handleApprove = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'approved',
              reviewer: 'admin',
              reason: reviewComment,
            }
          : task
      )
    );
    setSelectedTask(null);
    setReviewComment('');
  };

  const handleReject = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'rejected',
              reviewer: 'admin',
              reason: reviewComment,
            }
          : task
      )
    );
    setSelectedTask(null);
    setReviewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Eye className="w-10 h-10 text-blue-600" />
            人工审核工具
          </h1>
          <p className="text-gray-600">专业的人工内容审核和管理工作?/p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 任务列表 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  待审核任?({tasks.filter(t => t.status === 'pending').length}
                  )
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter(t => t.status === 'pending')
                    .map(task => (
                      <div
                        key={task.id}
                        className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          selectedTask?.id === task.id
                            ? 'ring-2 ring-blue-500'
                            : ''
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            任务 #{task.id.split('-')[1]}
                          </span>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                          {task.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 审核详情 */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    审核详情
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 内容预览 */}
                  <div>
                    <Label className="block mb-2">内容预览</Label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">{selectedTask.content}</p>
                    </div>
                  </div>

                  {/* 审核选项 */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => handleApprove(selectedTask.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      批准通过
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedTask.id)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      拒绝内容
                    </Button>
                  </div>

                  {/* 审核备注 */}
                  <div>
                    <Label htmlFor="reviewComment" className="block mb-2">
                      审核备注
                    </Label>
                    <Textarea
                      id="reviewComment"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="请输入审核意见和理由..."
                      rows={4}
                    />
                  </div>

                  {/* 快捷操作 */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      查看历史记录
                    </Button>
                    <Button variant="outline" size="sm">
                      标记为可?                    </Button>
                    <Button variant="outline" size="sm">
                      请求协助
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      选择任务开始审?                    </h3>
                    <p className="text-gray-500">
                      从左侧列表中选择一个待审核任务
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 已处理任?*/}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  已处理任?                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks
                    .filter(t => t.status !== 'pending')
                    .map(task => (
                      <div key={task.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">
                            任务 #{task.id.split('-')[1]}
                          </span>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === 'approved' ? '已批? : '已拒?}
                          </Badge>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {task.content.substring(0, 80)}...
                        </p>
                        {task.reason && (
                          <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                            <strong>审核意见:</strong> {task.reason}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <User className="w-3 h-3 mr-1" />
                          审核? {task.reviewer || '未知'} �?                          <Clock className="w-3 h-3 mx-1" />
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

