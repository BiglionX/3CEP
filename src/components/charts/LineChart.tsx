/**
 * 可复用的折线图组件
 * 基于 recharts 实现
 */

'use client';

import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface LineChartDataPoint {
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  title?: string;
  xKey: string;
  yKey: string;
  color?: string;
  showGrid?: boolean;
  height?: number;
  showLegend?: boolean;
  showDots?: boolean;
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
        <p style={{ color: payload[0].color }} className="text-sm">
          {payload[0].name}: {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 折线图组件
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  xKey,
  yKey,
  color = '#3b82f6',
  showGrid = true,
  height = 300,
  showLegend = true,
  showDots = false,
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
        <RechartsLineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}

          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                : undefined
            }
          />

          <YAxis
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

          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={showDots ? { r: 4 } : false}
            activeDot={{ r: 6 }}
            animationDuration={500}
            name={yKey}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
