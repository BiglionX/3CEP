'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  BarChart3,
  Bot,
  Coins,
  Globe,
  CreditCard,
  ShoppingCart,
  HelpCircle,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  CheckCircle,
  Circle,
} from 'lucide-react';
import Link from 'next/link';

interface RewardQuestion {
  id: string;
  activity_id: string;
  question_text: string;
  question_type: 'single' | 'multiple' | 'text';
  options: { label: string; value: string; isCorrect: boolean }[];
  correct_answer: string;
  explanation: string;
  points: number;
  sort_order: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  reward_type: string;
  reward_amount: number;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: string;
}

export default function RewardQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [questions, setQuestions] = useState<RewardQuestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<RewardQuestion | null>(
    null
  );
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'single' as 'single' | 'multiple' | 'text',
    options: [
      { label: 'A', value: '', isCorrect: false },
      { label: 'B', value: '', isCorrect: false },
      { label: 'C', value: '', isCorrect: false },
      { label: 'D', value: '', isCorrect: false },
    ],
    correct_answer: '',
    explanation: '',
    points: 10,
  });

  useEffect(() => {
    // 模拟加载活动数据和题目数据
    const mockActivity: Activity = {
      id: params.id as string,
      title: '产品使用技巧问答',
      description: '关于产品使用最佳实践的有奖问答活动',
      reward_type: 'fcx',
      reward_amount: 100,
      start_time: '2024-01-15T00:00:00Z',
      end_time: '2024-02-15T23:59:59Z',
      max_participants: 100,
      current_participants: 45,
      status: 'active',
    };

    const mockQuestions: RewardQuestion[] = [
      {
        id: '1',
        activity_id: params.id as string,
        question_text: '以下哪个是智能家居控制系统的核心功能？',
        question_type: 'single',
        options: [
          { label: 'A', value: '远程控制', isCorrect: true },
          { label: 'B', value: '打电话', isCorrect: false },
          { label: 'C', value: '发短信', isCorrect: false },
          { label: 'D', value: '玩游戏', isCorrect: false },
        ],
        correct_answer: 'A',
        explanation: '智能家居控制系统的核心功能是远程控制各种智能设备。',
        points: 10,
        sort_order: 1,
      },
      {
        id: '2',
        activity_id: params.id as string,
        question_text: '如何提升设备的使用寿命？',
        question_type: 'multiple',
        options: [
          { label: 'A', value: '定期维护', isCorrect: true },
          { label: 'B', value: '正确充电', isCorrect: true },
          { label: 'C', value: '摔打测试', isCorrect: false },
          { label: 'D', value: '避免潮湿', isCorrect: true },
        ],
        correct_answer: 'A,B,D',
        explanation: '定期维护、正确充电和避免潮湿环境都可以延长设备寿命。',
        points: 20,
        sort_order: 2,
      },
    ];

    setTimeout(() => {
      setActivity(mockActivity);
      setQuestions(mockQuestions);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleAddQuestion = () => {
    const newQ: RewardQuestion = {
      id: String(Date.now()),
      activity_id: params.id as string,
      ...newQuestion,
      sort_order: questions.length + 1,
    };
    setQuestions([...questions, newQ]);
    setIsModalOpen(false);
    resetForm();
  };

  const handleEditQuestion = (question: RewardQuestion) => {
    setEditingQuestion(question);
    setNewQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      points: question.points,
    });
    setIsModalOpen(true);
  };

  const handleUpdateQuestion = () => {
    if (editingQuestion) {
      setQuestions(
        questions.map(q =>
          q.id === editingQuestion.id ? { ...q, ...newQuestion } : q
        )
      );
      setIsModalOpen(false);
      setEditingQuestion(null);
      resetForm();
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('确定要删除这道题目吗？')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const resetForm = () => {
    setNewQuestion({
      question_text: '',
      question_type: 'single',
      options: [
        { label: 'A', value: '', isCorrect: false },
        { label: 'B', value: '', isCorrect: false },
        { label: 'C', value: '', isCorrect: false },
        { label: 'D', value: '', isCorrect: false },
      ],
      correct_answer: '',
      explanation: '',
      points: 10,
    });
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...newQuestion.options];
    if (field === 'isCorrect' && newQuestion.question_type === 'single') {
      // 单选题只能有一个正确答案
      newOptions.forEach((opt, i) => {
        newOptions[i] = { ...opt, isCorrect: i === index };
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const getCorrectAnswerText = (question: RewardQuestion) => {
    if (question.question_type === 'text') {
      return question.correct_answer;
    }
    return question.options
      .filter(o => o.isCorrect)
      .map(o => o.label)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 返回按钮 */}
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push('/enterprise/admin/reward-qa')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回活动列表
            </Button>

            {/* 活动信息 */}
            {activity && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">奖励类型：</span>
                      <span className="font-medium">
                        {activity.reward_type === 'fcx'
                          ? 'FCX奖励'
                          : activity.reward_type === 'physical'
                            ? '实物奖励'
                            : '混合奖励'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">奖励金额：</span>
                      <span className="font-medium">
                        {activity.reward_amount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">参与人数：</span>
                      <span className="font-medium">
                        {activity.current_participants}/
                        {activity.max_participants}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">状态：</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'draft'
                              ? 'bg-gray-100 text-gray-800'
                              : activity.status === 'ended'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {activity.status === 'active'
                          ? '进行中'
                          : activity.status === 'draft'
                            ? '草稿'
                            : activity.status === 'ended'
                              ? '已结束'
                              : '已关闭'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 题目管理 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>题目管理</CardTitle>
                <Dialog
                  open={isModalOpen}
                  onOpenChange={open => {
                    setIsModalOpen(open);
                    if (!open) {
                      setEditingQuestion(null);
                      resetForm();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      添加题目
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingQuestion ? '编辑题目' : '添加新题目'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid gap-2">
                        <Label htmlFor="question_text">题目内容</Label>
                        <Input
                          id="question_text"
                          value={newQuestion.question_text}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              question_text: e.target.value,
                            })
                          }
                          placeholder="请输入题目内容"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="question_type">题目类型</Label>
                          <select
                            id="question_type"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newQuestion.question_type}
                            onChange={e =>
                              setNewQuestion({
                                ...newQuestion,
                                question_type: e.target.value as any,
                              })
                            }
                          >
                            <option value="single">单选题</option>
                            <option value="multiple">多选题</option>
                            <option value="text">文本题</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="points">分值</Label>
                          <Input
                            id="points"
                            type="number"
                            value={newQuestion.points}
                            onChange={e =>
                              setNewQuestion({
                                ...newQuestion,
                                points: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>

                      {newQuestion.question_type !== 'text' && (
                        <div className="grid gap-2">
                          <Label>选项设置</Label>
                          <div className="space-y-2">
                            {newQuestion.options.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOptionChange(
                                      index,
                                      'isCorrect',
                                      !option.isCorrect
                                    )
                                  }
                                  className="flex-shrink-0"
                                >
                                  {option.isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                </button>
                                <span className="text-sm font-medium w-6">
                                  {option.label}
                                </span>
                                <Input
                                  value={option.value}
                                  onChange={e =>
                                    handleOptionChange(
                                      index,
                                      'value',
                                      e.target.value
                                    )
                                  }
                                  placeholder={`选项${option.label}`}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {newQuestion.question_type === 'single'
                              ? '点击圆形图标设置单选题正确答案'
                              : '点击圆形图标设置多选题正确答案'}
                          </p>
                        </div>
                      )}

                      {newQuestion.question_type === 'text' && (
                        <div className="grid gap-2">
                          <Label htmlFor="correct_answer">正确答案</Label>
                          <Input
                            id="correct_answer"
                            value={newQuestion.correct_answer}
                            onChange={e =>
                              setNewQuestion({
                                ...newQuestion,
                                correct_answer: e.target.value,
                              })
                            }
                            placeholder="请输入正确答案"
                          />
                        </div>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="explanation">答案解析</Label>
                        <Input
                          id="explanation"
                          value={newQuestion.explanation}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              explanation: e.target.value,
                            })
                          }
                          placeholder="请输入答案解析"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingQuestion(null);
                          resetForm();
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={
                          editingQuestion
                            ? handleUpdateQuestion
                            : handleAddQuestion
                        }
                      >
                        {editingQuestion ? '保存' : '添加'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      暂无题目
                    </h3>
                    <p className="text-gray-500 mb-4">
                      添加第一道题目开始有奖问答活动
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                                第{index + 1}题
                              </span>
                              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">
                                {question.question_type === 'single'
                                  ? '单选题'
                                  : question.question_type === 'multiple'
                                    ? '多选题'
                                    : '文本题'}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {question.points}分
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {question.question_text}
                            </h4>
                            {question.question_type !== 'text' && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {question.options.map((option, i) => (
                                  <div
                                    key={i}
                                    className={`text-sm p-2 rounded ${
                                      option.isCorrect
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <span className="font-medium mr-1">
                                      {option.label}.
                                    </span>
                                    {option.value}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">正确答案：</span>
                              {getCorrectAnswerText(question)}
                            </div>
                            {question.explanation && (
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">解析：</span>
                                {question.explanation}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
