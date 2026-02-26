# 统一认证组件库

## 📦 组件概览

统一认证组件库提供了一套完整、可定制的认证解决方案，支持多种业务场景和主题风格。

## 🚀 核心组件

### 1. UnifiedLogin 统一登录组件

```typescript
import { UnifiedLogin } from '@/components/auth/UnifiedLogin'

// 基础用法
<UnifiedLogin 
  isOpen={true}
  onClose={() => {}}
  onLoginSuccess={(user) => {}}
  mode="page"
/>

// 高级配置
<UnifiedLogin 
  isOpen={true}
  onClose={() => {}}
  onLoginSuccess={(user) => {}}
  redirectUrl="/dashboard"
  mode="modal"
  theme="admin"
  loginMethods={['email', 'phone']}
  showRememberMe={true}
  showForgotPassword={true}
/>
```

#### Props 说明

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `isOpen` | `boolean` | `false` | 控制弹窗显示状态 |
| `onClose` | `() => void` | 必需 | 关闭回调函数 |
| `onLoginSuccess` | `(user: any) => void` | 可选 | 登录成功回调 |
| `redirectUrl` | `string` | `undefined` | 登录成功后重定向地址 |
| `mode` | `'modal' \| 'page'` | `'modal'` | 显示模式 |
| `theme` | `AuthTheme` | `'default'` | 主题配置 |
| `loginMethods` | `LoginMethod[]` | `['email']` | 支持的登录方式 |
| `showRememberMe` | `boolean` | `true` | 是否显示记住我选项 |
| `showForgotPassword` | `boolean` | `true` | 是否显示忘记密码链接 |

### 2. AuthControls 认证状态控件

```typescript
import { 
  AuthControls, 
  NavbarAuthControls, 
  SidebarAuthControls,
  CompactAuthControls 
} from '@/components/auth/AuthControls'

// 导航栏控件
<NavbarAuthControls />

// 侧边栏控件
<SidebarAuthControls />

// 紧凑控件
<CompactAuthControls />
```

### 3. useUnifiedAuth Hook

```typescript
import { useUnifiedAuth } from '@/hooks/use-unified-auth'

const {
  user,
  isAuthenticated,
  is_admin,
  roles,
  isLoading,
  error,
  login,
  logout,
  hasPermission
} = useUnifiedAuth()
```

## 🎨 主题系统

### 预设主题

```typescript
// 管理员主题
const adminTheme: AuthTheme = {
  name: 'admin',
  primaryColor: '#3b82f6',
  secondaryColor: '#1d4ed8',
  title: '管理后台登录',
  subtitle: '请输入您的管理员凭证',
  background: 'linear-gradient(to bottom right, #dbeafe, #bfdbfe)',
  logo: '/icons/admin-logo.svg'
}

// 品牌商主题
const brandTheme: AuthTheme = {
  name: 'brand',
  primaryColor: '#0ea5e9',
  secondaryColor: '#0284c7',
  title: '品牌商平台',
  subtitle: '专业的电子产品回收解决方案',
  background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)',
  logo: '/icons/brand-logo.svg'
}

// 维修店主题
const repairTheme: AuthTheme = {
  name: 'repair',
  primaryColor: '#10b981',
  secondaryColor: '#059669',
  title: '维修师平台',
  subtitle: '一站式设备维修服务管理',
  background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)',
  logo: '/icons/repair-logo.svg'
}
```

### 自定义主题

```typescript
const customTheme: AuthTheme = {
  name: 'custom',
  primaryColor: '#8b5cf6',
  secondaryColor: '#7c3aed',
  title: '我的应用登录',
  subtitle: '欢迎回来',
  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
  customStyles: {
    card: 'shadow-2xl border-0',
    button: 'rounded-full font-bold',
    input: 'border-2 focus:border-purple-500'
  }
}
```

## 🔧 登录方式扩展

### 支持的登录方式

```typescript
type LoginMethod = 
  | 'email'      // 邮箱登录
  | 'phone'      // 手机登录
  | 'api-key'    // API密钥登录
  | 'oauth'      // 第三方登录
  | 'ldap'       // LDAP登录
  | 'saml'       // SAML登录

// 配置示例
const loginConfig = {
  methods: ['email', 'phone', 'oauth'],
  defaultMethod: 'email',
  oauthProviders: ['google', 'github', 'wechat'],
  phoneCountries: ['+86', '+1', '+81']
}
```

### 自定义登录字段

```typescript
interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// 示例：企业登录需要额外字段
const enterpriseFields: CustomField[] = [
  {
    name: 'company',
    label: '公司名称',
    type: 'text',
    required: true,
    placeholder: '请输入公司全称'
  },
  {
    name: 'department',
    label: '部门',
    type: 'select',
    required: false,
    options: [
      { value: 'tech', label: '技术部' },
      { value: 'sales', label: '销售部' },
      { value: 'support', label: '客服部' }
    ]
  }
]
```

## 🌍 国际化支持

### 内置语言包

