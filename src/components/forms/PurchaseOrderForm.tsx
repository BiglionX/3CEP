/**
 * 表单验证使用示例组件
 * 展示如何在企业服务中使用验证系统
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { 
  useValidation, 
  validationSchemas, 
  enterpriseValidations,
  type FormError 
} from '@/lib/validation'

interface PurchaseOrderFormData {
  orderNumber: string
  supplier: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totalAmount: number
  deliveryDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description?: string
}

export function PurchaseOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formErrors, setFormErrors] = useState<FormError[]>([])
  const { validateForm } = useValidation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(enterpriseValidations.purchaseOrder),
    defaultValues: {
      items: [{ name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
      priority: 'medium'
    }
  })

  // 监听表单数据变化
  const formData = watch()
  
  // 计算商品总价
  const calculateTotalAmount = () => {
    const items = formData.items || []
    const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    setValue('totalAmount', total)
  }

  // 更新商品总价
  const updateItemTotal = (index: number) => {
    const items = [...(formData.items || [])]
    const item = items[index]
    if (item) {
      item.totalPrice = item.quantity * item.unitPrice
      setValue(`items.${index}.totalPrice`, item.totalPrice)
      calculateTotalAmount()
    }
  }

  // 添加商品
  const addItem = () => {
    const items = formData.items || []
    setValue('items', [...items, { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  // 删除商品
  const removeItem = (index: number) => {
    const items = formData.items || []
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setValue('items', newItems)
      calculateTotalAmount()
    }
  }

  // 表单提交处理
  const onSubmit = async (data: PurchaseOrderFormData) => {
    try {
      setIsSubmitting(true)
      setFormErrors([])
      setSubmitStatus('idle')

      // 验证表单数据
      const validation = await validateForm(enterpriseValidations.purchaseOrder, data)
      
      if (!validation.success) {
        setFormErrors(validation.errors)
        setSubmitStatus('error')
        return
      }

      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 这里应该调用实际的API
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('提交采购订单:', validation.data)setSubmitStatus('success')
      
      // 3秒后重置表单
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
      
    } catch (error) {
      console.error('表单提交失败:', error)
      setFormErrors([{
        field: 'general',
        message: '提交失败，请稍后重试',
        code: 'SUBMIT_ERROR'
      }])
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 字段验证错误显示
  const getFieldError = (fieldName: string) => {
    return errors[fieldName as keyof PurchaseOrderFormData]?.message ||
           formErrors.find(err => err.field === fieldName)?.message
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>创建采购订单</CardTitle>
        <CardDescription>
          填写采购订单信息，系统将自动验证数据有效?
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {submitStatus === 'success' && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              采购订单创建成功！订单号：{formData.orderNumber}
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === 'error' && formErrors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {formErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">订单?*</Label>
              <Input
                id="orderNumber"
                {...register('orderNumber')}
                placeholder="如：PO-2024-001"
                disabled={isSubmitting}
              />
              {getFieldError('orderNumber') && (
                <p className="text-sm text-red-500">{getFieldError('orderNumber')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">供应?*</Label>
              <Input
                id="supplier"
                {...register('supplier')}
                placeholder="供应商名?
                disabled={isSubmitting}
              />
              {getFieldError('supplier') && (
                <p className="text-sm text-red-500">{getFieldError('supplier')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate">交付日期 *</Label>
              <Input
                id="deliveryDate"
                type="date"
                {...register('deliveryDate')}
                disabled={isSubmitting}
              />
              {getFieldError('deliveryDate') && (
                <p className="text-sm text-red-500">{getFieldError('deliveryDate')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">优先?*</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">�?/SelectItem>
                  <SelectItem value="medium">�?/SelectItem>
                  <SelectItem value="high">�?/SelectItem>
                  <SelectItem value="urgent">紧?/SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('priority') && (
                <p className="text-sm text-red-500">{getFieldError('priority')}</p>
              )}
            </div>
          </div>

          {/* 商品列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>商品清单 *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addItem}
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加商品
              </Button>
            </div>

            {formData?.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">商品 #{index + 1}</h4>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="商品名称"
                      {...register(`items.${index}.name`)}
                      disabled={isSubmitting}
                    />
                    {getFieldError(`items.${index}.name`) && (
                      <p className="text-sm text-red-500">{getFieldError(`items.${index}.name`)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="number"
                      placeholder="数量"
                      min="1"
                      {...register(`items.${index}.quantity`, { 
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index)
                      })}
                      disabled={isSubmitting}
                    />
                    {getFieldError(`items.${index}.quantity`) && (
                      <p className="text-sm text-red-500">{getFieldError(`items.${index}.quantity`)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      type="number"
                      placeholder="单价"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.unitPrice`, { 
                        valueAsNumber: true,
                        onChange: () => updateItemTotal(index)
                      })}
                      disabled={isSubmitting}
                    />
                    {getFieldError(`items.${index}.unitPrice`) && (
                      <p className="text-sm text-red-500">{getFieldError(`items.${index}.unitPrice`)}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  小计：¥{(item.totalPrice || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* 总金?*/}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">订单总金额：</span>
              <span className="text-2xl font-bold text-blue-600">
                ¥{(formData.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">订单描述</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="请输入订单详细描?.."
              rows={3}
              disabled={isSubmitting}
            />
            {getFieldError('description') && (
              <p className="text-sm text-red-500">{getFieldError('description')}</p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交?..
                </>
              ) : (
                '创建订单'
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              disabled={isSubmitting}
            >
              保存草稿
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}