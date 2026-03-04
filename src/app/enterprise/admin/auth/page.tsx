"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  Users, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  Shield
} from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function EnterpriseAuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    companyName: '',
    businessLicense: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 简单验?
      if (!loginForm.email || !loginForm.password) {
        setErrors({ general: '请填写所有必填字? });
        return;
      }
      
      // 模拟成功登录，跳转到企业后台
      router.push('/enterprise/admin/dashboard');
    } catch (error) {
      setErrors({ general: '登录失败，请检查用户名和密? });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      // 表单验证
      const newErrors: Record<string, string> = {};
      
      if (!registerForm.companyName) newErrors.companyName = '请输入公司名?;
      if (!registerForm.businessLicense) newErrors.businessLicense = '请输入营业执照号?;
      if (!registerForm.contactPerson) newErrors.contactPerson = '请输入联系人姓名';
      if (!registerForm.phone) newErrors.phone = '请输入联系电?;
      if (!registerForm.email) newErrors.email = '请输入邮箱地址';
      if (!registerForm.password) newErrors.password = '请输入密?;
      if (registerForm.password !== registerForm.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一?;
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // 模拟注册
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 注册成功，自动登录并跳转
      router.push('/enterprise/admin/dashboard');
    } catch (error) {
      setErrors({ general: '注册失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-12">
        {/* 左侧宣传区域 */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="text-center lg:text-left mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              企业智能管理平台
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              一站式AI服务管理后台，助您轻松掌控企业智能化进程
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">智能体监?/h3>
                <p className="text-gray-600">实时监控AI智能体运行状态和性能指标</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">安全管理</h3>
                <p className="text-gray-600">企业级安全防护和权限管理体系</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">团队协作</h3>
                <p className="text-gray-600">多人协作管理，清晰的权限分工</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧登录/注册表单 */}
        <div className="lg:w-1/2">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'login'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  企业登录
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-3 px-4 text-center font-medium ${
                    activeTab === 'register'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  企业注册
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6">
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-email">企业邮箱 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        className="pl-10"
                        placeholder="请输入企业邮?
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码 *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        className="pl-10 pr-10"
                        placeholder="请输入密?
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-600">记住?/span>
                    </label>
                    <Link href="/enterprise/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      忘记密码?
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        登录?..
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        企业登录
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    还没有企业账户{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      立即注册
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-6">
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">公司名称 *</Label>
                      <Input
                        id="companyName"
                        value={registerForm.companyName}
                        onChange={(e) => setRegisterForm({...registerForm, companyName: e.target.value})}
                        placeholder="请输入公司全?
                        required
                      />
                      {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessLicense">营业执照 *</Label>
                      <Input
                        id="businessLicense"
                        value={registerForm.businessLicense}
                        onChange={(e) => setRegisterForm({...registerForm, businessLicense: e.target.value})}
                        placeholder="请输入营业执照号?
                        required
                      />
                      {errors.businessLicense && <p className="text-red-500 text-xs">{errors.businessLicense}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">联系?*</Label>
                      <Input
                        id="contactPerson"
                        value={registerForm.contactPerson}
                        onChange={(e) => setRegisterForm({...registerForm, contactPerson: e.target.value})}
                        placeholder="请输入联系人姓名"
                        required
                      />
                      {errors.contactPerson && <p className="text-red-500 text-xs">{errors.contactPerson}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">联系电话 *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        placeholder="请输入联系电?
                        required
                      />
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">企业邮箱 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        className="pl-10"
                        placeholder="请输入企业邮?
                        required
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">密码 *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          className="pl-10 pr-10"
                          placeholder="请输入密?
                          required
                        />
                      </div>
                      {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认密码 *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                          className="pl-10 pr-10"
                          placeholder="请再次输入密?
                          required
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="agreement"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      required
                    />
                    <label htmlFor="agreement" className="ml-2 text-sm text-gray-600">
                      我同意{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                        服务条款
                      </Link>
                      {' '}和{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                        隐私政策
                      </Link>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full py-6 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        注册?..
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        企业注册
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    已有企业账户{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      立即登录
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>© 2026 FixCycle AI Platform. 保留所有权利?/p>
          </div>
        </div>
      </div>
    </div>
  );
}
