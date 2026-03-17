# 商业用户后台数据表和管理入口分析报告

## 📊 执行摘要

根据代码库检查，**新增功能有对应的数据表支持，但超级管理员后台尚未提供统一管理入口**。

---

## ✅ 数据表支持情况

### 1. 智能体管理 - ✅ 已有数据表

#### 相关数据表

- **`agents`** (`030_create_agents_tables.sql`)
  - 智能体基本信息：名称、描述、分类、配置
  - 状态管理：active/inactive/paused/error/draft
  - 版本控制：version、tags、pricing
  - 使用统计：usage_count、rating、review_count
  - 权限控制：is_public、is_featured、created_by

- **`agent_usage_logs`** (`030_create_agents_tables.sql`)
  - 使用日志：request_data、response_data、success、error_message
  - 性能监控：response_time_ms
  - 审计追踪：ip_address、user_agent、created_at

- **`agent_reviews`** (`030_create_agents_tables.sql`)
  - 用户评价：rating、comment
  - 审计：created_at、updated_at

- **`agent_versions`** (`030_create_agents_tables.sql`)
  - 版本历史：version、configuration、changelog
  - 版本控制：is_current、created_by

- **`user_agent_installations`** (`032_create_user_agent_installations.sql`)
  - 用户订阅智能体记录
  - 安装时间、状态、配置

#### 数据完整性

- ✅ 基础表结构完整
- ✅ RLS策略已配置
- ✅ 索引优化到位
- ✅ 示例数据已插入（15个智能体）

---

### 2. Token管理 - ✅ 已有数据表

#### 相关数据表

- **`token_packages`** (`20240115000001_create_token_system.sql`)
  - 套餐信息：name、description、token_amount、price
  - 优惠策略：discount_percentage
  - 排序和显示：is_popular、is_active、sort_order
  - 示例数据：4个套餐（基础、标准、高级、专业）

- **`user_tokens`** (`20240115000001_create_token_system.sql`)
  - 用户余额：balance、total_purchased、total_consumed
  - 时间戳：last_updated、created_at、updated_at
  - 唯一性约束：UNIQUE(user_id)

- **`token_transactions`** (`20240115000001_create_token_system.sql`)
  - 交易记录：transaction_type、amount、balance_before、balance_after
  - 关联：package_id、payment_id、description
  - 类型：purchase、consume、refund、bonus

- **`payments`** (`20240115000001_create_token_system.sql`)
  - 支付记录：amount、payment_method、payment_status
  - 第三方集成：transaction_id、payment_data
  - 状态：pending、completed、failed、refunded

#### 数据完整性

- ✅ 完整的支付流程支持
- ✅ RLS策略已配置
- ✅ 索引优化到位
- ✅ 示例套餐数据已插入

---

### 3. FXC管理 - ✅ 已有数据表

#### 相关数据表

- **`fcx_accounts`** (`009_create_fxc_system_tables.sql`)
  - 账户信息：balance、frozen_balance、account_type、status
  - 账户类型：factory、supplier、repair_shop
  - RLS策略：用户只能访问自己的账户

- **`fcx_transactions`** (`009_create_fcx_system_tables.sql`)
  - 交易流水：from_account_id、to_account_id、amount
  - 交易类型：purchase、reward、settlement、freeze、unfreeze、stake、unstake
  - 业务关联：reference_id、memo、status

- **`fcx2_options`** (`009_create_fcx_system_tables.sql`)
  - FCX2期权：amount、earned_from_order_id、status
  - 过期机制：expires_at = NOW() + 2 years

- **`repair_orders`** (`009_create_fcx_system_tables.sql`)
  - 维修工单：order_number、device_info、fault_description
  - FCX锁定：fcx_amount_locked
  - 状态流转：pending、confirmed、in_progress、completed、disputed、cancelled

#### 数据完整性

- ✅ 完整的FCX生态系统
- ✅ RLS策略已配置
- ✅ 索引优化到位
- ✅ 触发器：自动更新updated_at

