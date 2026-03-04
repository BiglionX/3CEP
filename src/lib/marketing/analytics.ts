// 营销埋点工具
export async function trackEvent(
  eventType: string,
  properties: Record<string, any> = {}
) {
  try {
    // 获取UTM参数
    const urlParams =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');

    const payload = {
      event_type: eventType,
      role: properties.role,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      source: properties.source,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      session_id: getSessionId(),
    };

    // 发送到后端API
    const response = await fetch('/api/marketing/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('埋点发送失?', response.statusText);
    }
  } catch (error) {
    console.error('埋点发送异?', error);
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-side';

  let sessionId = sessionStorage.getItem('marketing_session_id');
  if (!sessionId) {
    sessionId =
      Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    sessionStorage.setItem('marketing_session_id', sessionId);
  }
  return sessionId;
}

// 页面浏览埋点
export function trackPageView(role?: string) {
  trackEvent('page_view', { role });
}

// CTA点击埋点
export function trackCtaClick(ctaType: string, role?: string) {
  trackEvent('cta_click', { role, cta_type: ctaType });
}

// 表单提交埋点
export function trackFormSubmit(formType: string, role?: string) {
  trackEvent('form_submit', { role, form_type: formType });
}

// 线索提交埋点
export function trackLeadSubmit(role?: string) {
  trackEvent('lead_submit', { role });
}

// 演示尝试埋点
export function trackDemoTry(demoType: string, role?: string) {
  trackEvent('demo_try', { role, demo_type: demoType });
}
