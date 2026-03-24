/**
 * 可复用的柱状图组件
 * 基于 recharts 实现
 */

'use client';

import React from 'react';
import {
  Bar,
  CartesianGrid,
  LabelList,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface BarChartDataPoint {
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  title?: string;
  xKey: string;
  yKeys: string[];
  colors?: string[];
  orientation?: 'horizontal' | 'vertical';
  stack?: boolean;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showDataLabels?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  className?: string;
}

/**
 * 自定义 Tooltip 组件
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * 默认颜色方案
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

/**
 * 柱状图组件
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  orientation = 'vertical',
  stack = false,
  height = 300,
  showLegend = true,
  showGrid = true,
  showDataLabels = false,
  yAxisLabel,
  xAxisLabel,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}

          <XAxis
            type={orientation === 'horizontal' ? 'number' : 'category'}
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                : undefined
            }
          />

          <YAxis
            type={orientation === 'horizontal' ? 'category' : 'number'}
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickFormatter={value => Number(value).toLocaleString()}
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                : undefined
            }
          />

          <Tooltip content={<CustomTooltip />} />

          {showLegend && <Legend />}

          {yKeys.map((yKey, index) => (
            <Bar
              key={yKey}
              dataKey={yKey}
              fill={colors[index % colors.length]}
              stackId={stack ? 'a' : undefined}
              name={yKey}
            >
              {showDataLabels && (
                <LabelList
                  position="top"
                  formatter={(value: number) => Number(value).toLocaleString()}
                  fill="#374151"
                  fontSize={10}
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
