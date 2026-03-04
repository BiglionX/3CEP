# 数据映射和转换规则规范

## 📋 规范文畴

**文档编号**: DC008-MAPPING  
**版本**: v1.0  
**生效日期**: 2026年2月28日  
**适用范围**: 数据中心模块数据标准化转换

## 🎯 映射规则设计原则

### 核心原则

1. **无损转换**: 确保数据在转换过程中不丢失信息
2. **可逆性**: 支持正向和反向转换
3. **性能优化**: 转换过程高效，不影响系统性能
4. **错误容忍**: 具备优雅的错误处理机制
5. **可配置性**: 支持灵活的规则配置和扩展

### 转换策略

- **即时转换**: 实时数据访问时进行转换
- **批量转换**: 定期批量处理历史数据
- **增量转换**: 只转换发生变化的数据
- **按需转换**: 根据使用场景动态转换

## 🔄 数据映射规则

### 1. 字段映射规则

#### 1.1 基础字段映射

```typescript
// 字段映射配置
export interface FieldMapping {
  sourceField: string; // 源字段名
  targetField: string; // 目标字段名
  dataType: DataType; // 数据类型
  transform?: TransformRule; // 转换规则
  defaultValue?: any; // 默认值
  required?: boolean; // 是否必需
  description?: string; // 字段说明
}

// 标准字段映射表
export const STANDARD_FIELD_MAPPINGS: Record<string, FieldMapping> = {
  // 时间字段映射
  created_time: {
    sourceField: 'created_time',
    targetField: 'created_at',
    dataType: 'datetime',
    transform: value => new Date(value).toISOString(),
    description: '创建时间字段标准化',
  },

  update_time: {
    sourceField: 'update_time',
    targetField: 'updated_at',
    dataType: 'datetime',
    transform: value => new Date(value).toISOString(),
    description: '更新时间字段标准化',
  },

  // ID字段映射
  user_name: {
    sourceField: 'user_name',
    targetField: 'username',
    dataType: 'string',
    description: '用户名字段标准化',
  },

  device_id: {
    sourceField: 'device_id',
    targetField: 'deviceId',
    dataType: 'string',
    description: '设备ID字段驼峰化',
  },

  // 状态字段映射
  is_active: {
    sourceField: 'is_active',
    targetField: 'status',
    dataType: 'string',
    transform: value => (value ? 'active' : 'inactive'),
    description: '布尔状态转枚举状态',
  },
};
```

#### 1.2 枚举值映射

```typescript
// 枚举值映射配置
export interface EnumMapping {
  sourceValue: string | number;
  targetValue: string | number;
  description?: string;
}

// 状态枚举映射
export const STATUS_ENUM_MAPPING: Record<string, EnumMapping[]> = {
  user_status: [
    { sourceValue: 1, targetValue: 'active', description: '激活状态' },
    { sourceValue: 0, targetValue: 'inactive', description: '非激活状态' },
    { sourceValue: -1, targetValue: 'suspended', description: '暂停状态' },
  ],

  order_status: [
    { sourceValue: 'NEW', targetValue: 'created', description: '新订单' },
    {
      sourceValue: 'CONFIRMED',
      targetValue: 'confirmed',
      description: '已确认',
    },
    {
      sourceValue: 'PROCESSING',
      targetValue: 'processing',
      description: '处理中',
    },
    { sourceValue: 'SHIPPED', targetValue: 'shipped', description: '已发货' },
    {
      sourceValue: 'DELIVERED',
      targetValue: 'delivered',
      description: '已送达',
    },
    {
      sourceValue: 'COMPLETED',
      targetValue: 'completed',
      description: '已完成',
    },
    {
      sourceValue: 'CANCELLED',
      targetValue: 'cancelled',
      description: '已取消',
    },
  ],
};

// 通用枚举转换函数
export function convertEnumValue(enumType: string, sourceValue: any): any {
  const mappings = STATUS_ENUM_MAPPING[enumType];
  if (!mappings) {
    return sourceValue; // 无映射时返回原值
  }

  const mapping = mappings.find(m => m.sourceValue === sourceValue);
  return mapping ? mapping.targetValue : sourceValue;
}
```

### 2. 数据结构映射

#### 2.1 嵌套结构转换

