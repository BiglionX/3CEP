/**
 * 租户切换器组件
 * 允许用户在多个租户之间切换
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Building, Check } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  userRole: string;
  isPrimary: boolean;
  joinedAt: string;
}

export default function TenantSwitcher() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载用户可访问的租户列表
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/tenants');
      
      if (!response.ok) {
        throw new Error('获取租户列表失败');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTenants(result.data);
        
        // 从 cookie 或 localStorage 获取当前租户
        const currentTenantId = getCurrentTenantId();
        const current = result.data.find((t: Tenant) => t.id === currentTenantId) || 
                       result.data.find((t: Tenant) => t.isPrimary) ||
                       result.data[0];
        
        if (current) {
          setCurrentTenant(current);
          // 设置当前租户 cookie
          document.cookie = `current-tenant-id=${current.id}; path=/; max-age=604800`;
        }
      } else {
        throw new Error(result.error || '获取租户列表失败');
      }
      
    } catch (err: any) {
      console.error('加载租户列表失败:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTenantId = (): string | null => {
    // 检查 cookie
    const cookieMatch = document.cookie.match(/current-tenant-id=([^;]+)/);
    if (cookieMatch) {
      return cookieMatch[1];
    }
    
    // 检查 localStorage
    return localStorage.getItem('current-tenant-id');
  };

  const switchTenant = async (tenant: Tenant) => {
    try {
      const response = await fetch('/api/user/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId: tenant.id }),
      });
      
      if (!response.ok) {
        throw new Error('切换租户失败');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentTenant(tenant);
        setIsOpen(false);
        
        // 保存到 localStorage 作为备份
        localStorage.setItem('current-tenant-id', tenant.id);
        
        // 触发自定义事件通知其他组件
        window.dispatchEvent(new CustomEvent('tenantChanged', {
          detail: { tenantId: tenant.id, tenantName: tenant.name }
        }));
        
        // 可选：刷新页面或重新加载数据
        // window.location.reload();
      } else {
        throw new Error(result.error || '切换租户失败');
      }
      
    } catch (err: any) {
      console.error('切换租户失败:', err);
      alert(`切换租户失败: ${err.message}`);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'admin': '管理员',
      'member': '成员',
      'viewer': '查看者',
      'owner': '拥有者'
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100">
        <Building className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-red-50 border border-red-200">
        <Building className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-600">加载失败</span>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100">
        <Building className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">无可用租户</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 当前租户显示 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Building className="w-4 h-4 text-gray-600" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
            {currentTenant.name}
          </div>
          <div className="text-xs text-gray-500">
            {getRoleDisplayName(currentTenant.userRole)}
            {currentTenant.isPrimary && ' · 主租户'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 租户列表 */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                选择租户
              </div>
              
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  onClick={() => switchTenant(tenant)}
                  className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-50 ${
                    tenant.id === currentTenant.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {tenant.name}
                      </span>
                      {tenant.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          主
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {tenant.code}
                      {tenant.description && ` · ${tenant.description}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getRoleDisplayName(tenant.userRole)}
                    </div>
                  </div>
                  
                  {tenant.id === currentTenant.id && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            {/* 底部信息 */}
            <div className="border-t border-gray-100 px-4 py-2">
              <div className="text-xs text-gray-500">
                共 {tenants.length} 个租户
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}