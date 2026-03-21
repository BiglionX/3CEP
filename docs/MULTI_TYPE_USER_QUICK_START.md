# 多类型用户管理 - 快速开始指南

## 🚀 5 分钟快速上手

### 第 1 步：确认数据库已就绪 ✅

您已经在 Supabase Dashboard 中验证了数据库表结构：

- ✅ 用户相关表总数：13
- ✅ 索引总数：26
- ✅ 触发器总数：4

**数据库已经完全就绪！**

---

### 第 2 步：启动开发服务器

```bash
# 如果服务器还未启动
npm run dev
```

等待看到：

```
✓ Ready in XXXXms
○ http://localhost:3001
```

---

### 第 3 步：访问用户管理页面 🎉

#### 方式 A：直接访问 URL

```
http://localhost:3001/admin/users
```

#### 方式 B：通过菜单点击

1. 登录到管理后台
2. 在左侧菜单栏找到 **"用户管理"**
3. 点击进入

---

### 第 4 步：体验功能 ✨

现在您可以看到：

#### 📊 统计卡片

- 总用户数
- 个人用户数量
- 维修店数量
- 企业用户数量

#### 🔍 强大的筛选功能

- **用户类型**: 个人/维修店/企业/外贸公司
- **账户类型**: 个人/维修店/工厂/供应商/企业/外贸
- **状态**: 活跃/待审核/已暂停/已关闭/已拒绝
- **认证状态**: 已认证/审核中/待审核/已拒绝
- **关键词搜索**: 邮箱或手机

#### 📋 用户列表

显示所有用户信息，包括：

- 用户类型图标
- 账户类型
- 邮箱/手机
- 角色
- 订阅计划
- 状态标签
- 认证状态标签
- 创建时间

#### 🔎 用户详情

点击任意用户的"查看"按钮（或直接访问 `/admin/users/{userId}`）可以看到：

- 完整的基本信息
- 详细信息（公司名称、地址等）
- 元数据（JSON 格式）
- 操作日志（待实现）

---

## 💡 当前状态说明

### ✅ 立即可用的功能

| 功能         | 状态    | 说明                      |
| ------------ | ------- | ------------------------- |
| 查看用户列表 | ✅ 可用 | 显示模拟数据              |
| 筛选和搜索   | ✅ 可用 | 前端筛选逻辑已实现        |
| 查看用户详情 | ✅ 可用 | 详情页面已完成            |
| 菜单导航     | ✅ 可用 | 侧边栏已有菜单项          |
| 权限控制     | ✅ 可用 | admin 和 manager 角色可见 |

### ⚠️ 需要注意的地方

#### 1. 数据是模拟的

**现象**: 页面显示的数据是硬编码的
**原因**: API 调用代码被注释
**位置**:

- [`src/app/admin/users/page.tsx:146-150`](file://d:\BigLionX\3cep\src\app\admin\users\page.tsx#L146-L150)
- [`src/app/admin/users/[id]/page.tsx:79-85`](file://d:\BigLionX\3cep\src\app\admin\users[id]\page.tsx#L79-L85)

**解决方法**:

```typescript
// 找到这段代码并取消注释
const response = await fetch(`/api/admin/user-management?${params}`);
const data = await response.json();
setUsers(data.users);
```

#### 2. 需要真实数据

**选项 A**: 等待用户自然注册
**选项 B**: 手动插入测试数据

```sql
-- 示例：插入一个测试用户
INSERT INTO user_accounts (
  user_id, user_type, account_type, email, phone,
  status, is_verified, verification_status,
  subscription_plan, role
) VALUES (
  gen_random_uuid(), 'enterprise', 'factory',
  'test@example.com', '13800138000',
  'active', true, 'verified',
  'enterprise', 'manager'
);
```

---

## 🎯 常用操作

### 查看所有用户

直接访问列表页面即可看到所有用户（当前是模拟数据）

### 筛选特定类型的用户

1. 在"用户类型"下拉框中选择类型
2. 点击"应用筛选"按钮

### 搜索特定用户

1. 在搜索框输入邮箱或手机号
2. 按回车或点击"应用筛选"

### 查看用户详情

点击用户行右侧的"查看"按钮（眼睛图标）

---

## 📝 下一步建议

### 高优先级

1. **连接真实 API**

   ```bash
   # 编辑 src/app/admin/users/page.tsx
   # 取消 API 调用的注释
   ```

2. **测试 API 端点**

   ```bash
   curl http://localhost:3001/api/admin/user-management
   ```

3. **运行编译检查**
   ```bash
   npm run build
   ```

### 中优先级

4. **添加示例数据**
   - 创建几个测试用户用于演示

5. **完善权限配置**
   - 参考 [`user-management-permissions.ts`](file://d:\BigLionX\3cep\src\config\user-management-permissions.ts)

### 低优先级

6. **增强功能**
   - 批量导入导出
   - 数据分析图表
   - 审计日志

---

## 🐛 常见问题

### Q1: 为什么看不到数据？

**A**: 当前使用的是模拟数据，需要连接真实 API。请查看上面的"注意事项"部分。

### Q2: 菜单在哪里？

**A**: 在左侧边栏，找到"用户管理"菜单项。只有 admin 和 manager 角色可见。

### Q3: 如何添加新用户？

**A**: 目前系统只读展示。如需创建功能，可以参考权限配置文件添加 `usermgr.create` 权限。

### Q4: 可以删除用户吗？

**A**: 需要 `usermgr.delete` 权限，目前只有 admin 角色有此权限。

---

## 📚 完整文档

- 📘 [**部署指南**](file://d:\BigLionX\3cep\docs\MULTI_TYPE_USER_DEPLOYMENT_GUIDE.md)
- 📊 [**实施报告**](file://d:\BigLionX\3cep\MULTI_TYPE_USER_INTEGRATION_REPORT.md)
- 💡 [**使用指南**](file://d:\BigLionX\3cep\docs\MULTI_TYPE_USER_MANAGEMENT_GUIDE.md)
- 🔐 [**权限配置**](file://d:\BigLionX\3cep\src\config\user-management-permissions.ts)

---

## 🎉 恭喜！

您已经完成了快速开始！现在您可以：

- ✅ 访问用户管理页面
- ✅ 使用各种筛选功能
- ✅ 查看用户详情
- ✅ 理解系统架构

**立即访问**: http://localhost:3001/admin/users

---

_最后更新：2026-03-22_
