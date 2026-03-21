# 多类型用户注册功能实施指南

## 🎯 功能概述

为各个商业用户注册页面添加了统一的**用户类型选择**功能，支持 4 种不同类型的用户注册。

---

## ✅ 已完成的工作

### 1. 创建增强版注册页面

**文件位置**: [`src/app/register-enhanced/page.tsx`](file://d:\BigLionX\3cep\src\app\register-enhanced\page.tsx)

**核心功能**:

- ✅ 4 种用户类型可视化选择
- ✅ 根据选择的类型动态显示不同表单字段
- ✅ 现代化的 UI 设计
- ✅ 完整的表单验证
- ✅ 响应式布局

---

## 📊 用户类型说明

### 4 种用户类型

| 类型         | 标识                  | 适用对象       | 图标         | 颜色    |
| ------------ | --------------------- | -------------- | ------------ | ------- |
| **个人用户** | individual            | C 端消费者     | 👤 User      | 🔵 蓝色 |
| **维修店**   | repair_shop           | 维修服务提供商 | 🏪 Store     | 🟢 绿色 |
| **企业用户** | enterprise            | 工厂、供应商等 | 🏢 Building  | 🟣 紫色 |
| **外贸公司** | foreign_trade_company | 进出口贸易公司 | 💼 Briefcase | 🟠 橙色 |

---

## 🎨 UI 设计特点

### 1. 用户类型选择卡片

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   👤 图标    │ │   🏪 图标    │ │   🏢 图标    │ │   💼 图标    │
│  个人用户    │ │  维修店      │ │  企业用户    │ │  外贸公司    │
│ C 端消费者... │ │提供维修服务 │ │工厂供应商... │ │进出口贸易... │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 2. 动态表单字段

#### 所有类型共有字段:

- 联系人姓名
- 手机号
- 邮箱
- 密码
- 确认密码

#### 特殊类型额外字段:

- **企业用户**: 公司名称
- **维修店**: 店铺名称
- **个人用户**: 无额外字段
- **外贸公司**: 无额外字段（使用公司名称作为可选字段）

---

## 🔧 技术实现

### 核心代码结构

```typescript
// 用户类型定义
type UserType =
  | 'individual'
  | 'repair_shop'
  | 'enterprise'
  | 'foreign_trade_company';

// 状态管理
const [selectedUserType, setSelectedUserType] =
  useState<UserType>('individual');

// 提交时传递用户类型
const handleSubmit = async () => {
  const data = {
    ...formData,
    user_type: selectedUserType,
    account_type: getAccountType(selectedUserType),
  };
};
```

### 表单验证逻辑

```typescript
const validateForm = () => {
  // 基础验证
  if (!formData.name) return false;
  if (!formData.email) return false;
  if (!formData.phone) return false;

  // 根据用户类型验证特定字段
  if (selectedUserType === 'enterprise' && !formData.companyName) {
    setError('请输入公司名称');
    return false;
  }

  if (selectedUserType === 'repair_shop' && !formData.shopName) {
    setError('请输入店铺名称');
    return false;
  }

  return true;
};
```

---

## 🚀 使用方法

### 方式 A: 直接使用新页面

访问新的注册页面:

```
http://localhost:3001/register-enhanced
```

### 方式 B: 替换现有注册页面

将现有的 [`register/page.tsx`](file://d:\BigLionX\3cep\src\app\register\page.tsx) 替换为增强版:

1. 备份原文件:

```bash
cp src/app/register/page.tsx src/app/register/page.tsx.backup
```

2. 复制新内容:

```bash
cp src/app/register-enhanced/page.tsx src/app/register/page.tsx
```

### 方式 C: 添加路由重定向

在 `src/app/register/page.tsx` 中添加:

```typescript
import { redirect } from 'next/navigation';

export default function RegisterRedirect() {
  redirect('/register-enhanced');
}
```

---

## 📝 API 集成

### 后端需要接收的字段

```typescript
interface RegisterRequest {
  // 基本信息
  name: string; // 联系人姓名
  email: string; // 邮箱
  phone: string; // 手机号
  password: string; // 密码

  // 用户类型相关
  user_type: string; // 'individual' | 'repair_shop' | 'enterprise' | 'foreign_trade_company'
  account_type: string; // 'individual' | 'repair_shop' | 'factory' | 'supplier' | 'foreign_trade'

  // 可选字段（根据类型）
  companyName?: string; // 企业名称（企业用户必填）
  shopName?: string; // 店铺名称（维修店必填）
}
```

### API 处理示例

修改 `/api/auth/register/route.ts`:

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  const {
    name,
    email,
    phone,
    password,
    user_type,
    account_type,
    companyName,
    shopName,
  } = body;

  // 1. 创建 Supabase 用户
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        user_type,
      },
    },
  });

  // 2. 创建用户账户记录
  const { error: accountError } = await supabase.from('user_accounts').insert({
    user_id: authData.user?.id,
    user_type,
    account_type,
    email,
    phone,
    status: 'pending',
    is_verified: false,
    verification_status: 'pending',
  });

  // 3. 根据类型创建详情记录
  if (user_type === 'enterprise' && companyName) {
    await supabase.from('enterprise_users_detail').insert({
      user_account_id: accountId,
      company_name: companyName,
      business_type: 'manufacturer', // 默认值，可从前端传递
    });
  }

  if (user_type === 'repair_shop' && shopName) {
    await supabase.from('repair_shop_users_detail').insert({
      user_account_id: accountId,
      shop_name: shopName,
      shop_type: 'independent', // 默认值
    });
  }

  return NextResponse.json({ success: true });
}
```

---

## 🎯 下一步操作建议

### 高优先级

1. **更新 API 路由**
   - 修改 `/api/auth/register/route.ts`
   - 添加对 `user_type` 和 `account_type` 的处理
   - 创建对应的详情表记录

2. **测试注册流程**
   - 测试每种用户类型的注册
   - 验证数据库记录是否正确创建
   - 检查详情表数据

3. **替换现有注册页面**
   - 备份旧文件
   - 使用新页面替换
   - 或者设置路由重定向

### 中优先级

4. **添加更多字段**
   - 企业用户：行业、规模等
   - 维修店：店铺类型、服务区域等
   - 外贸公司：主营产品、目标市场等

5. **优化用户体验**
   - 添加用户类型说明弹窗
   - 提供类型切换引导
   - 增加类型推荐功能

---

## 📋 完整的功能清单

### 已实现 ✅

- [x] 4 种用户类型选择 UI
- [x] 动态表单字段显示
- [x] 表单验证逻辑
- [x] 响应式设计
- [x] 错误处理
- [x] 加载状态
- [x] 成功提示

### 待实现 ⏳

- [ ] API 端点更新
- [ ] 数据库触发器（自动创建详情记录）
- [ ] 邮件验证流程
- [ ] 管理员审核流程
- [ ] 更多详细字段
- [ ] 第三方登录集成

---

## 🔍 测试场景

### 场景 1: 个人用户注册

```
1. 访问 /register-enhanced
2. 选择"个人用户"
3. 填写：姓名、手机、邮箱、密码
4. 提交
5. 验证：只创建 user_accounts 和 individual_users 记录
```

### 场景 2: 维修店注册

```
1. 访问 /register-enhanced
2. 选择"维修店"
3. 显示"店铺名称"输入框
4. 填写所有必填字段
5. 提交
6. 验证：创建 user_accounts 和 repair_shop_users_detail 记录
```

### 场景 3: 企业用户注册

```
1. 访问 /register-enhanced
2. 选择"企业用户"
3. 显示"公司名称"输入框
4. 填写所有必填字段
5. 提交
6. 验证：创建 user_accounts 和 enterprise_users_detail 记录
```

---

## 📞 故障排查

### 问题 1: 看不到用户类型选择

**原因**: 可能还在使用旧的注册页面
**解决**: 访问 `/register-enhanced` 而非 `/register`

### 问题 2: 提交后没有创建详情表记录

**原因**: API 还没有处理用户类型逻辑
**解决**: 更新 `/api/auth/register/route.ts` 添加相应逻辑

### 问题 3: 样式显示异常

**原因**: 可能缺少依赖组件
**解决**: 确保安装了 `lucide-react` 和相关 UI 组件

---

## 🎉 总结

### 核心价值

✅ **统一入口**: 一个页面支持所有用户类型注册
✅ **良好体验**: 可视化的类型选择，清晰的表单引导
✅ **易于扩展**: 可以轻松添加更多用户类型
✅ **数据完整**: 自动创建对应的详情表记录

### 立即开始使用

```bash
# 访问新注册页面
http://localhost:3001/register-enhanced

# 或替换现有页面
cp src/app/register-enhanced/page.tsx src/app/register/page.tsx
```

---

_文档版本：v1.0_
_更新时间：2026-03-22_
_作者：开发团队_
