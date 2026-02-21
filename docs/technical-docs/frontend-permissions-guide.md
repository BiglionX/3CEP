# 前端权限控制使用指南

## 📋 概述

本文档介绍如何在前端应用中使用权限控制系统，实现基于角色的界面元素动态显示和控制。

---

## 🚀 快速开始

### 1. 安装依赖

确保已安装以下依赖：

```bash
npm install lucide-react
```

### 2. 基本使用

```typescript
import { usePermission } from '@/hooks/use-permission';
import {
  PermissionButton,
  PermissionControl,
} from '@/components/admin/PermissionControls';

// 在组件中使用
export default function MyComponent() {
  const { hasPermission, hasRole } = usePermission();

  return (
    <div>
      {/* 权限按钮 */}
      <PermissionButton permission="users_create">创建用户</PermissionButton>

      {/* 权限容器 */}
      <PermissionControl permission="content_read">
        <div>只有有内容查看权限的用户能看到这里</div>
      </PermissionControl>
    </div>
  );
}
```

---

## 🎯 核心组件

### 1. PermissionControl 权限容器

根据权限动态显示或隐藏整个组件区域。

```typescript
<PermissionControl
  permission="users_read" // 单个权限
  role={['admin', 'manager']} // 或指定角色
  requireAll={false} // 是否需要满足所有条件
  fallback={<div>权限不足时显示的内容</div>}
>
  <div>有权限时显示的内容</div>
</PermissionControl>
```

### 2. PermissionButton 权限按钮

根据权限控制按钮的显示或禁用状态。

```typescript
<PermissionButton
  permission={['users_create', 'users_update']} // 支持多个权限
  requiredRole="admin" // 或指定角色
  disableInsteadOfHide={true} // 权限不足时禁用而不是隐藏
  tooltip="需要管理员权限"
  className="btn btn-primary"
  onClick={handleClick}
>
  创建用户
</PermissionButton>
```

### 3. PermissionField 表单字段

根据权限控制表单字段的显示。

```typescript
<PermissionField
  permission="users_create"
  requiredRole={['admin', 'manager']}
  label="用户名"
>
  <input type="text" placeholder="输入用户名" />
</PermissionField>
```

### 4. ActionMenu 动作菜单

根据权限动态生成操作菜单。

```typescript
const actions = [
  {
    label: '编辑',
    onClick: handleEdit,
    permission: 'users_update',
    icon: <EditIcon />
  },
  {
    label: '删除',
    onClick: handleDelete,
    permission: 'users_delete',
    icon: <DeleteIcon />
  }
]

<ActionMenu actions={actions} rowData={userData} />
```

---

## 🔧 Hooks 使用

### usePermission Hook

```typescript
import { usePermission } from '@/hooks/use-permission';

export default function MyComponent() {
  const {
    // 状态
    userInfo,
    loading,
    isAuthenticated,

    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,

    // 辅助方法
    getAccessibleMenus,
    getUserInfo,
    login,
    logout,
  } = usePermission();

  // 使用示例
  if (hasPermission('users_create')) {
    // 显示创建按钮
  }

  if (hasAnyRole(['admin', 'manager'])) {
    // 显示管理功能
  }
}
```

### PermissionGuard 和 RoleGuard

```typescript
import { PermissionGuard, RoleGuard } from '@/hooks/use-permission'

// 权限守卫
<PermissionGuard
  permission={['content_create', 'content_update']}
  fallback={<div>权限不足</div>}
>
  <ContentEditor />
</PermissionGuard>

// 角色守卫
<RoleGuard
  roles={['admin', 'manager']}
  fallback={<Unauthorized />}
>
  <AdminPanel />
</RoleGuard>
```

---

## 📊 权限标识参考

### 系统权限标识

| 权限标识             | 说明       | 适用角色                               |
| -------------------- | ---------- | -------------------------------------- |
| `dashboard_read`     | 仪表板查看 | 所有角色                               |
| `users_read`         | 用户查看   | admin, manager                         |
| `users_create`       | 用户创建   | admin, manager                         |
| `users_update`       | 用户编辑   | admin, manager                         |
| `users_delete`       | 用户删除   | admin                                  |
| `content_read`       | 内容查看   | admin, manager, content_manager        |
| `content_create`     | 内容创建   | admin, manager, content_manager        |
| `content_update`     | 内容编辑   | admin, manager, content_manager        |
| `content_delete`     | 内容删除   | admin, manager, content_manager        |
| `content_approve`    | 内容审批   | admin, manager, content_manager        |
| `shops_read`         | 店铺查看   | admin, manager, shop_manager           |
| `shops_create`       | 店铺创建   | admin, manager, shop_manager           |
| `shops_approve`      | 店铺审批   | admin, manager, shop_manager           |
| `payments_read`      | 支付查看   | admin, manager, finance_manager        |
| `payments_refund`    | 支付退款   | admin, manager, finance_manager        |
| `reports_read`       | 报表查看   | 所有业务角色                           |
| `reports_export`     | 报表导出   | admin, manager, finance_manager        |
| `settings_read`      | 设置查看   | admin, manager                         |
| `settings_update`    | 设置修改   | admin                                  |
| `procurement_read`   | 采购查看   | admin, manager, procurement_specialist |
| `procurement_create` | 采购创建   | admin, manager, procurement_specialist |
| `inventory_read`     | 库存查看   | admin, manager, warehouse_operator     |
| `inventory_update`   | 库存调整   | admin, manager, warehouse_operator     |
| `agents_execute`     | 智能体执行 | admin, manager, agent_operator         |
| `agents_monitor`     | 智能体监控 | admin, manager, agent_operator         |

