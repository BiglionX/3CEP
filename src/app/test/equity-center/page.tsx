'use client';

import React from 'react';
import { FcxEquityCenter } from '@/components/fcx/FcxEquityCenter';

export default function TestEquityCenter() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          FCX权益中心组件测试
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <FcxEquityCenter userId="test-user-id" className="" showTabs={true} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            组件功能说明
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                主要功能
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>权益商城浏览和搜?/span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>按等级筛选权?/span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>一键兑换权?/span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>我的权益管理</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>兑换历史查看</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">�?/span>
                  <span>实时可用性检?/span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                权益类型示例
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-2xl mr-3">�?/span>
                  <div>
                    <div className="font-medium">优先派单?/div>
                    <div className="text-sm text-gray-600">
                      获得优质订单优先推荐
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-2xl mr-3">🎫</span>
                  <div>
                    <div className="font-medium">服务折扣?/div>
                    <div className="text-sm text-gray-600">
                      享受维修服务费用折扣
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-2xl mr-3">🔧</span>
                  <div>
                    <div className="font-medium">免费检测服?/div>
                    <div className="text-sm text-gray-600">
                      每月一次免费设备检?                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl mr-3">👑</span>
                  <div>
                    <div className="font-medium">VIP专属客服</div>
                    <div className="text-sm text-gray-600">
                      享受一对一专属客服服务
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              技术特?            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">🔄</div>
                <h4 className="font-medium text-gray-800">实时同步</h4>
                <p className="text-sm text-gray-600">权益状态和余额实时更新</p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-medium text-gray-800">权限控制</h4>
                <p className="text-sm text-gray-600">
                  根据用户等级显示可兑换权?                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl mb-2">📱</div>
                <h4 className="font-medium text-gray-800">响应式设?/h4>
                <p className="text-sm text-gray-600">适配各种设备屏幕尺寸</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

