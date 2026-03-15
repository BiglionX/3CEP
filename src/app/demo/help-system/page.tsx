'use client';

import {
  HelpLink,
  ContextualHelp,
  PageHelpNavigation,
  QuickHelpButton,
} from '@/components/ui/HelpLink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Shield,
  BarChart3,
  Settings,
  Database,
  Monitor,
} from 'lucide-react';

export default function HelpDemoPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">帮助系统演示</h1>

      {/* 页面级帮助导航*/}
      <PageHelpNavigation
        pageTitle="用户管理"
        sections={[
          {
            id: 'user-management-guide',
            title: '用户管理指南',
            icon: <User className="w-4 h-4" />,
          },
          {
            id: 'rbac-permissions-guide',
            title: '权限管理',
            icon: <Shield className="w-4 h-4" />,
          },
          {
            id: 'data-center-user-guide',
            title: '数据中心',
            icon: <Database className="w-4 h-4" />,
          },
        ]}
      />

      {/* 上下文帮助示例*/}
      <div className="mb-8">
        <ContextualHelp section="user-management" feature="用户列表" />
      </div>

      {/* 不同变体HelpLink 示例 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>内联帮助链接</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              这是一个普通的文本段落，其中包含{' '}
              <HelpLink href="/docs/guides/user-management-guide.md">
                用户管理帮助
              </HelpLink>
                          </p>
            <p>
              你也可以为特定功能添加帮助：
              <HelpLink href="/docs/role-guides/admin.md" topic="权限分配">
                权限分配说明
              </HelpLink>
                          </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>按钮样式帮助</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <HelpLink
                href="/docs/guides/quick-start-guide.md"
                variant="button"
              >
                快速开始指              </HelpLink>
              <HelpLink
                href="/docs/technical-docs/architecture-design.md"
                variant="button"
                external
              >
                技术架构文              </HelpLink>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图标按钮帮助示例 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>图标帮助按钮</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span>在工具栏中使用图标帮助：</span>
            <HelpLink
              href="/docs/deployment/deployment-checklist.md"
              variant="icon"
              aria-label="部署检查清单帮
            />
            <HelpLink
              href="/docs/guides/backup-strategy-guide.md"
              variant="icon"
              aria-label="备份策略帮助"
            />
          </div>
        </CardContent>
      </Card>

      {/* 关键页面集成示例 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              用户管理页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <HelpLink
                href="/docs/guides/user-management-guide.md"
                variant="button"
                className="w-full"
              >
                用户管理操作指南
              </HelpLink>
              <HelpLink
                href="/docs/role-guides/admin.md#用户管理"
                variant="inline"
              >
                管理员权限说              </HelpLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              权限配置页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <HelpLink
                href="/docs/guides/rbac-permissions-guide.md"
                variant="button"
                className="w-full"
              >
                RBAC权限配置指南
              </HelpLink>
              <HelpLink
                href="/docs/role-guides/ops.md#权限管理"
                variant="inline"
              >
                运维权限说明
              </HelpLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              数据分析页面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <HelpLink
                href="/docs/role-guides/analyst.md"
                variant="button"
                className="w-full"
              >
                数据分析师操作手              </HelpLink>
              <HelpLink
                href="/docs/guides/data-center-user-guide.md"
                variant="inline"
              >
                数据中心使用指南
              </HelpLink>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速帮助按钮*/}
      <QuickHelpButton />
    </div>
  );
}