```typescript
// 嵌套结构映射规则
export interface StructureMapping {
  sourcePath: string; // 源路径
  targetPath: string; // 目标路径
  transform?: (value: any) => any; // 转换函数
}

// 联系信息结构映射
export const CONTACT_INFO_MAPPING: StructureMapping[] = [
  {
    sourcePath: 'contact_person',
    targetPath: 'contactInfo.name',
    transform: value => value || '',
  },
  {
    sourcePath: 'phone',
    targetPath: 'contactInfo.phone',
    transform: standardizePhone,
  },
  {
    sourcePath: 'email',
    targetPath: 'contactInfo.email',
    transform: standardizeEmail,
  },
];

// 地址信息结构映射
export const ADDRESS_MAPPING: StructureMapping[] = [
  {
    sourcePath: 'province',
    targetPath: 'address.province',
  },
  {
    sourcePath: 'city',
    targetPath: 'address.city',
  },
  {
    sourcePath: 'district',
    targetPath: 'address.district',
  },
  {
    sourcePath: 'detail_address',
    targetPath: 'address.detail',
    transform: value => value || '',
  },
];
```

#### 2.2 数组结构转换

```typescript
// 数组元素映射
export interface ArrayMapping {
  sourceArrayPath: string;
  targetArrayPath: string;
  elementMapping: Record<string, FieldMapping>;
  filter?: (element: any) => boolean; // 过滤条件
}

// 标签数组转换示例
export const TAGS_ARRAY_MAPPING: ArrayMapping = {
  sourceArrayPath: 'tags',
  targetArrayPath: 'tags',
  elementMapping: {
    tag_name: {
      sourceField: 'tag_name',
      targetField: 'name',
      dataType: 'string',
    },
    tag_type: {
      sourceField: 'tag_type',
      targetField: 'type',
      dataType: 'string',
    },
  },
  filter: tag => tag.tag_name && tag.tag_name.trim() !== '',
};
```

## 🛠️ 转换引擎实现

### 1. 通用转换器

```typescript
// 通用数据转换器
export class DataTransformer {
  private mappings: FieldMapping[];
  private structureMappings: StructureMapping[];
  private enumMappings: Record<string, EnumMapping[]>;

  constructor(
    fieldMappings: FieldMapping[],
    structureMappings: StructureMapping[],
    enumMappings: Record<string, EnumMapping[]>
  ) {
    this.mappings = fieldMappings;
    this.structureMappings = structureMappings;
    this.enumMappings = enumMappings;
  }

  // 主转换方法
  transform(sourceData: any, targetType: string): any {
    const targetData: any = {};

    // 1. 字段映射转换
    this.applyFieldMappings(sourceData, targetData);

    // 2. 结构映射转换
    this.applyStructureMappings(sourceData, targetData);

    // 3. 枚举值转换
    this.applyEnumMappings(targetData, targetType);

    // 4. 数据清理和验证
    this.cleanAndValidate(targetData);

    return targetData;
  }

  private applyFieldMappings(source: any, target: any): void {
    for (const mapping of this.mappings) {
      const sourceValue = this.getValueByPath(source, mapping.sourceField);

      if (sourceValue !== undefined || mapping.required) {
        const transformedValue = mapping.transform
          ? mapping.transform(sourceValue)
          : sourceValue;

        this.setValueByPath(target, mapping.targetField, transformedValue);
      }
    }
  }

  private applyStructureMappings(source: any, target: any): void {
    for (const structMapping of this.structureMappings) {
      const sourceValue = this.getValueByPath(source, structMapping.sourcePath);

      if (sourceValue !== undefined) {
        const transformedValue = structMapping.transform
          ? structMapping.transform(sourceValue)
          : sourceValue;

        this.setValueByPath(target, structMapping.targetPath, transformedValue);
      }
    }
  }

  private applyEnumMappings(data: any, enumType: string): void {
    const enumMapping = this.enumMappings[enumType];
    if (!enumMapping) return;

    // 递归处理所有字段
    this.recursiveEnumConvert(data, enumMapping);
  }

  private recursiveEnumConvert(obj: any, mapping: EnumMapping[]): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.recursiveEnumConvert(item, mapping));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value === 'string' || typeof value === 'number') {
          const enumMap = mapping.find(m => m.sourceValue === value);
          if (enumMap) {
            obj[key] = enumMap.targetValue;
          }
        } else {
          this.recursiveEnumConvert(value, mapping);
        }
      });
    }
  }

  // 工具方法
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    let current = obj;
    for (const key of keys) {
      if (!current[key]) current[key] = {};
      current = current[key];
    }

    current[lastKey] = value;
  }

  private cleanAndValidate(data: any): void {
    // 移除undefined值
    this.removeUndefinedValues(data);

    // 数据类型验证
    this.validateDataTypes(data);
  }

  private removeUndefinedValues(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.removeUndefinedValues(item));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
          delete obj[key];
        } else {
          this.removeUndefinedValues(obj[key]);
        }
      });
    }
  }

  private validateDataTypes(data: any): void {
    // 实现数据类型验证逻辑
    // 可以集成Zod或其他验证库
  }
}
```

