/**
 * 租户功能演示页面
 * 展示 TenantSwitcher 组件和多租户功能
 */

'use client';

import TenantSwitcher from '@/components/TenantSwitcher';
import { useState, useEffect } from 'react';

export default function TenantDemoPage() {
  const [currentTenant, setCurrentTenant] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 监听租户切换事件
  useEffect(() => {
    const handleTenantChange = (event: CustomEvent) => {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('租户已切?', event.detail)setCurrentTenant(event.detail.tenantId);
      loadTenantData(event.detail.tenantId);
    };

    window.addEventListener('tenantChanged', handleTenantChange as EventListener);
    
    // 初始化当前租?
    const initTenantId = getCurrentTenantId();
    if (initTenantId) {
      setCurrentTenant(initTenantId);
      loadTenantData(initTenantId);
    }

    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange as EventListener);
    };
  }, []);

  const getCurrentTenantId = (): string | null => {
    // 检?cookie
    const cookieMatch = document.cookie.match(/current-tenant-id=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    
    // 检?localStorage
    return localStorage.getItem('current-tenant-id');
  };

  const loadTenantData = async (tenantId: string) => {
    setIsLoading(true);
    try {
      // 这里可以加载特定租户的数?
      // 模拟加载数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTenantData({
        tenantId,
        name: `租户 ${tenantId.substring(0, 8)}`,
        data: [
          { id: 1, name: '示例数据 1', value: Math.random() },
          { id: 2, name: '示例数据 2', value: Math.random() },
          { id: 3, name: '示例数据 3', value: Math.random() }
        ],
        stats: {
          total: 156,
          active: 142,
          pending: 14
        }
      });
    } catch (error) {
      console.error('加载租户数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">多租户功能演?/h1>
              <p className="text-gray-600">展示租户切换和数据隔离功?/p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                当前租户: {currentTenant ? currentTenant.substring(0, 8) : '未选择'}
              </span>
              <TenantSwitcher />
            </div>
          </div>
        </div>

        {/* 租户信息展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">租户统计</h3>
            {tenantData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">总数</span>
                  <span className="font-medium">{tenantData.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">活跃</span>
                  <span className="font-medium text-green-600">{tenantData.stats.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">待处?/span>
                  <span className="font-medium text-yellow-600">{tenantData.stats.pending}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                {isLoading ? '加载?..' : '请选择租户查看数据'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">租户数据</h3>
            {tenantData ? (
              <div className="space-y-3">
                {tenantData.data.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {item.value.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                {isLoading ? '加载?..' : '请选择租户查看数据'}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">租户信息</h3>
            {tenantData ? (
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">租户ID</span>
                  <div className="font-mono text-sm mt-1 p-2 bg-gray-50 rounded break-all">
                    {tenantData.tenantId}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">租户名称</span>
                  <div className="mt-1 font-medium">{tenantData.name}</div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">数据已按租户隔离</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                {isLoading ? '加载?..' : '请选择租户查看信息'}
              </div>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">功能说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🔑 租户切换</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>�?点击右上角租户选择?/li>
                <li>�?从下拉列表中选择目标租户</li>
                <li>�?系统自动切换并保存选择</li>
                <li>�?页面数据实时更新</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🔒 数据隔离</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>�?每个租户只能看到自己的数?/li>
                <li>�?后端通过 RLS 策略强制隔离</li>
                <li>�?Cookie �?localStorage 同步租户状?/li>
                <li>�?支持跨页面租户状态保?/li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">�?技术特?/h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>�?基于 Supabase RLS 策略</li>
                <li>�?Cookie + localStorage 双重存储</li>
                <li>�?自定义事件通知机制</li>
                <li>�?响应式设计支持移动端</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">📋 使用场景</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>�?SaaS 多客户数据隔?/li>
                <li>�?企业内部多部门管?/li>
                <li>�?合作伙伴独立空间</li>
                <li>�?测试/生产环境分离</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
