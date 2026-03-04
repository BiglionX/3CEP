# 文件夹结构与模块匹配规范

## 📐 设计原则

### 1. 模块化架构

- **业务模块** → `src/modules/` - 核心业务逻辑，按领域划分
- **技术基建** → `src/tech/` - 纯技术实现，与业务解耦
- **应用层** → `src/app/` - Next.js 路由和页面
- **共享资源** → `src/components/`, `src/hooks/`, `src/lib/` - 跨模块复用

### 2. 目录命名规范

- ✅ 使用短横线命名 (kebab-case): `b2b-procurement`, `repair-service`
- ❌ 避免大括号等特殊字符: `compliance}`, `customers}`
- ❌ 避免根目录分散: 所有代码在 `src/` 下统一管理

### 3. 依赖关系清晰

- 业务模块之间通过接口通信
- 技术基建层不依赖任何业务模块
- 共享资源层完全独立，可被任意模块使用

---

## 🏗️ 标准目录结构

```
src/
├── app/                              # 【应用层】Next.js App Router
│   ├── (public)/                     # 公共页面包围组
│   │   ├── landing/                  # 营销落地页
│   │   ├── login/                    # 登录注册
│   │   └── page.tsx                  # 首页
│   ├── (dashboard)/                  # 仪表板页面包围组
│   │   ├── dashboard/                # 用户仪表板
│   │   └── layout.tsx                # 仪表板布局
│   ├── admin/                        # 管理后台
│   │   ├── users/                    # 用户管理
│   │   ├── orders/                   # 订单管理
│   │   └── layout.tsx                # 后台布局
│   ├── api/                          # API 路由
│   │   ├── auth/                     # 认证相关 API
│   │   ├── procurement/              # 采购相关 API
│   │   └── health/                   # 健康检查 API
│   └── globals.css                   # 全局样式
│
├── modules/                          # 【业务模块层】核心业务逻辑
│   ├── index.ts                      # 模块统一导出
│   │
│   ├── auth/                         # 认证授权模块
│   │   ├── services/                 # 业务服务
│   │   │   └── auth.service.ts       # 认证服务
│   │   ├── hooks/                    # 业务 Hooks
│   │   │   └── useAuth.ts            # 认证 Hook
│   │   ├── components/               # 业务组件
│   │   │   ├── LoginForm.tsx         # 登录表单
│   │   │   └── RegisterForm.tsx      # 注册表单
│   │   ├── constants/                # 业务常量
│   │   │   └── auth.constants.ts     # 认证常量
│   │   └── types/                    # 业务类型
│   │       └── auth.types.ts         # 认证类型定义
│   │
│   ├── repair-service/               # 维修服务模块
│   │   ├── services/
│   │   │   ├── repair.service.ts     # 维修服务
│   │   │   ├── work-order.service.ts # 工单服务
│   │   │   └── diagnosis.service.ts  # 诊断服务
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── parts-market/                 # 配件商城模块
│   │   ├── services/
│   │   │   ├── parts.service.ts      # 配件服务
│   │   │   └── marketplace.service.ts# 商城服务
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── b2b-procurement/              # B2B采购模块
│   │   ├── services/
│   │   │   ├── procurement.service.ts# 采购服务
│   │   │   ├── supplier.service.ts   # 供应商服务
│   │   │   └── logistics.service.ts  # 物流服务
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── data-center/                  # 数据中心模块
│   │   ├── services/
│   │   │   ├── data.service.ts       # 数据服务
│   │   │   ├── analytics.service.ts  # 分析服务
│   │   │   └── reporting.service.ts  # 报告服务
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── fcx-alliance/                 # FCX联盟模块
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   ├── admin-panel/                  # 管理后台模块
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── constants/
│   │   └── types/
│   │
│   └── common/                       # 公共业务模块
│       ├── components/               # 跨模块业务组件
│       │   ├── ErrorBoundary.tsx     # 错误边界
│       │   ├── Loading.tsx           # 加载组件
│       │   └── PermissionGuard.tsx   # 权限守卫
│       ├── hooks/                    # 跨模块业务 Hooks
│       │   ├── usePermission.ts      # 权限 Hook
│       │   └── useRole.ts            # 角色 Hook
│       ├── constants/                # 全局业务常量
│       │   ├── roles.constants.ts    # 角色常量
│       │   └── permissions.constants.ts # 权限常量
│       └── types/                    # 全局业务类型
│           ├── common.types.ts       # 通用类型
│           └── user.types.ts         # 用户类型
│
├── tech/                             # 【技术基建层】纯技术实现
│   ├── index.ts                      # 技术模块统一导出
│   │
│   ├── database/                     # 数据库层
│   │   ├── models/                   # 数据模型
│   │   │   ├── user.model.ts         # 用户模型
│   │   │   ├── order.model.ts        # 订单模型
│   │   │   └── product.model.ts      # 产品模型
│   │   ├── repositories/             # 数据访问层
│   │   │   ├── user.repository.ts    # 用户数据访问
│   │   │   └── order.repository.ts   # 订单数据访问
│   │   ├── connection.ts             # 数据库连接
│   │   └── types.ts                  # 数据库类型
│   │
│   ├── api/                          # API 层
│   │   ├── controllers/              # 控制器
│   │   │   ├── auth.controller.ts    # 认证控制器
│   │   │   └── user.controller.ts    # 用户控制器
│   │   ├── services/                 # 技术服务
│   │   │   ├── response.service.ts   # 响应处理服务
│   │   │   └── validation.service.ts # 参数验证服务
│   │   ├── routes/                   # 路由定义
│   │   │   └── index.ts              # 路由汇总
│   │   └── types.ts                  # API 类型
│   │
│   ├── middleware/                   # 中间件层
│   │   ├── auth.middleware.ts        # 认证中间件
│   │   ├── logging.middleware.ts     # 日志中间件
│   │   ├── error.middleware.ts       # 错误处理中间件
│   │   ├── rateLimit.middleware.ts   # 限流中间件
│   │   └── cors.middleware.ts        # CORS 中间件
│   │
│   ├── utils/                        # 工具函数层
│   │   ├── helper.utils.ts           # 辅助函数
│   │   ├── validation.utils.ts       # 验证工具
│   │   ├── formatting.utils.ts       # 格式化工具
│   │   ├── crypto.utils.ts           # 加密工具
│   │   └── date.utils.ts             # 日期工具
│   │
│   └── types/                        # TypeScript 类型定义
│       ├── common.types.ts           # 通用类型
│       ├── api.types.ts              # API 类型
│       ├── database.types.ts         # 数据库类型
│       └── utils.types.ts            # 工具类型
│
├── lib/                              # 【第三方库封装】外部依赖适配
│   ├── index.ts                      # 库统一导出
│   ├── supabase/                     # Supabase 客户端
│   │   ├── client.ts                 # Supabase 客户端实例
│   │   ├── auth.ts                   # 认证封装
│   │   └── storage.ts                # 存储封装
│   ├── redis/                        # Redis 客户端
│   │   ├── client.ts                 # Redis 客户端实例
│   │   └── cache.ts                  # 缓存封装
│   ├── llm/                          # LLM API 封装
│   │   ├── deepseek.ts               # DeepSeek API
│   │   └── prompt.ts                 # Prompt 模板
│   └── axios.ts                      # Axios 实例配置
│
├── components/                       # 【UI 组件库】纯展示组件
│   ├── index.ts                      # 组件统一导出
│   ├── ui/                           # 基础 UI 组件
│   │   ├── Button/                   # 按钮组件
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   └── index.ts
│   │   ├── Input/                    # 输入框组件
│   │   ├── Table/                    # 表格组件
│   │   ├── Modal/                    # 模态框组件
│   │   └── ...
│   ├── business/                     # 业务组件 (跨模块复用)
│   │   ├── DataTable/                # 数据表格
│   │   ├── SearchBar/                # 搜索栏
│   │   ├── Pagination/               # 分页器
│   │   └── ...
│   └── layouts/                      # 布局组件
│       ├── MainLayout.tsx            # 主布局
│       ├── DashboardLayout.tsx       # 仪表板布局
│       └── AdminLayout.tsx           # 管理后台布局
│
├── hooks/                            # 【React Hooks】跨模块复用
│   ├── index.ts                      # Hooks 统一导出
│   ├── useAuth.ts                    # 认证 Hook
│   ├── usePermission.ts              # 权限 Hook
│   ├── useDebounce.ts                # 防抖 Hook
│   ├── useLocalStorage.ts            # 本地存储 Hook
│   └── useFetch.ts                   # 数据获取 Hook
│
├── stores/                           # 【状态管理】Zustand stores
│   ├── index.ts
│   ├── auth.store.ts                 # 认证状态
│   ├── user.store.ts                 # 用户状态
│   └── app.store.ts                  # 应用状态
│
├── contexts/                         # 【React Contexts】上下文
│   ├── AuthContext.tsx               # 认证上下文
│   ├── ThemeContext.tsx              # 主题上下文
│   └── ConfigContext.tsx             # 配置上下文
│
├── config/                           # 【配置文件】环境配置
│   ├── index.ts                      # 配置统一导出
│   ├── app.config.ts                 # 应用配置
│   ├── database.config.ts            # 数据库配置
│   ├── redis.config.ts               # Redis 配置
│   └── env.config.ts                 # 环境变量配置
│
├── types/                            # 【全局类型】跨模块类型定义
│   ├── index.ts
│   ├── global.d.ts                   # 全局类型声明
│   ├── next-auth.d.ts                # NextAuth 类型扩展
│   └── styled-components.d.ts        # 样式组件类型
│
├── styles/                           # 【全局样式】
│   ├── globals.css                   # 全局样式
│   ├── variables.css                 # CSS 变量
│   └── mixins.css                    # CSS Mixins
│
├── migrations/                       # 【数据库迁移】
│   ├── 001_create_users_table.sql
│   ├── 002_create_orders_table.sql
│   └── ...
│
└── __tests__/                        # 【单元测试】
    ├── setup.ts                      # 测试环境设置
    ├── mocks/                        # Mock 数据
    │   ├── auth.mock.ts
    │   └── user.mock.ts
    └── helpers/                      # 测试辅助函数
        └── test-utils.ts
```