---

## 🎨 实际应用场景

### 1. 动态菜单渲染

```typescript
const menuItems = [
  {
    name: '用户管理',
    href: '/admin/users',
    icon: <UsersIcon />,
    permission: 'users_read',
  },
  {
    name: '内容管理',
    href: '/admin/content',
    icon: <ContentIcon />,
    requiredRole: ['admin', 'content_manager'],
  },
];

// 在侧边栏组件中过滤
const accessibleMenus = menuItems.filter(item => {
  if (item.permission) {
    return hasPermission(item.permission);
  }
  if (item.requiredRole) {
    return hasAnyRole(item.requiredRole);
  }
  return true;
});
```

### 2. 表格操作列权限控制

```typescript
const columns = [
  {
    header: '操作',
    cell: row => (
      <ActionMenu
        actions={[
          {
            label: '查看详情',
            onClick: () => viewDetails(row),
            permission: 'users_read',
          },
          {
            label: '编辑',
            onClick: () => editUser(row),
            permission: 'users_update',
          },
          {
            label: '删除',
            onClick: () => deleteUser(row),
            permission: 'users_delete',
          },
        ]}
        rowData={row}
      />
    ),
  },
];
```

### 3. 表单字段权限控制

```typescript
function UserForm() {
  return (
    <form>
      <PermissionField permission="users_create" label="用户名">
        <input type="text" name="username" />
      </PermissionField>

      <PermissionField requiredRole={['admin']} label="用户角色">
        <select name="role">
          <option value="viewer">查看员</option>
          <option value="content_manager">内容管理员</option>
          <option value="admin">管理员</option>
        </select>
      </PermissionField>

      <PermissionButton permission="users_create">保存用户</PermissionButton>
    </form>
  );
}
```

---

## ⚙️ 高级用法

### 自定义权限检查逻辑

```typescript
// 组合多个权限检查
const canManageUsers = hasAllPermissions([
  'users_read',
  'users_create',
  'users_update',
]);
const canViewSensitiveData =
  hasRole('admin') && hasPermission('sensitive_data_read');

// 动态权限检查
const checkPermission = (resource, action) => {
  return hasPermission(`${resource}_${action}`);
};
```

### 权限变化监听

```typescript
useEffect(() => {
  // 当权限发生变化时执行某些操作
  if (hasPermission('users_create')) {
    // 启用某些功能
  } else {
    // 禁用某些功能
  }
}, [userInfo?.roles]); // 监听角色变化
```

### 权限不足的优雅降级

```typescript
// 提供友好的权限不足提示
<PermissionControl
  permission="premium_feature"
  fallback={
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-800">
        此功能需要高级权限，请联系管理员升级账户。
      </p>
    </div>
  }
>
  <PremiumFeatureComponent />
</PermissionControl>
```

---

## 🧪 测试和调试

### 模拟不同角色

```typescript
// 在开发环境中模拟不同角色
localStorage.setItem('debug_role', 'content_manager');
// 刷新页面即可看到对应角色的界面
```

### 权限调试工具

```typescript
// 在控制台查看当前用户权限
console.log('当前用户权限:', usePermission().userInfo?.roles);
console.log(
  '是否具有用户创建权限:',
  usePermission().hasPermission('users_create')
);
```

---

## 📱 响应式设计考虑

```typescript
// 移动端权限控制
<div className="lg:hidden">
  <PermissionControl permission="mobile_access">
    <MobileNavigation />
  </PermissionControl>
</div>

// 桌面端权限控制
<div className="hidden lg:block">
  <PermissionControl permission="desktop_access">
    <DesktopNavigation />
  </PermissionControl>
</div>
```

---

## 🔒 安全注意事项

1. **前端权限控制只是用户体验优化**，真正的权限验证必须在后端进行
2. **敏感操作必须在后端再次验证权限**
3. **不要在前端暴露不应该访问的功能逻辑**
4. **定期审查权限配置的合理性**

---

## 🆘 常见问题

### Q: 权限不生效怎么办？

A: 检查用户是否已正确登录，JWT token 是否有效，以及权限配置是否正确

### Q: 如何添加新的权限点？

A: 在 `config/rbac.json` 中添加新的权限定义，然后在组件中使用

### Q: 权限控制组件性能如何优化？

A: 可以使用 React.memo 包装权限组件，避免不必要的重新渲染

### Q: 如何处理复杂的权限组合逻辑？

A: 建议在自定义 Hook 中封装复杂的权限检查逻辑
