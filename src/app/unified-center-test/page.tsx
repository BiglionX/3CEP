'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UserSidebarNavigation from '@/components/user/UserSidebarNavigation'
import DynamicModuleMenu from '@/components/user/DynamicModuleMenu'
import { 
  moduleRegistry, 
  getAllModules, 
  getModulesByCategory,
  getModulesByPermissions
} from '@/lib/module-registry'
import { useUnifiedAuth } from '@/hooks/use-unified-auth'

export default function UnifiedCenterTestPage() {
  const { is_admin } = useUnifiedAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // 获取统计信息
  const allModules = getAllModules()
  const businessModules = getModulesByCategory('business')
  const managementModules = getModulesByCategory('management')
  const personalModules = getModulesByCategory('personal')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">统一用户中心测试</h1>
              {is_admin && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  管理员模式
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏导航 */}
        <UserSidebarNavigation />

        {/* 主内容区 */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* 标签页导航 */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">概览</TabsTrigger>
                  <TabsTrigger value="modules">模块管理</TabsTrigger>
                  <TabsTrigger value="navigation">导航测试</TabsTrigger>
                  <TabsTrigger value="settings">设置</TabsTrigger>
                </TabsList>

                {/* 概览标签页 */}
                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">统一用户中心概览</h2>
                    <p className="text-gray-600">查看当前用户中心的各项功能和模块状态</p>
                  </div>

                  {/* 统计卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总模块数</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{allModules.length}</div>
                        <p className="text-xs text-gray-500">所有可用功能模块</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">业务模块</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{businessModules.length}</div>
                        <p className="text-xs text-gray-500">核心业务功能</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">管理模块</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{managementModules.length}</div>
                        <p className="text-xs text-gray-500">系统管理功能</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">个人模块</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{personalModules.length}</div>
                        <p className="text-xs text-gray-500">个人设置功能</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 模块分类展示 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>模块分类统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h3 className="font-medium text-gray-900">业务功能模块</h3>
                          <ul className="space-y-2">
                            {businessModules.slice(0, 5).map(module => (
                              <li key={module.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{module.name}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {module.path}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium text-gray-900">管理功能模块</h3>
                          <ul className="space-y-2">
                            {managementModules.slice(0, 5).map(module => (
                              <li key={module.id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{module.name}</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {module.path}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 模块管理标签页 */}
                <TabsContent value="modules" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">模块管理</h2>
                    <p className="text-gray-600">查看和测试模块注册系统的功能</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>动态模块菜单测试</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg p-4">
                        <DynamicModuleMenu 
                          mode="full"
                          showSearch={true}
                          showFilters={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 导航测试标签页 */}
                <TabsContent value="navigation" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">导航组件测试</h2>
                    <p className="text-gray-600">测试侧边栏导航组件的各种功能</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>紧凑模式</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-4 h-96">
                          <DynamicModuleMenu 
                            mode="compact"
                            showSearch={false}
                            showFilters={false}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>图标模式</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg p-4 h-96">
                          <DynamicModuleMenu 
                            mode="icons"
                            showSearch={false}
                            showFilters={false}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* 设置标签页 */}
                <TabsContent value="settings" className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">系统设置</h2>
                    <p className="text-gray-600">统一用户中心的相关配置</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>权限配置</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">管理员权限</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            is_admin 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {is_admin ? '已启用' : '未启用'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">模块访问控制</span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            已启用
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>系统信息</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">模块注册总数:</span>
                          <span className="font-medium">{allModules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">启用模块:</span>
                          <span className="font-medium">
                            {allModules.filter(m => m.enabled).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">分类数量:</span>
                          <span className="font-medium">4</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}