---

## 🔄 当前结构对比与调整建议

### 现状分析

#### ✅ 已符合规范的部分

```bash
src/modules/auth/              # ✓ 正确
src/modules/repair-service/    # ✓ 正确
src/modules/parts-market/      # ✓ 正确
src/modules/b2b-procurement/   # ✓ 正确
src/modules/admin-panel/       # ✓ 正确
src/modules/common/            # ✓ 正确
src/tech/database/             # ✓ 正确
src/tech/api/                  # ✓ 正确
src/tech/middleware/           # ✓ 正确
src/tech/utils/                # ✓ 正确
src/tech/types/                # ✓ 正确
```

#### ⚠️ 需要调整的部分

##### 1. 业务模块位置调整

```bash
# 当前存在的问题
src/data-center/               # ❌ 在 src/ 下，应该在 src/modules/data-center/
src/fcx-system/                # ❌ 名称不匹配，应该在 src/modules/fcx-alliance/

# 新增的模块需要确认归类
src/procurement-intelligence/  # ? 是 b2b-procurement 的子模块还是独立模块？
src/sales-intelligence/        # ? 新业务模块，需要在配置中注册
src/sales-agent/               # ? 同上
src/agent-sdk/                 # ? 技术基建还是业务模块？
```

**建议操作**:

