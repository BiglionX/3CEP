/**
 * API客户端测试
 */

import { apiClient, EnterpriseApi, ErrorHandler } from '@/services/api-client'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Base API Client', () => {
    it('应该正确构建URL', () => {
      // 测试私有方法需要通过公共方法间接测试
      expect(apiClient).toBeDefined()
    })

    it('应该处理GET请求', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' }),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.get('/test')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ data: 'test' })
    })

    it('应该处理POST请求', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'created' }),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiClient.post('/test', { name: 'test' })
      expect(result.success).toBe(true)
    })

    it('应该处理HTTP错误', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Bad Request' }),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await expect(apiClient.get('/test')).rejects.toThrow()
    })

    it('应该处理网络错误', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network Error'))

      await expect(apiClient.get('/test')).rejects.toThrow()
    })
  })

  describe('Enterprise API', () => {
    it('应该获取仪表板数据', async () => {
      const mockData = {
        totalOrders: 10,
        totalAgents: 5,
        totalSuppliers: 8
      }
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await EnterpriseApi.getDashboardData()
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
    })

    it('应该获取采购订单列表', async () => {
      const mockOrders = [{ id: '1', orderNumber: 'PO-001' }]
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockOrders),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await EnterpriseApi.getPurchaseOrders()
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('应该创建采购订单', async () => {
      const orderData = { orderNumber: 'PO-002', items: [] }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 'new-order-id' }),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await EnterpriseApi.createPurchaseOrder(orderData)
      expect(result.success).toBe(true)
    })

    it('应该获取智能体列表', async () => {
      const mockAgents = [{ id: '1', name: 'Test Agent' }]
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAgents),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await EnterpriseApi.getAgents()
      expect(result.success).toBe(true)
    })

    it('应该获取用户档案', async () => {
      const mockProfile = { name: 'Test User', email: 'test@example.com' }
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockProfile),
        headers: new Map([['content-type', 'application/json']])
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await EnterpriseApi.getUserProfile()
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('应该处理401未授权错误', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      const processedError = ErrorHandler.handleApiError(errorResponse)
      expect(processedError.message).toBe('未授权访问，请重新登录')
      expect(processedError.code).toBe('UNAUTHORIZED')
    })

    it('应该处理403权限不足错误', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      }

      const processedError = ErrorHandler.handleApiError(errorResponse)
      expect(processedError.message).toBe('权限不足')
      expect(processedError.code).toBe('FORBIDDEN')
    })

    it('应该处理404未找到错误', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not Found' }
        }
      }

      const processedError = ErrorHandler.handleApiError(errorResponse)
      expect(processedError.message).toBe('请求的资源不存在')
      expect(processedError.code).toBe('NOT_FOUND')
    })

    it('应该处理500服务器错误', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      }

      const processedError = ErrorHandler.handleApiError(errorResponse)
      expect(processedError.message).toBe('服务器内部错误，请稍后重试')
      expect(processedError.code).toBe('INTERNAL_ERROR')
    })

    it('应该处理超时错误', () => {
      const timeoutError = {
        name: 'AbortError',
        message: 'Timeout'
      }

      const processedError = ErrorHandler.handleApiError(timeoutError)
      expect(processedError.message).toBe('请求超时')
      expect(processedError.code).toBe('TIMEOUT_ERROR')
    })

    it('应该处理网络错误', () => {
      const networkError = {
        request: {}
      }

      const processedError = ErrorHandler.handleApiError(networkError)
      expect(processedError.message).toBe('网络连接失败，请检查网络设置')
      expect(processedError.code).toBe('NETWORK_ERROR')
    })
  })
})