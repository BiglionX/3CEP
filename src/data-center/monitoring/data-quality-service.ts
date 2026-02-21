// 数据质量检测核心服务
import { monitoringService, DataQualityMetric } from './monitoring-service';

// 数据质量问题类型
export type QualityIssueType = 
  | 'missing_value'           // 空值问题
  | 'invalid_format'          // 格式无效
  | 'out_of_range'            // 数值越界
  | 'duplicate_record'        // 重复记录
  | 'inconsistent_data'       // 数据不一致
  | 'stale_data'             // 数据陈旧
  | 'referential_integrity'   // 引用完整性
  | 'business_rule_violation' // 业务规则违反
  | 'schema_violation'        // 模式违反
  | 'uniqueness_violation';   // 唯一性违反

// 数据质量检查规则
export interface QualityCheckRule {
  id: string;
  name: string;
  tableName: string;
  columnName?: string;
  checkType: QualityIssueType;
  parameters?: Record<string, any>;
  threshold: number; // 问题阈值百分比 (0-100)
  enabled: boolean;
  schedule?: string; // cron表达式
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 数据质量检查结果
export interface QualityCheckResult {
  ruleId: string;
  ruleName: string;
  tableName: string;
  columnName?: string;
  checkType: QualityIssueType;
  issueCount: number;
  totalCount: number;
  issuePercentage: number;
  sampleIssues: any[];
  executionTime: number; // 执行时间(毫秒)
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 数据质量配置
export interface DataQualityConfig {
  defaultThreshold: number;
  samplingRate: number; // 采样率 (0-1)
  maxSampleSize: number;
  enableAutoFix: boolean;
  autoFixThreshold: number;
  notificationChannels: string[];
}

// 数据质量检测服务类
export class DataQualityService {
  private checkRules: Map<string, QualityCheckRule> = new Map();
  private checkResults: Map<string, QualityCheckResult[]> = new Map();
  private config: DataQualityConfig;
  private checkHistory: QualityCheckResult[] = [];
  private maxHistorySize: number = 1000;

  constructor(config?: Partial<DataQualityConfig>) {
    this.config = {
      defaultThreshold: 5,
      samplingRate: 1.0,
      maxSampleSize: 10000,
      enableAutoFix: false,
      autoFixThreshold: 1,
      notificationChannels: ['console'],
      ...config
    };
    
    this.initializeDefaultRules();
  }

  // 初始化默认检查规则
  private initializeDefaultRules(): void {
    const defaultRules: QualityCheckRule[] = [
      // 配件表完整性检查
      {
        id: 'parts_completeness_check',
        name: '配件信息完整性检查',
        tableName: 'parts',
        columnName: 'part_name',
        checkType: 'missing_value',
        threshold: 1.0,
        enabled: true,
        severity: 'high',
        description: '检查配件名称字段的完整性'
      },
      
      // 价格范围检查
      {
        id: 'price_range_check',
        name: '价格范围合理性检查',
        tableName: 'parts',
        columnName: 'price',
        checkType: 'out_of_range',
        parameters: { min: 0, max: 100000 },
        threshold: 0.5,
        enabled: true,
        severity: 'medium',
        description: '检查配件价格是否在合理范围内'
      },
      
      // 用户邮箱格式检查
      {
        id: 'email_format_check',
        name: '用户邮箱格式检查',
        tableName: 'users',
        columnName: 'email',
        checkType: 'invalid_format',
        parameters: { pattern: 'email' },
        threshold: 0.1,
        enabled: true,
        severity: 'medium',
        description: '验证用户邮箱格式是否正确'
      },
      
      // 订单号唯一性检查
      {
        id: 'order_number_uniqueness',
        name: '订单号唯一性检查',
        tableName: 'orders',
        columnName: 'order_number',
        checkType: 'duplicate_record',
        threshold: 0.0,
        enabled: true,
        severity: 'critical',
        description: '确保订单号的唯一性'
      },
      
      // 库存数据新鲜度检查
      {
        id: 'inventory_freshness_check',
        name: '库存数据新鲜度检查',
        tableName: 'inventory',
        checkType: 'stale_data',
        parameters: { maxAgeHours: 24 },
        threshold: 5.0,
        enabled: true,
        severity: 'medium',
        description: '检查库存数据是否及时更新'
      }
    ];

    defaultRules.forEach(rule => {
      this.addCheckRule(rule);
    });
    
    console.log('✅ 数据质量默认检查规则已初始化');
  }

