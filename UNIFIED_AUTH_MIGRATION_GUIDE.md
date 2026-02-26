
统一认证系统迁移指南
====================

1. 替换现有的AuthProvider:
   - 移除 src/components/providers/AuthProvider.tsx
   - 移除 src/modules/common/components/providers/AuthProvider.tsx
   - 在应用根部使用新的统一AuthProvider

2. 更新Hook引用:
   - 将 useAuth() 替换为 useUnifiedAuth()
   - 将 useUser() 替换为 useUnifiedAuth()
   - 将 usePermission() 的逻辑合并到统一认证中

3. 统一认证状态存储:
   - 优先使用Supabase Session
   - 备用localStorage JWT token
   - 临时mock token支持

4. 权限检查统一:
   - 所有权限检查通过统一认证服务
   - 管理员权限通过AuthService.isAdminUser()验证
   - 角色管理集中处理

5. 测试验证:
   - 确保登录/登出功能正常
   - 验证权限检查准确性
   - 测试各种边界情况
