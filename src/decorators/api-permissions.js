/**
 * API 权限验证装饰器
 * 为 REST API 端点提供细粒度权限控制
 */

const { hasPermission, hasRole } = require('../../middleware/permissions')

/**
 * API 权限验证装饰器工厂
 * @param {String|Array} permissions - 需要的权限标识
 * @param {Object} options - 配置选项
 * @returns {Function} 装饰器函数
 */
function requireApiPermission(permissions, options = {}) {
  const permissionList = Array.isArray(permissions) ? permissions : [permissions]
  const {
    requireAll = false,        // 是否需要所有权限
    checkTenant = false,       // 是否检查租户隔离
    audit = false,            // 是否记录审计日志
    errorCode = 403,
    errorMessage = '权限不足'
  } = options

  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const [req, res] = args
      
      try {
        // 检查用户认证
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: '用户未认证',
            code: 'UNAUTHORIZED'
          })
        }

        const userRoles = req.user.roles || []
        const userTenantId = req.user.tenant_id

        // 权限检查
        const hasAccess = requireAll 
          ? hasAllPermissions(userRoles, permissionList)
          : hasAnyPermission(userRoles, permissionList)

        if (!hasAccess) {
          // 记录权限拒绝审计日志
          if (audit) {
            await logAuditEvent(
              'api_permission_denied',
              req.user.id,
              req.path,
              { required_permissions: permissionList, user_roles: userRoles },
              req
            )
          }

          return res.status(errorCode).json({
            success: false,
            error: errorMessage,
            code: 'INSUFFICIENT_PERMISSIONS',
            required_permissions: permissionList,
            user_roles: userRoles
          })
        }

        // 租户隔离检查
        if (checkTenant) {
          const requestTenantId = req.query.tenant_id || req.body.tenant_id
          
          if (requestTenantId && requestTenantId !== userTenantId) {
            return res.status(403).json({
              success: false,
              error: '租户访问受限',
              code: 'TENANT_MISMATCH',
              user_tenant: userTenantId,
              requested_tenant: requestTenantId
            })
          }
        }

        // 记录成功的权限检查审计日志
        if (audit) {
          await logAuditEvent(
            'api_permission_granted',
            req.user.id,
            req.path,
            { permissions: permissionList },
            req
          )
        }

        // 调用原始方法
        return await originalMethod.apply(this, args)

      } catch (error) {
        console.error('API权限验证错误:', error)
        return res.status(500).json({
          success: false,
          error: '服务器内部错误',
          code: 'INTERNAL_ERROR'
        })
      }
    }

    return descriptor
  }
}

/**
 * 批量权限验证装饰器
 * @param {Array} permissionChecks - 权限检查配置数组
 * @returns {Function} 装饰器函数
 */
function requireMultiplePermissions(permissionChecks) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const [req, res] = args

      try {
        // 检查用户认证
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: '用户未认证',
            code: 'UNAUTHORIZED'
          })
        }

        const userRoles = req.user.roles || []

        // 逐个检查权限
        for (const check of permissionChecks) {
          const { permissions, condition = () => true, options = {} } = check
          
          // 检查条件是否满足
          if (!condition(req)) continue

          const permissionList = Array.isArray(permissions) ? permissions : [permissions]
          const requireAll = options.requireAll || false
          
          const hasAccess = requireAll 
            ? hasAllPermissions(userRoles, permissionList)
            : hasAnyPermission(userRoles, permissionList)

          if (!hasAccess) {
            return res.status(options.errorCode || 403).json({
              success: false,
              error: options.errorMessage || '权限不足',
              code: 'INSUFFICIENT_PERMISSIONS',
              required_permissions: permissionList,
              user_roles: userRoles
            })
          }
        }

        // 调用原始方法
        return await originalMethod.apply(this, args)

      } catch (error) {
        console.error('批量权限验证错误:', error)
        return res.status(500).json({
          success: false,
          error: '服务器内部错误',
          code: 'INTERNAL_ERROR'
        })
      }
    }

    return descriptor
  }
}

/**
 * 资源所有权验证装饰器
 * @param {String} resourceIdParam - 资源ID参数名
 * @param {String} ownerField - 资源所有者字段名
 * @returns {Function} 装饰器函数
 */
function requireResourceOwnership(resourceIdParam, ownerField = 'user_id') {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const [req, res] = args
      const resourceId = req.params[resourceIdParam] || req.query[resourceIdParam] || req.body[resourceIdParam]

      try {
        // 检查用户认证
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: '用户未认证',
            code: 'UNAUTHORIZED'
          })
        }

        // 如果是管理员，跳过所有权检查
        if (hasRole(req.user.roles, 'admin')) {
          return await originalMethod.apply(this, args)
        }

        // 查询资源所有者
        const resourceOwner = await getResourceOwner(resourceId, ownerField)
        
        if (!resourceOwner) {
          return res.status(404).json({
            success: false,
            error: '资源不存在',
            code: 'RESOURCE_NOT_FOUND'
          })
        }

        // 检查所有权
        if (resourceOwner !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: '无权访问此资源',
            code: 'RESOURCE_OWNERSHIP_DENIED'
          })
        }

        // 调用原始方法
        return await originalMethod.apply(this, args)

      } catch (error) {
        console.error('资源所有权验证错误:', error)
        return res.status(500).json({
          success: false,
          error: '服务器内部错误',
          code: 'INTERNAL_ERROR'
        })
      }
    }

    return descriptor
  }
}

