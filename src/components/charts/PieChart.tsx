/**
 * 可复用的饼图组件
 * 基于 recharts 实现
 */

'use client';

import React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface PieChartDataPoint {
  name: string;
  value: number;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  height?: number;
  colors?: string[];
  className?: string;
}

const RADIAN = Math.PI / 180;

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
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * 自定义 Tooltip 组件
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0];
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">{name}</p>
        <p className="text-sm text-gray-600">
          数值：{Number(value).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          占比：{(percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 自定义标签渲染（显示百分比）
 */
const renderCustomizedLabel: React.FC<{
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}> = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * 饼图组件
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  innerRadius = 0, // 0 为饼图，>0 为环形图
  outerRadius = 150,
  showLabel = true,
  showLegend = true,
  height = 300,
  colors = DEFAULT_COLORS,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={showLabel ? renderCustomizedLabel : undefined}
            labelLine={showLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />

          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