### 2. 批量转换处理器

```typescript
// 批量数据转换处理器
export class BatchDataProcessor {
  private transformer: DataTransformer;
  private batchSize: number;

  constructor(transformer: DataTransformer, batchSize: number = 1000) {
    this.transformer = transformer;
    this.batchSize = batchSize;
  }

  async processBatch(
    dataSource: AsyncIterable<any>,
    targetType: string,
    onProgress?: (processed: number, total: number) => void
  ): Promise<any[]> {
    const results: any[] = [];
    let processedCount = 0;
    let totalCount = 0;

    // 预估总数（如果数据源支持）
    if (dataSource instanceof Array) {
      totalCount = dataSource.length;
    }

    // 分批处理
    for await (const batch of this.createBatches(dataSource)) {
      const batchResults = await Promise.all(
        batch.map(item => this.transformer.transform(item, targetType))
      );

      results.push(...batchResults);
      processedCount += batch.length;

      // 进度回调
      if (onProgress) {
        onProgress(processedCount, totalCount);
      }
    }

    return results;
  }

  private async *createBatches(
    dataSource: AsyncIterable<any>
  ): AsyncGenerator<any[]> {
    const batch: any[] = [];

    for await (const item of dataSource) {
      batch.push(item);

      if (batch.length >= this.batchSize) {
        yield batch.splice(0);
      }
    }

    if (batch.length > 0) {
      yield batch;
    }
  }
}
```

## 📊 转换规则配置

### 1. 配置文件格式

```yaml
# data-mapping-config.yaml
version: '1.0'
mappings:
  # 用户数据映射
  user_mapping:
    source: 'legacy_user_table'
    target: 'standard_user'
    fields:
      - source_field: 'user_name'
        target_field: 'username'
        data_type: 'string'
        required: true

      - source_field: 'create_time'
        target_field: 'created_at'
        data_type: 'datetime'
        transform: 'to_iso_datetime'

      - source_field: 'user_status'
        target_field: 'status'
        data_type: 'enum'
        enum_mapping: 'user_status_enum'

    structures:
      - source_path: 'contact_info'
        target_path: 'contactInfo'
        mappings:
          phone: standardize_phone
          email: standardize_email

  # 订单数据映射
  order_mapping:
    source: 'order_table'
    target: 'standard_order'
    # ... 其他配置

enums:
  user_status_enum:
    - source: 1
      target: 'active'
      description: '激活用户'
    - source: 0
      target: 'inactive'
      description: '非激活用户'
    - source: -1
      target: 'suspended'
      description: '暂停用户'

transforms:
  to_iso_datetime:
    type: 'function'
    implementation: |
      (value) => {
        if (!value) return null;
        return new Date(value).toISOString();
      }

  standardize_phone:
    type: 'regex'
    pattern: "^\\+?([1-9]\\d{0,3})[-.\\s]?([1-9]\\d{1,14})$"
    replacement: '+$1$2'
```

### 2. 动态规则加载

