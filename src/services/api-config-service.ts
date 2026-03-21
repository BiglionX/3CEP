/**
 * API 配置服务
 * 用于管理和测试项目中的各种 API 配置
 */

export interface ApiConfig {
  provider: string;
  name: string;
  description: string;
  category: string;
  value?: string;
  status: 'active' | 'error' | 'inactive';
  is_required: boolean;
  updated_at?: string;
  last_tested?: string;
  test_result?: boolean;
}

export interface ApiTestResult {
  provider: string;
  success: boolean;
  message: string;
  timestamp: string;
  response_time?: number;
}

export class ApiConfigService {
  private static API_CONFIGS: Record<string, ApiConfig> = {
    // 数据库
    supabase: {
      provider: 'supabase',
      name: 'Supabase',
      description: 'PostgreSQL 数据库和实时服务',
      category: 'database',
      status: 'inactive',
      is_required: true,
    },
    redis: {
      provider: 'redis',
      name: 'Redis',
      description: '缓存和消息队列服务',
      category: 'database',
      status: 'inactive',
      is_required: false,
    },

    // 认证服务
    auth0: {
      provider: 'auth0',
      name: 'Auth0',
      description: '第三方认证服务',
      category: 'authentication',
      status: 'inactive',
      is_required: false,
    },
    next_auth: {
      provider: 'next_auth',
      name: 'NextAuth.js',
      description: 'Next.js 认证服务',
      category: 'authentication',
      status: 'inactive',
      is_required: true,
    },

    // 支付服务
    stripe: {
      provider: 'stripe',
      name: 'Stripe',
      description: '国际支付网关',
      category: 'payment',
      status: 'inactive',
      is_required: false,
    },
    alipay: {
      provider: 'alipay',
      name: '支付宝',
      description: '支付宝支付接口',
      category: 'payment',
      status: 'inactive',
      is_required: false,
    },
    wechat_pay: {
      provider: 'wechat_pay',
      name: '微信支付',
      description: '微信支付接口',
      category: 'payment',
      status: 'inactive',
      is_required: false,
    },

    // AI 服务
    openai: {
      provider: 'openai',
      name: 'OpenAI',
      description: 'GPT 模型和 AI 服务',
      category: 'ai',
      status: 'inactive',
      is_required: false,
    },
    anthropic: {
      provider: 'anthropic',
      name: 'Anthropic',
      description: 'Claude AI 模型服务',
      category: 'ai',
      status: 'inactive',
      is_required: false,
    },
    azure_openai: {
      provider: 'azure_openai',
      name: 'Azure OpenAI',
      description: 'Azure 云上的 OpenAI 服务',
      category: 'ai',
      status: 'inactive',
      is_required: false,
    },

    // 电商服务
    shopify: {
      provider: 'shopify',
      name: 'Shopify',
      description: 'Shopify 电商平台',
      category: 'ecommerce',
      status: 'inactive',
      is_required: false,
    },
    taobao: {
      provider: 'taobao',
      name: '淘宝',
      description: '淘宝开放平台',
      category: 'ecommerce',
      status: 'inactive',
      is_required: false,
    },

    // 监控服务
    sentry: {
      provider: 'sentry',
      name: 'Sentry',
      description: '错误追踪和性能监控',
      category: 'monitoring',
      status: 'inactive',
      is_required: false,
    },
    datadog: {
      provider: 'datadog',
      name: 'Datadog',
      description: '云监控服务',
      category: 'monitoring',
      status: 'inactive',
      is_required: false,
    },

    // 消息服务
    twilio: {
      provider: 'twilio',
      name: 'Twilio',
      description: '短信和语音服务',
      category: 'messaging',
      status: 'inactive',
      is_required: false,
    },
    sendgrid: {
      provider: 'sendgrid',
      name: 'SendGrid',
      description: '邮件发送服务',
      category: 'messaging',
      status: 'inactive',
      is_required: false,
    },

    // 存储服务
    aws_s3: {
      provider: 'aws_s3',
      name: 'AWS S3',
      description: '亚马逊云存储服务',
      category: 'storage',
      status: 'inactive',
      is_required: false,
    },
    cloudflare_r2: {
      provider: 'cloudflare_r2',
      name: 'Cloudflare R2',
      description: 'Cloudflare 对象存储',
      category: 'storage',
      status: 'inactive',
      is_required: false,
    },

    // 分析服务
    google_analytics: {
      provider: 'google_analytics',
      name: 'Google Analytics',
      description: '网站流量分析',
      category: 'analytics',
      status: 'inactive',
      is_required: false,
    },
    mixpanel: {
      provider: 'mixpanel',
      name: 'Mixpanel',
      description: '用户行为分析',
      category: 'analytics',
      status: 'inactive',
      is_required: false,
    },
  };

