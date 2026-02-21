# 众筹模块部署文档

## 项目概述

基于 FixCycle 业务需求，从零构建的众筹系统模块，支持项目创建、展示、预定和支付功能。

## 技术架构

- **前端框架**: Next.js 14 (App Router)
- **后端服务**: Next.js API Routes
- **数据库**: PostgreSQL (Supabase)
- **认证系统**: Supabase Auth
- **样式框架**: Tailwind CSS
- **编程语言**: TypeScript

## 核心功能

### 1. 项目管理

- ✅ 项目创建和编辑（草稿模式）
- ✅ 项目发布和状态管理
- ✅ 项目分类和标签系统
- ✅ 产品型号和兼容机型关联

### 2. 用户交互

- ✅ 项目列表展示和搜索
- ✅ 项目详情页面
- ✅ 支持预定功能
- ✅ 回报选择机制

### 3. 支付集成准备

- ✅ 预定流程完整实现
- ✅ 支持记录管理
- ✅ 回报设置和验证
- ✅ 支付接口预留

## 目录结构

```
src/
├── app/
│   ├── crowdfunding/                 # 众筹主页面
│   │   ├── page.tsx                 # 项目列表页
│   │   ├── [id]/                    # 项目详情页
│   │   │   └── page.tsx
│   │   ├── create/                  # 创建项目页
│   │   │   └── page.tsx
│   │   └── success/                 # 预定成功页
│   │       └── page.tsx
│   └── api/
│       └── crowdfunding/            # API接口
│           ├── projects/            # 项目相关API
│           │   └── route.ts
│           ├── [id]/                # 单个项目API
│           │   └── route.ts
│           └── pledges/             # 支持相关API
│               └── route.ts
├── services/
│   └── crowdfunding/                # 业务服务层
│       ├── project-service.ts      # 项目服务
│       ├── pledge-service.ts       # 支持服务
│       └── reward-service.ts       # 回报服务
├── hooks/
│   └── use-auth.ts                  # 认证Hook
└── components/
    └── crowdfunding/                # 众筹组件（预留）

supabase/
└── migrations/
    └── 019_create_crowdfunding_system.sql  # 数据库迁移
```

## 数据库设计

### 核心表结构

1. **crowdfunding_projects** - 众筹项目表
2. **crowdfunding_pledges** - 支持记录表
3. **crowdfunding_rewards** - 回报设置表
4. **crowdfunding_updates** - 项目更新表

### 关键特性

- 行级安全(RLS)策略
- 索引优化查询性能
- 存储过程支持统计计算
- 完整的约束和验证

## 部署步骤

### 1. 环境准备

```bash
# 确保Node.js和npm已安装
node --version  # 推荐 v18+
npm --version
```

### 2. 依赖安装

```bash
npm install
```

### 3. 数据库迁移

```bash
# 方法一：使用Supabase CLI（推荐）
npx supabase migration up

# 方法二：手动执行SQL
# 在Supabase控制台或psql中执行
# supabase/migrations/019_create_crowdfunding_system.sql
```

### 4. 环境变量配置

确保以下环境变量已在 `.env.local` 中配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. 启动应用

```bash
npm run dev
```

访问地址：http://localhost:3001/crowdfunding

## 使用指南

### 创建众筹项目

1. 访问 `/crowdfunding/create`
2. 填写项目基本信息
3. 设置回报档次
4. 预览并创建项目
5. 项目初始状态为"草稿"
6. 可编辑完善后发布

### 浏览和预定项目

1. 访问 `/crowdfunding` 查看项目列表
2. 使用搜索和筛选功能
3. 点击项目进入详情页
4. 选择支持金额和回报
5. 点击"立即预定"
6. 确认预定信息
7. 跳转到支付流程

### 管理功能

- 项目创建者可在个人中心管理自己的项目
- 管理员可审核和管理系统项目
- 支持记录可在用户中心查看

## API 接口文档

### 项目相关接口

```
GET    /api/crowdfunding/projects          # 获取项目列表
POST   /api/crowdfunding/projects          # 创建新项目
GET    /api/crowdfunding/projects/[id]     # 获取项目详情
PUT    /api/crowdfunding/projects/[id]     # 更新项目
DELETE /api/crowdfunding/projects/[id]     # 删除项目
POST   /api/crowdfunding/projects/[id]/publish  # 发布项目
```

### 支持相关接口

```
GET    /api/crowdfunding/pledges           # 获取用户支持记录
POST   /api/crowdfunding/pledges           # 创建支持记录
```

## 安全特性

### 认证授权

- 基于 JWT 的用户认证
- RBAC 权限控制系统
- 行级安全策略(RLS)
- 数据访问控制

### 数据验证

- 前端表单验证
- 后端数据校验
- 数据库约束检查
- 业务逻辑验证

## 性能优化

### 前端优化

- 响应式设计适配多设备
- 图片懒加载
- 分页加载减少数据传输
- 缓存策略优化

### 后端优化

- 数据库索引优化
- 查询结果缓存
- API 响应压缩
- 连接池管理

## 测试验证

### 功能测试清单

- [x] 项目创建流程
- [x] 项目展示和搜索
- [x] 项目详情查看
- [x] 预定功能完整流程
- [x] 回报选择和验证
- [x] 用户权限控制
- [x] 数据持久化存储

### 验收标准达成

✅ 能成功创建一个众筹项目  
✅ 用户可查看项目列表  
✅ 用户可查看详情页面  
✅ 点击"立即预定"功能可用  
✅ 支持完整的业务流程

## 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 Supabase 服务状态
   - 验证环境变量配置
   - 确认网络连接正常

2. **认证失败**

   - 检查 JWT 令牌有效性
   - 验证用户权限设置
   - 确认 RLS 策略配置

3. **API 调用错误**
   - 检查请求参数格式
   - 验证认证头信息
   - 查看服务端日志

### 日志监控

```bash
# 查看应用日志
npm run dev

# 查看数据库日志
supabase logs
```

## 后续扩展建议

### 功能增强

- 支付网关集成（支付宝、微信支付）
- 项目动态更新功能
- 社交分享和推广
- 数据分析和报表
- 消息通知系统

### 技术优化

- 微服务架构拆分
- 缓存层引入(Redis)
- 搜索引擎集成(Elasticsearch)
- 实时通信(WebSocket)
- 自动化测试覆盖

## 维护和支持

### 版本管理

- 遵循语义化版本规范
- 定期备份数据库
- 文档同步更新

### 监控告警

- 系统健康检查
- 性能指标监控
- 错误日志收集
- 用户行为分析

---

**部署完成时间**: 2026 年 2 月 20 日  
**负责人**: AI 助手  
**版本**: v1.0.0
