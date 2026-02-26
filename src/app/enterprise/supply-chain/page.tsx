"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  Truck,
  BarChart3,
  Zap,
  RefreshCw
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  category: string;
  reliability: number;
  deliveryTime: number;
  status: 'active' | 'warning' | 'risk';
}

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  status: 'normal' | 'low' | 'out';
}

export default function SupplyChainOptimizationPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const suppliers: Supplier[] = [
    {
      id: 'SUP-001',
      name: '深圳电子科技有限公司',
      category: '电子产品',
      reliability: 96.5,
      deliveryTime: 3,
      status: 'active'
    },
    {
      id: 'SUP-002',
      name: '广州精密制造厂',
      category: '机械零件',
      reliability: 89.2,
      deliveryTime: 5,
      status: 'warning'
    },
    {
      id: 'SUP-003',
      name: '上海包装材料公司',
      category: '包装材料',
      reliability: 92.8,
      deliveryTime: 2,
      status: 'active'
    }
  ];

  const inventoryItems: InventoryItem[] = [
    {
      id: 'INV-001',
      productName: '智能传感器 XYZ-2024',
      sku: 'XYZ-2024-001',
      currentStock: 150,
      minStock: 100,
      maxStock: 500,
      supplier: '深圳电子科技有限公司',
      status: 'normal'
    },
    {
      id: 'INV-002',
      productName: '精密轴承 ABC-123',
      sku: 'ABC-123-002',
      currentStock: 25,
      minStock: 50,
      maxStock: 200,
      supplier: '广州精密制造厂',
      status: 'low'
    },
    {
      id: 'INV-003',
      productName: '包装盒 DEF-456',
      sku: 'DEF-456-003',
      currentStock: 0,
      minStock: 100,
      maxStock: 300,
      supplier: '上海包装材料公司',
      status: 'out'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            供应链智能优化系统
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI驱动的供应链管理和优化系统，实现需求预测、库存优化和供应商协同
          </p>
        </div>

        {/* 导航标签 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['dashboard', 'suppliers', 'inventory', 'demand-forecast'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'dashboard' && '供应链仪表板'}
                {tab === 'suppliers' && '供应商管理'}
                {tab === 'inventory' && '库存优化'}
                {tab === 'demand-forecast' && '需求预测'}
              </button>
            ))}
          </nav>
        </div>

        {/* 供应链仪表板 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 关键指标 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">供应链可见性</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">端到端可视率</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">库存周转率</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8.1</div>
                  <p className="text-xs text-muted-foreground">次/年</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">准时交付率</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">96.8%</div>
                  <p className="text-xs text-muted-foreground">按时交付比例</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">成本节约</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">¥890K</div>
                  <p className="text-xs text-muted-foreground">年度节约金额</p>
                </CardContent>
              </Card>
            </div>

            {/* 供应商健康度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  供应商绩效监控
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">{supplier.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(supplier.status)}`}>
                          {supplier.status === 'active' && '良好'}
                          {supplier.status === 'warning' && '警告'}
                          {supplier.status === 'risk' && '风险'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">可靠性</span>
                          <span className="font-medium">{supplier.reliability}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">交付周期</span>
                          <span className="font-medium">{supplier.deliveryTime}天</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              supplier.reliability > 95 ? 'bg-green-500' : 
                              supplier.reliability > 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${supplier.reliability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 供应商管理 */}
        {activeTab === 'suppliers' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>供应商协作平台</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">供应商列表</h3>
                    <div className="space-y-3">
                      {suppliers.map((supplier) => (
                        <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-gray-600">{supplier.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{supplier.reliability}%</div>
                            <div className="text-xs text-gray-500">可靠性</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">协作功能</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">实时沟通</h4>
                        <p className="text-blue-700 text-sm">
                          与供应商建立实时沟通渠道，快速解决问题
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">绩效评估</h4>
                        <p className="text-green-700 text-sm">
                          定期评估供应商表现，优化合作策略
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">风险管理</h4>
                        <p className="text-purple-700 text-sm">
                          识别潜在供应风险，制定应急预案
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 库存优化 */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>智能库存管理</span>
                  <Button>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新数据
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">产品名称</th>
                        <th className="text-left py-3 px-4">SKU</th>
                        <th className="text-left py-3 px-4">当前库存</th>
                        <th className="text-left py-3 px-4">最低库存</th>
                        <th className="text-left py-3 px-4">最高库存</th>
                        <th className="text-left py-3 px-4">供应商</th>
                        <th className="text-left py-3 px-4">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{item.productName}</td>
                          <td className="py-3 px-4">{item.sku}</td>
                          <td className="py-3 px-4">{item.currentStock}</td>
                          <td className="py-3 px-4">{item.minStock}</td>
                          <td className="py-3 px-4">{item.maxStock}</td>
                          <td className="py-3 px-4">{item.supplier}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInventoryStatusColor(item.status)}`}>
                              {item.status === 'normal' && '正常'}
                              {item.status === 'low' && '库存偏低'}
                              {item.status === 'out' && '缺货'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* 补货建议 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  智能补货建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-yellow-900">紧急补货提醒</h3>
                      <p className="text-yellow-700 text-sm mt-1">
                        产品 "包装盒 DEF-456" 已缺货，建议立即下单 200 件
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Truck className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-900">优化建议</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        建议将 "精密轴承 ABC-123" 的安全库存提高至 80 件，以应对季节性需求增长
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 需求预测 */}
        {activeTab === 'demand-forecast' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>月度需求预测</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>需求预测图表</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>一月预测</span>
                      <span className="font-medium">1,250 件</span>
                    </div>
                    <div className="flex justify-between">
                      <span>二月预测</span>
                      <span className="font-medium">1,420 件</span>
                    </div>
                    <div className="flex justify-between">
                      <span>三月预测</span>
                      <span className="font-medium">1,180 件</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>预测因素分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">季节性因素</span>
                        <span className="text-green-700 font-semibold">+15%</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">春节前需求增长预期</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">市场趋势</span>
                        <span className="text-blue-700 font-semibold">+8%</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">智能产品市场需求上升</p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">促销活动</span>
                        <span className="text-purple-700 font-semibold">+12%</span>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">新品发布会带动销量</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}