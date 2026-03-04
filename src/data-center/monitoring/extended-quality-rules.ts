// 扩展数据质量检查规则库
import { QualityCheckRule, QualityIssueType } from './data-quality-service';

// 高级数据质量检查规则配?export const EXTENDED_QUALITY_RULES: QualityCheckRule[] = [
  // ==================== 完整性检查规?====================
  {
    id: 'completeness_user_profile_check',
    name: '用户档案完整性检?,
    tableName: 'user_profiles',
    checkType: 'missing_value' as QualityIssueType,
    parameters: {
      requiredColumns: ['first_name', 'last_name', 'phone', 'address'],
      completenessThreshold: 80, // 至少80%的必填字段要有?    },
    threshold: 5.0,
    enabled: true,
    severity: 'high',
    description: '检查用户档案必填字段的完整?,
  },

  {
    id: 'completeness_product_description_check',
    name: '产品描述完整性检?,
    tableName: 'products',
    columnName: 'description',
    checkType: 'missing_value' as QualityIssueType,
    parameters: {
      minLength: 50, // 描述至少50个字?      completenessRatio: 90, // 90%的产品应有完整描?    },
    threshold: 10.0,
    enabled: true,
    severity: 'medium',
    description: '检查产品描述字段的完整性和丰富?,
  },

  // ==================== 准确性检查规?====================
  {
    id: 'accuracy_phone_number_format',
    name: '手机号码格式准确性检?,
    tableName: 'users',
    columnName: 'phone',
    checkType: 'invalid_format' as QualityIssueType,
    parameters: {
      pattern: '^1[3-9]\\d{9}$', // 中国手机号格?      countryCode: '+86',
    },
    threshold: 1.0,
    enabled: true,
    severity: 'high',
    description: '验证手机号码格式是否符合国家标准',
  },

  {
    id: 'accuracy_email_validation',
    name: '邮箱地址准确性检?,
    tableName: 'users',
    columnName: 'email',
    checkType: 'invalid_format' as QualityIssueType,
    parameters: {
      pattern: 'email',
      mxLookup: true, // 是否检查MX记录
      disposableCheck: true, // 是否检查临时邮?    },
    threshold: 0.5,
    enabled: true,
    severity: 'medium',
    description: '验证邮箱地址格式和有效?,
  },

  {
    id: 'accuracy_id_card_validation',
    name: '身份证号码准确性检?,
    tableName: 'users',
    columnName: 'id_card',
    checkType: 'invalid_format' as QualityIssueType,
    parameters: {
      pattern: 'id_card_china', // 中国身份证格?      checksum: true, // 校验位验?      birthDateValidation: true, // 生日有效性验?    },
    threshold: 0.1,
    enabled: true,
    severity: 'critical',
    description: '验证身份证号码格式和有效?,
  },

  // ==================== 一致性检查规?====================
  {
    id: 'consistency_price_decimal_places',
    name: '价格小数位数一致性检?,
    tableName: 'products',
    columnName: 'price',
    checkType: 'inconsistent_data' as QualityIssueType,
    parameters: {
      decimalPlaces: 2, // 统一小数位数
      roundingMethod: 'round', // 四舍五入方式
    },
    threshold: 2.0,
    enabled: true,
    severity: 'medium',
    description: '检查价格字段的小数位数一致?,
  },

  {
    id: 'consistency_date_format_check',
    name: '日期格式一致性检?,
    tableName: 'orders',
    columnName: 'created_at',
    checkType: 'inconsistent_data' as QualityIssueType,
    parameters: {
      expectedFormat: 'YYYY-MM-DD HH:mm:ss',
      timezone: 'Asia/Shanghai',
    },
    threshold: 1.0,
    enabled: true,
    severity: 'medium',
    description: '验证日期时间字段格式的一致?,
  },

  {
    id: 'consistency_category_hierarchy',
    name: '分类层级一致性检?,
    tableName: 'categories',
    checkType: 'referential_integrity' as QualityIssueType,
    parameters: {
      parentColumn: 'parent_id',
      selfReference: true,
      noCircularReference: true,
    },
    threshold: 0.5,
    enabled: true,
    severity: 'high',
    description: '检查分类层级关系的一致性和完整?,
  },

  // ==================== 新鲜度检查规?====================
  {
    id: 'freshness_user_login_check',
    name: '用户登录记录新鲜度检?,
    tableName: 'user_sessions',
    checkType: 'stale_data' as QualityIssueType,
    parameters: {
      timestampColumn: 'last_login_at',
      maxAgeDays: 90, // 90天内应有登录记录
      activeUserThreshold: 30, // 30天内活跃用户比例
    },
    threshold: 15.0,
    enabled: true,
    severity: 'medium',
    description: '检查用户登录记录的新鲜度和活跃?,
  },

  {
    id: 'freshness_inventory_update_check',
    name: '库存更新新鲜度检?,
    tableName: 'inventory',
    checkType: 'stale_data' as QualityIssueType,
    parameters: {
      timestampColumn: 'last_updated_at',
      maxAgeHours: 24, // 24小时内应更新
      criticalItemsOnly: true, // 只检查关键库存项
      thresholdQuantity: 10, // 库存量低?0时重点关?    },
    threshold: 5.0,
    enabled: true,
    severity: 'high',
    description: '检查库存数据的及时更新情况',
  },

  // ==================== 业务规则检?====================
  {
    id: 'business_order_amount_validation',
    name: '订单金额业务规则检?,
    tableName: 'orders',
    checkType: 'business_rule_violation' as QualityIssueType,
    parameters: {
      rules: [
        {
          condition: 'amount > 0',
          description: '订单金额必须大于0',
        },
        {
          condition: 'amount <= 1000000',
          description: '订单金额不能超过100万元',
        },
        {
          condition: 'discount_rate >= 0 AND discount_rate <= 1',
          description: '折扣率应?-1之间',
        },
      ],
    },
    threshold: 0.1,
    enabled: true,
    severity: 'critical',
    description: '验证订单相关业务规则的合规?,
  },

  {
    id: 'business_user_age_validation',
    name: '用户年龄业务规则检?,
    tableName: 'users',
    columnName: 'birth_date',
    checkType: 'business_rule_violation' as QualityIssueType,
    parameters: {
      calculatedField: 'age',
      minAge: 18,
      maxAge: 120,
      legalAgeRequired: true,
    },
    threshold: 0.5,
    enabled: true,
    severity: 'high',
    description: '验证用户年龄是否符合业务要求',
  },

  // ==================== 模式验证规则 ====================
  {
    id: 'schema_column_type_validation',
    name: '字段类型模式验证',
    tableName: 'all_tables',
    checkType: 'schema_violation' as QualityIssueType,
    parameters: {
      expectedSchema: {
        id: 'INTEGER PRIMARY KEY',
        created_at: 'TIMESTAMP',
        updated_at: 'TIMESTAMP',
        status: 'VARCHAR(20)',
      },
      allowNullViolations: ['id', 'created_at'],
      maxLengthConstraints: {
        name: 100,
        description: 1000,
      },
    },
    threshold: 1.0,
    enabled: true,
    severity: 'high',
    description: '验证数据库表结构和字段约束的一致?,
  },

  {
    id: 'schema_foreign_key_validation',
    name: '外键约束模式验证',
    tableName: 'orders',
    checkType: 'schema_violation' as QualityIssueType,
    parameters: {
      foreignKeys: [
        {
          column: 'user_id',
          references: 'users(id)',
          onDelete: 'CASCADE',
        },
        {
          column: 'product_id',
          references: 'products(id)',
          onDelete: 'SET NULL',
        },
      ],
    },
    threshold: 0.5,
    enabled: true,
    severity: 'critical',
    description: '验证外键约束的完整性和正确?,
  },

  // ==================== 唯一性检查规?====================
  {
    id: 'uniqueness_user_username_check',
    name: '用户名唯一性检?,
    tableName: 'users',
    columnName: 'username',
    checkType: 'uniqueness_violation' as QualityIssueType,
    parameters: {
      caseSensitive: false,
      trimWhitespace: true,
    },
    threshold: 0.0,
    enabled: true,
    severity: 'critical',
    description: '确保用户名的全局唯一?,
  },

  {
    id: 'uniqueness_product_sku_check',
    name: '产品SKU唯一性检?,
    tableName: 'products',
    columnName: 'sku',
    checkType: 'uniqueness_violation' as QualityIssueType,
    parameters: {
      scope: 'global', // 全局唯一
      formatValidation: '^[A-Z0-9]{8,20}$', // SKU格式要求
    },
    threshold: 0.0,
    enabled: true,
    severity: 'critical',
    description: '确保产品SKU编码的唯一性和规范?,
  },

  // ==================== 复杂业务检查规?====================
  {
    id: 'complex_customer_lifetime_value',
    name: '客户生命周期价值计算检?,
    tableName: 'customers',
    checkType: 'business_rule_violation' as QualityIssueType,
    parameters: {
      calculationFields: ['total_orders', 'total_spent', 'avg_order_value'],
      derivedMetric: 'customer_ltv',
      formula: 'total_spent * (1 + retention_rate)',
      validationRules: [
        'customer_ltv >= 0',
        'total_orders >= 0',
        'avg_order_value > 0',
      ],
    },
    threshold: 2.0,
    enabled: true,
    severity: 'medium',
    description: '验证客户价值相关计算的准确性和合理?,
  },

  {
    id: 'complex_inventory_turnover_ratio',
    name: '库存周转率业务逻辑检?,
    tableName: 'inventory_analytics',
    checkType: 'business_rule_violation' as QualityIssueType,
    parameters: {
      calculationLogic: {
        numerator: 'cost_of_goods_sold',
        denominator: 'average_inventory_value',
        expectedRange: [1, 50], // 正常范围1-50�?�?      },
      seasonalAdjustment: true,
      industryBenchmark: 12, // 行业平均12�?�?    },
    threshold: 5.0,
    enabled: true,
    severity: 'medium',
    description: '检查库存周转率计算的业务逻辑合理?,
  },
];

// 规则组配?- 按业务域分组
export const QUALITY_RULE_GROUPS = {
  completeness: {
    name: '数据完整性检查组',
    rules: [
      'completeness_user_profile_check',
      'completeness_product_description_check',
    ],
    schedule: '0 1 * * *', // 每天凌晨1点执?    priority: 'high',
  },

  accuracy: {
    name: '数据准确性检查组',
    rules: [
      'accuracy_phone_number_format',
      'accuracy_email_validation',
      'accuracy_id_card_validation',
    ],
    schedule: '0 2 * * *', // 每天凌晨2点执?    priority: 'high',
  },

  consistency: {
    name: '数据一致性检查组',
    rules: [
      'consistency_price_decimal_places',
      'consistency_date_format_check',
      'consistency_category_hierarchy',
    ],
    schedule: '0 3 * * *', // 每天凌晨3点执?    priority: 'medium',
  },

  freshness: {
    name: '数据新鲜度检查组',
    rules: ['freshness_user_login_check', 'freshness_inventory_update_check'],
    schedule: '*/30 * * * *', // �?0分钟执行
    priority: 'high',
  },

  business: {
    name: '业务规则检查组',
    rules: [
      'business_order_amount_validation',
      'business_user_age_validation',
      'complex_customer_lifetime_value',
      'complex_inventory_turnover_ratio',
    ],
    schedule: '0 4 * * *', // 每天凌晨4点执?    priority: 'critical',
  },

  schema: {
    name: '模式验证检查组',
    rules: ['schema_column_type_validation', 'schema_foreign_key_validation'],
    schedule: '0 0 * * 0', // 每周日凌晨执?    priority: 'medium',
  },

  uniqueness: {
    name: '唯一性检查组',
    rules: ['uniqueness_user_username_check', 'uniqueness_product_sku_check'],
    schedule: '*/15 * * * *', // �?5分钟执行
    priority: 'critical',
  },
};

// 规则模板 - 用于快速创建类似规?export const RULE_TEMPLATES = {
  missing_value_template: {
    name: '{tableName} {columnName} 完整性检?,
    checkType: 'missing_value' as QualityIssueType,
    parameters: {},
    threshold: 1.0,
    enabled: true,
    severity: 'medium' as const,
    description: '检查{tableName}表{columnName}字段的完整?,
  },

  range_validation_template: {
    name: '{tableName} {columnName} 数值范围检?,
    checkType: 'out_of_range' as QualityIssueType,
    parameters: {
      min: 0,
      max: 1000000,
    },
    threshold: 0.5,
    enabled: true,
    severity: 'medium' as const,
    description: '验证{tableName}表{columnName}字段的数值范?,
  },

  format_validation_template: {
    name: '{tableName} {columnName} 格式验证',
    checkType: 'invalid_format' as QualityIssueType,
    parameters: {
      pattern: '',
    },
    threshold: 1.0,
    enabled: true,
    severity: 'high' as const,
    description: '验证{tableName}表{columnName}字段的格式规范?,
  },
};

// 配置管理接口
export interface QualityRuleConfiguration {
  globalSettings: {
    defaultThreshold: number;
    samplingRate: number;
    maxExecutionTime: number; // 最大执行时?�?
    parallelExecutionLimit: number; // 并行执行限制
  };

  notificationSettings: {
    channels: ('email' | 'sms' | 'webhook' | 'slack')[];
    thresholds: {
      warning: number; // 警告阈?      critical: number; // 严重阈?    };
    recipients: {
      warning: string[];
      critical: string[];
    };
  };

  autoRemediation: {
    enabled: boolean;
    maxAutoFixAttempts: number;
    allowedRuleTypes: QualityIssueType[];
  };

  scheduling: {
    defaultSchedule: string;
    timezone: string;
    executionWindow: {
      start: string; // HH:mm格式
      end: string; // HH:mm格式
    };
  };
}

// 默认配置
export const DEFAULT_QUALITY_CONFIG: QualityRuleConfiguration = {
  globalSettings: {
    defaultThreshold: 5,
    samplingRate: 1.0,
    maxExecutionTime: 300, // 5分钟
    parallelExecutionLimit: 10,
  },

  notificationSettings: {
    channels: ['email', 'webhook'],
    thresholds: {
      warning: 2.0,
      critical: 5.0,
    },
    recipients: {
      warning: ['data-team@company.com'],
      critical: ['data-team@company.com', 'management@company.com'],
    },
  },

  autoRemediation: {
    enabled: false,
    maxAutoFixAttempts: 3,
    allowedRuleTypes: ['missing_value', 'invalid_format'],
  },

  scheduling: {
    defaultSchedule: '0 2 * * *',
    timezone: 'Asia/Shanghai',
    executionWindow: {
      start: '00:00',
      end: '06:00',
    },
  },
};
