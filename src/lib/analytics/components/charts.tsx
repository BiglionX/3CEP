/**
 * FixCycle 6.0 Analytics - 通用图表组件库
 * Reusable Chart Components for Analytics Platform
 *
 * 基于 Recharts 封装的通用图表组件
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ==================== 类型定义 ====================

export interface ChartDataPoint {
  [key: string]: any;
  name?: string;
  time?: string;
  date?: string;
}

export interface BaseChartProps {
  /** 图表数据 */
  data: ChartDataPoint[];
  /** 图表标题 */
  title?: string;
  /** 图表高度 */
  height?: number;
  /** X 轴数据键 */
  dataKey?: string;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 提示框自定义渲染 */
  tooltipFormatter?: (value: any, name: string, props: any) => any;
  /** 自定义颜色 */
  colors?: string[];
  /** 加载状态 */
  loading?: boolean;
  /** 空数据提示 */
  emptyText?: string;
}

// ==================== 颜色配置 ====================

export const CHART_COLORS = {
  primary: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'],
  success: ['#00C853', '#64DD17', '#B2FF59'],
  warning: ['#FFB300', '#FFCA28', '#FFE082'],
  error: ['#F44336', '#E53935', '#EF5350'],
  blue: ['#2196F3', '#1E88E5', '#42A5F5'],
  purple: ['#9C27B0', '#7B1FA2', '#BA68C8'],
};

const DEFAULT_COLORS = CHART_COLORS.primary;

// ==================== 折线图组件 ====================

/**
 * 折线图 - 适用于趋势分析
 */
export const LineChartComponent: React.FC<BaseChartProps> = ({
  data,
  title,
  height = 300,
  dataKey = 'name',
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  colors = DEFAULT_COLORS,
  loading = false,
  emptyText = '暂无数据',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        加载中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            {emptyText}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={dataKey} />
        <YAxis />
        <Tooltip formatter={tooltipFormatter} />
        {showLegend && <Legend />}
        {Object.keys(data[0] || {})
          .filter(
            key =>
              key !== dataKey &&
              key !== 'name' &&
              key !== 'time' &&
              key !== 'date'
          )
          .map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return chart;
};

// ==================== 面积图组件 ====================

/**
 * 面积图 - 适用于累积量展示
 */
export const AreaChartComponent: React.FC<BaseChartProps> = ({
  data,
  title,
  height = 300,
  dataKey = 'name',
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  colors = DEFAULT_COLORS,
  loading = false,
  emptyText = '暂无数据',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        加载中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            {emptyText}
          </div>
        </CardContent>
      </Card>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={dataKey} />
        <YAxis />
        <Tooltip formatter={tooltipFormatter} />
        {showLegend && <Legend />}
        {Object.keys(data[0] || {})
          .filter(
            key =>
              key !== dataKey &&
              key !== 'name' &&
              key !== 'time' &&
              key !== 'date'
          )
          .map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.3}
            />
          ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return chart;
};

// ==================== 柱状图组件 ====================

/**
 * 柱状图 - 适用于分类对比
 */
export const BarChartComponent: React.FC<
  BaseChartProps & { stacked?: boolean }
> = ({
  data,
  title,
  height = 300,
  dataKey = 'name',
  showGrid = true,
  showLegend = true,
  tooltipFormatter,
  colors = DEFAULT_COLORS,
  loading = false,
  emptyText = '暂无数据',
  stacked = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        加载中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            {emptyText}
          </div>
        </CardContent>
      </Card>
    );
  }

  const keys = Object.keys(data[0] || {}).filter(
    key => key !== dataKey && key !== 'name' && key !== 'time' && key !== 'date'
  );

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={dataKey} />
        <YAxis />
        <Tooltip formatter={tooltipFormatter} />
        {showLegend && <Legend />}
        {keys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return chart;
};

// ==================== 饼图组件 ====================

/**
 * 饼图 - 适用于占比分析
 */
interface PieChartProps extends Omit<BaseChartProps, 'dataKey'> {
  /** 数据值键 */
  valueKey?: string;
  /** 数据显示名称键 */
  nameKey?: string;
  /** 是否显示百分比 */
  showPercentage?: boolean;
}

export const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  title,
  height = 300,
  nameKey = 'name',
  valueKey = 'value',
  showPercentage = true,
  colors = DEFAULT_COLORS,
  loading = false,
  emptyText = '暂无数据',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        加载中...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            {emptyText}
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = showPercentage
        ? ` (${((value / total) * 100).toFixed(1)}%)`
        : '';
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-muted-foreground">
            {value}
            {percentage}
          </p>
        </div>
      );
    }
    return null;
  };

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={Math.min(width, height) / 2 - 20}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  // 需要知道宽度来计算半径
  const [width, setWidth] = React.useState(400);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setWidth(window.innerWidth);
    }
  }, []);

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return chart;
};

// ==================== KPI 指标卡组件 ====================

/**
 * KPI 指标卡 - 用于展示关键指标
 */
export interface KPICardProps {
  /** 指标名称 */
  title: string;
  /** 当前值 */
  value: number | string;
  /** 变化值 */
  change?: number;
  /** 变化类型 */
  changeType?: 'increase' | 'decrease';
  /** 单位 */
  unit?: string;
  /** 趋势数据（可选） */
  trend?: number[];
  /** 目标值（可选） */
  target?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = 'increase',
  unit = '',
  trend,
  target,
}) => {
  const formatValue = () => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M${unit}`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K${unit}`;
      }
      return `${value}${unit}`;
    }
    return value;
  };

  const TrendSparkline = () => {
    if (!trend || trend.length === 0) return null;

    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;

    return (
      <div className="flex items-end space-x-1 h-8 mt-2">
        {trend.map((val, idx) => {
          const height = ((val - min) / range) * 100;
          return (
            <div
              key={idx}
              className="flex-1 bg-blue-500 rounded-t"
              style={{
                height: `${height}%`,
                opacity: 0.3 + (idx / trend.length) * 0.7,
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue()}</div>

        {change !== undefined && (
          <div
            className={`text-xs mt-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}
          >
            {changeType === 'increase' ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}

        {target !== undefined && typeof value === 'number' && (
          <div className="text-xs text-muted-foreground mt-1">
            目标：{target} (完成率：
            {(((value as number) / target) * 100).toFixed(1)}%)
          </div>
        )}

        <TrendSparkline />
      </CardContent>
    </Card>
  );
};

// ==================== 数据导出工具函数 ====================

/**
 * 导出图表数据为 CSV
 */
export const exportToCSV = (data: ChartDataPoint[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(fieldName => JSON.stringify(row[fieldName])).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

/**
 * 导出图表为图片（需要 html2canvas 库）
 */
export const exportChartToImage = async (
  chartRef: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  try {
    // 需要安装 html2canvas: npm install html2canvas
    const html2canvas = (await import('html2canvas')).default;

    if (!chartRef.current) {
      throw new Error('Chart ref not available');
    }

    const canvas = await html2canvas(chartRef.current);
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  } catch (error) {
    console.error('Export to image failed:', error);
    throw error;
  }
};
