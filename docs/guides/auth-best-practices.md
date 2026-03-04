# 统一认证组件最佳实践指南

## 🎯 设计原则

### 1. 一致性原则

- **视觉一致性**: 所有登录页面保持统一的视觉风格
- **交互一致性**: 相同操作产生相同的行为反馈
- **术语一致性**: 使用统一的业务术语和文案表达

### 2. 可访问性原则

- **键盘导航**: 支持完整的键盘操作
- **屏幕阅读器**: 兼容主流屏幕阅读器
- **色彩对比**: 确保足够的色彩对比度
- **响应式设计**: 适配各种设备和屏幕尺寸

### 3. 安全性原则

- **输入验证**: 严格的客户端和服务端双重验证
- **防暴力破解**: 实施登录尝试次数限制
- **会话管理**: 安全的会话管理和超时机制
- **传输加密**: 所有敏感数据通过HTTPS传输

## 🛠️ 开发最佳实践

### 组件设计模式

#### 1. 容器组件模式

```typescript
// 容器组件 - 处理业务逻辑
const LoginPageContainer = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleLoginSuccess = (user: any) => {
    // 统一的登录成功处理逻辑
    analytics.track('login_success', { userId: user.id })

    if (redirect?.startsWith('/admin') && !user.is_admin) {
      router.push('/unauthorized')
      return
    }

    router.push(redirect || getDefaultRedirect(user))
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

#### 2. 配置驱动模式

```typescript
// 业务配置
const businessConfig = {
  admin: {
    theme: 'admin',
    loginMethods: ['email'],
    redirectPaths: {
      success: '/admin/dashboard',
      failure: '/unauthorized'
    },
    customFields: []
  },
  brand: {
    theme: 'brand',
    loginMethods: ['email', 'api-key'],
    redirectPaths: {
      success: '/brand/dashboard',
      failure: '/brand/login'
    },
    customFields: [
      { name: 'company', required: true }
    ]
  }
}

