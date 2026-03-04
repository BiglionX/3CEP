/**
 * 增强版RBAC权限系统演示页面
 * 展示完整的权限管理、角色配置和访问控制功能
 */

'use client';

import { useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  EnhancedRbacProvider,
  useEnhancedRbac,
  PermissionGuard,
  RoleGuard,
} from '@/components/enhanced-rbac/EnhancedRbacManager';
import { PermissionManagementPanel } from '@/components/enhanced-rbac/PermissionManagementPanel';
import { RoleManagementPanel } from '@/components/enhanced-rbac/RoleManagementPanel';

// 模拟用户权限上下?const MOCK_USER_CONTEXT = {
  userId: 'user_123',
  roles: ['manager'],
  directPermissions: ['dashboard_read'],
  effectivePermissions: ['dashboard_read', 'users_read', 'users_create'],
  tenantId: 'tenant_001',
  department: 'IT部门',
  position: '系统管理?,
};

// 演示业务组件
function DemoBusinessComponents() {
  const {
    hasPermission,
    canAccessResource,
    checkConditionalPermission,
    batchCheckPermissions,
    getMissingPermissions,
  } = useEnhancedRbac();

  const [conditionalResult, setConditionalResult] = useState<any>(null);
  const [batchResult, setBatchResult] = useState<Record<string, boolean>>({});

  // 测试条件权限
  const testConditionalPermission = async () => {
    const result = await checkConditionalPermission('users_create', {
      workingHoursOnly: true,
      department: 'IT部门',
    });
    setConditionalResult(result);
  };

  // 测试批量权限检?  const testBatchPermissions = () => {
    const permissionsToCheck = [
      'dashboard_read',
      'users_create',
      'users_delete',
      'settings_update',
    ];
    const results = batchCheckPermissions(permissionsToCheck);
    setBatchResult(results);

    const missing = getMissingPermissions(permissionsToCheck);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('缺少的权?', missing)};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            权限检查演?          </CardTitle>
          <CardDescription>实时展示各种权限检查功能的效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基础权限检?*/}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">基础权限检?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>仪表板查看权?/span>
                  {hasPermission('dashboard_read') ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>用户管理权限</span>
                  {canAccessResource('users', 'create') ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>系统设置权限</span>
                  {hasPermission('settings_update') ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 条件权限检?*/}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">条件权限检?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testConditionalPermission} className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  测试条件权限
                </Button>

                {conditionalResult && (
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      {conditionalResult.allowed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">检查结?/span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {conditionalResult.reason || '权限检查完?}
                    </p>
                    {conditionalResult.requiresApproval && (
                      <Badge className="mt-2" variant="destructive">
                        需要审?                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 批量权限检?*/}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                批量权限检?              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testBatchPermissions}>执行批量检?/Button>

                {Object.keys(batchResult).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(batchResult).map(([perm, allowed]) => (
                      <div key={perm} className="p-3 border rounded">
                        <div className="text-sm font-medium truncate mb-1">
                          {perm}
                        </div>
                        <div className="flex items-center gap-1">
                          {allowed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs">
                            {allowed ? '允许' : '拒绝'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 权限保护组件演示 */}
      <Card>
        <CardHeader>
          <CardTitle>权限保护组件演示</CardTitle>
          <CardDescription>
            展示如何使用权限保护组件控制UI元素的可见?          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 权限保护 */}
          <PermissionGuard permission="users_create">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  用户创建功能可见
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                因为您拥?users_create 权限，所以可以看到这个受保护的内?              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard
            permission={['settings_update', 'audit_read']}
            requireAll={false}
          >
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  系统管理功能可见
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                因为您拥有系统管理相关权限之一，所以可以看到这个内?              </p>
            </div>
          </PermissionGuard>

          <PermissionGuard
            resource="procurement"
            action="approve"
            fallback={
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    采购审批功能不可?                  </span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  因为您没?procurement_approve 权限，所以这个功能被隐藏?                </p>
              </div>
            }
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  采购审批功能可见
                </span>
              </div>
            </div>
          </PermissionGuard>

          {/* 角色保护 */}
          <RoleGuard
            roles={['admin', 'manager']}
            fallback={
              <div className="p-4 bg-gray-100 rounded text-gray-500">
                此内容仅对管理员和经理可?              </div>
            }
          >
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">
                  管理功能区域
                </span>
              </div>
              <p className="text-sm text-purple-600 mt-1">
                作为管理员，您可以访问这些高级管理功?              </p>
            </div>
          </RoleGuard>
        </CardContent>
      </Card>
    </div>
  );
}

// 主演示组?function EnhancedRbacDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            增强版RBAC权限系统
          </h1>
          <p className="text-gray-600">
            基于角色的访问控制增强版，提供细粒度权限管理、动态授权和继承机制
          </p>
        </div>

        {/* 功能特性卡?*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5" />
                细粒度权?              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                支持资源级和操作级的精细权限控制
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                角色继承
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                支持角色间的继承关系，简化权限管?              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                动态授?              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                支持临时权限分配和条件访问控?              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                审计追踪
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                完整的权限操作日志和审计功能
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo">功能演示</TabsTrigger>
            <TabsTrigger value="permissions">权限管理</TabsTrigger>
            <TabsTrigger value="roles">角色管理</TabsTrigger>
            <TabsTrigger value="audit">审计日志</TabsTrigger>
          </TabsList>

          <TabsContent value="demo">
            <DemoBusinessComponents />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionManagementPanel />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagementPanel />
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>权限审计日志</CardTitle>
                <CardDescription>
                  系统权限操作的历史记录和审计信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>审计日志功能正在开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 页面导出
export default function EnhancedRbacDemoPage() {
  return (
    <EnhancedRbacProvider currentUser={MOCK_USER_CONTEXT}>
      <EnhancedRbacDemo />
    </EnhancedRbacProvider>
  );
}

