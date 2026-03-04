'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ThumbsUp,
  Reply,
  Paperclip,
  Smile,
} from 'lucide-react';

interface Feedback {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  likes: number;
  replies: number;
  category: 'bug' | 'feature' | 'improvement' | 'other';
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: '1',
      user: '张三',
      message:
        '希望能在维修记录中添加图片上传功能，这样可以更好地记录维修过程?,
      timestamp: '2024-01-20 14:30',
      likes: 24,
      replies: 3,
      category: 'feature',
    },
    {
      id: '2',
      user: '李四',
      message: '设备管理页面加载速度有点慢，特别是在设备数量较多的时候?,
      timestamp: '2024-01-19 16:45',
      likes: 18,
      replies: 5,
      category: 'improvement',
    },
    {
      id: '3',
      user: '王五',
      message: '配件商城的商品分类不够详细，希望能增加更多的筛选选项?,
      timestamp: '2024-01-18 11:20',
      likes: 32,
      replies: 2,
      category: 'feature',
    },
  ]);

  const [newFeedback, setNewFeedback] = useState({
    message: '',
    category: 'other' as const,
    contact: '',
  });

  const handleSubmit = () => {
    if (!newFeedback.message.trim()) return;

    const feedback: Feedback = {
      id: (feedbacks.length + 1).toString(),
      user: '当前用户',
      message: newFeedback.message,
      timestamp: new Date().toLocaleString('zh-CN'),
      likes: 0,
      replies: 0,
      category: newFeedback.category,
    };

    setFeedbacks([feedback, ...feedbacks]);
    setNewFeedback({ message: '', category: 'other', contact: '' });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-blue-100 text-blue-800';
      case 'improvement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'bug':
        return 'Bug反馈';
      case 'feature':
        return '功能建议';
      case 'improvement':
        return '改进建议';
      default:
        return '其他';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
            意见反馈
          </h1>
          <p className="text-lg text-gray-600">
            您的意见对我们很重要，帮助我们不断改进产品和服务
          </p>
        </div>

        {/* 反馈提交区域 */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>提交反馈</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                反馈类型
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'bug', label: 'Bug反馈' },
                  { value: 'feature', label: '功能建议' },
                  { value: 'improvement', label: '改进建议' },
                  { value: 'other', label: '其他' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setNewFeedback({
                        ...newFeedback,
                        category: option.value as any,
                      })
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      newFeedback.category === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                您的反馈 *
              </label>
              <Textarea
                placeholder="请详细描述您的意见或建议..."
                value={newFeedback.message}
                onChange={e =>
                  setNewFeedback({ ...newFeedback, message: e.target.value })
                }
                rows={5}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系方式（可选）
              </label>
              <Input
                type="email"
                placeholder="邮箱地址，方便我们回复您"
                value={newFeedback.contact}
                onChange={e =>
                  setNewFeedback({ ...newFeedback, contact: e.target.value })
                }
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!newFeedback.message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              提交反馈
            </Button>
          </CardContent>
        </Card>

        {/* 热门反馈 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">热门反馈</h2>

          <div className="space-y-6">
            {feedbacks.map(feedback => (
              <Card
                key={feedback.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {feedback.user}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{feedback.timestamp}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feedback.category)}`}
                          >
                            {getCategoryText(feedback.category)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{feedback.message}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{feedback.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
                        <Reply className="w-4 h-4" />
                        <span className="text-sm">{feedback.replies} 回复</span>
                      </button>
                    </div>

                    <Button variant="outline" size="sm">
                      <Reply className="w-4 h-4 mr-1" />
                      回复
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 帮助信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smile className="w-5 h-5 mr-2 text-green-600" />
              其他联系方式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">在线客服</h3>
                <p className="text-sm text-gray-600 mb-3">7×24小时在线服务</p>
                <Button variant="outline" size="sm">
                  立即咨询
                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Paperclip className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">邮件联系</h3>
                <p className="text-sm text-gray-600 mb-3">
                  support@fixcycle.com
                </p>
                <Button variant="outline" size="sm">
                  发送邮?                </Button>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">服务时间</h3>
                <p className="text-sm text-gray-600 mb-3">工作?9:00-18:00</p>
                <Button variant="outline" size="sm">
                  查看详情
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