```typescript
// 规则配置管理器
export class MappingRuleManager {
  private rules: Record<string, MappingConfig>;
  private transformers: Record<string, TransformFunction>;

  async loadRulesFromFile(configPath: string): Promise<void> {
    const config = await this.loadYamlConfig(configPath);
    this.rules = config.mappings;
    this.transformers = this.compileTransforms(config.transforms);
  }

  getTransformer(mappingName: string): DataTransformer {
    const config = this.rules[mappingName];
    if (!config) {
      throw new Error(`Mapping rule not found: ${mappingName}`);
    }

    return new DataTransformer(
      this.buildFieldMappings(config.fields),
      this.buildStructureMappings(config.structures),
      config.enums || {}
    );
  }

  private buildFieldMappings(fieldConfigs: any[]): FieldMapping[] {
    return fieldConfigs.map(config => ({
      sourceField: config.source_field,
      targetField: config.target_field,
      dataType: config.data_type,
      transform: config.transform
        ? this.transformers[config.transform]
        : undefined,
      defaultValue: config.default_value,
      required: config.required || false,
      description: config.description,
    }));
  }

  private buildStructureMappings(structConfigs: any[]): StructureMapping[] {
    return structConfigs.map(config => ({
      sourcePath: config.source_path,
      targetPath: config.target_path,
      transform: config.mappings
        ? this.createNestedTransformer(config.mappings)
        : undefined,
    }));
  }

  private createNestedTransformer(
    mappings: Record<string, string>
  ): (value: any) => any {
    return value => {
      const result: any = {};
      Object.entries(mappings).forEach(([sourceKey, transformName]) => {
        if (value[sourceKey] !== undefined) {
          const transformer = this.transformers[transformName];
          result[sourceKey] = transformer
            ? transformer(value[sourceKey])
            : value[sourceKey];
        }
      });
      return result;
    };
  }
}
```

## 🔍 数据质量检查

### 1. 转换前后验证

```typescript
// 数据质量检查器
export class DataQualityChecker {
  static validateConversion(
    sourceData: any,
    targetData: any,
    mappingConfig: MappingConfig
  ): ConversionValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. 必填字段检查
    this.checkRequiredFields(sourceData, targetData, mappingConfig, issues);

    // 2. 数据类型检查
    this.checkDataTypes(targetData, mappingConfig, issues);

    // 3. 枚举值检查
    this.checkEnumValues(targetData, mappingConfig, issues);

    // 4. 数据完整性检查
    this.checkDataIntegrity(sourceData, targetData, issues);

    return {
      isValid: issues.length === 0,
      issues,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      errorCount: issues.filter(i => i.severity === 'error').length,
    };
  }

  private static checkRequiredFields(
    source: any,
    target: any,
    config: MappingConfig,
    issues: ValidationIssue[]
  ): void {
    const requiredFields = config.fields.filter(f => f.required);

    for (const field of requiredFields) {
      const targetValue = this.getValueByPath(target, field.target_field);
      if (
        targetValue === undefined ||
        targetValue === null ||
        targetValue === ''
      ) {
        issues.push({
          severity: 'error',
          field: field.target_field,
          message: `Required field '${field.target_field}' is missing or empty`,
          sourceValue: this.getValueByPath(source, field.source_field),
        });
      }
    }
  }

  private static checkDataTypes(
    data: any,
    config: MappingConfig,
    issues: ValidationIssue[]
  ): void {
    for (const field of config.fields) {
      const value = this.getValueByPath(data, field.target_field);
      if (value !== undefined) {
        const isValid = this.validateDataType(value, field.data_type);
        if (!isValid) {
          issues.push({
            severity: 'warning',
            field: field.target_field,
            message: `Data type mismatch for field '${field.target_field}'. Expected ${field.data_type}, got ${typeof value}`,
            actualValue: value,
          });
        }
      }
    }
  }

  private static checkEnumValues(
    data: any,
    config: MappingConfig,
    issues: ValidationIssue[]
  ): void {
    const enumFields = config.fields.filter(f => f.data_type === 'enum');

    for (const field of enumFields) {
      const value = this.getValueByPath(data, field.target_field);
      if (value !== undefined) {
        const isValid = this.validateEnumValue(
          value,
          config.enums?.[field.enum_mapping || '']
        );
        if (!isValid) {
          issues.push({
            severity: 'warning',
            field: field.target_field,
            message: `Invalid enum value '${value}' for field '${field.target_field}'`,
            allowedValues: config.enums?.[field.enum_mapping || '']?.map(
              e => e.target
            ),
          });
        }
      }
    }
  }

  private static checkDataIntegrity(
    source: any,
    target: any,
    issues: ValidationIssue[]
  ): void {
    // 检查数据是否在转换过程中丢失
    const sourceKeys = Object.keys(source);
    const targetKeys = Object.keys(target);

    if (sourceKeys.length > targetKeys.length * 2) {
      issues.push({
        severity: 'warning',
        message: 'Significant data loss detected during conversion',
        sourceKeys: sourceKeys.length,
        targetKeys: targetKeys.length,
      });
    }
  }
}
```

