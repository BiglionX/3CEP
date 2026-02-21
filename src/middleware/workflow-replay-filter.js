/**
 * 工作流回放参数过滤中间件
 * 根据白名单配置过滤回放参数，确保安全性
 */

const fs = require('fs');
const path = require('path');

// 加载白名单配置
const ALLOWLIST_CONFIG_PATH = path.join(__dirname, '..', '..', 'config', 'workflow-replay-allowlist.json');

let allowlistConfig = null;

function loadAllowlistConfig() {
  if (!allowlistConfig) {
    try {
      const configContent = fs.readFileSync(ALLOWLIST_CONFIG_PATH, 'utf8');
      allowlistConfig = JSON.parse(configContent);
      console.log('✅ 工作流回放白名单配置加载成功');
    } catch (error) {
      console.error('❌ 加载工作流回放白名单配置失败:', error.message);
      // 使用默认配置
      allowlistConfig = getDefaultAllowlistConfig();
    }
  }
  return allowlistConfig;
}

function getDefaultAllowlistConfig() {
  return {
    allowlist: {
      common: { parameters: ['workflowId', 'executionId', 'input_data'] }
    },
    denylist: {
      credentials: { parameters: ['api_key', 'password', 'secret_key'] }
    },
    role_based_rules: {
      admin: { allow_all_parameters: true },
      ops: { allowed_categories: ['common'] },
      partner: { allowed_categories: ['common'] }
    }
  };
}

/**
 * 参数过滤主函数
 */
function filterReplayParameters(parameters, userRole, workflowId) {
  const config = loadAllowlistConfig();
  
  // 获取角色规则
  const roleRules = config.role_based_rules[userRole] || config.role_based_rules.partner;
  
  // 管理员允许所有参数
  if (roleRules.allow_all_parameters) {
    return {
      filtered: parameters,
      removed: [],
      audit_log: {
        user_role: userRole,
        workflow_id: workflowId,
        action: 'replay',
        parameters_allowed: Object.keys(parameters).length,
        parameters_removed: 0,
        timestamp: new Date().toISOString()
      }
    };
  }

  // 根据白名单过滤参数
  const allowedParams = new Set();
  const removedParams = [];
  const filteredParams = {};

  // 收集允许的参数名
  if (roleRules.allowed_categories) {
    roleRules.allowed_categories.forEach(category => {
      const categoryParams = config.allowlist[category]?.parameters || [];
      categoryParams.forEach(param => allowedParams.add(param));
    });
  }

  // 过滤参数
  Object.entries(parameters).forEach(([key, value]) => {
    // 检查显式允许的参数
    if (allowedParams.has(key)) {
      filteredParams[key] = value;
      return;
    }

    // 检查黑名单
    const isInDenylist = Object.values(config.denylist || {}).some(category => 
      category.parameters.includes(key)
    );

    if (isInDenylist) {
      removedParams.push({
        key,
        reason: 'blacklisted',
        value_type: typeof value
      });
      return;
    }

    // 检查参数长度和深度限制
    const validationResult = validateParameter(key, value, config.validation_rules);
    if (validationResult.valid) {
      filteredParams[key] = validationResult.cleaned_value;
    } else {
      removedParams.push({
        key,
        reason: validationResult.reason,
        value_type: typeof value
      });
    }
  });

  // 生成审计日志
  const auditLog = {
    user_role: userRole,
    workflow_id: workflowId,
    action: 'replay',
    parameters_allowed: Object.keys(filteredParams).length,
    parameters_removed: removedParams.length,
    removed_details: removedParams,
    timestamp: new Date().toISOString()
  };

  return {
    filtered: filteredParams,
    removed: removedParams,
    audit_log: auditLog
  };
}

/**
 * 参数验证函数
 */