  // 添加检查规则
  addCheckRule(rule: QualityCheckRule): void {
    this.checkRules.set(rule.id, rule);
    console.log(`✅ 添加数据质量检查规则: ${rule.name}`);
  }

  // 更新检查规则
  updateCheckRule(ruleId: string, updates: Partial<QualityCheckRule>): boolean {
    const existingRule = this.checkRules.get(ruleId);
    if (!existingRule) {
      console.warn(`⚠️ 检查规则不存在: ${ruleId}`);
      return false;
    }

    const updatedRule = { ...existingRule, ...updates };
    this.checkRules.set(ruleId, updatedRule);
    console.log(`✅ 更新数据质量检查规则: ${ruleId}`);
    return true;
  }

  // 删除检查规则
  removeCheckRule(ruleId: string): boolean {
    const result = this.checkRules.delete(ruleId);
    if (result) {
      console.log(`✅ 删除数据质量检查规则: ${ruleId}`);
    } else {
      console.warn(`⚠️ 检查规则不存在: ${ruleId}`);
    }
    return result;
  }

  // 获取所有检查规则
  getAllCheckRules(): QualityCheckRule[] {
    return Array.from(this.checkRules.values());
  }

  // 获取启用的检查规则
  getEnabledCheckRules(): QualityCheckRule[] {
    return Array.from(this.checkRules.values()).filter(rule => rule.enabled);
  }