---

### 4. 门户管理 - ⚠️ 部分支持

#### 相关数据表

- **`enterprise_documents`** (`026_enterprise_documents_management.sql`)
  - 企业文档：title、file_path、file_size、file_type
  - 分类管理：category、tags、metadata
  - 审批流程：status、uploaded_by、reviewed_by
  - 访问控制：access_level、download_count、view_count

- **`document_categories`** (`026_enterprise_documents_management.sql`)
  - 文档分类：name、code、description、parent_id
  - 必填字段：required_fields
  - 示例数据：5个分类（营业执照、资质证书、合同协议、财务报告、其他文档）

- **`document_approval_workflow`** (`026_enterprise_documents_management.sql`)
  - 审批流程：approver_id、approval_level、status、comments
  - 自动触发器：审批状态更新文档状态

#### 缺失的数据表

- ❌ **门户基本信息表**：存储logo、名称、描述、主题颜色
- ❌ **业务链接表**：存储用户自定义的业务链接
- ❌ **宣传图片表**：存储门户宣传图片（限5张）
- ❌ **博客文章表**：存储博客文章（限10篇）

#### 数据完整性

- ⚠️ 仅支持企业文档管理
- ❌ 缺少门户核心功能的数据表
- ❌ 需要创建门户专用数据表

---

## ❌ 超级管理员管理入口

### 当前超级管理员后台 (`/admin`)

#### 已有管理模块

- ✅ 用户管理 (`/admin/user-manager`)
- ✅ 维修店管理 (`/admin/shops`)
- ✅ 零件管理 (`/admin/parts`)
- ✅ 文章管理 (`/admin/articles`)
- ✅ 链接管理 (`/admin/links`)
- ✅ 设备管理 (`/admin/device-manager`)
- ✅ 内容审核 (`/admin/content-review`)
- ✅ 审计日志 (`/admin/audit-logs`)
- ✅ 系统监控 (`/admin/monitoring`)

#### ❌ 缺失的管理入口

1. **智能体统一管理**
   - 查看所有智能体订阅
   - 统一管理智能体配置
   - 查看智能体使用统计
   - 管理智能体评价

2. **Token统一管理**
   - 查看所有用户Token余额
   - 统一管理Token套餐
   - 查看Token交易记录
   - Token充值退款管理

3. **FXC统一管理**
   - 查看所有FCX账户
   - FCX交易流水查询
   - FCX汇率管理
   - FCX统计分析

4. **门户统一管理**
   - 查看所有用户门户配置
   - 审核门户内容
   - 门户使用统计
   - 门户模板管理

---

## 🔧 需要补充的工作

### 1. 创建门户管理数据表

#### 1.1 门户基本信息表

```sql
CREATE TABLE user_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL, -- 'enterprise', 'repair_shop', 'foreign_trade'
  portal_name VARCHAR(255) NOT NULL,
  portal_description TEXT,
  logo_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#2563eb',
  custom_domain VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, user_type)
);
```

#### 1.2 业务链接表

```sql
CREATE TABLE portal_business_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES user_portals(id) ON DELETE CASCADE,
  link_name VARCHAR(255) NOT NULL,
  link_url TEXT NOT NULL,
  link_icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 宣传图片表

```sql
CREATE TABLE portal_promotional_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES user_portals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_title VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.4 博客文章表