// 通用登录页面
const BusinessLoginPage = ({ businessType }: { businessType: string }) => {
  const config = businessConfig[businessType]

  return (
    <UnifiedLogin
      isOpen={true}
      theme={config.theme}
      loginMethods={config.loginMethods}
      customFields={config.customFields}
      onSuccess={(user) => router.push(config.redirectPaths.success)}
      onFailure={() => router.push(config.redirectPaths.failure)}
    />
  )
}
```

### 状态管理最佳实践

#### 1. 统一状态源

```typescript
// 使用统一的认证状态管理
const useAuthState = () => {
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    is_admin: false,
    roles: [],
    permissions: [],
    isLoading: true,
    error: null,
  });

  // 同步多个状态源
  useEffect(() => {
    const syncAuthState = async () => {
      try {
        // 优先检查Supabase会话
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const isAdmin = await AuthService.isAdminUser(session.user.id);
          setAuthState({
            user: session.user,
            isAuthenticated: true,
            is_admin: isAdmin,
            roles: isAdmin ? ['admin'] : ['user'],
            permissions: await AuthService.getUserPermissions(session.user.id),
            isLoading: false,
            error: null,
          });
          return;
        }

        // 备用方案：检查localStorage
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          const user = await AuthService.validateToken(storedToken);
          if (user) {
            setAuthState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
              isLoading: false,
            }));
            return;
          }
        }

        // 未认证状态
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    };

    syncAuthState();
  }, []);

  return authState;
};
```

#### 2. 错误处理模式

```typescript
// 统一错误处理
const useErrorHandler = () => {
  const handleError = (error: any, context: string) => {
    console.error(`[${context}] Error:`, error);

    // 记录错误日志
    analytics.track('error_occurred', {
      context,
      error: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // 用户友好的错误提示
    const userFriendlyMessage = getFriendlyErrorMessage(error);
    toast.error(userFriendlyMessage);

    // 根据错误类型采取相应措施
    if (error.code === 'SESSION_EXPIRED') {
      router.push('/login?reason=session_expired');
    } else if (error.code === 'PERMISSION_DENIED') {
      router.push('/unauthorized');
    }
  };

  return { handleError };
};
```

## 🔧 迁移最佳实践

### 渐进式迁移策略

#### 1. 并行运行模式

```typescript
// 支持新旧版本并行运行
const LoginPageRouter = () => {
  const [useNewAuth, setUseNewAuth] = useState(false)
  const searchParams = useSearchParams()
  const legacyMode = searchParams.get('legacy') === 'true'

  // A/B测试决定使用哪个版本
  useEffect(() => {
    const shouldUseNewAuth = !legacyMode && Math.random() > 0.3 // 70%使用新版
    setUseNewAuth(shouldUseNewAuth)

    // 记录使用情况
    analytics.track('auth_version_used', {
      version: shouldUseNewAuth ? 'new' : 'legacy',
      abTestGroup: legacyMode ? 'control' : 'experiment'
    })
  }, [legacyMode])

  if (useNewAuth) {
    return <UnifiedLoginPage />
  }

  return <LegacyLoginPage />
}
```

#### 2. 逐步替换策略

```typescript
// 逐步替换工具函数
const MigrationHelper = {
  // 检查是否应该使用新组件
  shouldUseUnifiedComponent: (pagePath: string) => {
    const migratedPages = [
      '/admin/login',
      '/brand/login',
      '/repair-shop/login',
    ];

    return migratedPages.includes(pagePath);
  },

  // 生成迁移报告
  generateMigrationReport: () => {
    const report = {
      totalPages: 8,
      migratedPages: 3,
      pendingPages: 5,
      migrationProgress: '37.5%',
      estimatedCompletion: '2026-04-07',
    };

    console.log('Migration Report:', report);
    return report;
  },
};
```

### 回滚机制

```typescript
// 安全回滚机制
const SafeMigrationWrapper = ({
  children,
  fallback: FallbackComponent
}: {
  children: React.ReactNode
  fallback: React.ComponentType
}) => {
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState('')

  useEffect(() => {
    if (hasError) {
      // 记录错误并触发回滚
      console.error('Component error detected:', errorInfo)
      analytics.track('component_error', {
        component: 'UnifiedLogin',
        error: errorInfo,
        timestamp: new Date().toISOString()
      })
    }
  }, [hasError, errorInfo])

  if (hasError) {
    return <FallbackComponent />
  }

  return (
    <ErrorBoundary
      onError={(error, info) => {
        setHasError(true)
        setErrorInfo(info.componentStack)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## 📊 监控和度量

### 关键性能指标(KPIs)

```typescript
// 认证性能监控
const AuthMetrics = {
  // 用户体验指标
  loginSuccessRate: 0, // 登录成功率
  averageLoginTime: 0, // 平均登录时间
  formCompletionRate: 0, // 表单完成率
  bounceRate: 0, // 登录页跳出率

  // 技术指标
  componentLoadTime: 0, // 组件加载时间
  apiResponseTime: 0, // API响应时间
  validationLatency: 0, // 表单验证延迟
  errorRate: 0, // 错误发生率

  // 业务指标
  dailyActiveUsers: 0, // 日活跃用户数
  newUserConversion: 0, // 新用户转化率
  retentionRate: 0, // 用户留存率
};

// 实时监控实现
const useAuthAnalytics = () => {
  useEffect(() => {
    // 页面停留时间追踪
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      analytics.track('page_stay_duration', {
        page: 'login',
        duration,
        timestamp: new Date().toISOString(),
      });
    };
  }, []);

  // 表单交互追踪
  const trackFormInteraction = (action: string, field?: string) => {
    analytics.track('form_interaction', {
      action,
      field,
      page: 'login',
      timestamp: new Date().toISOString(),
    });
  };

  return { trackFormInteraction };
};
```

### 用户行为分析

```typescript
// 用户行为模式分析
const UserBehaviorAnalytics = {
  // 登录行为分析
  analyzeLoginPatterns: (userId: string) => {
    const patterns = {
      preferredLoginMethod: '', // 偏好登录方式
      typicalLoginTime: '', // 典型登录时间
      devicePreferences: [], // 设备偏好
      commonErrors: [], // 常见错误类型
      abandonmentPoints: [], // 流程放弃点
    };

    return patterns;
  },

  // A/B测试分析
  analyzeABTestResults: (testName: string) => {
    const results = {
      controlGroup: { conversionRate: 0, avgTime: 0 },
      experimentGroup: { conversionRate: 0, avgTime: 0 },
      statisticalSignificance: false,
      recommendation: '',
    };

    return results;
  },
};
```

## 🔒 安全最佳实践

### 输入验证和净化

```typescript
// 严格的输入验证
const InputValidator = {
  validateEmail: (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  validatePassword: (password: string) => {
    return (
      password.length >= 8 &&
      password.length <= 128 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^a-zA-Z0-9]/.test(password)
    );
  },

  sanitizeInput: (input: string) => {
    // 移除潜在危险字符
    return input
      .replace(/[<>]/g, '') // 移除HTML标签
      .replace(/['"]/g, '') // 移除引号
      .trim();
  },
};

// 使用示例
const validateLoginForm = (formData: LoginForm) => {
  const errors = [];

  if (!InputValidator.validateEmail(formData.email)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (!InputValidator.validatePassword(formData.password)) {
    errors.push('密码必须包含大小写字母、数字和特殊字符，长度8-128位');
  }

  return errors;
};
```

### 防止常见攻击

```typescript
// CSRF防护
const CSRFProtection = {
  getToken: () => {
    return document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute('content');
  },

  validateToken: (token: string) => {
    // 验证CSRF token的有效性
    return token && token.length === 32;
  },
};

// 速率限制
const RateLimiter = {
  loginAttempts: new Map(),

  checkRateLimit: (identifier: string) => {
    const now = Date.now();
    const attempts = this.loginAttempts.get(identifier) || [];

    // 清理过期记录（15分钟前的记录）
    const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);

    // 限制每分钟最多5次尝试
    const recentMinute = recentAttempts.filter(time => now - time < 60 * 1000);

    if (recentMinute.length >= 5) {
      return {
        allowed: false,
        retryAfter: 60 - Math.floor((now - Math.min(...recentMinute)) / 1000),
      };
    }

    // 记录本次尝试
    this.loginAttempts.set(identifier, [...recentAttempts, now]);

    return { allowed: true };
  },
};
```

## 🎨 UX/UI最佳实践

### 响应式设计

```typescript
// 响应式断点
const breakpoints = {
  xs: '480px',    // 手机竖屏
  sm: '640px',    // 手机横屏
  md: '768px',    // 平板
  lg: '1024px',   // 桌面小屏
  xl: '1280px',   // 桌面大屏
  xxl: '1536px'   // 超大屏
}

// 响应式组件
const ResponsiveLoginForm = () => {
  const [screenSize, setScreenSize] = useState('desktop')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) setScreenSize('mobile')
      else if (width < 1024) setScreenSize('tablet')
      else setScreenSize('desktop')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const layoutConfig = {
    mobile: {
      flexDirection: 'column',
      maxWidth: '100%',
      padding: '1rem'
    },
    tablet: {
      flexDirection: 'row',
      maxWidth: '600px',
      padding: '2rem'
    },
    desktop: {
      flexDirection: 'row',
      maxWidth: '800px',
      padding: '3rem'
    }
  }

  return (
    <div style={layoutConfig[screenSize]}>
      {/* 响应式内容 */}
    </div>
  )
}
```

### 无障碍访问

```typescript
// 无障碍组件设计
const AccessibleLoginForm = () => {
  const [focusedField, setFocusedField] = useState('')

  return (
    <form aria-label="登录表单">
      <div className="form-group">
        <label htmlFor="email" className="sr-only">
          邮箱地址
        </label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={!!emailError}
          aria-describedby="email-error"
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField('')}
        />
        {emailError && (
          <div id="email-error" role="alert" className="error-message">
            {emailError}
          </div>
        )}
      </div>

      {/* 键盘导航支持 */}
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && focusedField) {
            // 处理键盘提交
          }
        }}
      >
        <button type="submit" aria-label="登录">
          登录
        </button>
      </div>
    </form>
  )
}
```

## 🚀 性能优化

### 代码分割和懒加载

```typescript
// 动态导入认证组件
const LazyUnifiedLogin = lazy(() =>
  import('@/components/auth/UnifiedLogin').then(module => ({
    default: module.UnifiedLogin
  }))
)

const OptimizedLoginPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyUnifiedLogin
        isOpen={true}
        onClose={() => {}}
        onLoginSuccess={() => {}}
      />
    </Suspense>
  )
}
```

### 缓存策略

```typescript
// 智能缓存
const AuthCache = {
  // 缓存用户信息
  cacheUserInfo: (user: any) => {
    const cacheKey = `user_${user.id}`;
    const cacheData = {
      ...user,
      cachedAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30分钟过期
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  },

  // 获取缓存的用户信息
  getCachedUserInfo: (userId: string) => {
    const cacheKey = `user_${userId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const data = JSON.parse(cached);
      if (data.expiresAt > Date.now()) {
        return data;
      }
      // 缓存过期，清理
      localStorage.removeItem(cacheKey);
    }

    return null;
  },
};
```

## 📈 持续改进

### 用户反馈收集

```typescript
// 用户体验调研
const UserFeedbackCollector = {
  collectLoginFeedback: () => {
    // 登录成功后询问用户体验
    setTimeout(() => {
      if (Math.random() < 0.1) {
        // 10%的用户看到调研
        showSurveyModal({
          title: '登录体验调研',
          questions: [
            '登录过程是否顺畅？',
            '界面是否清晰易懂？',
            '有什么改进建议？',
          ],
          onSubmit: responses => {
            analytics.track('login_survey_response', responses);
          },
        });
      }
    }, 3000); // 登录成功3秒后
  },
};
```

### A/B测试框架

```typescript
// A/B测试配置
const ABTestConfig = {
  loginPageRedesign: {
    variants: {
      control: { useLegacy: true },
      variantA: { useUnified: true, theme: 'modern' },
      variantB: { useUnified: true, theme: 'minimal' },
    },
    distribution: [0.4, 0.3, 0.3], // 40%控制组，各30%实验组
    metrics: ['conversion_rate', 'login_time', 'bounce_rate'],
  },
};

// A/B测试钩子
const useABTest = (testName: string) => {
  const [variant, setVariant] = useState('');

  useEffect(() => {
    const assignedVariant = assignUserToVariant(testName);
    setVariant(assignedVariant);

    // 记录分配结果
    analytics.identify({
      ab_test_variant: `${testName}_${assignedVariant}`,
    });
  }, [testName]);

  return variant;
};
```

---

**维护周期**: 每季度审查和更新  
**贡献者**: 前端架构组  
**最后审查**: 2026年2月25日
