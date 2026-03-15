'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Eye,
  EyeOff,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Lock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 扩展Window接口以支持自定义属性
declare global {
  interface Window {
    unifiedLoginInitialized?: boolean;
  }
}

// 全局防抖动标志，防止组件重复初始化
if (typeof window !== 'undefined' && !window.unifiedLoginInitialized) {
  window.unifiedLoginInitialized = true;
  // TODO: 移除调试日志 - console.log('🔒 UnifiedLogin组件防抖动初始化')
}

interface UnifiedLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
  redirectUrl?: string;
  showRegisterLink?: boolean;
  mode?: 'modal' | 'page';
}

// 重定向信息提示组件
const RedirectInfo = ({ redirectUrl }: { redirectUrl?: string }) => {
  if (!redirectUrl || redirectUrl === '/' || redirectUrl === '') return null;
  
  const getTargetDescription = () => {
    if (redirectUrl.startsWith('/admin')) return '管理后台';
    if (redirectUrl.startsWith('/brand')) return '品牌商平台';
    if (redirectUrl.startsWith('/repair-shop')) return '维修师平台';
    if (redirectUrl.startsWith('/importer') || redirectUrl.startsWith('/exporter')) return '贸易平台';
    return '目标页面';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4"
    >
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium">登录后将跳转</p>
          <p className="text-blue-700 text-sm mt-1">{getTargetDescription()}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// 防抖动标志，避免重复渲染
let isProcessing = false;

export function UnifiedLogin({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectUrl,
  showRegisterLink = true,
  mode = 'modal'
}: UnifiedLoginProps) {
  const router = useRouter();
  const { login, isAuthenticated, is_admin, isLoading: authLoading } = useUnifiedAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // 如果已经登录，自动关闭或跳转（优化版-防闪烁）
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // 使用setTimeout避免同步执行导致的组件闪?
      const timer = setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({ email: formData.email, is_admin });
        }
        handleClose();
      }, 100); // 100ms微延?
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isOpen, onLoginSuccess]);

  // 登录成功后的倒计?
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      performRedirect();
    }
  }, [success, countdown]);

  // 执行重定?
  const performRedirect = () => {
    if (onLoginSuccess) {
      onLoginSuccess({ email: formData.email, is_admin });
    }
    handleClose();
    
    // 使用路由器进行跳?
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (is_admin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  };

  const handleClose = () => {
    // 重置表单状?
    setFormData({
      email: '',
      password: '',
      rememberMe: false
    });
    setError('');
    setSuccess(false);
    setIsLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误信息
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('请输入邮箱地址');
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址');
      return false;
    }
    
    if (!formData.password) {
      setError('请输入密码');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess(true);
        // 保存记住我状?
        if (formData.rememberMe) {
          localStorage.setItem('remember_email', formData.email);
        } else {
          localStorage.removeItem('remember_email');
        }
        
        // 优化的登录成功处理流?
        setTimeout(() => {
          // 先执行回?
          if (onLoginSuccess) {
            onLoginSuccess(result.user);
          }
          
          // 然后执行跳转（避免组件卸载时的状态冲突）
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (result?.is_admin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
          
          // 最后关闭组?
          setTimeout(() => {
            handleClose();
          }, 100);
        }, 1800);
      } else {
        setError(result.error || '登录失败，请检查邮箱和密码');
      }
    } catch (err: any) {
      setError(err.message || '登录过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const LoginForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
          <CardDescription className="text-center">
            登录您的FixCycle账户
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 重定向信息提?*/}
            <RedirectInfo redirectUrl={redirectUrl} />

            {/* 成功提示 */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800 mb-1">登录成功!</h3>
                  <p className="text-green-700 mb-3">
                    {redirectUrl 
                      ? `将在 ${countdown} 秒后跳转到目标页面` 
                      : '正在为您跳转...'
                    }
                  </p>
                  {redirectUrl && (
                    <button
                      onClick={performRedirect}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      立即跳转
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && !success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                  <span className="text-red-800 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 邮箱输入 */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                邮箱地址 *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 py-5 text-base"
                  placeholder="your@email.com"
                  disabled={isLoading || success}
                  required
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                密码 *
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-12 py-5 text-base"
                  placeholder="•••••••"
                  disabled={isLoading || success}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading || success}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 记住我和忘记密码 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={isLoading || success}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  记住我
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                disabled={isLoading || success}
              >
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full py-5 text-base font-medium"
              disabled={isLoading || success || authLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  登录中...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  登录成功
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 注册链接 */}
          {showRegisterLink && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                还没有账户{' '}
                <button
                  onClick={() => {
                    handleClose();
                    window.location.href = '/register';
                  }}
                  className="font-medium text-blue-600 hover:text-blue-800"
                  disabled={isLoading || success}
                >
                  立即注册
                </button>
              </p>
            </div>
          )}

          {/* 服务条款 */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>登录即表示您同意我们的服务条款和隐私政策</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // 页面模式
  return mode === 'page' ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  ) : (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              disabled={isLoading || success}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            <LoginForm />
          </div>
        </DialogContent>
      </Dialog>
    );
}

// 便捷的Hook用于管理登录状态
export function useUnifiedLogin() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  
  return {
    isLoginOpen,
    openLogin,
    closeLogin
  };
}