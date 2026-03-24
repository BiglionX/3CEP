/**
 * 可复用的热力图组件
 * 基于 recharts 实现
 */

'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface HeatMapDataPoint {
  x: string;
  y: string;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  title?: string;
  colorScale?: (value: number) => string;
  height?: number;
  showValues?: boolean;
  className?: string;
}

/**
 * 颜色渐变方案 - 从蓝色到红色
 */
const getColorScale = (minValue: number, maxValue: number) => {
  return (value: number): string => {
    const ratio = (value - minValue) / (maxValue - minValue);

    // 蓝色 -> 绿色 -> 黄色 -> 红色
    const r = Math.floor(255 * ratio);
    const g = Math.floor(255 * (1 - Math.abs(2 * ratio - 1)));
    const b = Math.floor(255 * (1 - ratio));

    return `rgb(${r}, ${g}, ${b})`;
  };
};

/**
 * 自定义 Tooltip 组件
 */
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { x, y, value } = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800 mb-1">
          {x} - {y}
        </p>
        <p className="text-sm text-gray-600">
          数值：{Number(value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 热力图单元格组件
 */
const HeatmapCell: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  color: string;
  showValue?: boolean;
}> = ({ x, y, width, height, value, color, showValue }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#fff"
        strokeWidth={1}
      />
      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="bold"
        >
          {Number(value).toLocaleString()}
        </text>
      )}
    </g>
  );
};

/**
 * 热力图组件
 */
export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  xLabels,
  yLabels,
  title,
  colorScale,
  height = 400,
  showValues = true,
  className = '',
}) => {
  // 计算最大值和最小值用于颜色映射
  const { minValue, maxValue, cellWidth, cellHeight } = useMemo(() => {
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // 计算单元格尺寸
    const width = 600 / xLabels.length;
    const h = 300 / yLabels.length;

    return { minValue: min, maxValue: max, cellWidth: width, cellHeight: h };
  }, [data, xLabels, yLabels]);

  // 获取颜色函数
  const getColor = colorScale || getColorScale(minValue, maxValue);

  // 转换数据为图表格式
  const chartData = useMemo(() => {
    return yLabels.map(yLabel => {
      const row: any = { y: yLabel };
      xLabels.forEach(xLabel => {
        const dataPoint = data.find(d => d.x === xLabel && d.y === yLabel);
        row[xLabel] = dataPoint ? dataPoint.value : 0;
      });
      return row;
    });
  }, [data, xLabels, yLabels]);

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <XAxis
            dataKey="y"
            type="category"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
          />

          <YAxis dataKey="y" type="category" tick={{ fontSize: 10 }} />

          <Tooltip content={<CustomTooltip />} />

          {data.map((dataPoint, index) => {
            const xIndex = xLabels.indexOf(dataPoint.x);
            const yIndex = yLabels.indexOf(dataPoint.y);

            return (
              <Rectangle
                key={index}
                x={xIndex * cellWidth + 50}
                y={yIndex * cellHeight + 20}
                width={cellWidth - 4}
                height={cellHeight - 4}
                fill={getColor(dataPoint.value)}
              >
                {showValues && (
                  <text
                    x={(xIndex + 0.5) * cellWidth + 50}
                    y={(yIndex + 0.5) * cellHeight + 20}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={10}
                    fontWeight="bold"
                  >
                    {Number(dataPoint.value).toLocaleString()}
                  </text>
                )}
              </Rectangle>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 颜色图例 */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-600">低</span>
        <div
          className="w-48 h-4 rounded"
          style={{
            background: `linear-gradient(to right,
              rgb(0, 0, 255),
              rgb(0, 255, 0),
              rgb(255, 255, 0),
              rgb(255, 0, 0))`,
          }}
        />
        <span className="text-xs text-gray-600">高</span>
      </div>
    </div>
  );
};

export default HeatMap;
