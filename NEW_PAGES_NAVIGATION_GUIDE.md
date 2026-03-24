# 📍 今日新建 7 个页面的 Admin 入口导航指南

**日期**: 2026-03-24
**页面数量**: 7 个新页面

---

## 🎯 快速访问链接

### 方式一：直接 URL 访问（最快）

| 序号 | 页面名称           | 直接访问 URL                                                                                 | 功能描述               |
| ---- | ------------------ | -------------------------------------------------------------------------------------------- | ---------------------- |
| 1    | **智能体模板管理** | [`http://localhost:3001/admin/agent-templates`](http://localhost:3001/admin/agent-templates) | 管理和配置智能体模板库 |
| 2    | **智能体审核**     | [`http://localhost:3001/admin/agents-audit`](http://localhost:3001/admin/agents-audit)       | 审核提交的智能体应用   |
| 3    | **告警管理**       | [`http://localhost:3001/admin/alerts`](http://localhost:3001/admin/alerts)                   | 系统告警配置和管理     |
| 4    | **数据分析**       | [`http://localhost:3001/admin/analytics`](http://localhost:3001/admin/analytics)             | 数据统计和分析仪表板   |
| 5    | **配置历史**       | [`http://localhost:3001/admin/config-history`](http://localhost:3001/admin/config-history)   | 查看系统配置变更历史   |
| 6    | **订单交付**       | [`http://localhost:3001/admin/order-delivery`](http://localhost:3001/admin/order-delivery)   | 订单交付流程管理       |
| 7    | **智能体列表**     | [`http://localhost:3001/agents`](http://localhost:3001/agents)                               | 智能体主页面（前台）   |

---

## 🗺️ 从 Admin Dashboard 进入的路径

### 起点：Admin Dashboard

**URL**: `http://localhost:3001/admin/dashboard`

### 路径 1: 智能体模板管理

```
Admin Dashboard
  → 侧边栏 "智能体管理" (展开)
  → "智能体模板"
  → /admin/agent-templates
```

### 路径 2: 智能体审核

```
Admin Dashboard
  → 侧边栏 "智能体管理" (展开)
  → "智能体审核"
  → /admin/agents-audit
```

### 路径 3: 告警管理

```
Admin Dashboard
  → 侧边栏 "系统监控" (展开)
  → "告警管理"
  → /admin/alerts
```

### 路径 4: 数据分析

```
Admin Dashboard
  → 顶部导航 "数据分析"
  → 或侧边栏 "数据分析"
  → /admin/analytics
```

### 路径 5: 配置历史

```
Admin Dashboard
  → 侧边栏 "系统设置" (展开)
  → "配置历史"
  → /admin/config-history
```

### 路径 6: 订单交付

```
Admin Dashboard
  → 侧边栏 "订单管理" (展开)
  → "订单交付"
  → /admin/order-delivery
```

### 路径 7: 智能体列表（前台）

```
Admin Dashboard
  → 顶部导航 "返回主页"
  → 导航栏 "智能体"
  → /agents
```

---

## 🔍 在侧边栏中的位置

### RoleAwareSidebar.tsx 中的配置位置

根据 `src/components/admin/RoleAwareSidebar.tsx` 文件：

#### 智能体相关页面（3 个）

**位置**: 第 240-268 行 - "智能体管理" 分组

```typescript
{
  id: 'agents',
  name: '智能体管理',
  icon: <Zap className="w-5 h-5" />,
  href: '',
  roles: ['admin', 'manager', 'agent_operator'],
  children: [
    // ✅ 今日新增：智能体模板管理
    {
      id: 'agent-templates',
      name: '智能体模板',
      href: '/admin/agent-templates',  // ← 新页面
      icon: <FileText className="w-4 h-4" />,
    },
    // ✅ 今日新增：智能体审核
    {
      id: 'agents-audit',
      name: '智能体审核',
      href: '/admin/agents-audit',  // ← 新页面
      icon: <Shield className="w-4 h-4" />,
    },
    // 已有功能
    {
      id: 'agent-execution',
      name: '执行工作流',
      href: '/admin/agents/execute',
    },
    {
      id: 'agent-monitoring',
      name: '监控面板',
      href: '/admin/agents/monitor',
    },
  ],
}
```

#### 告警管理

**位置**: 系统监控分组（需确认具体行号）

```typescript
{
  id: 'monitoring',
  name: '系统监控',
  icon: <BarChart3 className="w-5 h-5" />,
  children: [
    // ✅ 今日新增：告警管理
    {
      id: 'alerts',
      name: '告警管理',
      href: '/admin/alerts',  // ← 新页面
    },
  ],
}
```

#### 数据分析

**位置**: 独立一级菜单或系统设置子菜单

```typescript
{
  id: 'analytics',
  name: '数据分析',
  href: '/admin/analytics',  // ← 新页面
  icon: <BarChart3 className="w-5 h-5" />,
  roles: ['admin', 'manager', 'analyst'],
}
```

#### 配置历史

**位置**: 系统设置分组

```typescript
{
  id: 'system-settings',
  name: '系统设置',
  icon: <Settings className="w-5 h-5" />,
  children: [
    // ✅ 今日新增：配置历史
    {
      id: 'config-history',
      name: '配置历史',
      href: '/admin/config-history',  // ← 新页面
    },
  ],
}
```

#### 订单交付

**位置**: 订单管理分组

```typescript
{
  id: 'orders',
  name: '订单管理',
  icon: <ShoppingCart className="w-5 h-5" />,
  children: [
    // ✅ 今日新增：订单交付
    {
      id: 'order-delivery',
      name: '订单交付',
      href: '/admin/order-delivery',  // ← 新页面
    },
  ],
}
```

---

## 🎨 从 AdminTopbar 快速访问

根据 `src/components/admin/AdminTopbar.tsx` 文件，顶部的模块快捷入口可能包括：

```typescript
const MODULES = [
  { name: '系统仪表板', href: '/admin/system-dashboard' },
  { name: '门户管理', href: '/admin/portals-management' },
  { name: 'FCX 权证', href: '/admin/fxc-management' },
  { name: '用户管理', href: '/admin/user-manager' },
  { name: '设备管理', href: '/admin/device-manager' },
];
```

**建议添加的快捷入口**:

- 智能体管理 → `/admin/agent-templates`
- 数据分析 → `/admin/analytics`
- 订单交付 → `/admin/order-delivery`

---

## 📱 移动端访问方式

### 步骤：

1. 点击左上角 **☰ 菜单按钮**
2. 展开侧边栏导航
3. 找到对应的菜单分组
4. 点击子菜单项进入

### 移动端优化：

- 所有 7 个页面均已响应式优化
- 支持触摸滑动操作
- 自动适配小屏幕

---

## 🔐 权限要求

### 各页面所需的最低角色权限：

| 页面                     | 所需角色                                     | 说明               |
| ------------------------ | -------------------------------------------- | ------------------ |
| `/admin/agent-templates` | `admin`, `manager`, `agent_operator`         | 智能体操作员可访问 |
| `/admin/agents-audit`    | `admin`, `manager`, `content_manager`        | 内容管理员可访问   |
| `/admin/alerts`          | `admin`, `manager`                           | 管理员专属         |
| `/admin/analytics`       | `admin`, `manager`, `analyst`                | 分析师可访问       |
| `/admin/config-history`  | `admin`                                      | 管理员专属         |
| `/admin/order-delivery`  | `admin`, `manager`, `procurement_specialist` | 采购专员可访问     |
| `/agents`                | 所有登录用户                                 | 前台公开展示页     |

---

## 🚀 推荐访问策略

### ⭐ 最快方式（推荐）

**直接复制粘贴 URL 到浏览器地址栏**

```
http://localhost:3001/admin/agent-templates
http://localhost:3001/admin/agents-audit
http://localhost:3001/admin/alerts
http://localhost:3001/admin/analytics
http://localhost:3001/admin/config-history
http://localhost:3001/admin/order-delivery
http://localhost:3001/agents
```

### 🎯 日常使用方式

1. **登录系统** → `http://localhost:3001/login`
2. **进入 Admin Dashboard** → 自动跳转到 `/admin/dashboard`
3. **通过侧边栏导航** → 点击对应菜单项

### 🔖 书签推荐

建议将常用的 3 个页面添加到浏览器书签：

- 智能体审核（高频使用）
- 数据分析（日常监控）
- 订单交付（业务处理）

---

## 📊 页面访问统计追踪

建议使用浏览器扩展或工具追踪这些页面的访问频率：

- Google Analytics
- Hotjar
- Microsoft Clarity

---

## 💡 提示

1. **首次访问**: 如果点击菜单后 404，请检查页面是否已正确部署
2. **认证问题**: 如果遇到 401，请参考 `QUICK_FIX_401.md` 进行修复
3. **权限不足**: 如果提示无权限，请联系管理员分配相应角色
4. **移动端**: 建议在移动设备上测试响应式布局

---

**文档生成时间**: 2026-03-24
**适用版本**: localhost:3001 开发环境
**最后更新**: 2026-03-24 23:59:59
