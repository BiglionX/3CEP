
/**
 * 统一认证工具函数
 */

export interface AuthUserData {
  id: string;
  email: string;
  is_admin: boolean;
  role?: string;
}

/**
 * 处理登录成功后的跳转逻辑
 */
export function handleLoginSuccess(userData: AuthUserData, redirect: string, router: any) {
  if (userData.is_admin) {
    // 管理员用户跳转到指定页面
    router.push(redirect);
  } else {
    // 普通用户跳转到首页或其他指定页面
    router.push('/');
  }
}

/**
 * 检查用户是否具有管理员权限
 */
export async function checkAdminPermission(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-session');
    if (response.ok) {
      const data = await response.json();
      return data.is_admin === true;
    }
    return false;
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}

/**
 * 获取当前用户的认证信息
 */
export async function getCurrentUser(): Promise<AuthUserData | null> {
  try {
    const response = await fetch('/api/auth/check-session');
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        return {
          id: data.user.id,
          email: data.user.email,
          is_admin: data.is_admin,
          role: data.user.role
        };
      }
    }
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}