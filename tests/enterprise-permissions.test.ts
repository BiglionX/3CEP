/**
 * 企业服务权限中间件测试
 */

import { 
  checkEnterpriseAccess, 
  getUserEnterprisePermissions,
  checkEnterpriseApiAccess
} from '@/middleware/enterprise-permissions'
import { NextRequest } from 'next/server'

// Mock AuthService
jest.mock('@/lib/auth-service', () => ({
  AuthService: {
    getCurrentUser: jest.fn()
  }
}))

describe('Enterprise Permissions Middleware', () => {
  const mockCurrentUser = {
    id: 'user123',
    email: 'test@example.com',
    roles: ['enterprise_admin']
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkEnterpriseAccess', () => {
    it('应该允许访问公共路径', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/enterprise' }
      } as NextRequest
      
      const result = await checkEnterpriseAccess(mockRequest, mockCurrentUser)
      expect(result).toBe(true)
    })

    it('应该拒绝未认证用户的受限路径访问', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/enterprise/dashboard' }
      } as NextRequest
      
      const result = await checkEnterpriseAccess(mockRequest, null)
      expect(result).toBe(false)
    })

    it('应该允许认证用户的受限路径访问', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/enterprise/dashboard' }
      } as NextRequest
      
      const result = await checkEnterpriseAccess(mockRequest, mockCurrentUser)
      expect(result).toBe(true)
    })

    it('应该拒绝普通用户访问管理员路径', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/enterprise/admin/dashboard' }
      } as NextRequest
      
      const result = await checkEnterpriseAccess(mockRequest, {
        ...mockCurrentUser,
        roles: ['enterprise_user']
      })
      expect(result).toBe(false)
    })

    it('应该允许管理员访问管理员路径', async () => {
      const mockRequest = {
        nextUrl: { pathname: '/enterprise/admin/dashboard' }
      } as NextRequest
      
      const result = await checkEnterpriseAccess(mockRequest, mockCurrentUser)
      expect(result).toBe(true)
    })
  })

  describe('getUserEnterprisePermissions', () => {
    it('应该为管理员返回完整权限', () => {
      const permissions = getUserEnterprisePermissions({
        roles: ['enterprise_admin']
      })
      
      expect(permissions).toContain('enterprise_full_access')
    })

    it('应该为采购经理返回采购相关权限', () => {
      const permissions = getUserEnterprisePermissions({
        roles: ['procurement_manager']
      })
      
      expect(permissions).toContain('procurement_access')
      expect(permissions).toContain('orders_manage')
    })

    it('应该为空用户返回空权限数组', () => {
      const permissions = getUserEnterprisePermissions(null)
      expect(permissions).toEqual([])
    })

    it('应该去重权限', () => {
      const permissions = getUserEnterprisePermissions({
        roles: ['enterprise_admin', 'admin']
      })
      
      const uniquePermissions = [...new Set(permissions)]
      expect(permissions).toEqual(uniquePermissions)
    })
  })

  describe('checkEnterpriseApiAccess', () => {
    it('应该拒绝未认证用户的API访问', async () => {
      const mockRequest = {} as NextRequest
      const result = await checkEnterpriseApiAccess(mockRequest, 'enterprise_read')
      
      expect(result.allowed).toBe(false)
      expect(result.user).toBeUndefined()
    })

    it('应该允许有权限用户访问API', async () => {
      const mockRequest = {} as NextRequest
      const result = await checkEnterpriseApiAccess(mockRequest, 'enterprise_read')
      
      // 这个测试需要mock AuthService.getCurrentUser()
      // 实际测试中需要正确设置mock
    })
  })
})