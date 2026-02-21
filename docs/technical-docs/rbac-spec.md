# RBAC 权限规范文档

## 📋 概述

本文档定义了系统的角色基础访问控制（RBAC）权限模型，包括角色定义、权限点说明和分配规则。

**版本**: 1.0.0  
**最后更新**: 2026-02-21  
**适用范围**: 管理后台、API 接口、n8n 工作流

---

## 🎭 角色定义

### 系统内置角色

| 角色标识                 | 角色名称     | 权限级别 | 描述                                   |
| ------------------------ | ------------ | -------- | -------------------------------------- |
| `admin`                  | 超级管理员   | 100      | 系统最高权限，拥有所有功能访问权限     |
| `manager`                | 管理员       | 80       | 业务管理员，可管理用户、内容和基础配置 |
| `content_manager`        | 内容管理员   | 70       | 负责内容审核、发布和管理               |
| `shop_manager`           | 店铺管理员   | 70       | 负责维修店铺管理和审核                 |
| `finance_manager`        | 财务管理员   | 75       | 负责财务管理、支付审核和报表查看       |
| `procurement_specialist` | 采购专员     | 60       | 负责采购流程管理和供应商对接           |
| `warehouse_operator`     | 仓库操作员   | 50       | 负责库存管理和出入库操作               |
| `agent_operator`         | 智能体操作员 | 55       | 负责智能体工作流执行和监控             |
| `viewer`                 | 只读查看员   | 30       | 仅能查看基础数据和报表                 |
| `external_partner`       | 外部合作伙伴 | 20       | 第三方合作伙伴，有限的数据访问权限     |

---

## 🔐 权限点详解

### 仪表板权限

- `dashboard_read`: 查看系统仪表板和统计数据

### 用户管理权限

- `users_read`: 查看用户列表和基本信息
- `users_create`: 创建新用户账户
- `users_update`: 编辑用户信息和权限
- `users_delete`: 删除用户账户

### 内容管理权限

- `content_read`: 查看内容列表和详情
- `content_create`: 创建新的内容条目
- `content_update`: 编辑现有内容
- `content_delete`: 删除内容条目
- `content_approve`: 审批待审核内容

### 店铺管理权限

- `shops_read`: 查看维修店铺信息
- `shops_create`: 创建新的维修店铺
- `shops_update`: 编辑店铺信息
- `shops_approve`: 审批店铺入驻申请

### 财务权限

- `payments_read`: 查看支付记录和财务数据
- `payments_refund`: 处理退款申请

### 报表权限

- `reports_read`: 查看各类业务报表
- `reports_export`: 导出报表数据

### 系统设置权限

- `settings_read`: 查看系统配置
- `settings_update`: 修改系统配置

### 采购权限

- `procurement_read`: 查看采购订单和流程
- `procurement_create`: 创建采购订单
- `procurement_approve`: 审批采购申请

### 库存权限

- `inventory_read`: 查看库存状态和流水
- `inventory_update`: 调整库存数量

### 智能体权限

- `agents_execute`: 执行智能体工作流
- `agents_monitor`: 监控智能体运行状态

### 集成权限

- `n8n_workflows_read`: 查看 n8n 工作流配置
- `n8n_workflows_manage`: 管理 n8n 工作流部署和配置

---

## 📊 角色权限映射

### 超级管理员 (admin)

```
拥有所有权限点的完全访问权限
```

### 管理员 (manager)

```
仪表板、用户管理、内容管理、店铺管理、财务查看、报表、系统设置、采购管理
```

### 内容管理员 (content_manager)

```
仪表板、内容管理（完整权限）、报表查看
```

### 店铺管理员 (shop_manager)

```
仪表板、店铺管理（完整权限）、报表查看
```

### 财务管理员 (finance_manager)

```
仪表板、支付管理、退款处理、报表查看、报表导出
```

### 采购专员 (procurement_specialist)

```
仪表板、采购管理（完整权限）、供应商查看、报表查看
```

### 仓库操作员 (warehouse_operator)

```
仪表板、库存查看、库存调整、报表查看
```

### 智能体操作员 (agent_operator)

```
仪表板、智能体执行、智能体监控、报表查看
```

### 只读查看员 (viewer)

```
仪表板查看、报表查看
```

### 外部合作伙伴 (external_partner)

```
仅仪表板查看权限
```

---

## 🏢 租户隔离配置

### 配置说明

```json
{
  "tenant_isolation": {
    "enabled": true,
    "mode": "strict",
    "default_tenant_field": "tenant_id"
  }
}
```

### 受租户隔离影响的资源

- 用户数据 (users)
- 内容数据 (content)
- 店铺信息 (shops)
- 支付记录 (payments)
- 采购订单 (procurement)
- 库存数据 (inventory)

---

## 📝 审计日志配置

### 敏感操作列表

需要记录审计日志的关键操作：

- 用户创建/修改/删除
- 内容删除
- 店铺审批
- 支付退款
- 系统设置修改

### 日志保留策略

- 保留天数：90 天
- 存储格式：NDJSON
- 存储路径：logs/audit-YYYYMMDD.ndjson

---

## 💡 最佳实践

### 1. 权限分配原则

- **最小权限原则**：只分配完成工作所需的最小权限
- **职责分离**：不同职责使用不同角色
- **定期审查**：定期审查用户权限分配

### 2. 角色使用建议

```
❌ 错误做法：
- 给所有员工分配 admin 角色
- 创建过多自定义角色

✅ 正确做法：
- 根据实际职责选择合适的标准角色
- 仅在必要时创建自定义角色
- 定期清理不活跃用户权限
```

### 3. 租户隔离注意事项

- 确保所有数据访问都包含租户过滤
- 在数据库层面实施行级安全策略
- 定期检查跨租户数据访问风险

### 4. 审计日志管理

- 定期备份审计日志
- 监控异常操作模式
- 建立审计报告机制

---

## 🛠️ 开发指南

### 后端权限检查示例

```javascript
// 检查特定权限
const hasPermission = requirePermission('content_create');

// 检查多个权限
const hasAnyPermission = requireAnyPermission([
  'content_create',
  'content_update',
]);

// 租户隔离检查
const tenantFilter = requireTenant();
```

### 前端权限控制示例

```jsx
// 组件级权限控制
{
  hasPermission('content_create') && (
    <Button onClick={handleCreate}>创建内容</Button>
  );
}

// 菜单项权限控制
{
  menuItems.filter(item => hasPermission(item.permission));
}
```

### API 权限装饰器

```javascript
// 路由级别权限控制
router.post(
  '/api/content',
  requirePermission('content_create'),
  contentController.create
);
```

---

## 🔧 配置文件参考

权限配置文件位于：`config/rbac.json`

主要配置项：

- `roles`: 角色定义
- `permissions`: 权限点定义
- `role_permissions`: 角色权限映射
- `tenant_isolation`: 租户隔离配置
- `audit_settings`: 审计日志配置

---

## 📞 支持与维护

如需修改权限配置或遇到权限相关问题，请联系：

- 系统管理员
- 技术负责人

**注意**：权限配置修改后需要重启服务才能生效。
