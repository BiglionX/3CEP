/**
 * FixCycle 6.0 Analytics - 预定义报表模板
 * Predefined Analytics Report Templates
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChartComponent,
  KPICard,
  LineChartComponent,
  PieChartComponent,
} from './charts';

// ==================== 流量分析报表 ====================

export const TrafficReport: React.FC<{
  appId?: string;
  dateRange?: { from: Date; to: Date };
}> = ({ appId, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // 模拟数据（实际应该从 API 获取）
    const fetchData = async () => {
      setLoading(true);

      // TODO: 替换为实际 API 调用
      // const response = await fetch(`/api/analytics/reports/traffic?appId=${appId}&from=${dateRange?.from}&to=${dateRange?.to}`);
      // const data = await response.json();

      // 模拟数据
      setTimeout(() => {
        setData({
          kpis: {
            pageviews: 125430,
            uniqueVisitors: 45230,
            sessions: 67890,
            bounceRate: 42.5,
            avgSessionDuration: 245,
            pagesPerSession: 3.8,
          },
          trends: {
            hourly: Array.from({ length: 24 }, (_, i) => ({
              hour: `${i}:00`,
              pageviews: Math.floor(Math.random() * 5000) + 1000,
              visitors: Math.floor(Math.random() * 2000) + 500,
            })),
            daily: Array.from({ length: 30 }, (_, i) => ({
              date: `2026-03-${i + 1}`,
              pageviews: Math.floor(Math.random() * 50000) + 20000,
              visitors: Math.floor(Math.random() * 20000) + 10000,
            })),
          },
          sources: [
            { name: '直接访问', value: 35000 },
            { name: '搜索引擎', value: 28000 },
            { name: '社交媒体', value: 18000 },
            { name: '外部链接', value: 12000 },
            { name: '其他', value: 7000 },
          ],
          topPages: [
            { path: '/dashboard', views: 25430, title: 'Dashboard' },
            { path: '/products', views: 18920, title: 'Products' },
            { path: '/about', views: 12340, title: 'About Us' },
            { path: '/contact', views: 9870, title: 'Contact' },
            { path: '/blog', views: 8760, title: 'Blog' },
          ],
        });

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [appId, dateRange]);

  if (loading) {
    return <div className="space-y-6">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI 指标卡 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="页面浏览量"
          value={data.kpis.pageviews}
          change={12.5}
          changeType="increase"
          trend={data.trends.daily.slice(-7).map(d => d.pageviews)}
        />
        <KPICard
          title="独立访客"
          value={data.kpis.uniqueVisitors}
          change={8.3}
          changeType="increase"
          trend={data.trends.daily.slice(-7).map(d => d.visitors)}
        />
        <KPICard
          title="会话数"
          value={data.kpis.sessions}
          change={5.2}
          changeType="increase"
        />
        <KPICard
          title="跳出率"
          value={`${data.kpis.bounceRate}%`}
          change={-2.1}
          changeType="decrease"
        />
        <KPICard
          title="平均会话时长"
          value={Math.floor(data.kpis.avgSessionDuration / 60)}
          unit="分钟"
          change={15.3}
          changeType="increase"
        />
        <KPICard
          title="每会话页数"
          value={data.kpis.pagesPerSession}
          change={3.2}
          changeType="increase"
        />
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="近 30 天流量趋势"
          data={data.trends.daily}
          dataKey="date"
          height={300}
          showLegend
        />

        <BarChartComponent
          title="24 小时流量分布"
          data={data.trends.hourly}
          dataKey="hour"
          height={300}
          stacked
        />
      </div>

      {/* 流量来源 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          title="流量来源分布"
          data={data.sources}
          nameKey="name"
          valueKey="value"
          height={300}
        />

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">热门页面</h3>
          </div>
          <div className="card-body">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">页面</th>
                  <th className="text-right">浏览量</th>
                  <th className="text-right">占比</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.path}
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="text-right text-muted-foreground">
                      {((page.views / data.kpis.pageviews) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 性能监控报表 ====================

export const PerformanceReport: React.FC<{
  appId?: string;
  dateRange?: { from: Date; to: Date };
}> = ({ appId, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 模拟数据
      setTimeout(() => {
        setData({
          metrics: {
            avgPageLoadTime: 1.85,
            avgFirstPaint: 0.82,
            avgLCP: 2.34,
            avgFID: 45,
            avgCLS: 0.08,
            errorRate: 0.12,
          },
          trends: {
            pageLoadTime: Array.from({ length: 24 }, (_, i) => ({
              time: `${i}:00`,
              value: 1.5 + Math.random(),
            })),
            lcp: Array.from({ length: 24 }, (_, i) => ({
              time: `${i}:00`,
              value: 2.0 + Math.random(),
            })),
          },
          devicePerformance: [
            { device: 'Desktop', pageLoadTime: 1.5, lcp: 2.1, fid: 35 },
            { device: 'Mobile', pageLoadTime: 2.8, lcp: 3.2, fid: 65 },
            { device: 'Tablet', pageLoadTime: 2.1, lcp: 2.6, fid: 48 },
          ],
          browserDistribution: [
            { browser: 'Chrome', percentage: 65 },
            { browser: 'Safari', percentage: 18 },
            { browser: 'Firefox', percentage: 10 },
            { browser: 'Edge', percentage: 5 },
            { browser: 'Other', percentage: 2 },
          ],
        });

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [appId, dateRange]);

  if (loading) {
    return <div className="space-y-6">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Web Vitals 指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="页面加载时间"
          value={data.metrics.avgPageLoadTime}
          unit="秒"
          change={-8.5}
          changeType="decrease"
          target={2.0}
        />
        <KPICard
          title="首次绘制"
          value={data.metrics.avgFirstPaint}
          unit="秒"
          change={-5.2}
          changeType="decrease"
          target={1.0}
        />
        <KPICard
          title="最大内容绘制"
          value={data.metrics.avgLCP}
          unit="秒"
          change={-3.8}
          changeType="decrease"
          target={2.5}
        />
        <KPICard
          title="首次输入延迟"
          value={data.metrics.avgFID}
          unit="毫秒"
          change={-12.3}
          changeType="decrease"
          target={100}
        />
        <KPICard
          title="累积布局偏移"
          value={data.metrics.avgCLS}
          change={-15.6}
          changeType="decrease"
          target={0.1}
        />
        <KPICard
          title="错误率"
          value={`${data.metrics.errorRate}%`}
          change={-0.05}
          changeType="decrease"
          target={0.5}
        />
      </div>

      {/* 性能趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="24 小时页面加载时间趋势"
          data={data.trends.pageLoadTime}
          dataKey="time"
          height={300}
        />

        <LineChartComponent
          title="24 小时 LCP 趋势"
          data={data.trends.lcp}
          dataKey="time"
          height={300}
        />
      </div>

      {/* 设备和浏览器分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="不同设备性能对比"
          data={data.devicePerformance}
          dataKey="device"
          height={300}
        />

        <PieChartComponent
          title="浏览器市场份额"
          data={data.browserDistribution}
          nameKey="browser"
          valueKey="percentage"
          height={300}
        />
      </div>
    </div>
  );
};

// ==================== 用户行为报表 ====================

export const UserBehaviorReport: React.FC<{
  appId?: string;
  dateRange?: { from: Date; to: Date };
}> = ({ appId, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 模拟数据
      setTimeout(() => {
        setData({
          metrics: {
            activeUsers: 8420,
            newUsers: 1250,
            returningUsers: 7170,
            avgSessionDuration: 245,
            retentionRate: 85.2,
          },
          hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            users: Math.floor(Math.random() * 1000) + 200,
          })),
          userActions: [
            { action: '页面浏览', count: 125430 },
            { action: '点击按钮', count: 45230 },
            { action: '表单提交', count: 12340 },
            { action: '文件下载', count: 8760 },
            { action: '视频播放', count: 6540 },
          ],
          deviceTypes: [
            { type: 'Desktop', users: 4520 },
            { type: 'Mobile', users: 3120 },
            { type: 'Tablet', users: 780 },
          ],
          geoDistribution: [
            { region: '华东', users: 3200 },
            { region: '华南', users: 2100 },
            { region: '华北', users: 1800 },
            { region: '西南', users: 920 },
            { region: '其他', users: 400 },
          ],
        });

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [appId, dateRange]);

  if (loading) {
    return <div className="space-y-6">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 用户指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          title="活跃用户"
          value={data.metrics.activeUsers}
          change={15.3}
          changeType="increase"
        />
        <KPICard
          title="新用户"
          value={data.metrics.newUsers}
          change={22.1}
          changeType="increase"
        />
        <KPICard
          title="回访用户"
          value={data.metrics.returningUsers}
          change={12.8}
          changeType="increase"
        />
        <KPICard
          title="平均停留时长"
          value={Math.floor(data.metrics.avgSessionDuration / 60)}
          unit="分钟"
          change={8.5}
          changeType="increase"
        />
        <KPICard
          title="留存率"
          value={`${data.metrics.retentionRate}%`}
          change={3.2}
          changeType="increase"
        />
      </div>

      {/* 活动热力图 */}
      <div className="grid grid-cols-1 gap-6">
        <BarChartComponent
          title="24 小时用户活跃度"
          data={data.hourlyActivity}
          dataKey="hour"
          height={300}
        />
      </div>

      {/* 用户行为和分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="用户行为 TOP5"
          data={data.userActions}
          dataKey="action"
          height={300}
        />

        <PieChartComponent
          title="设备类型分布"
          data={data.deviceTypes}
          nameKey="type"
          valueKey="users"
          height={300}
        />
      </div>

      {/* 地理分布 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">用户地理分布</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {data.geoDistribution.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{item.region}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.users / data.metrics.activeUsers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-muted-foreground">
                  {item.users.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 转化率分析报表 ====================

export const ConversionReport: React.FC<{
  appId?: string;
  dateRange?: { from: Date; to: Date };
}> = ({ appId, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 模拟数据
      setTimeout(() => {
        setData({
          funnel: [
            { stage: '访问', users: 10000, rate: 100 },
            { stage: '注册', users: 3500, rate: 35 },
            { stage: '激活', users: 2100, rate: 21 },
            { stage: '付费', users: 840, rate: 8.4 },
            { stage: '复购', users: 420, rate: 4.2 },
          ],
          conversionTrend: Array.from({ length: 30 }, (_, i) => ({
            date: `2026-03-${i + 1}`,
            rate: 3 + Math.random() * 2,
          })),
          channelConversion: [
            { channel: '搜索引擎', visitors: 3500, conversions: 420, rate: 12 },
            { channel: '社交媒体', visitors: 2800, conversions: 280, rate: 10 },
            { channel: '直接访问', visitors: 2100, conversions: 315, rate: 15 },
            { channel: '外部链接', visitors: 1600, conversions: 128, rate: 8 },
          ],
        });

        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [appId, dateRange]);

  if (loading) {
    return <div className="space-y-6">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 转化漏斗 */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">转化漏斗</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {data.funnel.map((step: any, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{step.stage}</span>
                  <div className="text-muted-foreground">
                    {step.users.toLocaleString()} 用户 ({step.rate}%)
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${step.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 转化率趋势 */}
      <div className="grid grid-cols-1 gap-6">
        <LineChartComponent
          title="30 天转化率趋势"
          data={data.conversionTrend}
          dataKey="date"
          height={300}
        />
      </div>

      {/* 渠道转化对比 */}
      <div className="grid grid-cols-1 gap-6">
        <BarChartComponent
          title="各渠道转化对比"
          data={data.channelConversion}
          dataKey="channel"
          height={300}
        />

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">渠道详情</h3>
          </div>
          <div className="card-body">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">渠道</th>
                  <th className="text-right">访客数</th>
                  <th className="text-right">转化数</th>
                  <th className="text-right">转化率</th>
                </tr>
              </thead>
              <tbody>
                {data.channelConversion.map((channel: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 font-medium">{channel.channel}</td>
                    <td className="text-right">
                      {channel.visitors.toLocaleString()}
                    </td>
                    <td className="text-right">
                      {channel.conversions.toLocaleString()}
                    </td>
                    <td className="text-right font-semibold text-green-600">
                      {channel.rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== 报表导出组件 ====================

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'png';
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: { from: Date; to: Date };
}

export const useReportExport = () => {
  const exportToCSV = (data: any[], filename: string) => {
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

  return {
    exportToCSV,
    // TODO: 实现 PDF 和 PNG 导出
  };
};
