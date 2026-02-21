'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Plus, 
  Edit, 
  Trash2, 
  History, 
  Coins,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: string;
  createdAt: string;
}

interface SmartQuotationPlan {
  id: string;
  orderId: string;
  supplierGroups: Array<{
    supplierId: string;
    supplierName: string;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      unit: string;
    }>;
    estimatedCost: number;
  }>;
  totalEstimatedCost: number;
  quotationCount: number;
  fcxConsumption: number;
  executionTime: string;
}

interface Modification {
  type: 'add' | 'remove' | 'modify';
  productId?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  oldQuantity?: number;
}

export function SmartProcurementAgent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [quotationPlans, setQuotationPlans] = useState<SmartQuotationPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SmartQuotationPlan | null>(null);
  const [modifications, setModifications] = useState<Modification[]>([]);
  const [useHistoricalSuppliers, setUseHistoricalSuppliers] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fcxEstimate, setFcxEstimate] = useState<any>(null);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [showModifyDialog, setShowModifyDialog] = useState<boolean>(false);

  // 模拟获取历史订单
  useEffect(() => {
    loadHistoricalOrders();
  }, []);

  const loadHistoricalOrders = async () => {
    try {
      // 模拟API调用
      const mockOrders: Order[] = [
        {
          id: 'order-001',
          orderNumber: 'PO-2024-001',
          items: [
            {
              id: 'item-001',
              productId: 'prod-001',
              productName: '电子元件A',
              quantity: 100,
              unit: '件',
              unitPrice: 50
            },
            {
              id: 'item-002',
              productId: 'prod-002',
              productName: '连接器B',
              quantity: 50,
              unit: '个',
              unitPrice: 30
            }
          ],
          status: 'completed',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: 'order-002',
          orderNumber: 'PO-2024-002',
          items: [
            {
              id: 'item-003',
              productId: 'prod-003',
              productName: '传感器C',
              quantity: 200,
              unit: '个',
              unitPrice: 25
            }
          ],
          status: 'delivered',
          createdAt: '2024-01-20T14:15:00Z'
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('加载历史订单失败:', error);
    }
  };

  const handleCreateSmartQuotation = async () => {
    if (!selectedOrderId) {
      alert('请选择一个历史订单');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/b2b-procurement/smart-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_smart_quotation',
          orderId: selectedOrderId,
          userId: 'current-user-id', // 实际项目中从认证获取
          useHistoricalSuppliersOnly: useHistoricalSuppliers,
          modifications: modifications.length > 0 ? modifications : undefined
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setQuotationPlans([result.quotationPlan]);
        setFcxEstimate(result.fcxEstimate);
        setSelectedPlan(result.quotationPlan);
        alert('智能询价计划创建成功！');
      } else {
        alert(`创建失败: ${result.errorMessage}`);
      }
    } catch (error) {
      console.error('创建智能询价计划错误:', error);
      alert('创建失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuotation = async () => {
    if (!selectedPlan) {
      alert('请先创建询价计划');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/b2b-procurement/smart-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute_quotation',
          quotationPlan: selectedPlan,
          userId: 'current-user-id'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setExecutionResult(result);
        alert(`询价执行成功！消耗 ${result.totalFcxConsumed} FCX`);
      } else {
        alert(`执行失败: ${result.errorMessage}`);
      }
    } catch (error) {
      console.error('执行询价错误:', error);
      alert('执行失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModification = () => {
    setModifications([
      ...modifications,
      {
        type: 'add',
        productId: '',
        productName: '',
        quantity: 0,
        unit: '件'
      }
    ]);
  };

  const handleRemoveModification = (index: number) => {
    const newModifications = [...modifications];
    newModifications.splice(index, 1);
    setModifications(newModifications);
  };

  const handleModificationChange = (index: number, field: string, value: any) => {
    const newModifications = [...modifications];
    (newModifications[index] as any)[field] = value;
    setModifications(newModifications);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; text: string }> = {
      draft: { variant: 'secondary', text: '草稿' },
      sent: { variant: 'default', text: '已发送' },
      completed: { variant: 'success', text: '已完成' },
      cancelled: { variant: 'destructive', text: '已取消' }
    };
    
    const config = statusMap[status] || { variant: 'secondary', text: status };
    return (
      <Badge variant={config.variant as any}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">智能采购代理</h1>
        <div className="flex items-center space-x-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">FCX智能询价系统</span>
        </div>
      </div>

      {/* 主要操作区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-blue-500" />
            基于历史订单的智能询价
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 订单选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="order-select" className="block text-sm font-medium text-gray-700 mb-1">
                选择历史订单
              </label>
              <select 
                id="order-select"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择一个历史订单</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} ({order.items.length}项商品)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="historical-suppliers"
                  checked={useHistoricalSuppliers}
                  onChange={(e) => setUseHistoricalSuppliers(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="historical-suppliers" className="text-sm text-gray-700">
                  仅使用历史供应商
                </label>
              </div>
              
              <Button 
                onClick={handleCreateSmartQuotation}
                disabled={!selectedOrderId || isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    生成智能询价计划
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 订单修改 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">订单修改</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddModification}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加修改
              </Button>
            </div>
            
            {modifications.length > 0 && (
              <div className="space-y-3">
                {modifications.map((mod, index) => (
                  <div key={index} className="flex items-end space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        修改类型
                      </label>
                      <select 
                        value={mod.type} 
                        onChange={(e) => handleModificationChange(index, 'type', e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="add">新增商品</option>
                        <option value="remove">删除商品</option>
                        <option value="modify">修改数量</option>
                      </select>
                    </div>
                    
                    {(mod.type === 'add' || mod.type === 'modify') && (
                      <>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            商品名称
                          </label>
                          <input
                            type="text"
                            value={mod.productName || ''}
                            onChange={(e) => handleModificationChange(index, 'productName', e.target.value)}
                            placeholder="输入商品名称"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="w-24">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            数量
                          </label>
                          <input
                            type="number"
                            value={mod.quantity || 0}
                            onChange={(e) => handleModificationChange(index, 'quantity', parseInt(e.target.value))}
                            placeholder="数量"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="w-20">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            单位
                          </label>
                          <input
                            type="text"
                            value={mod.unit || '件'}
                            onChange={(e) => handleModificationChange(index, 'unit', e.target.value)}
                            placeholder="单位"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveModification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FCX消耗预估 */}
      {fcxEstimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-500" />
              FCX消耗预估
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">预计消耗</p>
                <p className="text-2xl font-bold text-blue-800">{fcxEstimate.totalCost} FCX</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">当前余额</p>
                <p className="text-2xl font-bold text-green-800">{fcxEstimate.currentBalance} FCX</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600">余额状态</p>
                <p className="text-2xl font-bold text-orange-800">
                  {fcxEstimate.canAfford ? '充足' : '不足'}
                </p>
              </div>
            </div>
            
            {fcxEstimate.breakdown && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">费用明细:</h4>
                <ul className="space-y-1 text-sm">
                  {fcxEstimate.breakdown.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.item}</span>
                      <span className={item.cost >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.cost >= 0 ? '+' : ''}{item.cost} FCX
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 询价计划展示 */}
      {quotationPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>智能询价计划</CardTitle>
          </CardHeader>
          <CardContent>
            {quotationPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">询价计划 #{plan.id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600">
                      供应商组数: {plan.supplierGroups.length} | 
                      预计总成本: ¥{plan.totalEstimatedCost.toLocaleString()} |
                      FCX消耗: {plan.fcxConsumption}
                    </p>
                  </div>
                  <Button 
                    onClick={handleExecuteQuotation}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? '执行中...' : '执行询价'}
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          供应商
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          商品项数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          预计成本
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plan.supplierGroups.map((group, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {group.supplierName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {group.items.length} 项
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ¥{group.estimatedCost.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              待执行
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 执行结果 */}
      {executionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              询价执行结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">成功执行</p>
                <p className="text-2xl font-bold text-green-800">
                  {executionResult.executedRequests.length} 个
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">FCX消耗</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {executionResult.totalFcxConsumed} FCX
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">执行状态</p>
                <p className="text-2xl font-bold text-blue-800">完成</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}