### 2. 性能监控

```typescript
// 转换性能监控器
export class ConversionPerformanceMonitor {
  private metrics: ConversionMetrics[];

  startMonitoring(): void {
    this.metrics = [];
  }

  recordConversion(
    mappingName: string,
    recordCount: number,
    durationMs: number,
    validationResult: ConversionValidationResult
  ): void {
    this.metrics.push({
      timestamp: new Date(),
      mappingName,
      recordCount,
      durationMs,
      successRate: validationResult.isValid ? 1 : 0,
      errorCount: validationResult.errorCount,
      warningCount: validationResult.warningCount,
    });
  }

  getPerformanceReport(): PerformanceReport {
    const totalRecords = this.metrics.reduce(
      (sum, m) => sum + m.recordCount,
      0
    );
    const totalTime = this.metrics.reduce((sum, m) => sum + m.durationMs, 0);
    const avgDuration = totalTime / this.metrics.length;
    const throughput = totalRecords / (totalTime / 1000); // records/second

    return {
      totalConversions: this.metrics.length,
      totalRecords,
      totalTimeMs: totalTime,
      averageDurationMs: avgDuration,
      throughput: Math.round(throughput),
      successRate: this.calculateSuccessRate(),
      errorSummary: this.getErrorSummary(),
    };
  }

  private calculateSuccessRate(): number {
    const successful = this.metrics.filter(m => m.successRate === 1).length;
    return successful / this.metrics.length;
  }

  private getErrorSummary(): ErrorSummary {
    const allErrors = this.metrics.flatMap(m => m.errorCount);
    const errorCounts = new Map<string, number>();

    allErrors.forEach(error => {
      const key = error.message || 'Unknown error';
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);
  }
}
```

## 🚀 实施策略

### 1. 渐进式部署

```typescript
// 转换实施控制器
export class DataConversionController {
  private ruleManager: MappingRuleManager;
  private processor: BatchDataProcessor;
  private qualityChecker: DataQualityChecker;
  private monitor: ConversionPerformanceMonitor;

  async executeConversionPlan(plan: ConversionPlan): Promise<ConversionResult> {
    const results: ConversionStepResult[] = [];

    for (const step of plan.steps) {
      try {
        const stepResult = await this.executeStep(step);
        results.push(stepResult);

        // 检查步骤结果
        if (!stepResult.success && step.critical) {
          throw new Error(`Critical step failed: ${step.name}`);
        }
      } catch (error) {
        if (step.critical) {
          throw error;
        }
        results.push({
          stepName: step.name,
          success: false,
          error: error.message,
          processedRecords: 0,
        });
      }
    }

    return {
      planName: plan.name,
      success: results.every(r => r.success || !r.critical),
      steps: results,
      performance: this.monitor.getPerformanceReport(),
    };
  }

  private async executeStep(
    step: ConversionStep
  ): Promise<ConversionStepResult> {
    const startTime = Date.now();

    // 获取转换器
    const transformer = this.ruleManager.getTransformer(step.mapping);

    // 执行转换
    const results = await this.processor.processBatch(
      step.dataSource,
      step.targetType,
      (processed, total) => {
        // 进度更新
        console.log(`Processing ${step.name}: ${processed}/${total}`);
      }
    );

    // 质量检查
    const validationResults = results.map(result =>
      DataQualityChecker.validateConversion(
        result.original,
        result.converted,
        this.ruleManager.getMappingConfig(step.mapping)
      )
    );

    const duration = Date.now() - startTime;

    // 记录性能指标
    this.monitor.recordConversion(
      step.mapping,
      results.length,
      duration,
      this.combineValidationResults(validationResults)
    );

    return {
      stepName: step.name,
      success: validationResults.every(v => v.isValid),
      processedRecords: results.length,
      durationMs: duration,
      validationIssues: validationResults.flatMap(v => v.issues),
    };
  }
}
```

---

_文档版本: v1.0_  
_最后更新: 2026年2月28日_  
_维护团队: 数据标准化工作组_
