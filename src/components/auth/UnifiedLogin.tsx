'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnifiedLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  redirectUrl?: string;
  mode?: 'modal' | 'page';
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    is_admin?: boolean;
    [key: string]: any;
  };
  error?: string;
}

export function UnifiedLogin({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectUrl,
  mode = 'modal',
}: UnifiedLoginProps) {
  const router = useRouter();
  const { login } = useUnifiedAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 重置表单状态
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      rememberMe: false,
    });
    setShowPassword(false);
    setError('');
    setIsLoading(false);
    setIsProcessing(false);
  }, []);

  // 处理表单输入变化
  const handleInputChange = useCallback((field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  }, [error]);

  // 处理登录提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isProcessing) return;

    // 验证表单
    if (!formData.email || !formData.password) {
      setError('请填写邮箱和密码');
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError('');

    try {
      // 执行登录
      const result: LoginResult = await login(formData.email, formData.password);

      if (result.success && result.user) {
        // 登录成功
        console.debug('登录成功:', result.user);

        // 调用成功回调
        onLoginSuccess(result.user);

        // 根据用户角色跳转
        const targetUrl = redirectUrl || (result.user.is_admin ? '/admin/dashboard' : '/');
        router.push(targetUrl);

        // 如果是模态框模式，关闭模态框
        if (mode === 'modal') {
          onClose();
        }

        // 重置表单
        resetForm();
      } else {
        // 登录失败
        setError(result.error || '登录失败，请检查邮箱和密码');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsProcessing(false), 1000); // 防抖处理
    }
  }, [formData, isProcessing, login, onLoginSuccess, onClose, redirectUrl, router, mode, resetForm]);

  // 处理注册链接点击
  const handleRegister = useCallback(() => {
    const registerUrl = mode === 'modal' ? '/register' : '/register';
    router.push(registerUrl);
    if (mode === 'modal') {
      onClose();
    }
  }, [router, mode, onClose]);

  // 处理忘记密码
  const handleForgotPassword = useCallback(() => {
    router.push('/forgot-password');
    if (mode === 'modal') {
      onClose();
    }
  }, [router, mode, onClose]);

  // 当模态框关闭时重置表单
  useEffect(() => {
    if (!isOpen && mode === 'modal') {
      resetForm();
    }
  }, [isOpen, mode, resetForm]);

  // 渲染登录表单
  const renderLoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          placeholder="请输入邮箱"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入密码"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            id="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="rememberMe" className="text-sm text-gray-600">
            记住我
          </Label>
        </div>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          忘记密码？
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || isProcessing}>
        {isLoading ? '登录中...' : '登录'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        还没有账户？{' '}
        <button
          type="button"
          onClick={handleRegister}
          className="text-blue-600 hover:text-blue-800 font-medium"
          disabled={isLoading}
        >
          立即注册
        </button>
      </div>
    </form>
  );

  // 页面模式
  if (mode === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>登录</CardTitle>
            <CardDescription>请输入您的邮箱和密码登录账户</CardDescription>
          </CardHeader>
          <CardContent>{renderLoginForm()}</CardContent>
        </Card>
      </div>
    );
  }

  // 模态框模式
  if (mode === 'modal' && isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="relative">
            <CardTitle>登录</CardTitle>
            <CardDescription>请输入您的邮箱和密码登录账户</CardDescription>
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              ✕
            </button>
          </CardHeader>
          <CardContent>{renderLoginForm()}</CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

export default UnifiedLogin;
