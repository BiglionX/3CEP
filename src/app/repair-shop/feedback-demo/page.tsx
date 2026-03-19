/**
 * 操作反馈系统演示页面
 * 展示Toast通知、确认对话框和批量操作反馈功能
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  Send,
  Trash2,
  Save,
  Upload,
} from 'lucide-react';
import {
  FeedbackProvider,
  useFeedback,
  useConfirm,
  withBatchFeedback,
  FeedbackType,
} from '@/components/feedback-system';

// Toast演示组件
function ToastDemo() {
  const { showToast, clearAll } = useFeedback();
  const showSuccess = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.SUCCESS, title });
  const showError = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.ERROR, title });
  const showWarning = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.WARNING, title });
  const showInfo = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.INFO, title });
  const showLoading = (message: string) =>
    showToast(message, { type: FeedbackType.LOADING, duration: 0 });

  const [loadingToastVisible, setLoadingToastVisible] = useState(false);

  const handleSuccessToast = () => {
    showSuccess('操作成功', '您的数据已成功保存');
  };

  const handleErrorToast = () => {
    showError('操作失败', '请检查网络连接后重试');
  };

  const handleWarningToast = () => {
    showWarning('请注意', '此操作不可撤销,请谨慎操作');
  };

  const handleInfoToast = () => {
    showInfo('系统提示', '新版本功能现已可用');
  };

  const handleLoadingToast = () => {
    if (loadingToastVisible) {
      clearAll();
      setLoadingToastVisible(false);
    } else {
      showLoading('正在处理');
      setLoadingToastVisible(true);
    }
  };

  const handleCustomToast = () => {
    showToast('这条消息使用了自定义图标', {
      type: FeedbackType.SUCCESS,
      title: '自定义图标',
      duration: 6000,
      action: {
        label: '撤回',
        onClick: () => {
          // eslint-disable-next-line no-console
          console.log('消息已撤回');
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Toast通知演示
        </CardTitle>
        <CardDescription>各种类型的即时反馈通知</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button onClick={handleSuccessToast} variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            成功通知
          </Button>

          <Button onClick={handleErrorToast} variant="outline" size="sm">
            <XCircle className="w-4 h-4 mr-2 text-red-500" />
            错误通知
          </Button>

          <Button onClick={handleWarningToast} variant="outline" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
            警告通知
          </Button>

          <Button onClick={handleInfoToast} variant="outline" size="sm">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            信息通知
          </Button>

          <Button
            onClick={handleLoadingToast}
            variant={loadingToastVisible ? 'destructive' : 'outline'}
            size="sm"
          >
            <Loader2
              className={`w-4 h-4 mr-2 ${
                loadingToastVisible ? 'animate-spin' : ''
              }`}
            />
            {loadingToastVisible ? '关闭加载' : '加载通知'}
          </Button>

          <Button onClick={handleCustomToast} variant="outline" size="sm">
            <Send className="w-4 h-4 mr-2 text-purple-500" />
            自定义通知
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 确认对话框演示组件
function ConfirmDemo() {
  const showConfirm = useConfirm();

  const handleDeleteConfirm = async () => {
    const confirmed = await showConfirm.confirm({
      title: '确认删除',
      message: '此操作将永久删除选定的数据,是否继续?',
      confirmText: '删除',
      cancelText: '取消',
      onConfirm: async () => {
        // 模拟删除操作
        await new Promise(resolve => setTimeout(resolve, 1000));
        // eslint-disable-next-line no-console
        console.log('数据已删除');
      },
    });

    // eslint-disable-next-line no-console
    console.log('用户选择:', confirmed ? '确认删除' : '取消删除');
  };

  const handleSaveConfirm = async () => {
    await showConfirm.confirm({
      title: '保存更改',
      message: '您有未保存的更改,是否要保存?',
      confirmText: '保存',
      cancelText: '不保存',
      onConfirm: async () => {
        // 模拟保存操作
        await new Promise(resolve => setTimeout(resolve, 800));
        // console.log('更改已保存');
      },
      onCancel: () => {
        // console.log('放弃更改');
      },
    });
  };

  const handleDangerousAction = async () => {
    const confirmed = await showConfirm.confirm({
      title: '危险操作警告',
      message: '此操作可能导致数据丢失,强烈建议您先备份数据',
      confirmText: '我了解风险,继续',
      cancelText: '取消操作',
    });

    if (confirmed) {
      // eslint-disable-next-line no-console
      console.log('执行危险操作');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          确认对话框演示
        </CardTitle>
        <CardDescription>用户操作确认和危险操作警告</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDeleteConfirm} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            删除确认
          </Button>

          <Button onClick={handleSaveConfirm} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            保存确认
          </Button>

          <Button onClick={handleDangerousAction} variant="destructive">
            危险操作
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 表单操作演示组件
function FormDemo() {
  const { showToast, clearAll } = useFeedback();
  const showSuccess = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.SUCCESS, title });
  const showError = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.ERROR, title });
  const showLoading = (message: string) =>
    showToast(message, { type: FeedbackType.LOADING, duration: 0 });
  const showConfirm = useConfirm();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!formData.name.trim()) {
      showError('表单错误', '请输入姓名');
      return;
    }

    if (!formData.email.trim()) {
      showError('表单错误', '请输入邮箱地址');
      return;
    }

    showLoading('提交中...');

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearAll();
      showSuccess(
        '提交成功',
        '您的表单已成功提交,我们会尽快回复您'
      );

      // 重置表单
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      clearAll();
      showError('提交失败', '网络错误,请稍后重试');
    }
  };

  const handleReset = async () => {
    const confirmed = await showConfirm.confirm({
      title: '重置表单',
      message: '此操作将清除所有已输入的内容,是否继续?',
      confirmText: '重置',
      cancelText: '取消',
    });

    if (confirmed) {
      setFormData({ name: '', email: '', message: '' });
      showSuccess('表单已重置', '所有内容已清除');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          表单操作演示
        </CardTitle>
        <CardDescription>结合反馈系统的表单提交和重置操作</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="请输入您的姓名"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="请输入您的邮箱地址"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">留言</Label>
            <Input
              id="message"
              value={formData.message}
              onChange={e =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="请输入您的留言"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">
              <Send className="w-4 h-4 mr-2" />
              提交表单
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              重置
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// 批量操作演示组件
function BatchOperationDemo() {
  const [items] = useState([
    { id: 1, name: '项目A' },
    { id: 2, name: '项目B' },
    { id: 3, name: '项目C' },
    { id: 4, name: '项目D' },
    { id: 5, name: '项目E' },
  ]);

  const { showToast } = useFeedback();
  const showSuccess = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.SUCCESS, title });
  const showError = (title: string, message: string) =>
    showToast(message, { type: FeedbackType.ERROR, title });

  const handleBatchProcess = async () => {
    try {
      const result = await Promise.all(
        items.map(async item => {
          // 模拟处理每个项目
          await new Promise(resolve =>
            setTimeout(resolve, Math.random() * 1000 + 500)
          );

          // 模拟随机失败
          if (Math.random() < 0.2) {
            throw new Error(`处理 ${item.name} 时出错`);
          }

          return { id: item.id, success: true };
        })
      );

      // console.log('批量处理结果:', result);
      showSuccess('处理完成', `成功处理 ${result.length} 个项目`);
    } catch (error) {
      showError('处理失败', '部分项目处理失败,请查看详情');
    }
  };

  const handleBatchDelete = async () => {
    const result = await withBatchFeedback(
      items.slice(0, 3), // 只处理前3个项目
      async (item: { id: number; name: string }) => {
        // 模拟删除操作
        await new Promise(resolve => setTimeout(resolve, 800));
        return { id: item.id, success: true };
      },
      {
        itemName: '文件',
        successMessage: '删除成功',
        errorMessage: '删除失败',
      }
    );

    // console.log('批量删除结果:', result);
    showSuccess(
      '批量删除完成',
      `成功删除 ${result.filter(r => r.success).length}/${result.length} 个文件`
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          批量操作演示
        </CardTitle>
        <CardDescription>批量处理和操作反馈</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">待处理项目列表</h4>
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.id} className="text-sm text-gray-600">
                • {item.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleBatchProcess} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            批量处理所有项目
          </Button>

          <Button onClick={handleBatchDelete} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            批量删除项目
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 主演示组件
function FeedbackDemo() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          操作反馈系统演示
        </h1>
        <p className="text-gray-600">
          展示Toast通知、确认对话框和批量操作反馈功能
        </p>
      </div>

      <div className="space-y-8">
        <ToastDemo />
        <ConfirmDemo />
        <FormDemo />
        <BatchOperationDemo />
      </div>

      {/* 系统状态 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>反馈系统状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-600">Toast系统</div>
              <div className="text-xs text-green-500">运行正常</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">✓</div>
              <div className="text-sm text-gray-600">确认对话框</div>
              <div className="text-xs text-blue-500">运行正常</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">✓</div>
              <div className="text-sm text-gray-600">批量处理</div>
              <div className="text-xs text-purple-500">运行正常</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">✓</div>
              <div className="text-sm text-gray-600">全局集成</div>
              <div className="text-xs text-orange-500">运行正常</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 包装组件以提供反馈上下文
export default function FeedbackDemoPage() {
  return (
    <FeedbackProvider>
      <FeedbackDemo />
    </FeedbackProvider>
  );
}
