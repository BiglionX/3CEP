# 商业用户后台功能扩展计划

## 📋 概述

为所有商业用户后台（企业、维修店、贸易公司）添加以下5个核心功能模块：

1. **智能体管理** - 已使用的智能体、到期日、续费等，并可链接到智能体商店订阅
2. **Token管理** - Token余额、购买、使用记录
3. **门户管理** - 自定义营销页面（Logo、业务访问、宣传图片、博客管理）
4. **FXC管理** - 货币/金融管理
5. **APP下载** - 桌面端和手机端应用下载

---

## ✅ 已完成 - 企业后台

### 文件路径

`src/app/enterprise/admin/dashboard/page.tsx`

### 新增功能

#### 1. 菜单项更新

```typescript
const menuItems = [
  { name: '仪表盘', href: '/enterprise/admin/dashboard', icon: BarChart3 },
  { name: '智能体管理', href: '/enterprise/admin/agents', icon: Bot },
  { name: 'Token管理', href: '/enterprise/admin/tokens', icon: Coins }, // 新增
  { name: '门户管理', href: '/enterprise/admin/portal', icon: Globe }, // 新增
  { name: 'FXC管理', href: '/enterprise/admin/fxc', icon: CreditCard }, // 新增
  {
    name: '采购管理',
    href: '/enterprise/admin/procurement',
    icon: ShoppingCart,
  },
  { name: '有奖问答', href: '/enterprise/admin/reward-qa', icon: HelpCircle },
  {
    name: '新品众筹',
    href: '/enterprise/admin/crowdfunding',
    icon: DollarSign,
  },
  { name: '企业资料', href: '/enterprise/admin/documents', icon: FileText },
  { name: '设备管理', href: '/enterprise/admin/devices', icon: Package },
  { name: '数据分析', href: '/enterprise/admin/analytics', icon: TrendingUp },
  { name: '团队管理', href: '/enterprise/admin/team', icon: Users },
  { name: '系统设置', href: '/enterprise/admin/settings', icon: Settings },
];
```

#### 2. APP下载区域

在快捷操作卡片中添加了APP下载按钮：

```tsx
{
  /* APP下载区域 */
}
<div className="mt-6 pt-6 border-t">
  <h4 className="text-sm font-semibold text-gray-900 mb-4">
    <Smartphone className="h-4 w-4 mr-2 inline" />
    移动端应用
  </h4>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Button
      variant="outline"
      className="h-16 flex items-center justify-center gap-2"
    >
      <Download className="h-5 w-5" />
      <div className="text-left">
        <div className="text-sm font-semibold">桌面端下载</div>
        <div className="text-xs text-gray-500">Windows / Mac</div>
      </div>
    </Button>
    <Button
      variant="outline"
      className="h-16 flex items-center justify-center gap-2"
    >
      <Smartphone className="h-5 w-5" />
      <div className="text-left">
        <div className="text-sm font-semibold">手机APP下载</div>
        <div className="text-xs text-gray-500">iOS / Android</div>
      </div>
    </Button>
  </div>
</div>;
```

#### 3. 新增图标导入

```typescript
import {
  Bot,
  ShoppingCart,
  BarChart3,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  HelpCircle,
  FileText,
  Coins, // 新增
  Globe, // 新增
  Smartphone, // 新增
  Download, // 新增
  CreditCard, // 新增
} from 'lucide-react';
```

---

## 🔄 待完成 - 维修店后台

### 文件路径

`src/app/repair-shop/dashboard/page.tsx`

### 需要修改的组件

`src/components/dashboard/repair-shop-dashboard.tsx`

### 待添加功能

#### 1. 添加新图标导入

```typescript
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Star,
  ShoppingCart,
  Users,
  Clock,
  Activity,
  Bot, // 新增
  Coins, // 新增
  Globe, // 新增
  Smartphone, // 新增
  Download, // 新增
  CreditCard, // 新增
} from 'lucide-react';
```

#### 2. 添加侧边栏菜单项（如果有侧边栏）

```typescript
const menuItems = [
  // ... 现有菜单项
  { name: '智能体管理', href: '/repair-shop/agents', icon: Bot },
  { name: 'Token管理', href: '/repair-shop/tokens', icon: Coins },
  { name: '门户管理', href: '/repair-shop/portal', icon: Globe },
  { name: 'FXC管理', href: '/repair-shop/fxc', icon: CreditCard },
  // ... 其他菜单项
];
```

#### 3. 添加APP下载区域

在快捷操作或主内容区域添加：

```tsx
{
  /* APP下载区域 */
}
<Card className="mt-6">
  <CardHeader>
    <CardTitle className="flex items-center">
      <Smartphone className="h-5 w-5 mr-2" />
      移动端应用
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="h-16 flex items-center justify-center gap-2"
      >
        <Download className="h-5 w-5" />
        <div className="text-left">
          <div className="text-sm font-semibold">桌面端下载</div>
          <div className="text-xs text-gray-500">Windows / Mac</div>
        </div>
      </Button>
      <Button
        variant="outline"
        className="h-16 flex items-center justify-center gap-2"
      >
        <Smartphone className="h-5 w-5" />
        <div className="text-left">
          <div className="text-sm font-semibold">手机APP下载</div>
          <div className="text-xs text-gray-500">iOS / Android</div>
        </div>
      </Button>
    </div>
  </CardContent>
</Card>;
```

---

## 🔄 待完成 - 贸易公司后台

### 文件路径

`src/app/foreign-trade/company/page.tsx`

### 待添加功能

#### 1. 添加新图标导入

```typescript
import {
  // ... 现有图标
  Bot, // 新增
  Coins, // 新增
  Globe, // 新增
  Smartphone, // 新增
  Download, // 新增
  CreditCard, // 新增
} from 'lucide-react';
```

