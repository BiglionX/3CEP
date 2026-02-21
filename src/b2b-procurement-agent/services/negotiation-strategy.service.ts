import { generateUUID } from "@/fcx-system/utils/helpers";
import { createClient } from "@supabase/supabase-js";
import {
  NegotiationAdvice,
  NegotiationStrategy,
  StrategyActions,
  StrategyConditions,
  StrategyEvaluation,
  StrategyType,
  SupplierWithRating,
} from "../models/negotiation.model";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class NegotiationStrategyService {
  /**
   * 获取所有激活的议价策略
   */
  async getActiveStrategies(): Promise<NegotiationStrategy[]> {
    try {
      const { data, error } = await supabase
        .from("negotiation_strategies")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw new Error(`获取议价策略失败: ${error.message}`);

      return data?.map(this.mapToStrategy) || [];
    } catch (error) {
      console.error("获取议价策略错误:", error);
      throw error;
    }
  }

  /**
   * 根据条件评估并选择最佳策略
   */
  async evaluateStrategies(
    supplier: SupplierWithRating,
    targetPrice: number,
    initialQuote: number,
    urgencyLevel?: string
  ): Promise<StrategyEvaluation[]> {
    try {
      const strategies = await this.getActiveStrategies();
      const evaluations: StrategyEvaluation[] = [];

      for (const strategy of strategies) {
        const matchScore = this.calculateMatchScore(
          strategy.conditions,
          supplier,
          targetPrice,
          initialQuote,
          urgencyLevel
        );

        if (matchScore > 0) {
          evaluations.push({
            strategyId: strategy.id,
            strategyName: strategy.name,
            matchScore,
            recommendedActions: this.adjustActionsBasedOnContext(
              strategy.actions,
              supplier,
              targetPrice,
              initialQuote
            ),
            confidence: this.calculateConfidence(
              matchScore,
              supplier.rating?.overallRating || 0
            ),
            reasoning: this.generateReasoning(strategy, matchScore, supplier),
          });
        }
      }

      // 按匹配度降序排列
      return evaluations.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error("评估议价策略错误:", error);
      throw error;
    }
  }

  /**
   * 生成议价建议
   */
  async generateNegotiationAdvice(
    supplier: SupplierWithRating,
    targetPrice: number,
    initialQuote: number,
    urgencyLevel?: string
  ): Promise<NegotiationAdvice> {
    try {
      const evaluations = await this.evaluateStrategies(
        supplier,
        targetPrice,
        initialQuote,
        urgencyLevel
      );

      if (evaluations.length === 0) {
        // 如果没有匹配的策略，返回保守建议
        return this.getConservativeAdvice(targetPrice, initialQuote);
      }

      const bestStrategy = evaluations[0];
      const priceDeviation = ((initialQuote - targetPrice) / targetPrice) * 100;

      // 计算建议价格
      let recommendedPrice = initialQuote;
      if (bestStrategy.recommendedActions.priceAdjustment) {
        recommendedPrice =
          initialQuote *
          (1 - bestStrategy.recommendedActions.priceAdjustment / 100);
      }

      // 确保建议价格不低于目标价格
      recommendedPrice = Math.max(recommendedPrice, targetPrice);

      return {
        recommendedPrice,
        confidence: bestStrategy.confidence,
        strategyToUse: bestStrategy.strategyId,
        alternativeStrategies: evaluations.slice(1, 4).map((e) => e.strategyId),
        riskLevel: this.assessRiskLevel(
          priceDeviation,
          supplier.rating?.overallRating || 0
        ),
        expectedDiscount:
          ((initialQuote - recommendedPrice) / initialQuote) * 100,
        timeEstimate: this.estimateTime(bestStrategy.strategyId, urgencyLevel),
      };
    } catch (error) {
      console.error("生成议价建议错误:", error);
      throw error;
    }
  }

  /**
   * 创建新的议价策略
   */
  async createStrategy(
    strategy: Omit<NegotiationStrategy, "id" | "createdAt" | "updatedAt">
  ): Promise<NegotiationStrategy> {
    try {
      const strategyId = generateUUID();
      const now = new Date();

      const { data, error } = await supabase
        .from("negotiation_strategies")
        .insert({
          id: strategyId,
          name: strategy.name,
          description: strategy.description,
          strategy_type: strategy.strategyType,
          conditions: strategy.conditions,
          actions: strategy.actions,
          priority: strategy.priority,
          is_active: strategy.isActive,
          created_by: strategy.createdBy,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw new Error(`创建议价策略失败: ${error.message}`);

      return this.mapToStrategy(data);
    } catch (error) {
      console.error("创建议价策略错误:", error);
      throw error;
    }
  }

  /**
   * 更新议价策略
   */
  async updateStrategy(
    id: string,
    updates: Partial<NegotiationStrategy>
  ): Promise<NegotiationStrategy> {
    try {
      const { data, error } = await supabase
        .from("negotiation_strategies")
        .update({
          name: updates.name,
          description: updates.description,
          strategy_type: updates.strategyType,
          conditions: updates.conditions,
          actions: updates.actions,
          priority: updates.priority,
          is_active: updates.isActive,
          updated_at: new Date(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(`更新议价策略失败: ${error.message}`);

      return this.mapToStrategy(data);
    } catch (error) {
      console.error("更新议价策略错误:", error);
      throw error;
    }
  }

  /**
   * 删除议价策略
   */
  async deleteStrategy(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("negotiation_strategies")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`删除议价策略失败: ${error.message}`);

      return true;
    } catch (error) {
      console.error("删除议价策略错误:", error);
      return false;
    }
  }

  // 私有辅助方法

  /**
   * 计算策略匹配度得分
   */
  private calculateMatchScore(
    conditions: StrategyConditions,
    supplier: SupplierWithRating,
    targetPrice: number,
    initialQuote: number,
    urgencyLevel?: string
  ): number {
    let score = 0;
    let totalWeight = 0;

    // 价格偏差检查
    if (conditions.maxPriceDeviation !== undefined) {
      const priceDeviation = Math.abs(
        ((initialQuote - targetPrice) / targetPrice) * 100
      );
      if (priceDeviation <= conditions.maxPriceDeviation) {
        score += 30;
      }
      totalWeight += 30;
    }

    // 供应商评分检查
    if (conditions.supplierRatingThreshold !== undefined && supplier.rating) {
      if (supplier.rating.overallRating >= conditions.supplierRatingThreshold) {
        score += 25;
      }
      totalWeight += 25;
    }

    // 交易次数检查
    if (conditions.transactionCountThreshold !== undefined && supplier.rating) {
      if (
        supplier.rating.transactionCount >= conditions.transactionCountThreshold
      ) {
        score += 20;
      }
      totalWeight += 20;
    }

    // 紧急程度检查
    if (conditions.urgencyLevel && urgencyLevel) {
      if (conditions.urgencyLevel === urgencyLevel) {
        score += 15;
      }
      totalWeight += 15;
    }

    // 成功率检查
    if (
      conditions.successfulNegotiationsRatio !== undefined &&
      supplier.rating
    ) {
      const successRatio =
        supplier.rating.transactionCount > 0
          ? supplier.rating.successfulNegotiations /
            supplier.rating.transactionCount
          : 0;
      if (successRatio >= conditions.successfulNegotiationsRatio) {
        score += 10;
      }
      totalWeight += 10;
    }

    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }

  /**
   * 根据上下文调整策略动作
   */
  private adjustActionsBasedOnContext(
    baseActions: StrategyActions,
    supplier: SupplierWithRating,
    targetPrice: number,
    initialQuote: number
  ): StrategyActions {
    const adjustedActions = { ...baseActions };
    const priceDeviation = ((initialQuote - targetPrice) / targetPrice) * 100;

    // 根据价格偏差调整价格调整幅度
    if (adjustedActions.priceAdjustment) {
      if (priceDeviation > 20) {
        // 价格差异很大时，更激进的价格调整
        adjustedActions.priceAdjustment *= 1.5;
      } else if (priceDeviation < 5) {
        // 价格接近时，更保守的调整
        adjustedActions.priceAdjustment *= 0.7;
      }
    }

    // 根据供应商评分调整其他条件
    if (supplier.rating) {
      if (supplier.rating.overallRating > 4.5) {
        // 高评分供应商可以提供更多优惠
        if (adjustedActions.deliveryTimeFlexibility) {
          adjustedActions.deliveryTimeFlexibility += 1;
        }
      } else if (supplier.rating.overallRating < 3.0) {
        // 低评分供应商需要更谨慎
        if (adjustedActions.priceAdjustment) {
          adjustedActions.priceAdjustment *= 0.8;
        }
      }
    }

    return adjustedActions;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    matchScore: number,
    supplierRating: number
  ): number {
    // 综合匹配度和供应商评分计算置信度
    const ratingFactor = supplierRating / 5; // 归一化到0-1
    return Math.round((matchScore * 0.7 + ratingFactor * 30) * 100) / 100;
  }

  /**
   * 生成推荐理由
   */
  private generateReasoning(
    strategy: NegotiationStrategy,
    matchScore: number,
    supplier: SupplierWithRating
  ): string {
    const reasons = [];

    if (matchScore >= 80) {
      reasons.push(`策略"${strategy.name}"高度匹配当前场景`);
    } else if (matchScore >= 60) {
      reasons.push(`策略"${strategy.name}"较为适合当前情况`);
    } else {
      reasons.push(`策略"${strategy.name}"基本符合要求`);
    }

    if (supplier.rating) {
      if (supplier.rating.overallRating >= 4.0) {
        reasons.push("供应商历史表现优秀");
      } else if (supplier.rating.overallRating >= 3.0) {
        reasons.push("供应商表现良好");
      }

      if (supplier.rating.transactionCount >= 20) {
        reasons.push("供应商经验丰富");
      }
    }

    return reasons.join("，");
  }

  /**
   * 评估风险等级
   */
  private assessRiskLevel(
    priceDeviation: number,
    supplierRating: number
  ): "low" | "medium" | "high" {
    let riskScore = 0;

    // 价格偏差风险
    if (priceDeviation > 30) riskScore += 2;
    else if (priceDeviation > 15) riskScore += 1;

    // 供应商评分风险
    if (supplierRating < 3.0) riskScore += 2;
    else if (supplierRating < 4.0) riskScore += 1;

    if (riskScore >= 3) return "high";
    if (riskScore >= 1) return "medium";
    return "low";
  }

  /**
   * 预估所需时间
   */
  private estimateTime(strategyId: string, urgencyLevel?: string): number {
    let baseTime = 30; // 默认30分钟

    if (urgencyLevel === "urgent") {
      baseTime = 15; // 紧急情况下15分钟
    }

    return baseTime;
  }

  /**
   * 获取保守建议
   */
  private getConservativeAdvice(
    targetPrice: number,
    initialQuote: number
  ): NegotiationAdvice {
    const conservativePrice = targetPrice * 1.02; // 只比目标价高2%
    const expectedDiscount =
      ((initialQuote - conservativePrice) / initialQuote) * 100;

    return {
      recommendedPrice: Math.min(conservativePrice, initialQuote),
      confidence: 60,
      strategyToUse: "",
      alternativeStrategies: [],
      riskLevel: "low",
      expectedDiscount: Math.max(expectedDiscount, 0),
      timeEstimate: 20,
    };
  }

  /**
   * 映射数据库记录到策略对象
   */
  private mapToStrategy(data: any): NegotiationStrategy {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      strategyType: data.strategy_type as StrategyType,
      conditions: data.conditions,
      actions: data.actions,
      priority: data.priority,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
