/**
 * 供应链系统主入口文件
 * 导出所有核心模块和服务
 */

// 数据模型导出
export * from './models/inventory.model';

// 服务接口导出
export * from './services/interfaces';

// 核心服务实现
export * from './services/inventory.service';
export * from './services/warehouse.service';
// export * from './services/product.service';
export * from './services/supplier.service';
// export * from './services/purchase-order.service';
export * from './services/recommendation.service';

/**
 * 供应链系统版本信? */
export const SUPPLY_CHAIN_VERSION = '1.0.0';

/**
 * 供应链系统配置常? */
export const SUPPLY_CHAIN_CONSTANTS = {
  // 库存预警阈?  LOW_STOCK_THRESHOLD: 0.2, // 库存低于20%时预?
  // 安全库存倍数
  SAFETY_STOCK_MULTIPLIER: 1.5, // 安全库存为基础销量的1.5�?
  // 补货建议倍数
  REORDER_QUANTITY_MULTIPLIER: 2, // 补货数量为重新订购点?�?
  // 供应商评级权?  QUALITY_WEIGHT: 0.4, // 质量权重40%
  DELIVERY_WEIGHT: 0.3, // 交货权重30%
  PRICE_WEIGHT: 0.2, // 价格权重20%
  SERVICE_WEIGHT: 0.1, // 服务权重10%

  // 仓库推荐算法参数
  DISTANCE_WEIGHT: 0.3, // 距离权重30%
  INVENTORY_WEIGHT: 0.4, // 库存权重40%
  COST_WEIGHT: 0.2, // 成本权重20%
  TIME_WEIGHT: 0.1, // 时间权重10%
};
