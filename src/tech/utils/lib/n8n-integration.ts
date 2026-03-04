// n8n webhook集成配置
export const N8N_CONFIG = {
  // webhook URL配置
  WEBHOOK_URLS: {
    lead_capture:
      process.env.N8N_LEAD_WEBHOOK_URL ||
      'http://localhost:5678/webhook/lead-capture',
    demo_request:
      process.env.N8N_DEMO_WEBHOOK_URL ||
      'http://localhost:5678/webhook/demo-request',
    contact_form:
      process.env.N8N_CONTACT_WEBHOOK_URL ||
      'http://localhost:5678/webhook/contact-form',
  },

  // 工作流ID映射
  WORKFLOW_IDS: {
    leads_onboarding:
      process.env.N8N_LEADS_ONBOARDING_WORKFLOW_ID ||
      'leads-onboarding-workflow',
    demo_scheduling:
      process.env.N8N_DEMO_SCHEDULING_WORKFLOW_ID || 'demo-scheduling-workflow',
    contact_processing:
      process.env.N8N_CONTACT_PROCESSING_WORKFLOW_ID ||
      'contact-processing-workflow',
  },

  // 认证配置
  AUTH: {
    api_token: process.env.N8N_API_TOKEN || '',
    webhook_secret: process.env.N8N_WEBHOOK_SECRET || 'default-secret-key',
  },

  // 重试配置
  RETRY: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2,
  },
};

// webhook触发函数
export async function triggerN8nWebhook(webhookType: string, payload: any) {
  const webhookUrl =
    N8N_CONFIG.WEBHOOK_URLS[
      webhookType as keyof typeof N8N_CONFIG.WEBHOOK_URLS
    ];

  if (!webhookUrl) {
    console.warn(`未配?${webhookType} 的webhook URL`);
    return { success: false, error: 'Webhook URL未配? };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': N8N_CONFIG.AUTH.webhook_secret,
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'marketing-site',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?${webhookType} webhook触发成功`, result)return { success: true, data: result };
  } catch (error) {
    console.error(`�?${webhookType} webhook触发失败:`, error);
    return { success: false, error: (error as Error).message };
  }
}

// 线索处理工作?export async function processLead(leadData: any) {
  const payload = {
    lead_id: leadData.id,
    role: leadData.role,
    name: leadData.name,
    email: leadData.email,
    company: leadData.company,
    phone: leadData.phone,
    use_case: leadData.use_case,
    source: leadData.source,
    utm_params: {
      source: leadData.utm_source,
      medium: leadData.utm_medium,
      campaign: leadData.utm_campaign,
    },
  };

  return await triggerN8nWebhook('lead_capture', payload);
}

// 演示预约工作?export async function scheduleDemo(demoData: any) {
  const payload = {
    demo_id: demoData.id,
    name: demoData.name,
    email: demoData.email,
    company: demoData.company,
    role: demoData.role,
    preferred_time: demoData.preferred_time,
    use_case: demoData.use_case,
  };

  return await triggerN8nWebhook('demo_request', payload);
}

// 联系表单处理工作?export async function processContact(contactData: any) {
  const payload = {
    contact_id: contactData.id,
    name: contactData.name,
    email: contactData.email,
    subject: contactData.subject,
    message: contactData.message,
    company: contactData.company,
  };

  return await triggerN8nWebhook('contact_form', payload);
}

// 健康检查函?export async function checkN8nHealth() {
  try {
    // 检查n8n主服务是否可访问
    const healthUrl =
      process.env.N8N_HEALTH_CHECK_URL || 'http://localhost:5678/healthz';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return {
      healthy: response.ok,
      status: response.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

// webhook验证中间?export function verifyWebhookSignature(signature: string, payload: string) {
  if (!N8N_CONFIG.AUTH.webhook_secret) {
    console.warn('Webhook secret未配?);
    return true; // 开发环境下允许通过
  }

  // 简单的签名验证（实际项目中应该使用HMAC�?  const expectedSignature = require('crypto')
    .createHash('sha256')
    .update(N8N_CONFIG.AUTH.webhook_secret + payload)
    .digest('hex');

  return signature === expectedSignature;
}

// 导出默认配置
export default N8N_CONFIG;