  // 执行单个检查规则
  async executeCheckRule(ruleId: string): Promise<QualityCheckResult | null> {
    const rule = this.checkRules.get(ruleId);
    if (!rule || !rule.enabled) {
      console.warn(`⚠️ 检查规则不可用: ${ruleId}`);
      return null;
    }

    const startTime = Date.now();
    
    try {
      console.log(`🔍 执行数据质量检查: ${rule.name}`);
      
      const issueCount = await this.performCheck(rule);
      const totalCount = await this.getTableRecordCount(rule.tableName);
      const issuePercentage = totalCount > 0 ? (issueCount / totalCount) * 100 : 0;
      
      const result: QualityCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        tableName: rule.tableName,
        columnName: rule.columnName,
        checkType: rule.checkType,
        issueCount,
        totalCount,
        issuePercentage,
        sampleIssues: await this.getSampleIssues(rule, issueCount),
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: this.determineStatus(issuePercentage, rule.threshold),
        severity: rule.severity
      };

      // 记录检查结果
      this.recordCheckResult(result);
      
      // 更新监控系统
      monitoringService.recordDataQuality(this.convertToDataQualityMetric(result));
      
      console.log(`✅ 检查完成: ${rule.name} - 问题率: ${issuePercentage.toFixed(2)}%`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ 检查执行失败 ${rule.name}:`, error);
      
      const result: QualityCheckResult = {
        ruleId: rule.id,
        ruleName: rule.name,
        tableName: rule.tableName,
        columnName: rule.columnName,
        checkType: rule.checkType,
        issueCount: 0,
        totalCount: 0,
        issuePercentage: 0,
        sampleIssues: [],
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        status: 'failed',
        severity: rule.severity
      };
      
      this.recordCheckResult(result);
      return result;
    }
  }

  // 执行所有启用的检查
  async runAllChecks(): Promise<QualityCheckResult[]> {
    console.log('🚀 开始执行所有数据质量检查...');
    
    const enabledRules = this.getEnabledCheckRules();
    const results: QualityCheckResult[] = [];
    
    // 并行执行检查
    const checkPromises = enabledRules.map(rule => this.executeCheckRule(rule.id));
    
    const checkResults = await Promise.all(checkPromises);
    checkResults.forEach(result => {
      if (result) {
        results.push(result);
      }
    });
    
    console.log(`✅ 数据质量检查完成，共执行 ${results.length} 个检查`);
    return results;
  }

  // 执行特定表的检查
  async runTableChecks(tableName: string): Promise<QualityCheckResult[]> {
    const tableRules = Array.from(this.checkRules.values())
      .filter(rule => rule.tableName === tableName && rule.enabled);
    
    const results: QualityCheckResult[] = [];
    
    for (const rule of tableRules) {
      const result = await this.executeCheckRule(rule.id);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  // 核心检查逻辑实现
  private async performCheck(rule: QualityCheckRule): Promise<number> {
    // 这里应该连接到实际的数据库执行检查
    // 目前使用模拟数据进行演示
    
    switch (rule.checkType) {
      case 'missing_value':
        return await this.checkMissingValues(rule);
        
      case 'invalid_format':
        return await this.checkInvalidFormat(rule);
        
      case 'out_of_range':
        return await this.checkOutOfRange(rule);
        
      case 'duplicate_record':
        return await this.checkDuplicates(rule);
        
      case 'stale_data':
        return await this.checkStaleData(rule);
        
      default:
        console.warn(`⚠️ 未实现的检查类型: ${rule.checkType}`);
        return 0;
    }
  }

  // 检查空值
  private async checkMissingValues(rule: QualityCheckRule): Promise<number> {
    // 模拟数据库查询: SELECT COUNT(*) FROM table WHERE column IS NULL OR column = ''
    const baseCount = Math.floor(Math.random() * 50);
    const multiplier = rule.tableName === 'parts' ? 1 : 
                      rule.tableName === 'users' ? 0.5 : 
                      rule.tableName === 'orders' ? 0.1 : 0.3;
    return Math.floor(baseCount * multiplier);
  }

  // 检查格式有效性
  private async checkInvalidFormat(rule: QualityCheckRule): Promise<number> {
    if (rule.parameters?.pattern === 'email') {
      // 模拟邮箱格式检查
      return Math.floor(Math.random() * 20);
    }
    return Math.floor(Math.random() * 15);
  }

  // 检查数值范围
  private async checkOutOfRange(rule: QualityCheckRule): Promise<number> {
    const min = rule.parameters?.min || 0;
    const max = rule.parameters?.max || 100;
    // 模拟范围检查
    return Math.floor(Math.random() * 25);
  }

  // 检查重复记录
  private async checkDuplicates(rule: QualityCheckRule): Promise<number> {
    // 模拟去重检查
    return Math.floor(Math.random() * 5);
  }

  // 检查数据陈旧度
  private async checkStaleData(rule: QualityCheckRule): Promise<number> {
    const maxAgeHours = rule.parameters?.maxAgeHours || 24;
    // 模拟陈旧数据检查
    return Math.floor(Math.random() * 30);
  }

  // 获取表记录总数
  private async getTableRecordCount(tableName: string): Promise<number> {
    // 模拟不同表的记录数
    const counts: Record<string, number> = {
      'parts': 1000,
      'users': 500,
      'orders': 1500,
      'inventory': 800
    };
    return counts[tableName] || 1000;
  }

  // 获取样本问题数据
  private async getSampleIssues(rule: QualityCheckRule, issueCount: number): Promise<any[]> {
    if (issueCount === 0) return [];
    
    const sampleSize = Math.min(issueCount, 5); // 最多返回5个样本
    const samples: any[] = [];
    
    for (let i = 0; i < sampleSize; i++) {
      samples.push({
        id: `sample_${i + 1}`,
        tableName: rule.tableName,
        columnName: rule.columnName,
        issueType: rule.checkType,
        value: this.generateSampleValue(rule.checkType),
        timestamp: new Date().toISOString()
      });
    }
    
    return samples;
  }

  // 生成样本值
  private generateSampleValue(checkType: QualityIssueType): any {
    switch (checkType) {
      case 'missing_value':
        return null;
      case 'invalid_format':
        return 'invalid-email-format';
      case 'out_of_range':
        return -999;
      case 'duplicate_record':
        return 'DUPLICATE_001';
      case 'stale_data':
        return new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      default:
        return 'sample_value';
    }
  }

  // 确定检查状态
  private determineStatus(issuePercentage: number, threshold: number): 'passed' | 'failed' | 'warning' {
    if (issuePercentage <= threshold) {
      return 'passed';
    } else if (issuePercentage <= threshold * 2) {
      return 'warning';
    } else {
      return 'failed';
    }
  }

  // 记录检查结果
  private recordCheckResult(result: QualityCheckResult): void {
    // 按规则ID存储结果
    if (!this.checkResults.has(result.ruleId)) {
      this.checkResults.set(result.ruleId, []);
    }
    
    const ruleResults = this.checkResults.get(result.ruleId)!;
    ruleResults.push(result);
    
    // 保持结果数量在限制范围内
    if (ruleResults.length > 100) {
      ruleResults.shift();
    }
    
    // 添加到历史记录
    this.checkHistory.push(result);
    if (this.checkHistory.length > this.maxHistorySize) {
      this.checkHistory.shift();
    }
  }

  // 转换为监控指标格式
  private convertToDataQualityMetric(result: QualityCheckResult): DataQualityMetric {
    const score = Math.max(0, 100 - result.issuePercentage);
    const issues = result.status !== 'passed' ? [
      `${result.checkType}: ${result.issueCount}/${result.totalCount} (${result.issuePercentage.toFixed(1)}%)`
    ] : [];
    
    return {
      tableName: result.tableName,
      metricType: this.getMetricType(result.checkType),
      score,
      sampleSize: result.totalCount,
      issues,
      lastChecked: result.timestamp
    };
  }

  // 获取指标类型
  private getMetricType(issueType: QualityIssueType): 
    'completeness' | 'accuracy' | 'consistency' | 'timeliness' {
    switch (issueType) {
      case 'missing_value':
        return 'completeness';
      case 'invalid_format':
      case 'out_of_range':
      case 'business_rule_violation':
        return 'accuracy';
      case 'duplicate_record':
      case 'inconsistent_data':
      case 'referential_integrity':
      case 'uniqueness_violation':
      case 'schema_violation':
        return 'consistency';
      case 'stale_data':
        return 'timeliness';
      default:
        return 'accuracy';
    }
  }

  // 获取检查历史
  getCheckHistory(limit: number = 50): QualityCheckResult[] {
    return this.checkHistory.slice(-limit);
  }

  // 获取特定规则的检查结果
  getRuleCheckResults(ruleId: string, limit: number = 10): QualityCheckResult[] {
    const results = this.checkResults.get(ruleId);
    return results ? results.slice(-limit) : [];
  }

  // 生成数据质量报告
  async generateQualityReport(): Promise<{
    summary: {
      overallScore: number;
      totalTables: number;
      totalChecks: number;
      passedChecks: number;
      failedChecks: number;
      warningChecks: number;
    };
    details: QualityCheckResult[];
    recommendations: string[];
  }> {
    const allResults = await this.runAllChecks();
    
    const passedChecks = allResults.filter(r => r.status === 'passed').length;
    const failedChecks = allResults.filter(r => r.status === 'failed').length;
    const warningChecks = allResults.filter(r => r.status === 'warning').length;
    
    const overallScore = allResults.length > 0 ? 
      allResults.reduce((sum, r) => sum + (100 - r.issuePercentage), 0) / allResults.length : 100;
    
    const recommendations = this.generateRecommendations(allResults);
    
    return {
      summary: {
        overallScore: Math.round(overallScore),
        totalTables: new Set(allResults.map(r => r.tableName)).size,
        totalChecks: allResults.length,
        passedChecks,
        failedChecks,
        warningChecks
      },
      details: allResults,
      recommendations
    };
  }

  // 生成改进建议
  private generateRecommendations(results: QualityCheckResult[]): string[] {
    const recommendations: string[] = [];
    
    const failedResults = results.filter(r => r.status === 'failed');
    const warningResults = results.filter(r => r.status === 'warning');
    
    if (failedResults.length > 0) {
      recommendations.push(`存在 ${failedResults.length} 个严重数据质量问题，需要立即处理`);
    }
    
    if (warningResults.length > 0) {
      recommendations.push(`存在 ${warningResults.length} 个数据质量警告，建议关注`);
    }
    
    // 基于具体问题类型给出建议
    const missingValueIssues = results.filter(r => r.checkType === 'missing_value' && r.issuePercentage > 0);
    if (missingValueIssues.length > 0) {
      recommendations.push('建议完善数据录入验证，减少空值产生');
    }
    
    const duplicateIssues = results.filter(r => r.checkType === 'duplicate_record' && r.issueCount > 0);
    if (duplicateIssues.length > 0) {
      recommendations.push('建议加强唯一性约束和数据去重机制');
    }
    
    return recommendations;
  }

  // 配置更新
  updateConfig(newConfig: Partial<DataQualityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('✅ 数据质量配置已更新');
  }
}

// 导出实例
export const dataQualityService = new DataQualityService();