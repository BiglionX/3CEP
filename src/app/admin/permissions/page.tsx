'use client';

import { useEffect, useState } from 'react';

/**
 * 角色权限配置页面
 */
export default function PermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // 加载角色和权限
  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    try {
      setLoading(true);

      // 获取所有角色
      const rolesRes = await fetch('/api/admin/roles');
      const rolesData = await rolesRes.json();
      setRoles(rolesData.data || []);

      // 获取所有权限定义
      const permissionsRes = await fetch('/api/admin/permissions');
      const permissionsData = await permissionsRes.json();
      setPermissions(permissionsData.data || []);

      // 默认选择第一个角色
      if (rolesData.data?.length > 0) {
        setSelectedRoleId(rolesData.data[0].id);
      }
    } catch (error) {
      console.error('加载失败:', error);
      alert('加载角色和权限失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存权限配置
  const handleSave = async () => {
    if (!selectedRoleId) return;

    try {
      setSaving(true);

      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: selectedRoleId,
          permissions: getSelectedPermissions(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      alert('✅ 权限配置已保存');
    } catch (error) {
      console.error('保存失败:', error);
      alert(
        `❌ 保存失败：${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setSaving(false);
    }
  };

  // 获取当前选中的权限列表
  const getSelectedPermissions = () => {
    const role = roles.find(r => r.id === selectedRoleId);
    return role?.permissions || [];
  };

  // 切换权限选中状态
  const togglePermission = (permissionId: string, module: string) => {
    const currentPermissions = getSelectedPermissions();
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(p => p !== permissionId)
      : [...currentPermissions, permissionId];

    setRoles(
      roles.map(role =>
        role.id === selectedRoleId
          ? { ...role, permissions: newPermissions }
          : role
      )
    );
  };

  // 全选模块权限
  const selectAllInModule = (module: string) => {
    const modulePermissions = permissions
      .filter(p => p.module === module)
      .map(p => p.id);

    const currentPermissions = getSelectedPermissions();
    const allSelected = modulePermissions.every(p =>
      currentPermissions.includes(p)
    );

    const newPermissions = allSelected
      ? currentPermissions.filter(p => !modulePermissions.includes(p))
      : [...new Set([...currentPermissions, ...modulePermissions])];

    setRoles(
      roles.map(role =>
        role.id === selectedRoleId
          ? { ...role, permissions: newPermissions }
          : role
      )
    );
  };

  // 检查权限是否选中
  const isPermissionSelected = (permissionId: string) => {
    const role = roles.find(r => r.id === selectedRoleId);
    return role?.permissions.includes(permissionId) || false;
  };

  // 检查模块是否全选
  const isModuleAllSelected = (module: string) => {
    const modulePermissions = permissions
      .filter(p => p.module === module)
      .map(p => p.id);

    const currentPermissions = getSelectedPermissions();
    return modulePermissions.every(p => currentPermissions.includes(p));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">角色权限配置</h1>
            <button
              onClick={handleSave}
              disabled={saving || !selectedRoleId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '💾 保存配置'}
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧：角色列表 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">角色列表</h2>
              </div>
              <div className="p-4 space-y-2">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      selectedRoleId === role.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{role.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {role.permissions.length} 个权限
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：权限配置 */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold text-gray-900">
                  权限配置 - {roles.find(r => r.id === selectedRoleId)?.name}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {getModules().map(module => (
                  <div key={module} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {getModuleLabel(module)}
                      </h3>
                      <button
                        onClick={() => selectAllInModule(module)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {isModuleAllSelected(module) ? '取消全选' : '全选'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {permissions
                        .filter(p => p.module === module)
                        .map(permission => (
                          <label
                            key={permission.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isPermissionSelected(permission.id)}
                              onChange={() =>
                                togglePermission(permission.id, module)
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 辅助函数 ====================

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  module: string;
  description?: string;
}

// 获取所有模块
function getModules(): string[] {
  return [
    'skill_management',
    'user_management',
    'system_settings',
    'analytics',
    'content_management',
  ];
}

// 获取模块标签
function getModuleLabel(module: string): string {
  const labels: Record<string, string> = {
    skill_management: '技能管理',
    user_management: '用户管理',
    system_settings: '系统设置',
    analytics: '数据分析',
    content_management: '内容管理',
  };
  return labels[module] || module;
}
