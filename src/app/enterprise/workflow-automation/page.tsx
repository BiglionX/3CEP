'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'error' | 'stopped';
  lastRun: string;
  nextRun: string;
  successRate: number;
  tasksCompleted: number;
}

interface AutomationTask {
  id: string;
  name: string;
  type: 'data_sync' | 'email_notification' | 'file_processing' | 'api_call';
  status: 'pending' | 'running' | 'completed' | 'failed';
  schedule: string;
  lastExecution: string;
}

export default function WorkflowAutomationPage() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [_selectedWorkflow, _setSelectedWorkflow] = useState<string | null>(null);

  const workflows: Workflow[] = [
    {
      id: 'WF-001',
      name: '订单处理自动化',
      description: '自动处理新订单，包括库存检查、支付验证和发货通知',
      status: 'running',
      lastRun: '2024-01-20 14:30:25',
      nextRun: '2024-01-20 15:00:00',
      successRate: 98.5,
      tasksCompleted: 1247,
    },
    {
      id: 'WF-002',
      name: '数据同步流程',
      description: '定时同步各系统间的数据，保持信息一致性',
      status: 'running',
      lastRun: '2024-01-20 13:45:12',
      nextRun: '2024-01-20 16:00:00',
      successRate: 96.2,
      tasksCompleted: 892,
    },
    {
      id: 'WF-003',
      name: '报表生成系统',
      description: '自动生成各类业务报表并发送给相关人员',
      status: 'paused',
      lastRun: '2024-01-19 09:00:00',
      nextRun: '待恢复',
      successRate: 100,
      tasksCompleted: 156,
    },
  ];

  const automationTasks: AutomationTask[] = [
    {
      id: 'TASK-001',
      name: '库存数据同步',
      type: 'data_sync',
      status: 'completed',
      schedule: '每小时执行',
      lastExecution: '2024-01-20 14:00:00',
    },
    {
      id: 'TASK-002',
      name: '订单状态更新',
      type: 'api_call',
      status: 'running',
      schedule: '实时触发',
      lastExecution: '2024-01-20 14:30:15',
    },
    {
      id: 'TASK-003',
      name: '日报邮件发送',
      type: 'email_notification',
      status: 'pending',
      schedule: '每日 9:00',
      lastExecution: '2024-01-19 09:00:02',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'data_sync':
        return '🔄';
      case 'email_notification':
        return '📧';
      case 'file_processing':
        return '📁';
      case 'api_call':
        return '🔌';
      default:
        return '⚙️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 px:6lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl text:4xl font-bold text-gray-900 mb-4">
            流程自动化系统
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            RPA流程机器人，自动化重复性工作，提升业务效率和准确性
          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['workflows', 'tasks', 'scheduler', 'monitoring'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                     ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 text:gray-700hover:border-gray-300'
                }`}
              >
                {tab === 'workflows' && '工作流程'}
                {tab === 'tasks' && '自动化任务'}
                {tab === 'scheduler' && '任务调度'}
                {tab === 'monitoring' && '系统监控'}
              </button>
            ))}
          </nav>
        </div>

        {/* 工作流程 */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">自动化工作流程</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新建流程
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflows.map(workflow => (
                <Card
                  key={workflow.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => _setSelectedWorkflow(workflow.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{workflow.name}</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}
                          >
                            {workflow.status === 'running' && '运行中'}
                            {workflow.status === 'paused' && '已暂停'}
                            {workflow.status === 'error' && '错误'}
                            {workflow.status === 'stopped' && '已停止'}
                          </span>
                        </CardTitle>
                        <p className="text-gray-600 mt-1">
                          {workflow.description}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          {workflow.status === 'running' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">上次运行:</span>
                        <div className="font-medium">{workflow.lastRun}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">下次运行:</span>
                        <div className="font-medium">
                          {workflow.nextRun || '无计划'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">成功率</span>
                        <div className="font-medium text-green-600">
                          {workflow.successRate}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">任务完成:</span>
                        <div className="font-medium">
                          {workflow.tasksCompleted}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 自动化任务 */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>任务列表</span>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    添加任务
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">任务名称</th>
                        <th className="text-left py-3 px-4">类型</th>
                        <th className="text-left py-3 px-4">状态</th>
                        <th className="text-left py-3 px-4">执行计划</th>
                        <th className="text-left py-3 px-4">上次执行</th>
                        <th className="text-left py-3 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automationTasks.map(task => (
                        <tr key={task.id} className="border-b bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-xl mr-2">
                                {getTaskTypeIcon(task.type)}
                              </span>
                              <span className="font-medium">{task.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            {task.type === 'data_sync' && '数据同步'}
                            {task.type === 'email_notification' && '邮件通知'}
                            {task.type === 'file_processing' && '文件处理'}
                            {task.type === 'api_call' && 'API调用'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}
                            >
                              {task.status === 'pending' && '待执行'}
                              {task.status === 'running' && '执行中'}
                              {task.status === 'completed' && '已完成'}
                              {task.status === 'failed' && '失败'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{task.schedule}</td>
                          <td className="py-3 px-4">{task.lastExecution}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 任务调度 */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  调度计划管理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">定时任务</h3>
                    <div className="space-y-3">
                      {[
                        { time: '09:00', task: '日报生成', status: 'active' },
                        { time: '12:00', task: '数据备份', status: 'active' },
                        {
                          time: '18:00',
                          task: '周报汇总',
                          status: 'scheduled',
                        },
                      ].map((schedule, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{schedule.time}</div>
                            <div className="text-sm text-gray-600">
                              {schedule.task}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              schedule.status === 'active'
                                 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {schedule.status === 'active'  ? '运行中' : '已计划'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">事件触发</h3>
                    <div className="space-y-3">
                      {[
                        {
                          event: '新订单创建',
                          action: '发送确认邮件',
                          status: 'enabled',
                        },
                        {
                          event: '库存低于阈值',
                          action: '发送补货提醒',
                          status: 'enabled',
                        },
                        {
                          event: '用户注册',
                          action: '发送欢迎消息',
                          status: 'disabled',
                        },
                      ].map((trigger, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{trigger.event}</div>
                            <div className="text-sm text-gray-600">
                              {trigger.action}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              trigger.status === 'enabled'
                                 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {trigger.status === 'enabled'  ? '启用' : '禁用'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 系统监控 */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    系统状态
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>CPU使用率</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: '45%' }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>内存使用率</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: '68%' }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    执行统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>今日任务数</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>成功率</span>
                      <span className="font-semibold text-green-600">
                        98.5%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>失败任务</span>
                      <span className="font-semibold text-red-600">19</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    系统警告
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center p-2 bg-yellow-50 rounded">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-sm">3个任务执行超时</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">所有系统正常运行</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
