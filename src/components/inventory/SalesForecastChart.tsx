'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ForecastDataPoint {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
}

interface SalesForecastChartProps {
  data: ForecastDataPoint[];
  title?: string;
  description?: string;
  itemName?: string;
}

export function SalesForecastChart({
  data,
  title = '销量预测趋势',
  description = '历史销量与AI预测对比',
  itemName,
}: SalesForecastChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // 根据时间范围过滤数据
  const filteredData = data.slice(-getTimeRangeDays(timeRange));

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (timeRange === '7d') {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(0)} 件
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {itemName && (
            <CardDescription className="text-xs mt-1">
              商品: {itemName}
            </CardDescription>
          )}
          <CardDescription>{description}</CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: any) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">最近7天</SelectItem>
            <SelectItem value="30d">最近30天</SelectItem>
            <SelectItem value="90d">最近90天</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            暂无预测数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* 置信区间阴影 */}
              {filteredData[0]?.lowerBound && (
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stackId="1"
                  stroke="none"
                  fill="#8884d8"
                  fillOpacity={0.1}
                  name="置信区间"
                />
              )}
              {filteredData[0]?.lowerBound && (
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stackId="1"
                  stroke="none"
                  fill="#fff"
                  fillOpacity={1}
                />
              )}

              {/* 预测曲线 */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#8884d8"
                strokeWidth={2}
                fill="url(#colorPredicted)"
                name="预测销量"
                dot={false}
                activeDot={{ r: 6 }}
              />

              {/* 实际销量曲线 */}
              {filteredData.some(d => d.actual !== undefined) && (
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  fill="url(#colorActual)"
                  name="实际销量"
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* 图例说明 */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>紫色虚线: AI预测销量</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>绿色实线: 历史实际销量</span>
          </div>
          {filteredData[0]?.lowerBound && (
            <div className="col-span-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-200 rounded opacity-50"></div>
              <span>浅色区域: 95%置信区间</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 辅助函数: 获取时间范围对应的天数
function getTimeRangeDays(range: '7d' | '30d' | '90d'): number {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 30;
  }
}
