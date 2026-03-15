'use client';

import React from 'react';
import { FcxLevelDisplay } from '@/components/fcx/FcxLevelDisplay';

export default function TestLevelDisplay() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FCX等级展示组件测试
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 青铜级示例 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              青铜级用户
            </h2>
            <FcxLevelDisplay
              userId="test-bronze-user"
              className="shadow-lg"
              showRefresh={true}
            />
          </div>

          {/* 白银级示例 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              白银级用户
            </h2>
            <FcxLevelDisplay
              userId="test-silver-user"
              className="shadow-lg"
              showRefresh={true}
            />
          </div>

          {/* 黄金级示例 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              黄金级用户
            </h2>
            <FcxLevelDisplay
              userId="test-gold-user"
              className="shadow-lg"
              showRefresh={true}
            />
          </div>

          {/* 钻石级示例 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              钻石级用户
            </h2>
            <FcxLevelDisplay
              userId="test-diamond-user"
              className="shadow-lg"
              showRefresh={true}
            />
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">组件说明</h2>
          <div className="prose max-w-none">
            <h3>功能特性：</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>实时显示用户当前等级和综合评分</li>
              <li>可视化进度条展示升级路径</li>
              <li>关键指标卡片展示（评分、订单数、余额等）</li>
              <li>个性化升级建议</li>
              <li>支持手动刷新等级信息</li>
              <li>响应式设计，适配不同屏幕尺寸</li>
            </ul>

            <h3 className="mt-6">等级体系：</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <div className="text-amber-600 font-bold">青铜级</div>
                <div className="text-sm text-gray-600">0-59分</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-gray-600 font-bold">白银级</div>
                <div className="text-sm text-gray-600">60-74分</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-yellow-600 font-bold">黄金级</div>
                <div className="text-sm text-gray-600">75-89分</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-blue-600 font-bold">钻石级</div>
                <div className="text-sm text-gray-600">90-100分</div>
              </div>
            </div>

            <h3 className="mt-6">评分维度：</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>评分占比 30%：</strong>客户评价平均分
              </li>
              <li>
                <strong>完成率占比 25%：</strong>订单完成比例
              </li>
              <li>
                <strong>订单数量占比 20%：</strong>累计完成订单数
              </li>
              <li>
                <strong>服务质量占比 15%：</strong>服务质量和专业度
              </li>
              <li>
                <strong>FCX2余额占比 10%：</strong>持有的FCX2期权数量
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