```bash
# 方案 A: 移动到 modules 下 (如果是业务模块)
mv src/data-center src/modules/data-center
mv src/fcx-system src/modules/fcx-alliance

# 方案 B: 更新配置文件 (如果保持独立)
# 在 project-structure-config.json 中添加这些模块定义
```

##### 2. 技术基建整合

```bash
# 当前重复的目录
src/middleware/                # ❌ 与 src/tech/middleware/ 重复
src/utils/                     # ❌ 与 src/tech/utils/ 重复
src/types/                     # ⚠️  与 src/tech/types/ 功能重叠
src/controllers/               # ❌ 应该合并到 src/tech/api/controllers/
src/models/                    # ❌ 应该合并到 src/tech/database/models/

# 建议操作
# 1. 检查内容差异
# 2. 合并到对应的 tech 目录下
# 3. 删除重复目录
```

##### 3. Agent 相关模块处理

```bash
src/agents-orchestrator/       # ? 建议：如果是核心编排逻辑，保留为独立模块
src/b2b-procurement-agent/     # ❌ 建议：合并到 src/modules/b2b-procurement/agent/
src/test-agent/                # ❌ 建议：删除或移动到 tests/agents/
src/sales-agent/               # ? 建议：作为 sales-intelligence 的子模块
```

##### 4. 其他目录清理

```bash
src/decorators/                # ? 用途不明，需确认是否必要
src/permissions/               # ⚠️  应该在 modules/common/ 或 modules/auth/
src/security/                  # ⚠️  应该在 tech/middleware/ 或 tech/utils/
src/stores/                    # ✓ 保留 (状态管理)
src/contexts/                  # ✓ 保留 (React Contexts)
src/config/                    # ✓ 保留 (配置文件)
src/lib/                       # ✓ 保留 (第三方库封装)
src/components/                # ✓ 保留 (UI 组件)
src/hooks/                     # ✓ 保留 (React Hooks)
src/styles/                    # ✓ 保留 (样式文件)
src/migrations/                # ✓ 保留 (数据库迁移)
src/supply-chain/              # ? 需确认：是业务模块还是子服务？
src/monitoring/                # ⚠️  建议在 tech/ 下创建 monitoring/
src/analytics/                 # ⚠️  应该在 modules/data-center/ 下
```