function validateParameter(key, value, validationRules = {}) {
  // 类型检查
  const allowedTypes = validationRules.data_types?.allowed_types || ['string', 'number', 'boolean'];
  const valueType = typeof value;
  
  if (!allowedTypes.includes(valueType)) {
    return {
      valid: false,
      reason: `unsupported_type_${valueType}`,
      cleaned_value: null
    };
  }

  // 长度检查
  if (valueType === 'string' && validationRules.parameter_length) {
    const maxLength = validationRules.parameter_length.max_length || 1000;
    if (value.length > maxLength) {
      if (validationRules.parameter_length.truncate_if_exceeds) {
        return {
          valid: true,
          reason: 'truncated',
          cleaned_value: value.substring(0, maxLength)
        };
      } else {
        return {
          valid: false,
          reason: 'exceeds_max_length',
          cleaned_value: null
        };
      }
    }
  }

  // 嵌套深度检查
  if (valueType === 'object' && validationRules.nested_depth) {
    const maxDepth = validationRules.nested_depth.max_depth || 5;
    const currentDepth = getObjectDepth(value);
    
    if (currentDepth > maxDepth) {
      if (validationRules.nested_depth.flatten_if_exceeds) {
        return {
          valid: true,
          reason: 'flattened',
          cleaned_value: flattenObject(value, maxDepth)
        };
      } else {
        return {
          valid: false,
          reason: 'exceeds_max_depth',
          cleaned_value: null
        };
      }
    }
  }

  return {
    valid: true,
    reason: 'valid',
    cleaned_value: value
  };
}

/**
 * 计算对象嵌套深度
 */
function getObjectDepth(obj, currentDepth = 0) {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }
  
  if (Array.isArray(obj)) {
    return Math.max(...obj.map(item => getObjectDepth(item, currentDepth + 1)));
  }
  
  return Math.max(
    currentDepth,
    ...Object.values(obj).map(value => getObjectDepth(value, currentDepth + 1))
  );
}

/**
 * 展平嵌套对象
 */
function flattenObject(obj, maxDepth, currentDepth = 0, prefix = '') {
  if (currentDepth >= maxDepth || typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      flattenObject(item, maxDepth, currentDepth + 1, `${prefix}[${index}]`)
    );
  }

  const flattened = {};
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && currentDepth < maxDepth - 1) {
      Object.assign(flattened, flattenObject(value, maxDepth, currentDepth + 1, newKey));
    } else {
      flattened[newKey] = value;
    }
  });

  return flattened;
}

/**
 * Express中间件
 */
function workflowReplayFilter(req, res, next) {
  // 检查是否为工作流回放请求
  if (!req.path.includes('/api/workflows/replay') && !req.path.includes('/api/workflows/rollback')) {
    return next();
  }

  try {
    const userRole = req.user?.role || 'user';
    const workflowId = req.body?.workflowId || req.query?.workflowId;
    
    if (!workflowId) {
      return res.status(400).json({
        error: '缺少工作流ID',
        code: 'MISSING_WORKFLOW_ID'
      });
    }

    // 过滤请求体中的参数
    if (req.body && typeof req.body === 'object') {
      const filterResult = filterReplayParameters(req.body, userRole, workflowId);
      
      // 更新请求体
      req.filteredBody = filterResult.filtered;
      req.filterAudit = filterResult.audit_log;
      req.removedParameters = filterResult.removed;

      // 记录审计日志
      if (allowlistConfig?.audit_settings?.enabled) {
        logAuditEvent(filterResult.audit_log);
      }

      // 如果移除了太多参数，可能拒绝请求
      const removalRate = filterResult.removed.length / 
        (Object.keys(req.body).length || 1);
      
      if (removalRate > 0.5 && allowlistConfig?.audit_settings?.alert_threshold) {
        console.warn(`⚠️ 高参数移除率警告: ${removalRate * 100}%`);
      }
    }

    next();
  } catch (error) {
    console.error('工作流回放参数过滤错误:', error);
    res.status(500).json({
      error: '参数过滤失败',
      code: 'PARAMETER_FILTER_ERROR'
    });
  }
}

/**
 * 记录审计事件
 */
function logAuditEvent(auditData) {
  // 这里应该集成到实际的审计日志系统
  console.log('🔒 审计日志:', JSON.stringify(auditData, null, 2));
  
  // 可以在这里添加到数据库或外部日志系统
  // 例如: auditService.log(auditData);
}

module.exports = {
  workflowReplayFilter,
  filterReplayParameters,
  loadAllowlistConfig
};