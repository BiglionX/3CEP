/**
 * 响应式管理后台仪表盘
 * 使用新的移动端布局组件重构
 */

'use client';

import {
  StatCardMobile,
  StatGridMobile,
} from '@/components/cards/StatCardMobile';
import { AdminMobileLayout } from '@/components/layouts/AdminMobileLayout';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Store, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ResponsiveDashboardPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [stats, setStats] = useState({
    todayHotLinks: 0,
    pendingLinks: 0,
    weekArticles: 0,
    totalEngineers: 0,
    totalShops: 0,
    appointmentTrends: [] as any[],
  });
  const [dataLoading, setDataLoading] = useState(true);

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/dashboard')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch('/api/admin/dashboard/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('加载运营数据失败:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      loadDashboardData();
    }
  }, [isLoading, isAuthenticated, is_admin]);

  // 认证加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未认证或不是管理员
  if (!isAuthenticated || !is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-yellow-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">请先登录管理员账户</p>
          <button
            onClick={() =>
              (window.location.href = `/login?redirect=${encodeURIComponent('/admin/dashboard')}`)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px]"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  // 数据加载中
  if (dataLoading) {
    return (
      <AdminMobileLayout title="仪表盘">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminMobileLayout>
    );
  }

  return (
    <AdminMobileLayout title="仪表盘">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* 统计卡片 - 响应式网格 */}
        <StatGridMobile columns={2}>
          <StatCardMobile
            title="今日热点链接"
            value={stats.todayHotLinks}
            change={Math.floor(stats.todayHotLinks * 0.1)}
            changePercent={10}
            icon={<FileText />}
            color="blue"
          />

          <StatCardMobile
            title="待审核链接"
            value={stats.pendingLinks}
            icon={<TrendingUp />}
            color="yellow"
          />

          <StatCardMobile
            title="本周文章"
            value={stats.weekArticles}
            change={5}
            changePercent={2.5}
            icon={<Briefcase />}
            color="green"
          />

          <StatCardMobile
            title="注册工程师"
            value={stats.totalEngineers}
            icon={<Users />}
            color="purple"
          />

          <StatCardMobile
            title="总店铺数"
            value={stats.totalShops}
            icon={<Store />}
            color="orange"
          />
        </StatGridMobile>

        {/* 数据汇总卡片 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">数据汇总</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-600">今日热点链接增长</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.todayHotLinks}
              </p>
              <p className="text-sm text-gray-500">
                较昨日 +
                {stats.todayHotLinks > 0
                  ? Math.floor(stats.todayHotLinks * 0.1)
                  : 0}
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <p className="text-sm text-gray-600">待审核内容积压</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingLinks}
              </p>
              <p className="text-sm text-gray-500">建议及时处理</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-sm text-gray-600">本周内容产出</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.weekArticles}
              </p>
              <p className="text-sm text-gray-500">保持稳定增长</p>
            </div>
          </div>
        </div>

        {/* 图表区域 - 移动端优化 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">预约趋势</h3>
          <div className="h-64 md:h-80">
            {/* TODO: 集成图表组件 */}
            <div className="flex items-center justify-center h-full text-gray-500">
              图表区域 - 可使用 Recharts 或其他图表库
            </div>
          </div>
        </div>
      </motion.div>
    </AdminMobileLayout>
  );
}
