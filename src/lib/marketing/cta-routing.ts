// CTA路由策略
export function getCtaDestination(role: string, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    // 未登录用户跳转到登录页，携带角色信息
    return `/login?redirect=/onboarding&role=${encodeURIComponent(role)}`;
  }
  
  // 已登录用户直接进入对应的角色引导流程
  return `/onboarding?role=${encodeURIComponent(role)}`;
}

export function handleCtaClick(role: string, ctaType: string) {
  // 埋点追踪
  import('./analytics').then(({ trackCtaClick }) => {
    trackCtaClick(ctaType, role);
  });
  
  // 获取认证状态
  const isAuthenticated = checkAuthStatus();
  
  // 获取跳转目标
  const destination = getCtaDestination(role, isAuthenticated);
  
  // 执行跳转
  if (typeof window !== 'undefined') {
    window.location.href = destination;
  }
}

function checkAuthStatus(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // 检查localStorage中的认证信息
    const token = localStorage.getItem('sb-access-token');
    const expiresAt = localStorage.getItem('sb-expires-at');
    
    if (!token || !expiresAt) return false;
    
    // 检查token是否过期
    const now = Date.now();
    const expirationTime = parseInt(expiresAt);
    
    return now < expirationTime;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return false;
  }
}

// 获取UTM参数
export function getUtmParams() {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_term: urlParams.get('utm_term') || null,
    utm_content: urlParams.get('utm_content') || null
  };
}

// 设置UTM参数到localStorage（用于跨页面追踪）
export function storeUtmParams() {
  const utmParams = getUtmParams();
  if (typeof window === 'undefined') return;
  
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(`utm_${key.replace('utm_', '')}`, value);
    }
  });
  
  // 设置首次访问时间
  if (!localStorage.getItem('first_visit_time')) {
    localStorage.setItem('first_visit_time', Date.now().toString());
  }
}

// 获取存储的UTM参数
export function getStoredUtmParams() {
  if (typeof window === 'undefined') return {};
  
  return {
    utm_source: localStorage.getItem('utm_source'),
    utm_medium: localStorage.getItem('utm_medium'),
    utm_campaign: localStorage.getItem('utm_campaign'),
    utm_term: localStorage.getItem('utm_term'),
    utm_content: localStorage.getItem('utm_content'),
    first_visit_time: localStorage.getItem('first_visit_time')
  };
}