---

## 📝 执行步骤

### Phase 1: 调研与规划 (1-2 天)

- [ ] 梳理每个目录的实际内容和用途
- [ ] 识别重复代码和冗余目录
- [ ] 确定最终目录结构
- [ ] 更新 `project-structure-config.json`

### Phase 2: 备份与准备 (0.5 天)

- [ ] 创建完整的 Git 提交
- [ ] 备份当前结构
- [ ] 通知团队成员

### Phase 3: 逐步迁移 (3-5 天)

- [ ] 移动业务模块到 `src/modules/`
- [ ] 整合技术基建到 `src/tech/`
- [ ] 清理重复目录
- [ ] 更新所有导入路径
- [ ] 删除无效目录 (`compliance}`, `customers}` 等)

### Phase 4: 验证与测试 (2-3 天)

- [ ] 运行 TypeScript 编译检查
- [ ] 运行单元测试
- [ ] 运行集成测试
- [ ] 手动测试关键功能
- [ ] 修复发现的问题

### Phase 5: 文档更新 (1 天)

- [ ] 更新 README.md
- [ ] 更新开发文档
- [ ] 编写迁移指南
- [ ] 培训团队成员

---

## ⚠️ 注意事项

### 1. 渐进式重构原则

- ✅ 小步快跑，每次只移动少量目录
- ✅ 每步都进行测试验证
- ✅ 避免大规模一次性重构
- ✅ 保持代码始终可运行

### 2. 导入路径更新

移动目录后，需要更新所有受影响的导入:

```typescript
// ❌ 旧路径
import { AuthService } from '@/services/auth.service';

// ✅ 新路径
import { AuthService } from '@/modules/auth/services/auth.service';
```

### 3. 避免破坏性变更

- 保持对外暴露的 API 不变
- 保持组件接口兼容
- 使用别名过渡期兼容

### 4. 团队协作

- 提前通知所有成员
- 选择低峰期执行
- 做好回滚预案

---

## 🎯 预期收益

### 代码质量提升

- ✅ 模块职责清晰
- ✅ 依赖关系明确
- ✅ 易于理解和维护

### 开发效率提升

- ✅ 快速定位代码
- ✅ 减少导入错误
- ✅ 便于代码复用

### 可扩展性增强

- ✅ 新增模块标准化
- ✅ 降低耦合度
- ✅ 支持团队并行开发

---

## 📊 决策清单

### 需要确认的问题

1. **data-center 模块**
   - [ ] 移动到 `src/modules/data-center/`
   - [ ] 保持独立，更新配置文件

2. **fcx-system 模块**
   - [ ] 重命名为 `fcx-alliance` 并移动到 `src/modules/`
   - [ ] 保持独立

3. **重复的技术目录**
   - [ ] 合并 `src/middleware/` 到 `src/tech/middleware/`
   - [ ] 合并 `src/utils/` 到 `src/tech/utils/`
   - [ ] 合并 `src/controllers/` 到 `src/tech/api/controllers/`
   - [ ] 合并 `src/models/` 到 `src/tech/database/models/`

4. **Agent 相关模块**
   - [ ] `b2b-procurement-agent` 合并到 `b2b-procurement` 模块
   - [ ] `test-agent` 删除或归档
   - [ ] `agents-orchestrator` 保持独立或重新归类

5. **其他目录**
   - [ ] `supply-chain/` - 独立模块还是子服务？
   - [ ] `procurement-intelligence/` - 独立还是归属于 `b2b-procurement`?
   - [ ] `sales-intelligence/` 和 `sales-agent/` - 新业务模块？

---

## 💡 推荐方案

基于**渐进式重构**原则，推荐以下方案:

### 短期 (发版前)

1. ✅ 清理明显的空目录和临时文件
2. ✅ 合并重复的技术目录 (`middleware`, `utils` 等)
3. ✅ 删除无效的 Agent 目录 (`test-agent`)
4. ✅ 更新配置文件保持一致

### 中期 (发版后)

1. 🔄 逐步将业务模块迁移到 `src/modules/`
2. 🔄 完善 `src/tech/` 技术基建层
3. 🔄 建立清晰的模块边界

### 长期 (持续优化)

1. 🎯 严格执行模块化规范
2. 🎯 定期审查和优化结构
3. 🎯 保持文档与代码同步
