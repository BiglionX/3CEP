/**
 * n8n 权限集成演示页面
 * 展示权限同步和工作流控制功能
 */

import { N8nWorkflowList } from '@/components/admin/N8nWorkflowManager';
import { RoleAwareLayout } from '@/components/admin/RoleAwareLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'n8n 权限集成演示 | 管理后台',
  description: '展示 n8n 工作流权限集成和控制功能',
};

export default function N8nIntegrationDemoPage() {
  return (
    <RoleAwareLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            n8n 权限集成演示
          </h1>
          <p className="text-gray-600">
            展示系统权限?n8n 工作流平台的深度集成
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-yellow-800 mb-2">🚀 功能亮点</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>
              �?<strong>自动权限同步</strong> - 用户角色变更时自动同步到 n8n
            </li>
            <li>
              �?<strong>细粒度控?/strong> - 支持读取、执行、管理三级权?            </li>
            <li>
              �?<strong>实时监控</strong> - 工作流执行状态和权限变更跟踪
            </li>
            <li>
              �?<strong>事件驱动</strong> - 基于事件的实时权限更新机?            </li>
          </ul>
        </div>

        <N8nWorkflowList />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 mb-3">📘 使用说明</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">权限同步机制</h4>
              <ul className="space-y-1">
                <li>�?用户角色变更时自动触发同?/li>
                <li>�?�?分钟执行定期一致性检?/li>
                <li>�?支持批量操作和重试机?/li>
                <li>�?完整的审计日志记?/li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">工作流权限控?/h4>
              <ul className="space-y-1">
                <li>�?读取权限：查看工作流定义和状?/li>
                <li>�?执行权限：运行工作流实例</li>
                <li>�?管理权限：修改工作流配置</li>
                <li>�?支持按角色和用户的精确控?/li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </RoleAwareLayout>
  );
}
