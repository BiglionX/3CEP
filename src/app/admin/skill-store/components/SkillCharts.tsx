/**
 * Skill 商店统计图表组件
 * 使用简单的 CSS 和 SVG 实现图表可视化
 */

'use client';

import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SkillChartsProps {
  categoryStats?: ChartData[];
  reviewStatusStats?: ChartData[];
  shelfStatusStats?: ChartData[];
  loading?: boolean;
}

export function SkillCharts({
  categoryStats = [],
  reviewStatusStats = [],
  shelfStatusStats = [],
  loading = false,
}: SkillChartsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 如果没有数据，显示空状态
  if (categoryStats.length === 0 && reviewStatusStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">暂无统计数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 分类分布图 */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            分类分布
          </h3>
          <div className="space-y-3">
            {categoryStats.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getCategoryColor(index)}`}
                    style={{
                      width: `${calculatePercentage(item.value, categoryStats)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 审核状态图 */}
      {reviewStatusStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            审核状态分布
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {reviewStatusStats.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${getStatusBgColor(item.label)} text-center`}
              >
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm mt-1 opacity-80">
                  {getStatusLabel(item.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 上架状态图 */}
      {shelfStatusStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            上架状态分布
          </h3>
          <div className="flex items-center justify-around">
            {shelfStatusStats.map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke={getShelfColor(item.label)}
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${calculatePercentage(item.value, shelfStatusStats) * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {getShelfLabel(item.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 辅助函数
function calculatePercentage(value: number, total: number): number {
  const sum = total.reduce((acc, item) => acc + item.value, 0);
  return sum > 0 ? Math.round((value / sum) * 100) : 0;
}

function getCategoryColor(index: number): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
  ];
  return colors[index % colors.length];
}

function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
    case '待审核':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
    case '已通过':
      return 'bg-green-100 text-green-800';
    case 'rejected':
    case '已驳回':
      return 'bg-red-100 text-red-800';
    case 'draft':
    case '草稿':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

function getShelfColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'on_shelf':
    case '已上架':
      return '#10b981'; // green-500
    case 'off_shelf':
    case '已下架':
      return '#6b7280'; // gray-500
    case 'suspended':
    case '已暂停':
      return '#ef4444'; // red-500
    default:
      return '#3b82f6'; // blue-500
  }
}

function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return '待审核';
    case 'approved':
      return '已通过';
    case 'rejected':
      return '已驳回';
    case 'draft':
      return '草稿';
    default:
      return status;
  }
}

function getShelfLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'on_shelf':
      return '已上架';
    case 'off_shelf':
      return '已下架';
    case 'suspended':
      return '已暂停';
    default:
      return status;
  }
}
