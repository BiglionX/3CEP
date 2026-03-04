// 数据质量规则配置管理服务
import {
  QualityCheckRule,
  QualityIssueType,
  DataQualityConfig,
  dataQualityService,
} from './data-quality-service';
import {
  EXTENDED_QUALITY_RULES,
  QUALITY_RULE_GROUPS,
  RULE_TEMPLATES,
  QualityRuleConfiguration,
  DEFAULT_QUALITY_CONFIG,
} from './extended-quality-rules';

export class QualityRuleConfigManager {
  private config: QualityRuleConfiguration;
  private ruleTemplates: Map<string, any>;
  private ruleGroups: Map<string, any>;

  constructor() {
    this.config = DEFAULT_QUALITY_CONFIG;
    this.ruleTemplates = new Map(Object.entries(RULE_TEMPLATES));
    this.ruleGroups = new Map(Object.entries(QUALITY_RULE_GROUPS));
    this.initializeExtendedRules();
  }

  // 初始化扩展规?  private initializeExtendedRules(): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔧 初始化扩展数据质量检查规?..')EXTENDED_QUALITY_RULES.forEach(rule => {
      // 检查规则是否已存在
      const existingRule = dataQualityService
        .getAllCheckRules()
        .find(r => r.id === rule.id);

      if (!existingRule) {
        dataQualityService.addCheckRule(rule);
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   �?添加规则: ${rule.name}`)} else {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`   ℹ️  规则已存? ${rule.name}`)}
    });

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `�?扩展规则初始化完成，�?${EXTENDED_QUALITY_RULES.length} 个新规则`
    )}

  // 获取规则配置
  getConfig(): QualityRuleConfiguration {
    return { ...this.config };
  }

  // 更新全局配置
  updateGlobalConfig(
    updates: Partial<QualityRuleConfiguration['globalSettings']>
  ): void {
    this.config.globalSettings = { ...this.config.globalSettings, ...updates };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?全局配置已更?)}

  // 更新通知配置
  updateNotificationConfig(
    updates: Partial<QualityRuleConfiguration['notificationSettings']>
  ): void {
    this.config.notificationSettings = {
      ...this.config.notificationSettings,
      ...updates,
    };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?通知配置已更?)}

  // 更新自动修复配置
  updateAutoRemediationConfig(
    updates: Partial<QualityRuleConfiguration['autoRemediation']>
  ): void {
    this.config.autoRemediation = {
      ...this.config.autoRemediation,
      ...updates,
    };
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?自动修复配置已更?)}

  // 获取规则模板
  getRuleTemplate(templateName: string): any | null {
    return this.ruleTemplates.get(templateName) || null;
  }

  // 基于模板创建规则
  createRuleFromTemplate(
    templateName: string,
    parameters: {
      tableName: string;
      columnName?: string;
      customParams?: Record<string, any>;
    }
  ): QualityCheckRule | null {
    const template = this.getRuleTemplate(templateName);
    if (!template) {
      console.warn(`⚠️ 模板不存? ${templateName}`);
      return null;
    }

    const ruleId = `${parameters.tableName}_${parameters.columnName || 'general'}_${templateName}_${Date.now()}`;

    const rule: QualityCheckRule = {
      id: ruleId,
      name: template.name
        .replace('{tableName}', parameters.tableName)
        .replace('{columnName}', parameters.columnName || ''),
      tableName: parameters.tableName,
      columnName: parameters.columnName,
      checkType: template.checkType,
      parameters: {
        ...template.parameters,
        ...parameters.customParams,
      },
      threshold: template.threshold,
      enabled: template.enabled,
      severity: template.severity,
      description: template.description
        .replace('{tableName}', parameters.tableName)
        .replace('{columnName}', parameters.columnName || ''),
    };

    return rule;
  }

  // 批量创建规则
  batchCreateRules(
    templateName: string,
    tableColumnPairs: {
      tableName: string;
      columnName?: string;
      params?: Record<string, any>;
    }[]
  ): QualityCheckRule[] {
    const createdRules: QualityCheckRule[] = [];

    tableColumnPairs.forEach(pair => {
      const rule = this.createRuleFromTemplate(templateName, {
        tableName: pair.tableName,
        columnName: pair.columnName,
        customParams: pair.params,
      });

      if (rule) {
        dataQualityService.addCheckRule(rule);
        createdRules.push(rule);
      }
    });

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?批量创建?${createdRules.length} 个规则`)return createdRules;
  }

  // 获取规则?  getRuleGroup(groupName: string): any | null {
    return this.ruleGroups.get(groupName) || null;
  }

  // 执行规则组检?  async executeRuleGroup(groupName: string): Promise<any[]> {
    const group = this.getRuleGroup(groupName);
    if (!group) {
      console.warn(`⚠️ 规则组不存在: ${groupName}`);
      return [];
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🚀 执行规则? ${group.name}`)const allRules = dataQualityService.getAllCheckRules();
    const groupRules = allRules.filter(
      rule => group.rules.includes(rule.id) && rule.enabled
    );

    const results: any[] = [];

    // 根据优先级排序执?    const sortedRules = groupRules.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.severity] - priorityOrder[b.severity];
    });

    // 执行规则检?    for (const rule of sortedRules) {
      try {
        const result = await dataQualityService.executeCheckRule(rule.id);
        if (result) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            result: result,
            status: result.status,
            issuePercentage: result.issuePercentage,
          });
        }
      } catch (error: any) {
        console.error(`�?执行规则失败 ${rule.name}:`, error);
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          error: error.message || 'Unknown error',
          status: 'failed',
        });
      }
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?规则组执行完? ${groupName} (${results.length} 个规?`)return results;
  }

  // 获取规则统计信息
  getRuleStatistics(): {
    totalRules: number;
    enabledRules: number;
    disabledRules: number;
    rulesByType: Record<QualityIssueType, number>;
    rulesBySeverity: Record<string, number>;
    rulesByTable: Record<string, number>;
  } {
    const allRules = dataQualityService.getAllCheckRules();

    const stats = {
      totalRules: allRules.length,
      enabledRules: allRules.filter(r => r.enabled).length,
      disabledRules: allRules.filter(r => !r.enabled).length,
      rulesByType: {} as Record<QualityIssueType, number>,
      rulesBySeverity: {} as Record<string, number>,
      rulesByTable: {} as Record<string, number>,
    };

    // 统计各类规则数量
    allRules.forEach(rule => {
      // 按类型统?      stats.rulesByType[rule.checkType] =
        (stats.rulesByType[rule.checkType] || 0) + 1;

      // 按严重性统?      stats.rulesBySeverity[rule.severity] =
        (stats.rulesBySeverity[rule.severity] || 0) + 1;

      // 按表统计
      stats.rulesByTable[rule.tableName] =
        (stats.rulesByTable[rule.tableName] || 0) + 1;
    });

    return stats;
  }

  // 导出规则配置
  exportRuleConfiguration(): {
    rules: QualityCheckRule[];
    groups: Record<string, any>;
    config: QualityRuleConfiguration;
  } {
    return {
      rules: dataQualityService.getAllCheckRules(),
      groups: Object.fromEntries(this.ruleGroups),
      config: this.getConfig(),
    };
  }

  // 导入规则配置
  importRuleConfiguration(configData: {
    rules?: QualityCheckRule[];
    groups?: Record<string, any>;
    config?: Partial<QualityRuleConfiguration>;
  }): void {
    // 更新配置
    if (configData.config) {
      this.config = { ...this.config, ...configData.config };
    }

    // 更新规则?    if (configData.groups) {
      this.ruleGroups = new Map(Object.entries(configData.groups));
    }

    // 更新规则
    if (configData.rules) {
      configData.rules.forEach(rule => {
        dataQualityService.addCheckRule(rule);
      });
    }

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('�?规则配置导入完成')}

  // 验证规则配置
  validateRuleConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const allRules = dataQualityService.getAllCheckRules();

    // 检查重复规则ID
    const ruleIds = allRules.map(r => r.id);
    const duplicateIds = ruleIds.filter(
      (id, index) => ruleIds.indexOf(id) !== index
    );
    if (duplicateIds.length > 0) {
      errors.push(`发现重复的规则ID: ${[...new Set(duplicateIds)].join(', ')}`);
    }

    // 检查阈值设?    allRules.forEach(rule => {
      if (rule.threshold < 0 || rule.threshold > 100) {
        errors.push(
          `规则 ${rule.name} 的阈值超出范?(0-100): ${rule.threshold}`
        );
      }

      if (rule.severity === 'critical' && rule.threshold > 1) {
        warnings.push(
          `关键规则 ${rule.name} 的阈值设置较? ${rule.threshold}%`
        );
      }
    });

    // 检查规则组引用
    Object.entries(QUALITY_RULE_GROUPS).forEach(([groupName, group]) => {
      const missingRules = group.rules.filter(
        (ruleId: string) => !allRules.some(r => r.id === ruleId)
      );

      if (missingRules.length > 0) {
        warnings.push(
          `规则?${groupName} 引用了不存在的规? ${missingRules.join(', ')}`
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 生成规则配置报告
  generateConfigurationReport(): any {
    const stats = this.getRuleStatistics();
    const validation = this.validateRuleConfiguration();

    return {
      timestamp: new Date().toISOString(),
      configuration: this.getConfig(),
      statistics: stats,
      validation: validation,
      ruleGroups: Object.fromEntries(this.ruleGroups),
      templates: Object.keys(RULE_TEMPLATES),
    };
  }

  // 启用/禁用规则?  toggleRuleGroup(groupName: string, enabled: boolean): boolean {
    const group = this.getRuleGroup(groupName);
    if (!group) {
      console.warn(`⚠️ 规则组不存在: ${groupName}`);
      return false;
    }

    const allRules = dataQualityService.getAllCheckRules();
    let updatedCount = 0;

    group.rules.forEach((ruleId: string) => {
      const rule = allRules.find(r => r.id === ruleId);
      if (rule) {
        dataQualityService.updateCheckRule(ruleId, { enabled });
        updatedCount++;
      }
    });

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `�?${enabled ? '启用' : '禁用'}了规则组 ${groupName} 中的 ${updatedCount} 个规则`
    )return true;
  }

  // 根据表名获取相关规则
  getRulesByTable(tableName: string): QualityCheckRule[] {
    return dataQualityService
      .getAllCheckRules()
      .filter(rule => rule.tableName === tableName);
  }

  // 根据严重性获取规?  getRulesBySeverity(
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): QualityCheckRule[] {
    return dataQualityService
      .getAllCheckRules()
      .filter(rule => rule.severity === severity);
  }

  // 获取需要立即关注的问题规则
  getCriticalRules(): QualityCheckRule[] {
    const allRules = dataQualityService.getAllCheckRules();
    const recentResults = dataQualityService.getCheckHistory(100);

    return allRules.filter(rule => {
      if (rule.severity !== 'critical') return false;

      const recentRuleResults = recentResults
        .filter(r => r.ruleId === rule.id)
        .slice(-5); // 最?次结?
      // 如果最近有失败或警告结果，则标记为关键
      return recentRuleResults.some(
        r => r.status === 'failed' || r.status === 'warning'
      );
    });
  }
}

// 导出实例
export const qualityRuleConfigManager = new QualityRuleConfigManager();
