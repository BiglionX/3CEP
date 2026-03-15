'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  User, 
  Phone, 
  Wrench, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceBrand: '',
    deviceModel: '',
    deviceIssue: '',
    priority: 'medium',
    technician: '',
    estimatedCompletion: '',
    price: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const technicians = [
    { id: 'tech-001', name: '李师傅', specialty: '手机维修' },
    { id: 'tech-002', name: '王师傅', specialty: '平板维修' },
    { id: 'tech-003', name: '张师傅', specialty: '笔记本维修' },
    { id: 'tech-004', name: '陈师傅', specialty: '综合维修' }
  ];

  const deviceBrands = [
    'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'Vivo', 'OnePlus', 'Google', 'Microsoft', 'Dell', 'HP', 'Lenovo'
  ];

  const handleChange = (field: string, value: string) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入客户姓名';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '请输入客户电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = '请输入正确的手机号码';
    }
    
    if (!formData.deviceBrand) {
      newErrors.deviceBrand = '请选择设备品牌';
    }
    
    if (!formData.deviceModel.trim()) {
      newErrors.deviceModel = '请输入设备型号';
    }
    
    if (!formData.deviceIssue.trim()) {
      newErrors.deviceIssue = '请描述设备问题';
    }
    
    if (!formData.technician) {
      newErrors.technician = '请选择负责技师';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 生成工单号
      const workOrderId = `WO-${Date.now().toString().slice(-6)}`;
      
      // 跳转到工单详情页
      router.push(`/repair-shop/work-orders/${workOrderId}`);
    } catch (error) {
      console.error('创建工单失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={handleCancel}
                className="mr-4"
              >
                ← 取消
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">新建工单</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading  (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    创建工单
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 客户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                客户信息
              </CardTitle>
              <CardDescription>
                输入客户的联系信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">客户姓名 *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleChange('customerName', e.target.value)}
                    placeholder="请输入客户姓名"
                    className={errors.customerName  'border-red-500' : ''}
                  />
                  {errors.customerName && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.customerName}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">联系电话 *</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => handleChange('customerPhone', e.target.value)}
                    placeholder="请输入手机号码"
                    className={errors.customerPhone  'border-red-500' : ''}
                  />
                  {errors.customerPhone && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.customerPhone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 设备信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                设备信息
              </CardTitle>
              <CardDescription>
                描述需要维修的设备信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">设备品牌 *</Label>
                  <Select 
                    value={formData.deviceBrand} 
                    onValueChange={(value: string) => handleChange('deviceBrand', value)}
                  >
                    <SelectTrigger className={errors.deviceBrand  'border-red-500' : ''}>
                      <SelectValue placeholder="选择品牌" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceBrands.map(brand => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deviceBrand && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.deviceBrand}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceModel">设备型号 *</Label>
                  <Input
                    id="deviceModel"
                    value={formData.deviceModel}
                    onChange={(e) => handleChange('deviceModel', e.target.value)}
                    placeholder="例如: iPhone 14 Pro"
                    className={errors.deviceModel  'border-red-500' : ''}
                  />
                  {errors.deviceModel && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.deviceModel}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceIssue">故障描述 *</Label>
                <Textarea
                  id="deviceIssue"
                  value={formData.deviceIssue}
                  onChange={(e) => handleChange('deviceIssue', e.target.value)}
                  placeholder="详细描述设备出现的问题..."
                  rows={4}
                  className={errors.deviceIssue  'border-red-500' : ''}
                />
                {errors.deviceIssue && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.deviceIssue}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: string) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">普通</SelectItem>
                    <SelectItem value="medium">中等</SelectItem>
                    <SelectItem value="high">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 分配信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                分配信息
              </CardTitle>
              <CardDescription>
                分配负责技师和预估完成时间
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technician">负责技师*</Label>
                  <Select 
                    value={formData.technician} 
                    onValueChange={(value: string) => handleChange('technician', value)}
                  >
                    <SelectTrigger className={errors.technician  'border-red-500' : ''}>
                      <SelectValue placeholder="选择技师" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name} - {tech.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.technician && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.technician}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedCompletion">预估完成时间</Label>
                  <Input
                    id="estimatedCompletion"
                    type="datetime-local"
                    value={formData.estimatedCompletion}
                    onChange={(e) => handleChange('estimatedCompletion', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">预估价格 (¥)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="输入预估维修费用"
                  min="0"
                  step="10"
                />
              </div>
            </CardContent>
          </Card>

          {/* 提交区域 */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleCancel} type="button">
              取消
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading  (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  创建中...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  创建工单
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
