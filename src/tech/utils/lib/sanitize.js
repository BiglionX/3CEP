/**
 * 数据脱敏工具库
 * 根据用户角色和租户对敏感数据进行脱敏处理
 */

// 敏感字段配置
const SENSITIVE_FIELDS = {
  // 用户个人信息
  personal: ['phone', 'email', 'id_card', 'real_name', 'address'],
  // 财务信息
  financial: ['bank_account', 'credit_card', 'balance', 'transaction_id'],
  // 系统敏感信息
  system: ['password', 'api_key', 'secret_key', 'access_token'],
  // 商业机密
  business: ['contract_terms', 'pricing_info', 'supplier_details']
};

// 脱敏规则配置
const MASKING_RULES = {
  phone: {
    pattern: /(\d{3})\d{4}(\d{4})/,
    mask: '$1****$2'
  },
  email: {
    pattern: /^([^@]{2})[^@]*(@.*)$/,
    mask: '$1***$2'
  },
  id_card: {
    pattern: /(\d{6})\d{8}(\w{4})/,
    mask: '$1********$2'
  },
  bank_account: {
    pattern: /(\d{4})\d+(\d{4})/,
    mask: '$1****$2'
  }
};

/**
 * 根据角色和租户对数据进行脱敏
 * @param {Object} data - 原始数据
 * @param {string} userRole - 用户角色
 * @param {string} userTenant - 用户租户
 * @param {Object} context - 上下文信息
 * @returns {Object} 脱敏后的数据
 */
function sanitizeData(data, userRole, userTenant, context = {}) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // 深拷贝数据
  const sanitizedData = JSON.parse(JSON.stringify(data));
  
  // 根据角色确定可访问的敏感级别
  const accessibleLevels = getAccessibleSensitiveLevels(userRole);
  
  // 递归处理数据
  return sanitizeRecursive(sanitizedData, accessibleLevels, userTenant, context);
}

/**
 * 递归脱敏处理
 */
function sanitizeRecursive(obj, accessibleLevels, userTenant, context, path = '') {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      sanitizeRecursive(item, accessibleLevels, userTenant, context, `${path}[${index}]`)
    );
  }

  if (typeof obj === 'object') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // 检查字段敏感级别
      const fieldLevel = getFieldSensitivityLevel(key);
      
      if (fieldLevel && !accessibleLevels.includes(fieldLevel)) {
        // 字段需要脱敏
        result[key] = maskFieldValue(key, value, userRole, context);
      } else if (shouldFilterByTenant(key, value, userTenant, context)) {
        // 租户过滤
        continue;
      } else {
        // 递归处理嵌套对象
        result[key] = sanitizeRecursive(value, accessibleLevels, userTenant, context, currentPath);
      }
    }
    
    return result;
  }

  return obj;
}

/**
 * 获取角色可访问的敏感级别
 */
function getAccessibleSensitiveLevels(role) {
  const levelMap = {
    'admin': ['personal', 'financial', 'system', 'business'],
    'ops': ['personal', 'financial', 'business'],
    'partner': ['personal'],
    'user': [],
    'guest': []
  };
  
  return levelMap[role] || [];
}

/**
 * 获取字段的敏感级别
 */
function getFieldSensitivityLevel(fieldName) {
  for (const [level, fields] of Object.entries(SENSITIVE_FIELDS)) {
    if (fields.includes(fieldName.toLowerCase())) {
      return level;
    }
  }
  return null;
}

/**
 * 对字段值进行脱敏处理
 */
function maskFieldValue(fieldName, value, userRole, context) {
  if (value === null || value === undefined) {
    return value;
  }

  const stringValue = String(value);
  
  // 查找对应的脱敏规则
  const rule = MASKING_RULES[fieldName.toLowerCase()];
  if (rule) {
    return stringValue.replace(rule.pattern, rule.mask);
  }

  // 默认脱敏规则
  if (stringValue.length <= 4) {
    return '*'.repeat(stringValue.length);
  } else {
    const visibleChars = Math.min(2, Math.floor(stringValue.length * 0.3));
    const hiddenChars = stringValue.length - visibleChars * 2;
    return stringValue.substring(0, visibleChars) + 
           '*'.repeat(hiddenChars) + 
           stringValue.substring(stringValue.length - visibleChars);
  }
}

/**
 * 根据租户过滤数据
 */
function shouldFilterByTenant(fieldName, value, userTenant, context) {
  // 租户相关字段检查
  const tenantFields = ['tenant_id', 'organization_id', 'company_id'];
  
  if (tenantFields.includes(fieldName.toLowerCase())) {
    // 如果是租户字段且与当前用户租户不匹配，则过滤
    return value !== userTenant;
  }
  
  return false;
}

/**
 * 工作流执行详情脱敏
 */
function sanitizeWorkflowExecution(executionData, userRole, userTenant) {
  const sanitized = sanitizeData(executionData, userRole, userTenant, {
    context: 'workflow_execution'
  });

  // 特殊处理工作流执行数据
  if (sanitized.execution) {
    // 移除内部调试信息
    delete sanitized.execution.debug_info;
    delete sanitized.execution.internal_logs;
    
    // 脱敏节点配置
    if (sanitized.execution.nodes) {
      sanitized.execution.nodes = sanitized.execution.nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        // 移除敏感配置
        parameters: sanitizeNodeParameters(node.parameters, userRole)
      }));
    }
  }

  return sanitized;
}

/**
 * 脱敏节点参数
 */
function sanitizeNodeParameters(parameters, userRole) {
  if (!parameters || typeof parameters !== 'object') {
    return parameters;
  }

  const sanitized = { ...parameters };
  const sensitiveParams = ['credentials', 'apiKey', 'password', 'secret'];

  // 管理员可以查看所有参数
  if (userRole === 'admin') {
    return sanitized;
  }

  // 其他角色隐藏敏感参数
  sensitiveParams.forEach(param => {
    if (sanitized[param] !== undefined) {
      sanitized[param] = '***MASKED***';
    }
  });

  return sanitized;
}

/**
 * Agent详情脱敏
 */
function sanitizeAgentDetails(agentData, userRole, userTenant) {
  return sanitizeData(agentData, userRole, userTenant, {
    context: 'agent_details'
  });
}

/**
 * 批量脱敏处理
 */
function sanitizeBatch(dataArray, userRole, userTenant, sanitizerFunc = sanitizeData) {
  if (!Array.isArray(dataArray)) {
    return dataArray;
  }

  return dataArray.map(item => 
    sanitizerFunc(item, userRole, userTenant)
  );
}

module.exports = {
  sanitizeData,
  sanitizeWorkflowExecution,
  sanitizeAgentDetails,
  sanitizeBatch,
  SENSITIVE_FIELDS,
  MASKING_RULES
};