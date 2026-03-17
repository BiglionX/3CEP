/**
 * 认证模块导出文件
 * 统一导出认证相关的核心组件 */

// 状态管理器
export {
  AuthStateManager,
  authStateManager,
  useAuthState,
  type AuthState,
  type AuthStateListener,
} from './state-manager';

// 安全认证Hook
export {
  useSafeAuth,
  useAuthStatus,
  useAuthInitialization,
} from '../../hooks/use-safe-auth';

// 错误处理
export {
  AuthErrorHandler,
  AuthErrorBoundary,
  type StandardizedError,
  type ErrorContext,
  AuthErrorCode,
  ErrorSeverity,
} from './error-handler';

// 服务端认证
export {
  getCurrentUser,
  getUserRoles,
  isAdminUser,
  getUserTenantId,
  requireAuth,
} from './server-auth';

// 安全Cookie配置（将在Task 2.4中实现）
// export { secureCookieOptions, getSessionExpiry } from './secure-cookies'

// 速率限制器（将在Task 2.3中实现）
// export { authRateLimiter } from './rate-limit'
