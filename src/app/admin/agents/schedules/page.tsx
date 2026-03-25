'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Schedule {
  id: string;
  name: string;
  workflowId: string;
  workflowName: string;
  cronExpression: string;
  timezone: string;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  nextRun?: string;
  totalRuns: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export default function AgentsSchedulesPage() {
  const { user } = useUnifiedAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const N8N_BASE_URL =
    process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678';
  const N8N_API_KEY = process.env.N8N_API_TOKEN || '';

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${N8N_BASE_URL}/api/v1/schedules`, {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`n8n API 错误：${response.status}`);
      }

      const data = await response.json();
      setSchedules(data.data || []);
    } catch (err: any) {
      console.error('加载调度失败:', err);
      setSchedules(getMockSchedules());
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    try {
      if (editingSchedule) {
        const response = await fetch(
          `${N8N_BASE_URL}/api/v1/schedules/${editingSchedule.id}`,
          {
            method: 'PUT',
            headers: {
              'X-N8N-API-KEY': N8N_API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(scheduleData),
          }
        );

        if (!response.ok) throw new Error('更新失败');
      } else {
        const response = await fetch(`${N8N_BASE_URL}/api/v1/schedules`, {
          method: 'POST',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scheduleData),
        });

        if (!response.ok) throw new Error('创建失败');
      }

      await loadSchedules();
      setDialogOpen(false);
      setEditingSchedule(null);
    } catch (err: any) {
      console.error('保存调度失败:', err);
    }
  };

  const handleToggleSchedule = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(
        `${N8N_BASE_URL}/api/v1/schedules/${id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('更新失败');
      await loadSchedules();
    } catch (err: any) {
      console.error('切换调度状态失败:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('确定要删除此调度吗？')) return;

    try {
      const response = await fetch(`${N8N_BASE_URL}/api/v1/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
        },
      });

      if (!response.ok) throw new Error('删除失败');
      await loadSchedules();
    } catch (err: any) {
      console.error('删除调度失败:', err);
    }
  };

  const getMockSchedules = (): Schedule[] => [
    {
      id: '1',
      name: '每日数据备份',
      workflowId: 'w1',
      workflowName: '数据库备份工作流',
      cronExpression: '0 2 * * *',
      timezone: 'Asia/Shanghai',
      status: 'active',
      lastRun: '2026-03-25T02:00:00Z',
      nextRun: '2026-03-26T02:00:00Z',
      totalRuns: 365,
      successRate: 99.5,
      createdAt: '2025-03-25T10:00:00Z',
      updatedAt: '2026-03-24T09:30:00Z',
    },
    {
      id: '2',
      name: '每小时订单同步',
      workflowId: 'w2',
      workflowName: '订单处理工作流',
      cronExpression: '0 * * * *',
      timezone: 'Asia/Shanghai',
      status: 'active',
      lastRun: '2026-03-25T09:00:00Z',
      nextRun: '2026-03-25T10:00:00Z',
      totalRuns: 8760,
      successRate: 98.2,
      createdAt: '2025-03-20T14:20:00Z',
      updatedAt: '2026-03-24T11:15:00Z',
    },
    {
      id: '3',
      name: '周报生成与发送',
      workflowId: 'w3',
      workflowName: '报表生成工作流',
      cronExpression: '0 9 * * 1',
      timezone: 'Asia/Shanghai',
      status: 'inactive',
      lastRun: '2026-03-18T09:00:00Z',
      nextRun: undefined,
      totalRuns: 52,
      successRate: 97.8,
      createdAt: '2025-04-01T08:00:00Z',
      updatedAt: '2026-03-23T23:00:00Z',
    },
    {
      id: '4',
      name: '库存预警检查',
      workflowId: 'w4',
      workflowName: '库存管理工作流',
      cronExpression: '0 */4 * * *',
      timezone: 'Asia/Shanghai',
      status: 'active',
      lastRun: '2026-03-25T08:00:00Z',
      nextRun: '2026-03-25T12:00:00Z',
      totalRuns: 2190,
      successRate: 99.1,
      createdAt: '2025-03-15T16:45:00Z',
      updatedAt: '2026-03-24T09:45:00Z',
    },
  ];

  useEffect(() => {
    loadSchedules();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            运行中
          </Badge>
        );
      case 'inactive':
        return <Badge variant="secondary">已暂停</Badge>;
      case 'error':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            异常
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCronExpression = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;

    const [minute, hour, day, month, weekday] = parts;
    const descriptions = [];

    if (minute === '*' && hour === '*') {
      descriptions.push('每分钟');
    } else if (hour === '*') {
      descriptions.push(`每小时的第${minute}分钟`);
    } else if (minute === '0' && hour !== '*') {
      descriptions.push(`每天 ${hour}:00`);
    } else {
      descriptions.push(`${hour}:${minute}`);
    }

    if (day === '*' && month === '*' && weekday === '*') {
      // 每天
    } else if (weekday === '1' && day === '*' && month === '*') {
      descriptions.push('每周一');
    } else if (weekday !== '*') {
      descriptions.push(`每周${weekday}`);
    }

    return descriptions.join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 页面头部 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="w-8 h-8 text-blue-600" />
            n8n 调度管理
          </h1>
          <p className="text-gray-600">
            配置和管理定时任务的 Cron 表达式与触发器
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setEditingSchedule(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          创建调度
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总调度数</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              已配置的调度任务
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行中</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">正在执行的调度</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总执行次数</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules
                .reduce((sum, s) => sum + s.totalRuns, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">累计执行次数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.length > 0
                ? (
                    schedules.reduce((sum, s) => sum + s.successRate, 0) /
                    schedules.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              所有调度的平均成功率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 调度列表 */}
      <Card>
        <CardHeader>
          <CardTitle>调度任务列表</CardTitle>
          <CardDescription>连接到 n8n 服务器：{N8N_BASE_URL}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <p>加载中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map(schedule => (
                <div
                  key={schedule.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {schedule.name}
                        </h3>
                        {getStatusBadge(schedule.status)}
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        关联工作流：
                        <span className="font-medium">
                          {schedule.workflowName}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Cron 表达式
                          </div>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                            {schedule.cronExpression}
                          </code>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            执行频率
                          </div>
                          <div className="text-sm">
                            {formatCronExpression(schedule.cronExpression)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">时区</div>
                          <div className="text-sm">{schedule.timezone}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            成功率
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            {schedule.successRate}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {schedule.lastRun && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            上次执行：
                            {new Date(schedule.lastRun).toLocaleString('zh-CN')}
                          </span>
                        )}
                        {schedule.nextRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            下次执行：
                            {new Date(schedule.nextRun).toLocaleString('zh-CN')}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          总执行：{schedule.totalRuns.toLocaleString()} 次
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleSchedule(schedule.id, schedule.status)
                        }
                      >
                        {schedule.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            暂停
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            启动
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSchedule(schedule);
                          setDialogOpen(true);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
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

      {/* Cron 表达式快速参考 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Cron 表达式快速参考
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">常用示例：</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">
                    0 * * * *
                  </code>{' '}
                  - 每小时执行
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">
                    0 2 * * *
                  </code>{' '}
                  - 每天凌晨 2 点
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">
                    */5 * * * *
                  </code>{' '}
                  - 每 5 分钟
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">
                    0 9 * * 1
                  </code>{' '}
                  - 每周一上午 9 点
                </li>
                <li>
                  <code className="bg-gray-100 px-2 py-0.5 rounded">
                    0 0 1 * *
                  </code>{' '}
                  - 每月 1 号零点
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">字段说明：</h4>
              <ul className="space-y-1 text-gray-600">
                <li>分钟 (0-59)</li>
                <li>小时 (0-23)</li>
                <li>日期 (1-31)</li>
                <li>月份 (1-12)</li>
                <li>星期 (0-6，0=周日)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            调度管理说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>使用 Cron 表达式定义任务的执行时间</li>
            <li>支持设置时区以确保定时任务在正确的时间执行</li>
            <li>可以随时暂停和启动调度任务</li>
            <li>查看历史执行记录和成功率统计</li>
            <li>如果连接失败，将显示模拟数据用于演示</li>
          </ul>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? '编辑调度' : '创建调度'}
            </DialogTitle>
            <DialogDescription>
              配置定时任务的 Cron 表达式和触发器
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveSchedule({
                name: formData.get('name') as string,
                workflowId: formData.get('workflowId') as string,
                cronExpression: formData.get('cronExpression') as string,
                timezone: formData.get('timezone') as string,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  名称
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingSchedule?.name}
                  className="col-span-3"
                  placeholder="例如：每日数据备份"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workflowId" className="text-right">
                  工作流
                </Label>
                <Select
                  name="workflowId"
                  defaultValue={editingSchedule?.workflowId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择工作流" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w1">数据库备份工作流</SelectItem>
                    <SelectItem value="w2">订单处理工作流</SelectItem>
                    <SelectItem value="w3">报表生成工作流</SelectItem>
                    <SelectItem value="w4">库存管理工作流</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cron" className="text-right">
                  Cron 表达式
                </Label>
                <Input
                  id="cron"
                  name="cronExpression"
                  defaultValue={editingSchedule?.cronExpression}
                  className="col-span-3"
                  placeholder="0 2 * * *"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timezone" className="text-right">
                  时区
                </Label>
                <Select
                  name="timezone"
                  defaultValue={editingSchedule?.timezone || 'Asia/Shanghai'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">
                      Asia/Shanghai (UTC+8)
                    </SelectItem>
                    <SelectItem value="Asia/Tokyo">
                      Asia/Tokyo (UTC+9)
                    </SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York (UTC-5)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Europe/London (UTC+0)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {editingSchedule ? '保存更改' : '创建调度'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
