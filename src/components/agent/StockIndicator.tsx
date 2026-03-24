'use client';

import { AlertCircle, CheckCircle, Package, TrendingDown } from 'lucide-react';

interface StockIndicatorProps {
  inventoryLimit?: number | null;
  inventoryUsed?: number;
  isLoading?: boolean;
  showDetails?: boolean;
  className?: string;
}

/**
 * 库存状态指示器组件
 *
 * 显示智能体的库存状态，包括：
 * - 无限库存
 * - 充足
 * - 紧张
 * - 售罄
 */
export function StockIndicator({
  inventoryLimit,
  inventoryUsed = 0,
  isLoading = false,
  showDetails = true,
  className = '',
}: StockIndicatorProps) {
  // 计算可用库存和状态
  const getStockInfo = () => {
    if (isLoading) {
      return {
        status: 'loading' as const,
        label: '加载中...',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: <Package className="w-4 h-4" />,
      };
    }

    // 无限制库存
    if (!inventoryLimit) {
      return {
        status: 'unlimited' as const,
        label: '无限库存',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }

    const availableStock = inventoryLimit - inventoryUsed;
    const stockPercentage = (availableStock / inventoryLimit) * 100;

    // 售罄
    if (availableStock <= 0) {
      return {
        status: 'out_of_stock' as const,
        label: '已售罄',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }

    // 库存紧张（低于 20%）
    if (stockPercentage <= 20) {
      return {
        status: 'low_stock' as const,
        label: '库存紧张',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        icon: <TrendingDown className="w-4 h-4" />,
      };
    }

    // 库存充足
    return {
      status: 'in_stock' as const,
      label: '库存充足',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: <CheckCircle className="w-4 h-4" />,
    };
  };

  const stockInfo = getStockInfo();

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* 状态标签 */}
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${stockInfo.bgColor} ${stockInfo.color}`}
      >
        {stockInfo.icon}
        <span>{stockInfo.label}</span>
      </div>

      {/* 详细信息 */}
      {showDetails && inventoryLimit && (
        <div className="text-sm text-gray-600">
          <span>
            剩余：{Math.max(0, inventoryLimit - inventoryUsed)} /{' '}
            {inventoryLimit}
          </span>
          {inventoryLimit > 0 && (
            <div className="mt-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stockInfo.status === 'out_of_stock'
                    ? 'bg-red-500'
                    : stockInfo.status === 'low_stock'
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(100, ((inventoryLimit - inventoryUsed) / inventoryLimit) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 库存警告提示组件
 */
interface StockAlertProps {
  availableStock: number;
  inventoryLimit: number;
  onRestock?: () => void;
}

export function StockAlert({
  availableStock,
  inventoryLimit,
  onRestock,
}: StockAlertProps) {
  const stockPercentage = (availableStock / inventoryLimit) * 100;

  if (stockPercentage > 20) {
    return null; // 不需要显示警告
  }

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        availableStock <= 0
          ? 'bg-red-50 border-red-500'
          : 'bg-orange-50 border-orange-500'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            availableStock <= 0 ? 'text-red-500' : 'text-orange-500'
          }`}
        />
        <div className="flex-1">
          <h4
            className={`font-medium ${
              availableStock <= 0 ? 'text-red-800' : 'text-orange-800'
            }`}
          >
            {availableStock <= 0 ? '库存已售罄' : '库存紧张'}
          </h4>
          <p
            className={`text-sm mt-1 ${
              availableStock <= 0 ? 'text-red-700' : 'text-orange-700'
            }`}
          >
            剩余库存：{availableStock} / {inventoryLimit} (
            {stockPercentage.toFixed(1)}%)
            {availableStock <= 0 ? ' 已无法继续销售' : ' 建议及时补货'}
          </p>
          {onRestock && availableStock > 0 && (
            <button
              onClick={onRestock}
              className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700 underline"
            >
              立即补货
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockIndicator;