```typescript
// 中文
const zhCN = {
  title: '登录',
  subtitle: '欢迎回来',
  email: '邮箱地址',
  password: '密码',
  login: '登录',
  register: '注册',
  forgotPassword: '忘记密码？',
  rememberMe: '记住我',
  loading: '登录中...',
  success: '登录成功',
  errors: {
    invalidCredentials: '用户名或密码错误',
    accountLocked: '账户已被锁定',
    networkError: '网络连接失败'
  }
}

// 英文
const enUS = {
  title: 'Sign In',
  subtitle: 'Welcome back',
  email: 'Email Address',
  password: 'Password',
  login: 'Sign In',
  register: 'Register',
  forgotPassword: 'Forgot Password?',
  rememberMe: 'Remember Me',
  loading: 'Signing in...',
  success: 'Login Successful',
  errors: {
    invalidCredentials: 'Invalid email or password',
    accountLocked: 'Account has been locked',
    networkError: 'Network connection failed'
  }
}
```

### 动态切换语言

```typescript
import { useTranslation } from '@/hooks/use-translation'

const { t, setLanguage } = useTranslation()

// 使用翻译
<h1>{t('auth.title')}</h1>
<input placeholder={t('auth.email')} />

// 切换语言
<button onClick={() => setLanguage('en-US')}>English</button>
<button onClick={() => setLanguage('zh-CN')}>中文</button>
```

## 🧪 测试工具

### 组件测试套件

```typescript
// 测试统一登录组件
import { render, screen, fireEvent } from '@testing-library/react'
import { UnifiedLogin } from '@/components/auth/UnifiedLogin'

describe('UnifiedLogin', () => {
  test('renders login form correctly', () => {
    render(<UnifiedLogin isOpen={true} onClose={jest.fn()} />)
    
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument()
    expect(screen.getByLabelText('密码')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  test('handles login submission', async () => {
    const mockLogin = jest.fn()
    render(
      <UnifiedLogin 
        isOpen={true} 
        onClose={jest.fn()}
        onLoginSuccess={mockLogin}
      />
    )
    
    fireEvent.change(screen.getByLabelText('邮箱地址'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: '登录' }))
    
    // 验证登录逻辑
    expect(mockLogin).toHaveBeenCalled()
  })
})
```

### 端到端测试

```typescript
// Playwright 测试
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('欢迎回来')).toBeVisible()
})
```

## 📊 性能监控

### 性能指标追踪

```typescript
// 登录性能监控
const loginMetrics = {
  formRenderTime: 0,    // 表单渲染时间
  validationTime: 0,    // 表单验证时间
  apiRequestTime: 0,    // API请求时间
  totalLoginTime: 0,    // 总登录时间
  successRate: 0        // 登录成功率
}

// 使用示例
useEffect(() => {
  const startTime = performance.now()
  
  // 登录逻辑...
  
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // 上报性能数据
  analytics.track('login_performance', {
    duration,
    method: 'email',
    userAgent: navigator.userAgent
  })
}, [])
```

## 🔒 安全最佳实践

### 输入验证

```typescript
// 严格的输入验证
const validateLoginInput = (email: string, password: string) => {
  const errors = []
  
  // 邮箱验证
  if (!email) {
    errors.push('邮箱不能为空')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('请输入有效的邮箱地址')
  }
  
  // 密码验证
  if (!password) {
    errors.push('密码不能为空')
  } else if (password.length < 8) {
    errors.push('密码长度至少8位')
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push('密码必须包含大小写字母和数字')
  }
  
  return errors
}
```

### CSRF防护

```typescript
// CSRF Token 处理
const getCSRFToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
}

const secureLogin = async (credentials: LoginCredentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken()
    },
    body: JSON.stringify(credentials),
    credentials: 'same-origin'
  })
  
  return response
}
```

## 🎯 使用示例

### 1. 基础登录页面

```typescript
'use client'

import { UnifiedLogin } from '@/components/auth/UnifiedLogin'
import { useSearchParams, useRouter } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirect = searchParams.get('redirect')

  const handleLoginSuccess = (user: any) => {
    if (redirect) {
      router.push(redirect)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <UnifiedLogin
      isOpen={true}
      onClose={() => router.push('/')}
      onLoginSuccess={handleLoginSuccess}
      redirectUrl={redirect || undefined}
      mode="page"
    />
  )
}
```

### 2. 带主题的业务登录

```typescript
'use client'

import { UnifiedLogin } from '@/components/auth/UnifiedLogin'
import { brandTheme } from '@/themes/auth-themes'

export default function BrandLoginPage() {
  return (
    <UnifiedLogin
      isOpen={true}
      onClose={() => router.push('/')}
      onLoginSuccess={handleLoginSuccess}
      theme={brandTheme}
      loginMethods={['email', 'api-key']}
      mode="page"
      customFields={[
        {
          name: 'company',
          label: '公司名称',
          type: 'text',
          required: true
        }
      ]}
    />
  )
}
```

### 3. 导航栏认证控件

```typescript
'use client'

import { NavbarAuthControls } from '@/components/auth/AuthControls'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="logo">FixCycle</div>
          <NavbarAuthControls />
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
```

---

**版本**: v1.0.0  
**最后更新**: 2026年2月25日  
**兼容性**: React 18+, Next.js 14+