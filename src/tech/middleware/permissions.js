/**
 * 权限控制中间件
 * 提供基于角色的权限验证和租户过滤功能
 */

const fs = require('fs');
const path = require('path');

// 缓存 RBAC 配置
let rbacConfig = null;

/**
 * 加载 RBAC 配置
 */
function loadRbacConfig() {
  if (rbacConfig) return rbacConfig;
  
  try {
    const configPath = process.env.RBAC_CONFIG_PATH || './config/rbac.json';
    const fullPath = path.resolve(configPath);
    rbacConfig = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    console.log('✅ RBAC 配置加载成功');
    return rbacConfig;
  } catch (error) {
    console.error('❌ RBAC 配置加载失败:', error.message);
    throw new Error('RBAC 配置文件加载失败');
  }
}

/**
 * 检查用户是否具有指定权限
 * @param {Array} userRoles - 用户角色数组
 * @param {String} permission - 需要检查的权限标识
 * @returns {Boolean} 是否具有权限
 */
function hasPermission(userRoles, permission) {
  const config = loadRbacConfig();
  
  // 超级管理员拥有所有权限
  if (userRoles.includes('admin')) {
    return true;
  }
  
  // 检查每个角色的权限
  for (const role of userRoles) {
    const rolePermissions = config.role_permissions[role] || [];
    if (rolePermissions.includes(permission)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查用户是否具有任意一个指定权限
 * @param {Array} userRoles - 用户角色数组
 * @param {Array} permissions - 需要检查的权限标识数组
 * @returns {Boolean} 是否具有任一权限
 */
function hasAnyPermission(userRoles, permissions) {
  return permissions.some(permission => hasPermission(userRoles, permission));
}

/**
 * 检查用户是否具有所有指定权限
 * @param {Array} userRoles - 用户角色数组
 * @param {Array} permissions - 需要检查的权限标识数组
 * @returns {Boolean} 是否具有所有权限
 */
function hasAllPermissions(userRoles, permissions) {
  return permissions.every(permission => hasPermission(userRoles, permission));
}

/**
 * 权限验证中间件
 * @param {String|Array} permissions - 需要的权限标识（单个或数组）
 * @param {Object} options - 配置选项
 * @returns {Function} 中间件函数
 */
function requirePermission(permissions, options = {}) {
  const permissionList = Array.isArray(permissions) ? permissions : [permissions];
  const { 
    requireAll = false,  // 是否需要所有权限
    errorCode = 403,
    errorMessage = '权限不足'
  } = options;
  
  return function(req, res, next) {
    // 检查用户是否已认证
    if (!req.user) {
      return sendJsonResponse(res, 401, {
        success: false,
        error: '用户未认证',
        code: 'UNAUTHORIZED'
      });
    }
    
    const userRoles = req.user.roles || [];
    
    // 权限检查
    const hasAccess = requireAll 
      ? hasAllPermissions(userRoles, permissionList)
      : hasAnyPermission(userRoles, permissionList);
    
    if (!hasAccess) {
      return sendJsonResponse(res, errorCode, {
        success: false,
        error: errorMessage,
        code: 'INSUFFICIENT_PERMISSIONS',
        required_permissions: permissionList,
        user_roles: userRoles
      });
    }
    
    next();
  };
}

/**
 * 租户过滤中间件
 * @param {Object} options - 配置选项
 * @returns {Function} 中间件函数
 */
function requireTenant(options = {}) {
  const {
    tenantField = 'tenant_id',
    errorCode = 403,
    errorMessage = '租户访问受限'
  } = options;
  
  return function(req, res, next) {
    // 检查用户是否已认证
    if (!req.user) {
      return sendJsonResponse(res, 401, {
        success: false,
        error: '用户未认证',
        code: 'UNAUTHORIZED'
      });
    }
    
    const userTenantId = req.user.tenant_id;
    const requestTenantId = req.query[tenantField] || req.body[tenantField];
    
    // 如果用户没有租户信息，拒绝访问
    if (!userTenantId) {
      return sendJsonResponse(res, errorCode, {
        success: false,
        error: '用户未关联租户',
        code: 'NO_TENANT_ASSOCIATED'
      });
    }
    
    // 如果请求中指定了租户ID，必须与用户租户ID匹配
    if (requestTenantId && requestTenantId !== userTenantId) {
      return sendJsonResponse(res, errorCode, {
        success: false,
        error: errorMessage,
        code: 'TENANT_MISMATCH',
        user_tenant: userTenantId,
        requested_tenant: requestTenantId
      });
    }
    
    // 将用户租户ID注入到请求中
    req.tenant = {
      id: userTenantId,
      field: tenantField
    };
    
    next();
  };
}

/**
 * 多租户数据过滤器
 * @param {Object} queryOptions - 查询选项
 * @param {String} tenantField - 租户字段名
 * @param {String} userTenantId - 用户租户ID
 * @returns {Object} 添加了租户过滤的查询条件
 */
function applyTenantFilter(queryOptions = {}, tenantField = 'tenant_id', userTenantId) {
  if (!userTenantId) {
    throw new Error('用户租户ID不能为空');
  }
  
  return {
    ...queryOptions,
    where: {
      ...(queryOptions.where || {}),
      [tenantField]: userTenantId
    }
  };
}

/**
 * 获取用户的可访问资源
 * @param {Array} userRoles - 用户角色数组
 * @param {String} category - 权限分类（可选）
 * @returns {Array} 用户可访问的资源列表
 */
function getUserAccessibleResources(userRoles, category = null) {
  const config = loadRbacConfig();
  const accessibleResources = new Set();
  
  // 超级管理员可以访问所有资源
  if (userRoles.includes('admin')) {
    return Object.keys(config.permissions).map(key => config.permissions[key].resource);
  }
  
  // 收集用户所有角色的权限对应的资源
  for (const role of userRoles) {
    const permissions = config.role_permissions[role] || [];
    for (const permKey of permissions) {
      const permission = config.permissions[permKey];
      if (permission && (!category || permission.category === category)) {
        accessibleResources.add(permission.resource);
      }
    }
  }
  
  return Array.from(accessibleResources);
}

/**
 * 验证资源访问权限
 * @param {Array} userRoles - 用户角色数组
 * @param {String} resource - 资源标识
 * @param {String} action - 操作类型 (read/create/update/delete/approve)
 * @returns {Boolean} 是否有访问权限
 */
function canAccessResource(userRoles, resource, action) {
  const config = loadRbacConfig();
  
  // 超级管理员拥有所有权限
  if (userRoles.includes('admin')) {
    return true;
  }
  
  // 构造权限标识
  const permissionKey = `${resource}_${action}`;
  
  // 检查用户是否有对应权限
  return hasPermission(userRoles, permissionKey);
}

/**
 * 通用JSON响应函数
 */
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// 导出公共接口
module.exports = {
  // 权限检查函数
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessResource,
  
  // 中间件函数
  requirePermission,
  requireTenant,
  
  // 辅助函数
  applyTenantFilter,
  getUserAccessibleResources,
  
  // 配置管理
  loadRbacConfig,
  getRbacConfig: () => rbacConfig
};