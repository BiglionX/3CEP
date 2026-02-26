/**
 * 表单验证系统测试
 */

import { 
  commonValidations, 
  enterpriseValidations,
  ErrorHandler,
  useValidation
} from '@/lib/validation'
import * as z from 'zod'

describe('Form Validation System', () => {
  describe('Common Validations', () => {
    it('应该验证有效邮箱', () => {
      const result = commonValidations.email.safeParse('test@example.com')
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效邮箱', () => {
      const result = commonValidations.email.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })

    it('应该验证有效手机号', () => {
      const result = commonValidations.phone.safeParse('13812345678')
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效手机号', () => {
      const result = commonValidations.phone.safeParse('12345')
      expect(result.success).toBe(false)
    })

    it('应该验证符合要求的密码', () => {
      const result = commonValidations.password.safeParse('Password123')
      expect(result.success).toBe(true)
    })

    it('应该拒绝不符合要求的密码', () => {
      const result = commonValidations.password.safeParse('123456')
      expect(result.success).toBe(false)
    })
  })

  describe('Enterprise Validations', () => {
    it('应该验证采购订单数据', () => {
      const orderData = {
        orderNumber: 'PO-2024-001',
        supplier: '测试供应商',
        items: [{
          name: '测试商品',
          quantity: 10,
          unitPrice: 100,
          totalPrice: 1000
        }],
        totalAmount: 1000,
        deliveryDate: '2024-12-31',
        priority: 'high',
        description: '测试订单描述'
      }

      const result = enterpriseValidations.purchaseOrder.safeParse(orderData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝无效的采购订单数据', () => {
      const invalidOrderData = {
        orderNumber: '', // 空订单号
        supplier: '测试供应商',
        items: [], // 空商品列表
        totalAmount: -100, // 负金额
        deliveryDate: 'invalid-date', // 无效日期
        priority: 'invalid-priority' // 无效优先级
      }

      const result = enterpriseValidations.purchaseOrder.safeParse(invalidOrderData)
      expect(result.success).toBe(false)
    })

    it('应该验证企业用户注册数据', () => {
      const userData = {
        companyName: '测试公司',
        email: 'test@company.com',
        phone: '13812345678',
        password: 'Password123',
        confirmPassword: 'Password123',
        industry: 'technology',
        employeeCount: '51-200',
        website: 'https://test.com'
      }

      const result = enterpriseValidations.enterpriseRegister.safeParse(userData)
      expect(result.success).toBe(true)
    })

    it('应该拒绝密码不匹配的企业注册', () => {
      const userData = {
        companyName: '测试公司',
        email: 'test@company.com',
        phone: '13812345678',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
        industry: 'technology',
        employeeCount: '51-200'
      }

      const result = enterpriseValidations.enterpriseRegister.safeParse(userData)
      expect(result.success).toBe(false)
    })
  })

  describe('Error Handler', () => {
    it('应该处理Zod验证错误', () => {
      const schema = z.object({
        name: z.string().min(3, '名称至少3个字符')
      })

      const result = schema.safeParse({ name: 'ab' })
      
      if (!result.success) {
        const errors = ErrorHandler.handleFormErrors(result.error)
        expect(errors).toHaveLength(1)
        expect(errors[0].field).toBe('name')
        expect(errors[0].message).toBe('名称至少3个字符')
      }
    })

    it('应该处理API错误', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: '请求参数错误',
            code: 'BAD_REQUEST'
          }
        }
      }

      const apiError = ErrorHandler.handleApiError(error)
      expect(apiError.message).toBe('请求参数错误')
      expect(apiError.code).toBe('BAD_REQUEST')
    })

    it('应该处理网络错误', () => {
      const error = {
        request: {}
      }

      const apiError = ErrorHandler.handleApiError(error)
      expect(apiError.message).toBe('网络连接失败，请检查网络设置')
      expect(apiError.code).toBe('NETWORK_ERROR')
    })
  })

  describe('Validation Hook', () => {
    it('应该成功验证有效数据', async () => {
      const { validateForm } = useValidation()
      const schema = z.object({
        name: z.string().min(1)
      })
      
      const result = await validateForm(schema, { name: 'test' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('test')
      }
    })

    it('应该返回验证错误', async () => {
      const { validateForm } = useValidation()
      const schema = z.object({
        name: z.string().min(3)
      })
      
      const result = await validateForm(schema, { name: 'ab' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toHaveLength(1)
      }
    })

    it('应该验证单个字段', () => {
      const { validateField } = useValidation()
      const schema = z.object({
        email: z.string().email()
      })
      
      const error = validateField(schema, 'email', 'invalid-email')
      expect(error).toBeTruthy()
      
      const noError = validateField(schema, 'email', 'test@example.com')
      expect(noError).toBeNull()
    })
  })
})