```sql
CREATE TABLE portal_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID REFERENCES user_portals(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 创建超级管理员统一管理页面

#### 2.1 智能体统一管理 (`/admin/agents-management`)

- 页面功能：
  - 查看所有用户订阅的智能体
  - 按用户类型筛选（企业/维修店/外贸）
  - 智能体使用统计
  - 智能体配置管理
  - 智能体评价管理

#### 2.2 Token统一管理 (`/admin/tokens-management`)

- 页面功能：
  - 查看所有用户Token余额
  - Token套餐管理
  - Token交易记录查询
  - Token统计分析
  - 手动调整Token余额

#### 2.3 FXC统一管理 (`/admin/fxc-management`)

- 页面功能：
  - 查看所有FCX账户
  - FCX交易流水查询
  - FCX汇率管理
  - FCX统计分析
  - 手动充值/提现

#### 2.4 门户统一管理 (`/admin/portals-management`)

- 页面功能：
  - 查看所有用户门户配置
  - 审核门户内容
  - 门户使用统计
  - 门户模板管理
  - 门户违规处理

### 3. 创建统一管理API

#### 3.1 智能体管理API

- `GET /api/admin/agents/subscriptions` - 获取所有订阅
- `GET /api/admin/agents/stats` - 获取统计数据
- `PUT /api/admin/agents/config` - 更新智能体配置
- `DELETE /api/admin/agents/:id` - 删除智能体

#### 3.2 Token管理API

- `GET /api/admin/tokens/balances` - 获取所有余额
- `GET /api/admin/tokens/transactions` - 获取交易记录
- `POST /api/admin/tokens/adjust` - 手动调整余额
- `GET /api/admin/tokens/stats` - 获取统计数据

#### 3.3 FXC管理API

- `GET /api/admin/fcx/accounts` - 获取所有账户
- `GET /api/admin/fcx/transactions` - 获取交易记录
- `POST /api/admin/fcx/adjust` - 手动调整余额
- `PUT /api/admin/fcx/rates` - 更新汇率

#### 3.4 门户管理API

- `GET /api/admin/portals/list` - 获取所有门户
- `GET /api/admin/portals/:id` - 获取门户详情
- `PUT /api/admin/portals/:id/review` - 审核门户
- `GET /api/admin/portals/stats` - 获取统计数据

---

## 📋 实施优先级

### P0 - 紧急（立即实施）

1. ✅ 创建门户管理数据表（4张表）
2. ✅ 在超级管理员后台添加导航菜单项
3. ✅ 创建基础API接口

### P1 - 高优先级（本周完成）

1. ✅ 实现智能体统一管理页面
2. ✅ 实现Token统一管理页面
3. ✅ 实现FXC统一管理页面
4. ✅ 实现门户统一管理页面

### P2 - 中优先级（下周完成）

1. ✅ 添加统计分析功能
2. ✅ 添加批量操作功能
3. ✅ 添加数据导出功能
4. ✅ 添加审计日志记录

### P3 - 低优先级（后续优化）

1. ✅ 优化性能和查询速度
2. ✅ 添加高级筛选和搜索
3. ✅ 添加实时数据更新
4. ✅ 添加自动化报告

---

## 🎯 总结

### 数据表支持情况

| 功能模块   | 数据表支持  | 完整性 | 备注                   |
| ---------- | ----------- | ------ | ---------------------- |
| 智能体管理 | ✅ 已有     | 100%   | 完整支持               |
| Token管理  | ✅ 已有     | 100%   | 完整支持               |
| FXC管理    | ✅ 已有     | 100%   | 完整支持               |
| 门户管理   | ⚠️ 部分支持 | 25%    | 仅企业文档，缺少核心表 |

### 管理入口情况

| 管理模块       | 超级管理员入口 | 状态     |
| -------------- | -------------- | -------- |
| 智能体统一管理 | ❌ 缺失        | 需要创建 |
| Token统一管理  | ❌ 缺失        | 需要创建 |
| FXC统一管理    | ❌ 缺失        | 需要创建 |
| 门户统一管理   | ❌ 缺失        | 需要创建 |

### 下一步行动

1. **立即执行**：创建门户管理数据表（4张）
2. **本周完成**：在超级管理员后台添加4个管理模块
3. **下周优化**：添加统计分析和批量操作功能

---

**报告生成时间**: 2026-03-17
**报告版本**: 1.0.0
**状态**: ✅ 分析完成
