# 外贸管理模块技术规范 (Foreign Trade Management Module)

## 📋 模块概述

外贸管理模块是Procyc平台的核心业务模块之一，为进出口贸易企业提供完整的数字化管理解决方案。该模块支持进口商和出口商的双向贸易业务，涵盖订单管理、合作伙伴管理、物流跟踪、仓储管理等全链条业务流程。

## 🎯 核心功能

### 1. 订单管理 (Order Management)
- **订单创建**: 支持进出口订单的在线创建和管理
- **订单跟踪**: 实时跟踪订单状态和交付进度
- **多维度筛选**: 按状态、类型、时间等条件筛选订单
- **统计分析**: 订单数量、金额、状态分布等数据分析

### 2. 合作伙伴管理 (Partner Management)
- **供应商管理**: 供应商信息维护、资质审核、绩效评估
- **客户管理**: 客户档案管理、信用评级、交易历史
- **合同管理**: 合同创建、审批、执行跟踪
- **关系维护**: 合作伙伴沟通记录、评估反馈

### 3. 物流管理 (Logistics Management)
- **发货管理**: 发货单创建、承运商协调、运输安排
- **物流跟踪**: 实时物流状态监控、位置跟踪
- **仓储管理**: 仓库信息管理、库存监控、出入库记录
- **运输方式**: 支持海运、空运、陆运、铁路等多种运输方式

## 🏗️ 系统架构

### 前端架构
```
/src/app/foreign-trade/
├── company/                    # 外贸公司管理
│   ├── page.tsx               # 公司主页仪表板
│   ├── orders/                # 订单管理
│   │   ├── page.tsx          # 订单列表
│   │   ├── create/page.tsx   # 创建订单
│   │   └── tracking/page.tsx # 订单跟踪
│   ├── partners/              # 合作伙伴管理
│   │   ├── suppliers/page.tsx # 供应商管理
│   │   ├── customers/page.tsx # 客户管理
│   │   └── contracts/page.tsx # 合同管理
│   └── logistics/             # 物流管理
│       ├── shipping/page.tsx  # 发货管理
│       ├── tracking/page.tsx  # 物流跟踪
│       └── warehouse/page.tsx # 仓储管理
└── components/                # 共享组件
    └── foreign-trade/
        ├── Sidebar.tsx        # 侧边栏导航
        ├── StatsCard.tsx      # 统计卡片
        └── ActionMenu.tsx     # 操作菜单
```

### 后端API架构
```
/src/app/api/foreign-trade/
├── orders/
│   ├── route.ts              # 订单列表和创建
│   └── [id]/route.ts         # 订单详情操作
├── partners/
│   ├── route.ts              # 合作伙伴列表和创建
│   └── [id]/route.ts         # 合作伙伴详情操作
├── shipments/
│   └── route.ts              # 发货管理
└── tracking/
    └── [tracking_number]/route.ts # 物流跟踪
```

### 数据库设计
```sql
-- 核心业务表
foreign_trade_orders          -- 订单管理表
foreign_trade_partners        -- 合作伙伴表
foreign_trade_contracts       -- 合同管理表
foreign_trade_shipments       -- 发货管理表
foreign_trade_warehouses      -- 仓储管理表
foreign_trade_inventory       -- 库存管理表

-- 扩展功能表
foreign_trade_partner_contacts    -- 合作伙伴联系人
foreign_trade_partner_products    -- 合作伙伴产品目录
foreign_trade_shipping_routes     -- 运输路线
foreign_trade_customs_duties      -- 关税信息
```

## 🔧 技术实现

### 前端技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI库**: shadcn/ui + Tailwind CSS
- **状态管理**: React Hooks
- **数据获取**: fetch API
- **响应式设计**: 移动端优先

### 后端技术栈
- **运行时**: Node.js
- **框架**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **安全**: Row Level Security (RLS)

### 核心组件设计

