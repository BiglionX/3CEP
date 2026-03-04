# 智能体市场平台技术文档

## 📋 项目概述

**项目名称**: 智能体市场(Agent Marketplace)平台
**版本**: v1.0
**最后更新**: 2026年3月1日
**所属模块**: FixCycle 6.0 智能体生态系统

## 🎯 系统目标

构建完整的智能体发现、配置和管理平台，实现：

1. 企业用户像招聘员工一样使用智能体
2. 开发者可通过Token获得收益
3. 提供开源接口和插件化设计
4. 实现无配置使用的用户体验

## 🏗️ 系统架构

### 技术栈

- **前端框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript
- **UI组件库**: shadcn/ui + Tailwind CSS
- **状态管理**: React Hooks
- **数据获取**: Fetch API
- **后端服务**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)

### 目录结构

```
src/app/marketplace/
├── page.tsx                    # 市场主页
├── [id]/page.tsx              # 智能体详情页
├── categories/[category]/     # 分类页面
│   └── page.tsx
├── cart/page.tsx              # 购物车页面
├── checkout/page.tsx          # 结账页面
├── orders/page.tsx            # 订单管理页面
├── tokens/page.tsx            # Token钱包页面
├── developer/page.tsx         # 开发者收益页面
└── enterprise/page.tsx        # 企业订阅页面

src/app/api/marketplace/
├── route.ts                   # 市场API路由
├── orders/route.ts           # 订单API路由
├── tokens/route.ts           # Token经济API路由
└── enterprise/route.ts       # 企业订阅API路由
```

## 🔧 核心功能模块

### 1. 智能体市场主页 (`/marketplace`)

#### 功能特性

- **智能体展示**: 网格和列表两种视图模式
- **搜索功能**: 支持名称、描述、标签搜索
- **分类筛选**: 按类别筛选智能体
- **排序功能**: 支持按评分、下载量、价格、发布时间排序
- **精选推荐**: 突出显示优质智能体

#### 组件接口

