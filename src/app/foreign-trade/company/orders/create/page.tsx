'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, ArrowLeft, Info, Plus, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: '1',
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    },
  ]);

  // 表单状态
  const [formData, setFormData] = useState({
    type: 'import' as 'import' | 'export',
    partner: '',
    contractNumber: '',
    expectedDelivery: '',
    paymentTerms: '',
    shippingMethod: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 合作伙伴选项
  const partners =
    formData.type === 'import'
      ? [
          { id: '1', name: 'Samsung Electronics (韩国)', country: '韩国' },
          { id: '2', name: 'Apple Inc. (美国)', country: '美国' },
          { id: '3', name: 'Sony Corporation (日本)', country: '日本' },
          { id: '4', name: 'LG Electronics (韩国)', country: '韩国' },
        ]
      : [
          { id: '5', name: 'TechGlobal Ltd. (美国)', country: '美国' },
          { id: '6', name: 'Digital Solutions GmbH (德国)', country: '德国' },
          { id: '7', name: 'Asia Electronics Co. (日本)', country: '日本' },
          { id: '8', name: 'EuroTech BV (荷兰)', country: '荷兰' },
        ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setOrderItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setOrderItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // 自动计算总价
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice =
              updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partner) {
      newErrors.partner = '请选择合作伙伴';
    }

    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = '请输入合同编号';
    }

    if (!formData.expectedDelivery) {
      newErrors.expectedDelivery = '请选择预计交付日期';
    }

    const hasValidItems = orderItems.some(
      item => item.productName.trim() && item.quantity > 0 && item.unitPrice > 0
    );

    if (!hasValidItems) {
      newErrors.items = '请至少添加一个有效的商品';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 这里应该调用实际的API
      console.debug('创建订单:', {
        ...formData,
        items: orderItems.filter(item => item.productName.trim()),
        totalAmount: calculateTotal(),
      });

      // 成功后跳转
      router.push('/foreign-trade/company/orders');
    } catch (error) {
      console.error('创建订单失败:', error);
      setErrors({ submit: '创建订单失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {formData.type === 'import' ? '创建采购订单' : '创建销售订单'}
          </h1>
          <p className="text-gray-600 mt-1">填写订单详细信息并添加商品项</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要表单区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 订单基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>订单基本信息</CardTitle>
              <CardDescription>请填写订单的基本信息和条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">订单类型 *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="import">进口采购订单</SelectItem>
                      <SelectItem value="export">出口销售订单</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner">合作伙伴 *</Label>
                  <Select
                    value={formData.partner}
                    onValueChange={value => handleInputChange('partner', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择合作伙伴" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners.map(partner => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.partner && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.partner}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractNumber">合同编号 *</Label>
                  <Input
                    id="contractNumber"
                    value={formData.contractNumber}
                    onChange={e =>
                      handleInputChange('contractNumber', e.target.value)
                    }
                    placeholder="请输入合同编号"
                  />
                  {errors.contractNumber && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.contractNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">预计交付日期 *</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={e =>
                      handleInputChange('expectedDelivery', e.target.value)
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.expectedDelivery && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.expectedDelivery}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">付款条款</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={value =>
                      handleInputChange('paymentTerms', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择付款条款" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">30天账期</SelectItem>
                      <SelectItem value="60days">60天账期</SelectItem>
                      <SelectItem value="90days">90天账期</SelectItem>
                      <SelectItem value="prepaid">预付款</SelectItem>
                      <SelectItem value="cod">货到付款</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingMethod">运输方式</Label>
                  <Select
                    value={formData.shippingMethod}
                    onValueChange={value =>
                      handleInputChange('shippingMethod', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择运输方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sea">海运</SelectItem>
                      <SelectItem value="air">空运</SelectItem>
                      <SelectItem value="rail">铁路运输</SelectItem>
                      <SelectItem value="express">快递</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低优先级</SelectItem>
                      <SelectItem value="medium">中优先级</SelectItem>
                      <SelectItem value="high">高优先级</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">备注说明</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={e => handleInputChange('notes', e.target.value)}
                  placeholder="请输入订单的特殊要求或其他说明..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* 商品明细 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>商品明细</CardTitle>
                  <CardDescription>添加订单中的商品信息</CardDescription>
                </div>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加商品
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        商品 #{index + 1}
                      </h3>
                      {orderItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label>商品名称 *</Label>
                        <Input
                          value={item.productName}
                          onChange={e =>
                            updateItem(item.id, 'productName', e.target.value)
                          }
                          placeholder="请输入商品名称"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>SKU编码</Label>
                        <Input
                          value={item.sku}
                          onChange={e =>
                            updateItem(item.id, 'sku', e.target.value)
                          }
                          placeholder="商品编码"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>数量 *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e =>
                            updateItem(
                              item.id,
                              'quantity',
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>单价 (¥) *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e =>
                            updateItem(
                              item.id,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="text-right">
                        <span className="text-sm text-gray-600">小计: </span>
                        <span className="font-medium text-gray-900">
                          ¥{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {errors.items && (
                  <div className="text-sm text-red-600 flex items-center gap-1 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {errors.items}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 - 订单摘要 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                订单摘要
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">商品种类:</span>
                  <span className="font-medium">{orderItems.length} 种</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">商品总数:</span>
                  <span className="font-medium">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    件
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>订单总额:</span>
                    <span className="text-blue-600">
                      ¥{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium">优先级</span>
                  <Badge
                    variant={
                      formData.priority === 'high'
                        ? 'destructive'
                        : formData.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {formData.priority === 'high'
                      ? '高'
                      : formData.priority === 'medium'
                        ? '中'
                        : '低'}
                    优先级
                  </Badge>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    • 订单类型:{' '}
                    {formData.type === 'import' ? '进口采购' : '出口销售'}
                  </p>
                  <p>• 运输方式: {formData.shippingMethod || '未指定'}</p>
                  <p>• 付款条款: {formData.paymentTerms || '未指定'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    创建订单
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                取消
              </Button>

              {errors.submit && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {errors.submit}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
