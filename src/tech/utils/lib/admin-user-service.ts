import { supabase, supabaseAdmin } from './supabase'
import { AuthService, type UserRole, type AdminUser } from './auth-service'

export class AdminUserService {
  // 获取所有管理员用户
  static async getAllUsers(): Promise<AdminUser[]> {
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser) return []

      const currentRole = await AuthService.getUserRole(currentUser.id)
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以查看用户列表')
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取管理员用户列表失败:', error)
        return []
      }

      return data as AdminUser[]
    } catch (error) {
      console.error('获取管理员用户列表异常:', error)
      return []
    }
  }

  // 创建管理员用户
  static async createUser(userData: {
    email: string
    role: UserRole
    user_id?: string
  }): Promise<AdminUser | null> {
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser) {
        throw new Error('未登录用户无法创建管理员')
      }

      // 检查当前用户权限
      const currentRole = await AuthService.getUserRole(currentUser.id)
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以创建管理员用户')
      }

      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          user_id: userData.user_id || null,
          email: userData.email,
          role: userData.role,
          created_by: currentUser.id,
          is_active: true
        } as any)
        .select()
        .single()

      if (error) {
        console.error('创建管理员用户失败:', error)
        return null
      }

      return data as AdminUser
    } catch (error) {
      console.error('创建管理员用户异常:', error)
      return null
    }
  }

  // 更新管理员用户
  static async updateUser(
    userId: string, 
    updates: Partial<AdminUser>
  ): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser) return false

      const currentRole = await AuthService.getUserRole(currentUser.id)
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以更新用户')
      }

      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('更新管理员用户失败:', error)
      return false
    }
  }

  // 删除管理员用户
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser) return false

      const currentRole = await AuthService.getUserRole(currentUser.id)
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以删除用户')
      }

      const { error } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('删除管理员用户失败:', error)
      return false
    }
  }

  // 更新用户状态
  static async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser()
      if (!currentUser) return false

      const currentRole = await AuthService.getUserRole(currentUser.id)
      if (currentRole !== 'admin') {
        throw new Error('只有超级管理员可以更新用户状态')
      }

      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ 
          is_active: isActive, 
          updated_at: new Date().toISOString() 
        } as any)
        .eq('id', userId)

      return !error
    } catch (error) {
      console.error('更新用户状态失败:', error)
      return false
    }
  }

  // 根据邮箱查找用户
  static async findUserByEmail(email: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('查找用户失败:', error)
        return null
      }

      return data as AdminUser
    } catch (error) {
      console.error('查找用户异常:', error)
      return null
    }
  }

  // 根据ID查找用户
  static async findUserById(id: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('查找用户失败:', error)
        return null
      }

      return data as AdminUser
    } catch (error) {
      console.error('查找用户异常:', error)
      return null
    }
  }

  // 获取用户数量统计
  static async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    byRole: Record<UserRole, number>
  }> {
    try {
      const users = await this.getAllUsers()
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
        byRole: {} as Record<UserRole, number>
      }

      // 按角色统计
      const roles: UserRole[] = ['admin', 'content_reviewer', 'shop_reviewer', 'finance', 'viewer']
      roles.forEach(role => {
        stats.byRole[role] = users.filter(u => u.role === role).length
      })

      return stats
    } catch (error) {
      console.error('获取用户统计失败:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {
          admin: 0,
          content_reviewer: 0,
          shop_reviewer: 0,
          finance: 0,
          viewer: 0
        }
      }
    }
  }
}