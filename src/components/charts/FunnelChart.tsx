/**
 * 可复用的漏斗图组件
 * 基于 recharts 实现
 */

'use client';

import React from 'react';
import {
  Funnel,
  LabelList,
  FunnelChart as RechartsFunnelChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface FunnelChartDataPoint {
  stage: string;
  count: number;
}

export interface FunnelChartProps {
  data: FunnelChartDataPoint[];
  title?: string;
  showLabels?: boolean;
  showConversionRate?: boolean;
  height?: number;
  colors?: string[];
  className?: string;
}

/**
 * 默认颜色方案
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

/**
 * 自定义 Tooltip 组件
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { stage, count } = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{stage}</p>
        <p className="text-sm text-gray-600">
          数量：{Number(count).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 漏斗图组件
 */
export const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title,
  showLabels = true,
  showConversionRate = true,
  height = 400,
  colors = DEFAULT_COLORS,
  className = '',
}) => {
  // 计算转化率
  const firstCount = data[0]?.count || 1;

  const processedData = data.map((item, index) => ({
    ...item,
    conversionRate: ((item.count / firstCount) * 100).toFixed(1),
    fill: colors[index % colors.length],
  }));

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsFunnelChart>
          <Tooltip content={<CustomTooltip />} />

          <Funnel
            dataKey="count"
            data={processedData}
            shapeId="stage"
            nameKey="stage"
          >
            {showLabels && (
              <>
                {/* 右侧显示阶段名称 */}
                <LabelList
                  position="right"
                  fill="#374151"
                  stroke="none"
                  dataKey="stage"
                  fontSize={12}
                  fontWeight="bold"
                />

                {/* 中间显示数量 */}
                <LabelList
                  position="center"
                  fill="#fff"
                  stroke="none"
                  dataKey="count"
                  fontSize={14}
                  fontWeight="bold"
                  formatter={(value: number) => Number(value).toLocaleString()}
                />

                {/* 左侧显示转化率 */}
                {showConversionRate && (
                  <LabelList
                    position="left"
                    fill="#6b7280"
                    stroke="none"
                    dataKey="conversionRate"
                    fontSize={11}
                    formatter={(value: number, entry: any) =>
                      `${((entry.count / firstCount) * 100).toFixed(1)}%`
                    }
                  />
                )}
              </>
            )}
          </Funnel>
        </RechartsFunnelChart>
      </ResponsiveContainer>

      {/* 转化率说明 */}
      {showConversionRate && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          转化率基于第一阶段为 100% 计算
        </div>
      )}
    </div>
  );
};

export default FunnelChart;
