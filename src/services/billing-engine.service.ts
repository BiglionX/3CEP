// 计费引擎服务

import { BillingRule } from '@/models/token-account.model';

export interface Tier {
  minUsage: number;
  maxUsage: number;
  pricePerUnit: number;
}

export class BillingEngine {
  private rules: Map<string, BillingRule> = new Map();
  private tiers: Map<string, Tier[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认计费规?   */
  private initializeDefaultRules(): void {
    // AI诊断基础费用
    this.rules.set('diagnosis', {
      id: 'rule-diagnosis-001',
      serviceType: 'diagnosis',
      costPerUnit: 50,
      unitType: 'per_request',
      description: 'AI故障诊断基础费用',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 查看说明书费?    this.rules.set('manual_view', {
      id: 'rule-manual-view-001',
      serviceType: 'manual_view',
      costPerUnit: 10,
      unitType: 'per_request',
      description: '查看说明书费?,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 高级功能使用费用
    this.rules.set('advanced_feature', {
      id: 'rule-advanced-feature-001',
      serviceType: 'advanced_feature',
      costPerUnit: 100,
      unitType: 'per_request',
      description: '高级功能使用费用',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 设置阶梯定价
    this.tiers.set('diagnosis', [
      { minUsage: 0, maxUsage: 10, pricePerUnit: 50 }, // �?0次，50 Token/�?      { minUsage: 11, maxUsage: 50, pricePerUnit: 40 }, // 11-50次，40 Token/�?      { minUsage: 51, maxUsage: 100, pricePerUnit: 30 }, // 51-100次，30 Token/�?      { minUsage: 101, maxUsage: Infinity, pricePerUnit: 25 }, // 100次以上，25 Token/�?    ]);

    this.tiers.set('manual_view', [
      { minUsage: 0, maxUsage: 20, pricePerUnit: 10 }, // �?0次，10 Token/�?      { minUsage: 21, maxUsage: 100, pricePerUnit: 8 }, // 21-100次，8 Token/�?      { minUsage: 101, maxUsage: Infinity, pricePerUnit: 5 }, // 100次以上，5 Token/�?    ]);
  }

  /**
   * 计算服务费用
   */
  async calculateCost(serviceType: string, usage: number): Promise<number> {
    const rule = this.rules.get(serviceType);
    if (!rule) {
      throw new Error(`未找到服务类?${serviceType} 的计费规则`);
    }

    if (!rule.isActive) {
      throw new Error(`服务类型 ${serviceType} 的计费规则已停用`);
    }

    // 检查是否有阶梯定价
    const serviceTiers = this.tiers.get(serviceType);
    if (serviceTiers) {
      return this.calculateTieredCost(serviceTiers, usage);
    }

    // 使用基础定价
    return rule.costPerUnit * usage;
  }

  /**
   * 计算阶梯费用
   */
  private calculateTieredCost(tiers: Tier[], usage: number): number {
    let totalCost = 0;
    let remainingUsage = usage;

    // 按阶梯计算费?    for (const tier of tiers) {
      if (remainingUsage <= 0) break;

      const tierUsage = Math.min(
        remainingUsage,
        tier.maxUsage - tier.minUsage + 1
      );
      totalCost += tierUsage * tier.pricePerUnit;
      remainingUsage -= tierUsage;
    }

    return totalCost;
  }

  /**
   * 扣除Token
   */
  async deductTokens(
    accountId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    try {
      // 这里应该调用Token账户服务扣除Token
      // 暂时返回模拟结果
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `从账?${accountId} 扣除 ${amount} 个Token，用途：${description}`
      )return Math.random() > 0.05; // 95%成功率模?    } catch (error) {
      console.error('扣除Token失败:', error);
      return false;
    }
  }

  /**
   * 退还Token
   */
  async refundTokens(
    accountId: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      // 这里应该调用Token账户服务退还Token
      // 暂时返回模拟结果
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `向账?${accountId} 退?${amount} 个Token，原因：${reason}`
      )return true;
    } catch (error) {
      console.error('退还Token失败:', error);
      return false;
    }
  }

  /**
   * 获取服务类型的所有计费规?   */
  getServiceRules(serviceType: string): BillingRule | null {
    return this.rules.get(serviceType) || null;
  }

  /**
   * 获取所有活跃的计费规则
   */
  getAllActiveRules(): BillingRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.isActive);
  }

  /**
   * 添加新的计费规则
   */
  addRule(rule: BillingRule): void {
    this.rules.set(rule.serviceType, rule);
  }

  /**
   * 更新计费规则
   */
  updateRule(serviceType: string, updates: Partial<BillingRule>): void {
    const existingRule = this.rules.get(serviceType);
    if (existingRule) {
      const updatedRule = {
        ...existingRule,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.rules.set(serviceType, updatedRule);
    }
  }

  /**
   * 设置阶梯定价
   */
  setTieredPricing(serviceType: string, tiers: Tier[]): void {
    this.tiers.set(serviceType, tiers);
  }

  /**
   * 获取阶梯定价
   */
  getTieredPricing(serviceType: string): Tier[] | null {
    return this.tiers.get(serviceType) || null;
  }

  /**
   * 预估费用（基于预计使用量?   */
  async estimateCost(
    serviceType: string,
    estimatedUsage: number
  ): Promise<{
    totalCost: number;
    breakdown: Array<{ range: string; usage: number; cost: number }>;
  }> {
    const rule = this.rules.get(serviceType);
    if (!rule) {
      throw new Error(`未找到服务类?${serviceType} 的计费规则`);
    }

    const serviceTiers = this.tiers.get(serviceType);
    if (!serviceTiers) {
      // 无阶梯定?      return {
        totalCost: rule.costPerUnit * estimatedUsage,
        breakdown: [
          {
            range: '全部用量',
            usage: estimatedUsage,
            cost: rule.costPerUnit * estimatedUsage,
          },
        ],
      };
    }

    // 有阶梯定价，计算详细分解
    let totalCost = 0;
    let remainingUsage = estimatedUsage;
    const breakdown: Array<{ range: string; usage: number; cost: number }> = [];

    for (const tier of serviceTiers) {
      if (remainingUsage <= 0) break;

      const tierUsage = Math.min(
        remainingUsage,
        tier.maxUsage === Infinity
          ? remainingUsage
          : tier.maxUsage - tier.minUsage + 1
      );
      const tierCost = tierUsage * tier.pricePerUnit;

      totalCost += tierCost;

      const range =
        tier.maxUsage === Infinity
          ? `${tier.minUsage}+`
          : `${tier.minUsage}-${tier.maxUsage}`;

      breakdown.push({
        range,
        usage: tierUsage,
        cost: tierCost,
      });

      remainingUsage -= tierUsage;
    }

    return { totalCost, breakdown };
  }

  /**
   * 检查余额是否充?   */
  async checkBalance(
    accountId: string,
    serviceType: string,
    usage: number
  ): Promise<{
    isSufficient: boolean;
    requiredTokens: number;
    currentBalance: number;
  }> {
    const requiredTokens = await this.calculateCost(serviceType, usage);

    // 这里应该调用Token账户服务获取当前余额
    // 暂时使用模拟数据
    const currentBalance = 1000; // 模拟余额

    return {
      isSufficient: currentBalance >= requiredTokens,
      requiredTokens,
      currentBalance,
    };
  }
}
