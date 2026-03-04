/**
 * React Query 集成测试页面
 * 用于验证缓存和数据获取功?
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Zap, 
  Database, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useWorkOrders, useDeviceTypes, useTechnicians } from '@/hooks/use-repair-shop'

export default function ReactQueryTestPage() {
  const [shopId] = useState('test-shop-001')
  
  // 测试不同的查询钩?
  const workOrdersQuery = useWorkOrders(
    { status: undefined },
    { page: 1, pageSize: 5 }
  )
  
  const deviceTypesQuery = useDeviceTypes()
  const techniciansQuery = useTechnicians(shopId)

  const refetchAll = () => {
    workOrdersQuery.refetch()
    deviceTypesQuery.refetch()
    techniciansQuery.refetch()
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">React Query 集成测试</h1>
        <p className="text-gray-600">验证数据缓存、自动刷新和错误处理功能</p>
      </div>

      {/* 控制面板 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            测试控制面板
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={refetchAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重新获取所有数?
            </Button>
            <Button 
              variant="outline" 
              onClick={() => workOrdersQuery.refetch()}
            >
              <Database className="h-4 w-4 mr-2" />
              清除工单缓存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 工单数据测试 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                工单数据
              </span>
              <Badge variant={workOrdersQuery.isLoading ? "secondary" : workOrdersQuery.isError ? "destructive" : "default"}>
                {workOrdersQuery.isLoading ? '加载? : workOrdersQuery.isError ? '错误' : '就绪'}
              </Badge>
            </CardTitle>
            <CardDescription>
              测试分页数据获取和缓?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>数据状?</span>
                <div className="flex items-center gap-2">
                  {workOrdersQuery.isSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {workOrdersQuery.isError && <XCircle className="h-4 w-4 text-red-500" />}
                  <span>
                    {workOrdersQuery.isLoading ? '加载?..' : 
                     workOrdersQuery.isError ? '加载失败' : 
                     workOrdersQuery.isSuccess ? `成功加载 ${workOrdersQuery.(data as any)?.length || 0} 条记录` : 
                     '未加?}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>缓存状?</span>
                <Badge variant="outline">
                  {workOrdersQuery.isStale ? '过期' : '新鲜'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>获取时间:</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {workOrdersQuery.dataUpdatedAt ? 
                    new Date(workOrdersQuery.dataUpdatedAt).toLocaleTimeString() : 
                    '从未获取'}
                </span>
              </div>

              {workOrdersQuery.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    错误信息: {(workOrdersQuery.error as Error)?.message || '未知错误'}
                  </p>
                </div>
              )}

              {workOrdersQuery.isSuccess && workOrdersQuery.data && (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                  <h4 className="font-medium mb-2">工单列表:</h4>
                  <ul className="space-y-1 text-sm">
                    {workOrdersQuery.data.slice(0, 3).map((order: any) => (
                      <li key={order.id} className="flex justify-between">
                        <span className="truncate">{order.orderNumber || order.id}</span>
                        <Badge variant="secondary">{order.status}</Badge>
                      </li>
                    ))}
                    {workOrdersQuery.data.length > 3 && (
                      <li className="text-gray-500 text-xs">...还有 {workOrdersQuery.data.length - 3} �?/li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 设备类型测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                设备类型
              </span>
              <Badge variant={deviceTypesQuery.isLoading ? "secondary" : deviceTypesQuery.isError ? "destructive" : "default"}>
                {deviceTypesQuery.isLoading ? '加载? : deviceTypesQuery.isError ? '错误' : '就绪'}
              </Badge>
            </CardTitle>
            <CardDescription>
              测试静态数据缓?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>数据状?</span>
                <div className="flex items-center gap-2">
                  {deviceTypesQuery.isSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {deviceTypesQuery.isError && <XCircle className="h-4 w-4 text-red-500" />}
                  <span>
                    {deviceTypesQuery.isLoading ? '加载?..' : 
                     deviceTypesQuery.isError ? '加载失败' : 
                     deviceTypesQuery.isSuccess ? `成功加载 ${deviceTypesQuery.(data as any)?.length || 0} 条记录` : 
                     '未加?}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>缓存时间:</span>
                <Badge variant="outline">
                  30分钟
                </Badge>
              </div>

              {deviceTypesQuery.isSuccess && deviceTypesQuery.data && (
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium mb-2">设备分类:</h4>
                  <div className="flex flex-wrap gap-2">
                    {deviceTypesQuery.data.slice(0, 5).map((device: any) => (
                      <Badge key={device.id} variant="outline">
                        {device.category || device.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 缓存统计信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            缓存统计信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workOrdersQuery.fetchStatus === 'fetching' ? '...' : workOrdersQuery.(data as any)?.length || 0}
              </div>
              <div className="text-sm text-gray-600">工单记录</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {deviceTypesQuery.fetchStatus === 'fetching' ? '...' : deviceTypesQuery.(data as any)?.length || 0}
              </div>
              <div className="text-sm text-gray-600">设备类型</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {techniciansQuery.fetchStatus === 'fetching' ? '...' : techniciansQuery.(data as any)?.length || 0}
              </div>
              <div className="text-sm text-gray-600">技师数?/div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {[
                  workOrdersQuery.isFetching,
                  deviceTypesQuery.isFetching,
                  techniciansQuery.isFetching
                ].filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">正在获取</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
