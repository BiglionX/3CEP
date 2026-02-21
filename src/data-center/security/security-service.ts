// 安全加固服务
// 实现访问控制、数据脱敏、审计日志等安全功能

// 用户权限接口
export interface UserPermission {
  userId: string;
  role: 'admin' | 'analyst' | 'viewer' | 'guest';
  permissions: string[]; // 具体权限列表
  expiresAt?: string;
}

// 访问控制规则
export interface AccessControlRule {
  id: string;
  resource: string;        // 资源标识
  action: 'read' | 'write' | 'execute' | 'admin';
  condition?: string;      // 访问条件
  roles: string[];         // 允许的角色
  rateLimit?: number;      // 速率限制（请求/分钟）
}

// 审计日志条目
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: 'success' | 'failed';
  details?: any;
}

// 数据脱敏规则
export interface DataMaskingRule {
  field: string;
  pattern: RegExp;
  mask: string | ((match: string) => string);
  appliesToRoles: string[];
}

// 安全配置
export interface SecurityConfig {
  jwtSecret: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  corsOrigins: string[];
  rateLimits: {
    global: number;
    perUser: number;
    perIp: number;
  };
}

// 安全服务类
export class SecurityService {
  private permissions: Map<string, UserPermission> = new Map();
  public accessRules: Map<string, AccessControlRule> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private maskingRules: DataMaskingRule[] = [];
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.initializeDefaultRules();
    this.initializeMaskingRules();
  }

  // 初始化默认访问控制规则
  private initializeDefaultRules(): void {
    // 管理员完全访问
    this.addAccessRule({
      id: 'admin_full_access',
      resource: '*',
      action: 'admin',
      roles: ['admin']
    });

    // 分析师读写访问
    this.addAccessRule({
      id: 'analyst_rw_access',
      resource: 'analytics/*',
      action: 'read',
      roles: ['analyst', 'admin']
    });

    this.addAccessRule({
      id: 'analyst_write_access',
      resource: 'analytics/write',
      action: 'write',
      roles: ['analyst', 'admin'],
      rateLimit: 100
    });

    // 查看者只读访问
    this.addAccessRule({
      id: 'viewer_read_access',
      resource: 'data/views',
      action: 'read',
      roles: ['viewer', 'analyst', 'admin'],
      rateLimit: 50
    });

    // 游客有限访问
    this.addAccessRule({
      id: 'guest_limited_access',
      resource: 'data/public',
      action: 'read',
      roles: ['guest', 'viewer', 'analyst', 'admin'],
      rateLimit: 10
    });
  }

  // 初始化数据脱敏规则
  private initializeMaskingRules(): void {
    // 手机号码脱敏
    this.maskingRules.push({
      field: 'phone',
      pattern: /(\d{3})\d{4}(\d{4})/,
      mask: '$1****$2',
      appliesToRoles: ['viewer', 'guest']
    });

    // 邮箱脱敏
    this.maskingRules.push({
      field: 'email',
      pattern: /([^@]+)@(.+)/,
      mask: (match) => {
        const [full, username, domain] = match.match(/([^@]+)@(.+)/) || ['', '', ''];
        const maskedUsername = username.length > 2 
          ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
          : '**';
        return `${maskedUsername}@${domain}`;
      },
      appliesToRoles: ['viewer', 'guest']
    });

    // 身份证号脱敏
    this.maskingRules.push({
      field: 'id_card',
      pattern: /(\d{6})\d{8}(\d{4})/,
      mask: '$1********$2',
      appliesToRoles: ['viewer', 'guest']
    });
  }

  // 添加访问控制规则
  addAccessRule(rule: AccessControlRule): void {
    this.accessRules.set(rule.id, rule);
    console.log(`✅ 添加访问规则: ${rule.id}`);
  }

  // 检查访问权限
  checkAccess(
    userId: string, 
    resource: string, 
    action: string,
    userRole?: string
  ): { allowed: boolean; reason?: string } {
    const permission = this.permissions.get(userId);
    const role = userRole || permission?.role || 'guest';

    // 检查账户锁定
    const lockoutInfo = this.loginAttempts.get(userId);
    if (lockoutInfo && lockoutInfo.count >= this.config.maxLoginAttempts) {
      const lockoutEnd = lockoutInfo.lastAttempt + this.config.lockoutDuration * 1000;
      if (Date.now() < lockoutEnd) {
        return { 
          allowed: false, 
          reason: `账户已锁定，解锁时间: ${new Date(lockoutEnd).toLocaleString()}` 
        };
      }
    }

    // 查找匹配的规则
    for (const rule of this.accessRules.values()) {
      if (this.matchesResource(rule.resource, resource) && rule.action === action) {
        if (rule.roles.includes(role)) {
          // 检查速率限制
          if (rule.rateLimit && !this.checkRateLimit(userId, rule.rateLimit)) {
            return { allowed: false, reason: '速率限制 exceeded' };
          }
          return { allowed: true };
        }
      }
    }

    return { allowed: false, reason: '权限不足' };
  }

  // 资源匹配检查
  private matchesResource(ruleResource: string, requestedResource: string): boolean {
    if (ruleResource === '*') return true;
    if (ruleResource === requestedResource) return true;
    
    // 支持通配符匹配
    const rulePattern = ruleResource.replace(/\*/g, '.*');
    return new RegExp(`^${rulePattern}$`).test(requestedResource);
  }

  // 速率限制检查
  private checkRateLimit(userId: string, limit: number): boolean {
    // 简化的速率限制实现
    // 实际应用中应该使用Redis或其他存储来跟踪请求频率
    return true; // 暂时允许所有请求
  }

  // 记录审计日志
  logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.push(logEntry);
    
    // 输出到控制台（实际应用中应该写入专门的日志系统）
    console.log(`🔐 审计日志: ${entry.userId} ${entry.action} ${entry.resource} [${entry.status}]`);

    // 清理过期日志
    this.cleanupOldLogs();
  }

  // 数据脱敏
  maskData<T extends Record<string, any>>(data: T, userRole: string): T {
    const maskedData: Record<string, any> = { ...data };
    
    this.maskingRules.forEach(rule => {
      if (rule.appliesToRoles.includes(userRole) && maskedData[rule.field]) {
        if (typeof rule.mask === 'function') {
          maskedData[rule.field] = maskedData[rule.field].replace(
            rule.pattern, 
            rule.mask
          );
        } else {
          maskedData[rule.field] = maskedData[rule.field].replace(
            rule.pattern, 
            rule.mask
          );
        }
      }
    });

    return maskedData as T;
  }

  // 批量数据脱敏
  maskDataArray<T extends Record<string, any>>(dataArray: T[], userRole: string): T[] {
    return dataArray.map(item => this.maskData(item, userRole));
  }

  // 用户认证（简化实现）
  authenticateUser(
    username: string, 
    password: string,
    ipAddress: string
  ): { success: boolean; userId?: string; token?: string; error?: string } {
    // 检查登录尝试次数
    const attemptInfo = this.loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    
    if (attemptInfo.count >= this.config.maxLoginAttempts) {
      const lockoutEnd = attemptInfo.lastAttempt + this.config.lockoutDuration * 1000;
      if (Date.now() < lockoutEnd) {
        return { 
          success: false, 
          error: `账户已锁定至 ${new Date(lockoutEnd).toLocaleString()}` 
        };
      } else {
        // 锁定期结束后重置计数
        this.loginAttempts.set(username, { count: 0, lastAttempt: Date.now() });
      }
    }

    // 简化的认证逻辑（实际应该查询用户数据库）
    if (username === 'admin' && password === 'admin123') {
      // 登录成功，重置失败计数
      this.loginAttempts.delete(username);
      
      return {
        success: true,
        userId: 'admin_user',
        token: this.generateJWT('admin_user', 'admin')
      };
    } else {
      // 登录失败，增加失败计数
      this.loginAttempts.set(username, {
        count: attemptInfo.count + 1,
        lastAttempt: Date.now()
      });
      
      this.logAudit({
        userId: username,
        action: 'login_failed',
        resource: 'authentication',
        ipAddress,
        userAgent: 'unknown',
        status: 'failed',
        details: { reason: 'invalid_credentials' }
      });
      
      return { success: false, error: '用户名或密码错误' };
    }
  }

  // 生成JWT令牌（简化实现）
  private generateJWT(userId: string, role: string): string {
    // 实际应用中应该使用jsonwebtoken库
    return `fake_jwt_token_for_${userId}_${role}_${Date.now()}`;
  }

  // 验证JWT令牌
  verifyToken(token: string): { valid: boolean; userId?: string; role?: string } {
    // 简化的令牌验证
    if (token.startsWith('fake_jwt_token_for_')) {
      const parts = token.split('_');
      return {
        valid: true,
        userId: parts[3],
        role: parts[4]
      };
    }
    return { valid: false };
  }

  // 获取用户权限
  getUserPermissions(userId: string): UserPermission | undefined {
    return this.permissions.get(userId);
  }

  // 设置用户权限
  setUserPermissions(permission: UserPermission): void {
    this.permissions.set(permission.userId, permission);
    console.log(`✅ 设置用户权限: ${permission.userId} (${permission.role})`);
  }

  // 获取审计日志
  getAuditLogs(
    limit: number = 100,
    filter?: { userId?: string; action?: string; status?: string }
  ): AuditLogEntry[] {
    let filteredLogs = [...this.auditLogs];

    if (filter?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
    }
    if (filter?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filter.action);
    }
    if (filter?.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filter.status);
    }

    return filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // 清理过期日志
  private cleanupOldLogs(): void {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30天前
    const oldLogCount = this.auditLogs.length;
    
    this.auditLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp).getTime() > cutoffTime
    );
    
    if (this.auditLogs.length !== oldLogCount) {
      console.log(`🧹 清理了 ${oldLogCount - this.auditLogs.length} 条过期日志`);
    }
  }

  // 获取安全统计信息
  getSecurityStats(): {
    totalUsers: number;
    activeSessions: number;
    failedLoginAttempts: number;
    lockedAccounts: number;
    recentLogs: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp).getTime() > oneHourAgo
    ).length;

    const lockedAccounts = Array.from(this.loginAttempts.values())
      .filter(attempt => attempt.count >= this.config.maxLoginAttempts)
      .length;

    const failedAttempts = Array.from(this.loginAttempts.values())
      .reduce((sum, attempt) => sum + attempt.count, 0);

    return {
      totalUsers: this.permissions.size,
      activeSessions: 0, // 简化实现
      failedLoginAttempts: failedAttempts,
      lockedAccounts,
      recentLogs
    };
  }
}

// 默认安全配置
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
  sessionTimeout: 3600, // 1小时
  maxLoginAttempts: 5,
  lockoutDuration: 900, // 15分钟
  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-domain.com'
  ],
  rateLimits: {
    global: 1000,
    perUser: 100,
    perIp: 50
  }
};

// 导出实例
export const securityService = new SecurityService(DEFAULT_SECURITY_CONFIG);

// 设置默认用户权限
securityService.setUserPermissions({
  userId: 'admin_user',
  role: 'admin',
  permissions: ['*']
});

securityService.setUserPermissions({
  userId: 'analyst_user',
  role: 'analyst',
  permissions: ['analytics.read', 'analytics.write']
});

securityService.setUserPermissions({
  userId: 'viewer_user',
  role: 'viewer',
  permissions: ['data.read']
});