#### 1. 侧边栏导航组件 (Sidebar.tsx)
```typescript
interface SidebarProps {
  activeRole: 'importer' | 'exporter';
  onRoleChange: (role: 'importer' | 'exporter') => void;
  menuItems: MenuItem[];
}
```

#### 2. 统计卡片组件 (StatsCard.tsx)
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}
```

#### 3. 操作菜单组件 (ActionMenu.tsx)
```typescript
interface ActionMenuProps {
  actions: MenuItem[];
  align?: 'start' | 'end';
}
```

## 📊 API接口规范

### 订单管理API
```
GET    /api/foreign-trade/orders           # 获取订单列表
POST   /api/foreign-trade/orders           # 创建新订单
GET    /api/foreign-trade/orders/{id}      # 获取订单详情
PUT    /api/foreign-trade/orders/{id}      # 更新订单
DELETE /api/foreign-trade/orders/{id}      # 删除订单
```

### 合作伙伴管理API
```
GET    /api/foreign-trade/partners         # 获取合作伙伴列表
POST   /api/foreign-trade/partners         # 创建新合作伙伴
PUT    /api/foreign-trade/partners         # 批量导入合作伙伴
GET    /api/foreign-trade/partners/{id}    # 获取合作伙伴详情
PUT    /api/foreign-trade/partners/{id}    # 更新合作伙伴
PATCH  /api/foreign-trade/partners/{id}/status # 更新合作伙伴状态
```

### 物流管理API
```
GET    /api/foreign-trade/shipments        # 获取发货单列表
POST   /api/foreign-trade/shipments        # 创建新发货单
PUT    /api/foreign-trade/shipments        # 批量更新发货状态
GET    /api/foreign-trade/tracking/{tn}    # 获取物流跟踪信息
POST   /api/foreign-trade/tracking         # 创建物流跟踪记录
PUT    /api/foreign-trade/tracking/{tn}    # 更新物流状态
```

## 🔒 安全与权限

### 访问控制
- **RBAC权限模型**: 基于角色的访问控制
- **数据隔离**: 用户只能访问自己创建的数据
- **操作审计**: 关键操作记录审计日志

### 数据安全
- **传输加密**: HTTPS协议
- **存储加密**: 敏感数据加密存储
- **输入验证**: 严格的参数校验
- **SQL注入防护**: 参数化查询

## 📱 响应式设计

### 断点设置
- **手机**: 375px - 639px
- **平板**: 640px - 1023px
- **桌面**: 1024px+

### 移动端适配
- 侧边栏折叠为汉堡菜单
- 表格转换为卡片布局
- 操作按钮合并为下拉菜单
- 触控友好的交互设计

## 🚀 性能优化

### 前端优化
- **代码分割**: 按路由分割代码
- **懒加载**: 组件和图片懒加载
- **缓存策略**: 合理使用浏览器缓存
- **骨架屏**: 加载状态优化用户体验

### 后端优化
- **数据库索引**: 关键字段建立索引
- **查询优化**: 避免N+1查询问题
- **分页处理**: 大数据集分页返回
- **缓存机制**: 热点数据Redis缓存

## 📈 监控与运维

### 性能监控
- **页面加载时间**: 关键页面性能指标
- **API响应时间**: 接口调用耗时统计
- **错误率监控**: 异常请求捕获统计
- **用户行为分析**: 功能使用情况追踪

### 日志管理
- **访问日志**: 用户操作轨迹记录
- **错误日志**: 系统异常详细记录
- **审计日志**: 敏感操作完整记录
- **性能日志**: 系统性能指标收集

## 🔧 部署配置

### 环境变量
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
DATABASE_URL=your_database_connection
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📚 相关文档

- [数据库设计文档](../../../sql/foreign-trade-schema.sql)
- [API接口文档](../api-documentation.md)
- [用户操作手册](../../user-guides/foreign-trade-user-guide.md)
- [管理员手册](../../admin-guides/foreign-trade-admin-guide.md)

---
**版本**: v1.0  
**最后更新**: 2026年2月26日  
**作者**: Procyc开发团队