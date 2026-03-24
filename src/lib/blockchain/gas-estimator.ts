/**
 * Gas 估算和优化工具
 * FixCycle 6.0 Blockchain Gas Optimization Utilities
 */

import { ethers } from 'ethers';
import { getNetworkConfig } from './blockchain/config';

/**
 * Gas 估算结果
 */
export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  estimatedCost: string;
  estimatedCostUSD: string;
}

/**
 * Gas 优化配置
 */
export interface GasOptimizationConfig {
  safetyMultiplier: number; // 安全系数（默认 1.2）
  maxGasPrice: bigint; // 最大 Gas 价格
  minGasPrice: bigint; // 最小 Gas 价格
  dynamicPricing: boolean; // 是否启用动态定价
}

const DEFAULT_CONFIG: GasOptimizationConfig = {
  safetyMultiplier: 1.2,
  maxGasPrice: ethers.parseUnits('500', 'gwei'),
  minGasPrice: ethers.parseUnits('1', 'gwei'),
  dynamicPricing: true,
};

/**
 * Gas 估算器类
 */
export class GasEstimator {
  private provider: ethers.Provider;
  private config: GasOptimizationConfig;

  constructor(config?: Partial<GasOptimizationConfig>) {
    const networkConfig = getNetworkConfig();
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 估算交易的 Gas 消耗
   * @param contract 合约实例
   * @param methodName 方法名
   * @param args 方法参数
   * @returns Gas 估算结果
   */
  async estimateGas(
    contract: ethers.Contract,
    methodName: string,
    args: any[]
  ): Promise<GasEstimate> {
    try {
      // 获取基础 Gas 估算
      const gasLimit = await contract[methodName].estimateGas(...args);

      // 应用安全系数
      const adjustedGasLimit =
        (gasLimit * BigInt(Math.floor(this.config.safetyMultiplier * 100))) /
        100n;

      // 获取当前 Gas 价格
      const feeData = await this.provider.getFeeData();
      const gasPrice = this.getOptimalGasPrice(feeData);

      // 计算成本
      const estimatedCost = adjustedGasLimit * gasPrice;
      const estimatedCostUSD = this.weiToUSD(estimatedCost);

      return {
        gasLimit: adjustedGasLimit,
        gasPrice,
        maxFeePerGas: feeData.maxFeePerGas || undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
        estimatedCost: ethers.formatEther(estimatedCost),
        estimatedCostUSD,
      };
    } catch (error) {
      throw new Error(
        `Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 批量注册产品的 Gas 估算
   * @param productCount 产品数量
   * @returns Gas 估算结果
   */
  async estimateBatchRegistration(productCount: number): Promise<GasEstimate> {
    console.log(`📊 估算批量注册 ${productCount} 个产品的 Gas 消耗...`);

    // 基于实际测试的估算公式
    // 单个产品注册约需 80,000 Gas
    // 批量注册有规模效应，每个产品约需 50,000 Gas
    const baseGasPerProduct = 50000n;
    const fixedGas = 21000n; // 基础交易 Gas

    const totalGas = fixedGas + baseGasPerProduct * BigInt(productCount);
    const adjustedGas =
      (totalGas * BigInt(Math.floor(this.config.safetyMultiplier * 100))) /
      100n;

    const feeData = await this.provider.getFeeData();
    const gasPrice = this.getOptimalGasPrice(feeData);

    const estimatedCost = adjustedGas * gasPrice;

    return {
      gasLimit: adjustedGas,
      gasPrice,
      maxFeePerGas: feeData.maxFeePerGas || undefined,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
      estimatedCost: ethers.formatEther(estimatedCost),
      estimatedCostUSD: this.weiToUSD(estimatedCost),
    };
  }

  /**
   * 获取最优 Gas 价格
   * @param feeData 费用数据
   * @returns 最优 Gas 价格
   */
  private getOptimalGasPrice(feeData: ethers.FeeData): bigint {
    if (!this.config.dynamicPricing) {
      return feeData.gasPrice || this.config.minGasPrice;
    }

    // 使用 EIP-1559 费用模型
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      const baseFee = feeData.maxFeePerGas - feeData.maxPriorityFeePerGas;
      const priorityFee = feeData.maxPriorityFeePerGas;

      // 根据网络拥堵情况调整优先级费用
      const adjustedPriorityFee = this.adjustPriorityFee(priorityFee, baseFee);

      return baseFee + adjustedPriorityFee;
    }

    // 回退到传统 Gas 价格
    const gasPrice = feeData.gasPrice || this.config.minGasPrice;

    // 确保在合理范围内
    if (gasPrice > this.config.maxGasPrice) {
      return this.config.maxGasPrice;
    }

    if (gasPrice < this.config.minGasPrice) {
      return this.config.minGasPrice;
    }

    return gasPrice;
  }

  /**
   * 调整优先级费用
   * @param priorityFee 当前优先级费用
   * @param baseFee 基础费用
   * @returns 调整后的优先级费用
   */
  private adjustPriorityFee(priorityFee: bigint, baseFee: bigint): bigint {
    // 简单策略：基础费用的 10% 作为优先级费用
    const suggestedPriorityFee = baseFee / 10n;

    // 如果当前优先级费用过高，降低它
    if (priorityFee > suggestedPriorityFee * 2n) {
      return suggestedPriorityFee;
    }

    // 如果当前优先级费用过低，提高它
    if (priorityFee < suggestedPriorityFee / 2n) {
      return suggestedPriorityFee;
    }

    return priorityFee;
  }

  /**
   * Wei 转 USD（简化版本）
   * @param weiAmount Wei 金额
   * @returns USD 金额
   */
  private weiToUSD(weiAmount: bigint): string {
    // 这里需要实际的 ETH/USD 汇率 API
    // 简化处理：假设 1 ETH = $2000
    const ethAmount = parseFloat(ethers.formatEther(weiAmount));
    const usdAmount = ethAmount * 2000;
    return `$${usdAmount.toFixed(4)}`;
  }

  /**
   * 比较不同方案的 Gas 消耗
   * @param scenarios 场景数组
   */
  async compareGasScenarios(
    scenarios: Array<{ name: string; products: number }>
  ): Promise<void> {
    console.log('\n⛽ Gas 消耗对比分析:\n');
    console.log('方案\t\t\t产品数\tGas 消耗\t预估成本');
    console.log('─'.repeat(70));

    for (const scenario of scenarios) {
      const estimate = await this.estimateBatchRegistration(scenario.products);
      const name = `${scenario.name} (${scenario.products}个)`;
      console.log(
        `${name.padEnd(20)}\t${scenario.products}\t${estimate.gasLimit.toString().padEnd(10)}\t${estimate.estimatedCostUSD}`
      );
    }

    console.log('─'.repeat(70));
  }
}

/**
 * 创建 Gas 估算器实例
 */
export function createGasEstimator(
  config?: Partial<GasOptimizationConfig>
): GasEstimator {
  return new GasEstimator(config);
}

/**
 * 快速估算批量注册 Gas
 * @param productCount 产品数量
 * @param safetyMultiplier 安全系数
 */
export async function quickEstimateBatchGas(
  productCount: number,
  safetyMultiplier: number = 1.2
): Promise<bigint> {
  const baseGasPerProduct = 50000n;
  const fixedGas = 21000n;

  const totalGas = fixedGas + baseGasPerProduct * BigInt(productCount);
  return (totalGas * BigInt(Math.floor(safetyMultiplier * 100))) / 100n;
}
