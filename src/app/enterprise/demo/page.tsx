/**
 * 企业服务完整功能演示页面
 * 展示权限控制、表单验证、状态管理和组件复用
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Building, 
  Bot, 
  ShoppingCart, 
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EnterpriseLayout } from '@/components/enterprise/EnterpriseLayout'
import { DataTable } from '@/components/common/DataTable'
import { LoadingState, useAsyncData } from '@/components/common/LoadingState'
import { useToast } from '@/components/common/Notifications'
import { PurchaseOrderForm } from '@/components/forms/PurchaseOrderForm'
import { EnterpriseApi } from '@/services/api-client'
import { useValidation } from '@/lib/validation'

// 模拟数据类型
interface DemoData {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  value: number
}

export default function EnterpriseDemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { showSuccess, showError, showWarning } = useToast()
  const { validateForm } = useValidation()

  // 使用异步数据加载Hook
  const { 
    data: dashboardData, 
    loading: dashboardLoading, 
    error: dashboardError,
    retry: retryDashboard 
  } = useAsyncData(async () => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      totalOrders: 24,
      totalAgents: 8,
      totalSuppliers: 12,
      revenue: 1250000
    }
  }, [])

  // 模拟表格数据
  const [tableData, setTableData] = useState<DemoData[]>([
    { id: '1', name: '智能客服机器人', status: 'active', createdAt: '2024-01-15', value: 125000 },
    { id: '2', name: '采购管理系统', status: 'active', createdAt: '2024-01-16', value: 89000 },
    { id: '3', name: '供应商对接平台', status: 'pending', createdAt: '2024-01-14', value: 245000 },
    { id: '4', name: '数据分析看板', status: 'inactive', createdAt: '2024-01-13', value: 67500 }
  ])

  const tableColumns = [
    {
      key: 'name',
      title: '服务名称',
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'status',
      title: '状态',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'active' ? '运行中' : value === 'pending' ? '待启动' : '已停止'}
        </span>
      )
    },
    {
      key: 'value',
      title: '价值',
      render: (value: number) => `¥${value.toLocaleString()}`
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ]

  const tableActions = [
    {
      label: '查看详情',
      onClick: (record: DemoData) => {
        showInfo('查看详情', `正在查看 ${record.name}`)
      }
    },
    {
      label: '编辑',
      onClick: (record: DemoData) => {
        showWarning('编辑功能', `准备编辑 ${record.name}`)
      },
      condition: (record: DemoData) => record.status !== 'inactive'
    },
    {
      label: '删除',
      onClick: (record: DemoData) => {
        showError('删除确认', `确定要删除 ${record.name} 吗？`)
      },
      condition: (record: DemoData) => record.status === 'inactive'
    }
  ]

  // 处理表单提交示例
  const handleFormSubmit = async (data: any) => {
    try {
      // 这里可以调用实际的API
      console.log('表单数据:', data)
      showSuccess('提交成功', '采购订单已成功创建')
    } catch (error) {
      showError('提交失败', '请检查网络连接后重试')
    }
  }

  const tabs = [
    { id: 'dashboard', name: '仪表板', icon: Building },
    { id: 'services', name: '服务管理', icon: Bot },
    { id: 'orders', name: '采购订单', icon: ShoppingCart },
    { id: 'form', name: '表单示例', icon: Users }
  ]

  return (
    <EnterpriseLayout title="企业服务演示">
      {/* 标签导航 */}
      <div className="border-b bg-white mb-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 仪表板内容 */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <LoadingState
            loading={dashboardLoading}
            error={dashboardError}
            onRetry={retryDashboard}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总订单数</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.totalOrders || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">智能体数量</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.totalAgents || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">供应商数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.totalSuppliers || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总收入</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{(dashboardData?.revenue || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </LoadingState>
        </div>
      )}

      {/* 服务管理内容 */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>企业服务列表</CardTitle>
            <CardDescription>
              管理您的企业AI服务和应用
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tableData}
              columns={tableColumns}
              actions={tableActions}
              searchable
              exportable
              refreshable
              onSearch={(value) => {
                console.log('搜索:', value)
              }}
              onExport={() => {
                showInfo('导出功能', '正在准备导出数据...')
              }}
              onRefresh={() => {
                showSuccess('刷新成功', '数据已更新')
              }}
              onRowClick={(record) => {
                showInfo('行点击', `选择了: ${record.name}`)
              }}
              emptyText="暂无服务数据"
            />
          </CardContent>
        </Card>
      )}

      {/* 采购订单内容 */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>采购订单管理</CardTitle>
              <CardDescription>
                创建和管理企业的采购订单
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-800 font-medium">待审批</div>
                  <div className="text-2xl font-bold text-blue-600">12</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-800 font-medium">处理中</div>
                  <div className="text-2xl font-bold text-green-600">8</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-purple-800 font-medium">已完成</div>
                  <div className="text-2xl font-bold text-purple-600">36</div>
                </div>
              </div>
              
              <DataTable
                data={[
                  { id: '1', orderNumber: 'PO-2024-001', supplier: '深圳电子科技', amount: 125000, status: 'pending', date: '2024-01-15' },
                  { id: '2', orderNumber: 'PO-2024-002', supplier: '广州精密制造', amount: 89000, status: 'approved', date: '2024-01-16' }
                ]}
                columns={[
                  { key: 'orderNumber', title: '订单号' },
                  { key: 'supplier', title: '供应商' },
                  { key: 'amount', title: '金额', render: (value: number) => `¥${value.toLocaleString()}` },
                  { key: 'status', title: '状态', render: (value: string) => (
                    <span className={`px-2 py-1 rounded text-xs ${
                      value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      value === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {value === 'pending' ? '待审批' : value === 'approved' ? '已批准' : '未知'}
                    </span>
                  )},
                  { key: 'date', title: '日期' }
                ]}
                actions={[
                  { label: '查看详情', onClick: () => {} },
                  { label: '审批', onClick: () => {}, condition: (record: any) => record.status === 'pending' }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 表单示例内容 */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>表单验证示例</CardTitle>
              <CardDescription>
                展示完整的表单验证和错误处理功能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PurchaseOrderForm />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>通知系统演示</CardTitle>
              <CardDescription>
                点击按钮测试不同类型的通知
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => showSuccess('操作成功', '数据已保存到数据库')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                成功通知
              </Button>
              <Button variant="destructive" onClick={() => showError('操作失败', '请检查输入数据')}>
                <AlertCircle className="w-4 h-4 mr-2" />
                错误通知
              </Button>
              <Button variant="outline" onClick={() => showWarning('注意提醒', '某些字段需要特别注意')}>
                ⚠️ 警告通知
              </Button>
              <Button variant="secondary" onClick={() => useToast().info('系统信息', '这是系统提示信息')}>
                ℹ️ 信息通知
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </EnterpriseLayout>
  )
}