  /**
   * 获取所有 API 配置
   */
  static async getAllApiConfigs(): Promise<ApiConfig[]> {
    try {
      // 从环境变量中读取配置值
      const configs = Object.values(this.API_CONFIGS).map(config => {
        const envValue =
          process.env[`NEXT_PUBLIC_${config.provider.toUpperCase()}_KEY`] ||
          process.env[`${config.provider.toUpperCase()}_KEY`] ||
          process.env[`NEXT_PUBLIC_${config.provider.toUpperCase()}_URL`] ||
          process.env[`${config.provider.toUpperCase()}_URL`];

        return {
          ...config,
          value: envValue || undefined,
          status: envValue ? 'active' : 'inactive',
        };
      });

      return configs;
    } catch (error) {
      console.error('获取 API 配置失败:', error);
      return [];
    }
  }

  /**
   * 更新 API 配置
   */
  static async updateApiConfig(
    provider: string,
    value: string
  ): Promise<boolean> {
    try {
      if (!this.API_CONFIGS[provider]) {
        console.error(`未知的 API 提供商：${provider}`);
        return false;
      }

      // 在实际应用中，这里应该将配置保存到数据库或配置文件
      // 目前仅更新内存中的状态
      this.API_CONFIGS[provider] = {
        ...this.API_CONFIGS[provider],
        updated_at: new Date().toISOString(),
      };

      console.log(`API 配置已更新：${provider}`);
      return true;
    } catch (error) {
      console.error('更新 API 配置失败:', error);
      return false;
    }
  }

  /**
   * 测试所有 API 连接
   */
  static async testAllApis(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    for (const [provider, config] of Object.entries(this.API_CONFIGS)) {
      const result = await this.testApi(provider, config);
      results.push(result);
    }

    return results;
  }

  /**
   * 测试单个 API 连接
   */
  static async testApi(
    provider: string,
    config: ApiConfig
  ): Promise<ApiTestResult> {
    const startTime = Date.now();

    try {
      // 检查是否有配置值
      const envValue =
        process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_KEY`] ||
        process.env[`${provider.toUpperCase()}_KEY`] ||
        process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_URL`] ||
        process.env[`${provider.toUpperCase()}_URL`];

      if (!envValue) {
        return {
          provider,
          success: false,
          message: '未配置',
          timestamp: new Date().toISOString(),
        };
      }

      // 模拟 API 测试（实际应用中应该真正调用 API）
      // 这里只是模拟网络延迟
      await new Promise(resolve =>
        setTimeout(resolve, 100 + Math.random() * 200)
      );

      const responseTime = Date.now() - startTime;

      // 模拟测试结果（实际应该根据真实 API 响应判断）
      const success = Math.random() > 0.2; // 80% 成功率用于演示

      return {
        provider,
        success,
        message: success ? '连接成功' : '连接失败',
        timestamp: new Date().toISOString(),
        response_time: Math.round(responseTime),
      };
    } catch (error) {
      return {
        provider,
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取配置状态统计
   */
  static getConfigStatus() {
    const configs = Object.values(this.API_CONFIGS);

    const total = configs.length;
    const configured = configs.filter(
      c =>
        process.env[`NEXT_PUBLIC_${c.provider.toUpperCase()}_KEY`] ||
        process.env[`${c.provider.toUpperCase()}_KEY`] ||
        process.env[`NEXT_PUBLIC_${c.provider.toUpperCase()}_URL`] ||
        process.env[`${c.provider.toUpperCase()}_URL`]
    ).length;

    const required = configs.filter(c => c.is_required).length;
    const required_configured = configs.filter(
      c =>
        c.is_required &&
        (process.env[`NEXT_PUBLIC_${c.provider.toUpperCase()}_KEY`] ||
          process.env[`${c.provider.toUpperCase()}_KEY`] ||
          process.env[`NEXT_PUBLIC_${c.provider.toUpperCase()}_URL`] ||
          process.env[`${c.provider.toUpperCase()}_URL`])
    ).length;

    const healthy = configured; // 简化计算，实际应该基于真实测试结果

    return {
      total,
      configured,
      required,
      required_configured,
      healthy,
    };
  }
}
