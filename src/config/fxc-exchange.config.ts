/**
 * FXC 兑换 Token 配置
 * 
 * 汇率机制说明:
 * - 基础汇率：1 FXC = 10 Tokens
 * - 动态浮动：±5% 根据市场供需
 * - 更新频率：每小时更新一次
 * - 最小兑换金额：10 FXC
 * - 最大兑换金额：10,000 FXC/天
 */

export interface ExchangeRateConfig {
  baseRate: number; // 基础汇率
  dynamicPricing: boolean; // 是否启用动态定价
  volatilityBand: number; // 浮动范围 (±)
  updateFrequency: number; // 更新频率 (秒)
  minExchangeAmount: number; // 最小兑换金额
  maxDailyAmount: number; // 每日最大兑换金额
  feeRate: number; // 手续费率 (百分比)
}

export const EXCHANGE_CONFIG: ExchangeRateConfig = {
  baseRate: 10, // 1 FXC = 10 Tokens
  dynamicPricing: true,
  volatilityBand: 0.05, // ±5% 浮动
  updateFrequency: 3600, // 每小时更新
  minExchangeAmount: 10, // 最小 10 FXC
  maxDailyAmount: 10000, // 每天最多 10000 FXC
  feeRate: 0.01, // 1% 手续费
};

/**
 * 获取当前有效汇率
 * @param marketData 市场数据 (可选)
 * @returns 当前汇率
 */
export function getCurrentExchangeRate(marketData?: {
  supply: number;
  demand: number;
}): number {
  if (!EXCHANGE_CONFIG.dynamicPricing || !marketData) {
    return EXCHANGE_CONFIG.baseRate;
  }

  // 简单的供需定价模型
  const ratio = marketData.demand / marketData.supply;
  
  // 计算浮动比例 (限制在±5% 以内)
  let adjustment = 0;
  if (ratio > 1.2) {
    adjustment = EXCHANGE_CONFIG.volatilityBand; // 需求高，汇率上浮
  } else if (ratio < 0.8) {
    adjustment = -EXCHANGE_CONFIG.volatilityBand; // 需求低，汇率下浮
  } else if (ratio > 1) {
    adjustment = (ratio - 1) * EXCHANGE_CONFIG.volatilityBand;
  }

  return EXCHANGE_CONFIG.baseRate * (1 + adjustment);
}

/**
 * 计算兑换结果
 * @param fxcAmount FXC 金额
 * @param useDynamicRate 是否使用动态汇率
 * @returns 兑换的 Token 数量 (扣除手续费后)
 */
export function calculateExchangeResult(
  fxcAmount: number,
  useDynamicRate: boolean = true
): {
  tokenAmount: number;
  feeAmount: number;
  finalAmount: number;
  exchangeRate: number;
} {
  // 验证金额
  if (fxcAmount < EXCHANGE_CONFIG.minExchangeAmount) {
    throw new Error(`最小兑换金额为 ${EXCHANGE_CONFIG.minExchangeAmount} FXC`);
  }

  if (fxcAmount > EXCHANGE_CONFIG.maxDailyAmount) {
    throw new Error(`每日最大兑换金额为 ${EXCHANGE_CONFIG.maxDailyAmount} FXC`);
  }

  // 获取汇率
  const exchangeRate = useDynamicRate
    ? getCurrentExchangeRate()
    : EXCHANGE_CONFIG.baseRate;

  // 计算理论 Token 数量
  const theoreticalTokens = fxcAmount * exchangeRate;

  // 计算手续费
  const feeAmount = theoreticalTokens * EXCHANGE_CONFIG.feeRate;

  // 实际到账 Token 数量
  const finalAmount = theoreticalTokens - feeAmount;

  return {
    tokenAmount: theoreticalTokens,
    feeAmount,
    finalAmount,
    exchangeRate,
  };
}

/**
 * 验证兑换是否合法
 * @param userId 用户 ID
 * @param fxcAmount FXC 金额
 * @param dailyExchanged 今日已兑换金额
 */
export function validateExchange(
  userId: string,
  fxcAmount: number,
  dailyExchanged: number
): { valid: boolean; error?: string } {
  if (!userId) {
    return { valid: false, error: '用户 ID 不能为空' };
  }

  if (fxcAmount < EXCHANGE_CONFIG.minExchangeAmount) {
    return {
      valid: false,
      error: `最小兑换金额为 ${EXCHANGE_CONFIG.minExchangeAmount} FXC`,
    };
  }

  if (fxcAmount > EXCHANGE_CONFIG.maxDailyAmount) {
    return {
      valid: false,
      error: `每日最大兑换金额为 ${EXCHANGE_CONFIG.maxDailyAmount} FXC`,
    };
  }

  if (dailyExchanged + fxcAmount > EXCHANGE_CONFIG.maxDailyAmount) {
    return {
      valid: false,
      error: `今日已兑换 ${dailyExchanged} FXC，剩余可兑换额度为 ${
        EXCHANGE_CONFIG.maxDailyAmount - dailyExchanged
      } FXC`,
    };
  }

  return { valid: true };
}