/**
 * 速率限制装饰器
 * @param {Object} options - 速率限制配置
 * @returns {Function} 装饰器函数
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,  // 15分钟窗口
    max = 100,                   // 最大请求数
    message = '请求过于频繁，请稍后再试',
    keyGenerator = (req) => req.user?.id || req.ip
  } = options

  const requests = new Map()

  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const [req, res] = args
      const key = keyGenerator(req)
      const now = Date.now()
      
      if (!requests.has(key)) {
        requests.set(key, [])
      }

      const userRequests = requests.get(key)
      
      // 清理过期请求记录
      const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs)
      requests.set(key, validRequests)

      // 检查是否超过限制
      if (validRequests.length >= max) {
        return res.status(429).json({
          success: false,
          error: message,
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: Math.ceil((windowMs - (now - validRequests[0])) / 1000)
        })
      }

      // 记录当前请求
      validRequests.push(now)
      
      // 调用原始方法
      return await originalMethod.apply(this, args)
    }

    return descriptor
  }
}

/**
 * 输入验证装饰器
 * @param {Object} schema - 验证模式
 * @returns {Function} 装饰器函数
 */
function validateInput(schema) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      const [req, res] = args

      try {
        // 验证请求体
        if (schema.body) {
          const { error, value } = schema.body.validate(req.body)
          if (error) {
            return res.status(400).json({
              success: false,
              error: '请求参数验证失败',
              code: 'VALIDATION_ERROR',
              details: error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
              }))
            })
          }
          req.validatedBody = value
        }

        // 验证查询参数
        if (schema.query) {
          const { error, value } = schema.query.validate(req.query)
          if (error) {
            return res.status(400).json({
              success: false,
              error: '查询参数验证失败',
              code: 'VALIDATION_ERROR',
              details: error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
              }))
            })
          }
          req.validatedQuery = value
        }

        // 验证路径参数
        if (schema.params) {
          const { error, value } = schema.params.validate(req.params)
          if (error) {
            return res.status(400).json({
              success: false,
              error: '路径参数验证失败',
              code: 'VALIDATION_ERROR',
              details: error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
              }))
            })
          }
          req.validatedParams = value
        }

        // 调用原始方法
        return await originalMethod.apply(this, args)

      } catch (error) {
        console.error('输入验证错误:', error)
        return res.status(500).json({
          success: false,
          error: '服务器内部错误',
          code: 'INTERNAL_ERROR'
        })
      }
    }

    return descriptor
  }
}

// 辅助函数
async function logAuditEvent(action, userId, resource, details, req) {
  try {
    // 这里应该调用实际的审计日志系统
    console.log(`审计日志: ${action} by ${userId} on ${resource}`, details)
  } catch (error) {
    console.error('记录审计日志失败:', error)
  }
}

async function getResourceOwner(resourceId, ownerField) {
  // 这里应该实现具体的资源所有者查询逻辑
  // 示例实现：
  try {
    // 根据资源ID查询数据库获取所有者
    // const { data, error } = await supabase
    //   .from('resources')
    //   .select(ownerField)
    //   .eq('id', resourceId)
    //   .single()
    // 
    // if (error) throw error
    // return data[ownerField]
    
    // 临时返回null，实际项目中需要实现真实查询
    return null
  } catch (error) {
    console.error('查询资源所有者失败:', error)
    return null
  }
}

function hasAnyPermission(userRoles, permissions) {
  // 复用权限中间件的逻辑
  return permissions.some(permission => 
    userRoles.includes('admin') || // 管理员拥有所有权限
    getRolePermissions(userRoles).includes(permission)
  )
}

function hasAllPermissions(userRoles, permissions) {
  return permissions.every(permission => 
    userRoles.includes('admin') || // 管理员拥有所有权限
    getRolePermissions(userRoles).includes(permission)
  )
}

function hasRole(userRoles, role) {
  return userRoles.includes(role) || userRoles.includes('admin')
}

function getRolePermissions(userRoles) {
  // 这里应该从配置文件加载角色权限映射
  const rolePermissions = {
    'admin': ['*'],
    'manager': ['dashboard_read', 'users_read', 'content_read', 'shops_read'],
    'content_manager': ['dashboard_read', 'content_read', 'content_create', 'content_update'],
    'shop_manager': ['dashboard_read', 'shops_read', 'shops_approve'],
    'viewer': ['dashboard_read']
  }
  
  const permissions = new Set()
  userRoles.forEach(role => {
    const rolePerms = rolePermissions[role] || []
    rolePerms.forEach(perm => permissions.add(perm))
  })
  
  return Array.from(permissions)
}

// 导出装饰器
module.exports = {
  requireApiPermission,
  requireMultiplePermissions,
  requireResourceOwnership,
  rateLimit,
  validateInput
}