#### 2. 添加侧边栏菜单项（如果有侧边栏）

```typescript
const menuItems = [
  // ... 现有菜单项
  { name: '智能体管理', href: '/foreign-trade/agents', icon: Bot },
  { name: 'Token管理', href: '/foreign-trade/tokens', icon: Coins },
  { name: '门户管理', href: '/foreign-trade/portal', icon: Globe },
  { name: 'FXC管理', href: '/foreign-trade/fxc', icon: CreditCard },
  // ... 其他菜单项
];
```

#### 3. 添加APP下载区域

```tsx
{
  /* APP下载区域 */
}
<Card className="mt-6">
  <CardHeader>
    <CardTitle className="flex items-center">
      <Smartphone className="h-5 w-5 mr-2" />
      移动端应用
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Button
        variant="outline"
        className="h-16 flex items-center justify-center gap-2"
      >
        <Download className="h-5 w-5" />
        <div className="text-left">
          <div className="text-sm font-semibold">桌面端下载</div>
          <div className="text-xs text-gray-500">Windows / Mac</div>
        </div>
      </Button>
      <Button
        variant="outline"
        className="h-16 flex items-center justify-center gap-2"
      >
        <Smartphone className="h-5 w-5" />
        <div className="text-left">
          <div className="text-sm font-semibold">手机APP下载</div>
          <div className="text-xs text-gray-500">iOS / Android</div>
        </div>
      </Button>
    </div>
  </CardContent>
</Card>;
```

---

## 📁 需要创建的新页面

### 智能体管理页面

```
src/app/enterprise/admin/agents/page.tsx
src/app/repair-shop/agents/page.tsx
src/app/foreign-trade/agents/page.tsx
```

**页面功能：**

- 显示已使用的智能体列表
- 显示每个智能体的到期日
- 续费按钮
- 链接到智能体商店 `/agent-store` 进行订阅

### Token管理页面

```
src/app/enterprise/admin/tokens/page.tsx
src/app/repair-shop/tokens/page.tsx
src/app/foreign-trade/tokens/page.tsx
```

**页面功能：**

- 显示Token余额
- 购买Token按钮（链接到 `/tokens/packages`）
- Token使用记录
- 充值历史

### 门户管理页面

```
src/app/enterprise/admin/portal/page.tsx
src/app/repair-shop/portal/page.tsx
src/app/foreign-trade/portal/page.tsx
```

**页面功能：**

- Logo上传和管理
- 业务访问链接配置
- 宣传图片管理（限制数量和大小）
- 博客管理（限制数量）

### FXC管理页面

```
src/app/enterprise/admin/fxc/page.tsx
src/app/repair-shop/fxc/page.tsx
src/app/foreign-trade/fxc/page.tsx
```

**页面功能：**

- FXC余额显示
- FXC充值/提现
- 交易记录
- 汇率查询

---

## 🎨 UI组件建议

### 智能体管理页面示例

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">智能体管理</h1>
        <Link href="/agent-store">
          <Button>
            <Bot className="w-4 h-4 mr-2" />
            订阅智能体
          </Button>
        </Link>
      </div>

      {/* 智能体列表 */}
      <Card>
        <CardHeader>
          <CardTitle>已订阅的智能体</CardTitle>
        </CardHeader>
        <CardContent>{/* 智能体卡片列表 */}</CardContent>
      </Card>
    </div>
  );
}
```

### Token管理页面示例

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TokensPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Token管理</h1>
        <Link href="/tokens/packages">
          <Button>
            <Coins className="w-4 h-4 mr-2" />
            购买Token
          </Button>
        </Link>
      </div>

      {/* Token余额卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>Token余额</CardTitle>
        </CardHeader>
        <CardContent>{/* 余额显示 */}</CardContent>
      </Card>

      {/* 使用记录 */}
      <Card>
        <CardHeader>
          <CardTitle>使用记录</CardTitle>
        </CardHeader>
        <CardContent>{/* 记录表格 */}</CardContent>
      </Card>
    </div>
  );
}
```

---

## 📊 功能对比表

| 功能模块   | 企业后台  | 维修店后台 | 贸易公司后台 |
| ---------- | --------- | ---------- | ------------ |
| 智能体管理 | ✅ 菜单项 | 🔄 待添加  | 🔄 待添加    |
| Token管理  | ✅ 菜单项 | 🔄 待添加  | 🔄 待添加    |
| 门户管理   | ✅ 菜单项 | 🔄 待添加  | 🔄 待添加    |
| FXC管理    | ✅ 菜单项 | 🔄 待添加  | 🔄 待添加    |
| APP下载    | ✅ 按钮   | 🔄 待添加  | 🔄 待添加    |

---

## 🚀 下一步行动

1. **优先级1**：为维修店后台添加菜单项和APP下载
2. **优先级2**：为贸易公司后台添加菜单项和APP下载
3. **优先级3**：创建智能体管理页面（3个）
4. **优先级4**：创建Token管理页面（3个）
5. **优先级5**：创建门户管理页面（3个）
6. **优先级6**：创建FXC管理页面（3个）

---

## 📝 注意事项

1. **统一性**：所有后台的UI风格和交互方式应保持一致
2. **响应式**：确保所有新增功能在移动端也能正常使用
3. **权限控制**：根据用户角色显示/隐藏相应功能
4. **数据集成**：与现有API和数据库正确集成
5. **测试**：每个功能都需要进行完整的功能测试

---

## 🔗 相关链接

- 智能体商店：`/agent-store`
- Token包购买：`/tokens/packages`
- 商业用户注册：`/business-register`