```typescript
interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  price: number;
  token_cost_per_use: number;
  rating: number;
  download_count: number;
  developer: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. 智能体详情页 (`/marketplace/[id]`)

#### 功能特性

- **详细信息展示**: 完整的产品介绍和功能说明
- **多标签页**: 概览、功能、要求、更新日志、评价
- **截图预览**: 产品使用界面展示
- **用户评价**: 查看其他用户的使用体验
- **购买操作**: 直接购买或加入购物车

#### 组件接口

```typescript
interface AgentDetail extends MarketplaceAgent {
  long_description: string;
  screenshots: string[];
  documentation_url?: string;
  demo_video_url?: string;
  requirements: string[];
  features: string[];
  changelog: {
    version: string;
    date: string;
    changes: string[];
  }[];
  reviews: {
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    rating: number;
    comment: string;
    date: string;
  }[];
}
```

### 3. 分类浏览页 (`/marketplace/categories/[category]`)

#### 功能特性

- **分类导航**: 按业务领域分类浏览
- **高级筛选**: 价格区间、评分筛选
- **同类推荐**: 展示同类别下的其他智能体
- **行业专业化**: 针对不同行业的专门解决方案

### 4. 购物车系统 (`/marketplace/cart`)

#### 功能特性

- **商品管理**: 添加、删除、修改数量
- **价格计算**: 自动计算总价和Token消耗
- **优惠码支持**: 支持促销活动
- **安全保障**: 显示服务保障信息
- **结账引导**: 引导用户完成购买

#### 组件接口

```typescript
interface CartItem {
  id: string;
  agent: MarketplaceAgent;
  quantity: number;
  subtotal: number;
}
```

### 5. 结账系统 (`/marketplace/checkout`)

#### 功能特性

- **三步结账流程**: 信息填写 → 支付选择 → 订单确认
- **多种支付方式**: 支付宝、微信支付等
- **地址管理**: 完整的收货地址信息收集
- **订单预览**: 详细的订单信息确认
- **安全保障**: SSL加密和支付安全提示

### 6. 订单管理系统 (`/marketplace/orders`)

#### 功能特性

- **订单列表**: 按状态分类展示所有订单
- **订单详情**: 查看完整的订单信息
- **状态跟踪**: 实时跟踪订单处理状态
- **搜索过滤**: 按订单号或商品名称搜索
- **统计信息**: 订单数量和金额统计

#### 功能特性

- **商品管理**: 添加、删除、修改数量
- **价格计算**: 自动计算总价和Token消耗
- **优惠码支持**: 支持促销活动
- **安全保障**: 显示服务保障信息
- **结账流程**: 引导用户完成购买

#### 组件接口

```typescript
interface CartItem {
  id: string;
  agent: MarketplaceAgent;
  quantity: number;
  subtotal: number;
}
```

## 🗄️ 数据库设计

### 核心表结构

#### 智能体市场表

```sql
CREATE TABLE agent_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  category VARCHAR(100),
  version VARCHAR(20),
  price DECIMAL(10,2),
  token_cost_per_use DECIMAL(10,4),
  developer_id UUID REFERENCES users(id),
  rating DECIMAL(3,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  tags JSONB,
  screenshots JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 用户安装记录表

```sql
CREATE TABLE user_agent_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agent_marketplace(id),
  installation_type VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  configuration JSONB,
  installed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  last_used TIMESTAMP
);
```

#### 购物车表

```sql
CREATE TABLE shopping_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES agent_marketplace(id),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API接口设计

### 市场API (`/api/marketplace`)

#### GET /api/marketplace

获取智能体列表

**查询参数:**

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 12)
- `category`: 分类筛选
- `search`: 搜索关键词
- `sort`: 排序方式 (featured, rating, downloads, price-low, price-high, newest)
- `featured`: 是否只显示精选 (true/false)

**响应格式:**

```json
{
  "success": true,
  "data": [MarketplaceAgent],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  },
  "filters": {
    "category": "sales",
    "search": "客户",
    "sortBy": "featured"
  }
}
```

#### POST /api/marketplace

提交新的智能体

**请求体:**

```json
{
  "name": "销售助手智能体",
  "description": "专业的销售对话助手",
  "category": "sales",
  "price": 99.99,
  "token_cost_per_use": 0.5,
  "tags": ["销售", "CRM", "自动化"]
}
```

## 🎨 UI/UX设计规范

### 设计原则

1. **简洁直观**: 降低用户学习成本
2. **一致性强**: 统一的设计语言和交互模式
3. **响应式**: 适配各种设备屏幕
4. **高性能**: 优化加载速度和交互响应

### 组件规范

- **颜色系统**: 蓝色为主色调(#3B82F6)，搭配中性色系
- **间距系统**: 使用8px倍数的间距单位
- **字体系统**: 主要使用系统默认字体族
- **阴影系统**: 统一的阴影层级和过渡效果

### 交互规范

- **悬停效果**: 卡片悬停时轻微上浮和阴影增强
- **加载状态**: 使用骨架屏和加载动画
- **错误处理**: 友好的错误提示和重试机制
- **空状态**: 清晰的空状态指引

## 🔒 安全考虑

### 认证授权

- 所有API请求都需要用户认证
- 使用JWT Token进行身份验证
- 敏感操作需要额外权限验证

### 数据安全

- 用户数据加密存储
- API请求使用HTTPS传输
- 防止SQL注入和XSS攻击
- 实施合理的速率限制

### 内容安全

- 智能体内容审核机制
- 开发者身份验证
- 用户评价内容过滤
- 版权和知识产权保护

## 📊 性能优化

### 前端优化

- **代码分割**: 按路由分割代码包
- **图片优化**: 使用适当的图片格式和尺寸
- **缓存策略**: 合理使用浏览器缓存
- **懒加载**: 图片和组件的懒加载

### 后端优化

- **数据库索引**: 为常用查询字段建立索引
- **查询优化**: 减少不必要的数据库查询
- **缓存机制**: 使用Redis缓存热点数据
- **CDN加速**: 静态资源使用CDN分发

## 🧪 测试策略

### 自动化测试

- **单元测试**: 覆盖核心业务逻辑(目标85%覆盖率)
- **集成测试**: 测试API接口和数据库交互
- **端到端测试**: 模拟用户完整操作流程
- **性能测试**: 压力测试和负载测试

### 手动测试

- **功能测试**: 验证所有功能按预期工作
- **兼容性测试**: 不同浏览器和设备测试
- **用户体验测试**: 收集用户反馈和改进建议
- **安全性测试**: 渗透测试和安全审计

## 🚀 部署指南

### 环境要求

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Supabase账户

### 部署步骤

1. 克隆代码仓库
2. 安装依赖: `npm install`
3. 配置环境变量
4. 初始化数据库
5. 启动开发服务器: `npm run dev`
6. 构建生产版本: `npm run build`
7. 启动生产服务器: `npm start`

### 监控告警

- 应用性能监控(APM)
- 错误日志收集
- 用户行为分析
- 系统资源监控

## 📈 未来规划

### 短期目标 (1-3个月)

- 完善购买和支付流程
- 实现开发者后台管理
- 增加更多筛选和排序选项
- 优化移动端体验

### 中期目标 (3-6个月)

- 建立Token经济系统
- 实现收益分配机制
- 开发插件生态系统
- 增强社交和社区功能

### 长期目标 (6-12个月)

- 构建AI驱动的推荐系统
- 实现跨平台集成能力
- 建立完善的开发者生态
- 扩展国际化支持

---

**文档维护**: AI开发团队
**最后更新**: 2026年3月1日
