# 数据中心统一数据标准规范

## 📋 规范文畴

**文档编号**: DC008-STANDARDS  
**版本**: v1.0  
**生效日期**: 2026年2月28日  
**适用范围**: 数据中心模块及所有相关业务系统

## 🎯 设计原则

### 核心原则

1. **一致性**: 统一命名规范和数据格式
2. **清晰性**: 字段含义明确，易于理解
3. **扩展性**: 支持业务发展和系统演进
4. **兼容性**: 兼顾现有系统，支持渐进式改造
5. **可验证性**: 提供数据质量检查和验证机制

### 命名哲学

- **业务导向**: 字段名反映业务含义而非技术实现
- **简洁明确**: 避免冗余，保持适度长度
- **前瞻设计**: 考虑未来业务场景扩展

## 📐 命名规范标准

### 1. 基础命名规则

#### 1.1 字段命名规范

```
[业务域_]实体类型[_属性][_修饰词]
```

**示例**:

- `user_id` (用户ID)
- `device_model_name` (设备型号名称)
- `part_category_code` (配件分类代码)
- `order_status_current` (订单当前状态)

#### 1.2 命名风格统一

- **数据库字段**: snake_case (下划线命名)
- **API接口**: camelCase (驼峰命名)
- **前端展示**: 中文标签 + 英文标识符

#### 1.3 常用前缀规范

| 前缀   | 含义   | 使用场景 | 示例                           |
| ------ | ------ | -------- | ------------------------------ |
| `id`   | 标识符 | 主键字段 | `user_id`, `device_id`         |
| `name` | 名称   | 实体名称 | `user_name`, `brand_name`      |
| `code` | 代码   | 编码字段 | `category_code`, `status_code` |
| `desc` | 描述   | 详细描述 | `product_desc`, `error_desc`   |
| `flag` | 标志   | 布尔状态 | `is_active`, `has_permission`  |
| `num`  | 数量   | 数值统计 | `order_num`, `click_num`       |
| `amt`  | 金额   | 货币数值 | `order_amt`, `discount_amt`    |
| `dt`   | 日期   | 日期字段 | `create_dt`, `expire_dt`       |
| `tm`   | 时间   | 时间字段 | `start_tm`, `update_tm`        |
| `cnt`  | 计数   | 统计计数 | `view_cnt`, `share_cnt`        |

### 2. 时间字段标准

#### 2.1 标准时区

- **统一时区**: UTC时间存储
- **展示时区**: 根据用户区域自动转换
- **格式标准**: ISO 8601格式 (YYYY-MM-DDTHH:mm:ss.sssZ)

#### 2.2 时间字段命名

```typescript
// 创建时间
created_at: string; // 数据库存储 (UTC)
createdAt: Date; // 应用层使用 (本地化)

// 更新时间
updated_at: string; // 数据库存储 (UTC)
updatedAt: Date; // 应用层使用 (本地化)

// 业务时间
effective_start_dt: string; // 生效开始日期
effective_end_dt: string; // 生效结束日期
last_login_tm: string; // 最后登录时间
```

#### 2.3 时间精度要求

- **事务时间**: 毫秒级精度
- **业务时间**: 秒级精度通常足够
- **统计时间**: 日级精度按需使用

### 3. 状态和枚举标准

#### 3.1 状态字段统一

```typescript
// 通用状态字段
status: StatusEnum         // 主状态字段
sub_status?: SubStatusEnum // 子状态字段（可选）

// 布尔标志字段
is_active: boolean         // 激活状态
is_deleted: boolean        // 删除标志
is_verified: boolean       // 验证状态
```

#### 3.2 标准枚举定义

```typescript
// 通用状态枚举
export enum CommonStatus {
  ACTIVE = 'active', // 激活
  INACTIVE = 'inactive', // 非激活
  PENDING = 'pending', // 待处理
  APPROVED = 'approved', // 已批准
  REJECTED = 'rejected', // 已拒绝
  SUSPENDED = 'suspended', // 已暂停
  ARCHIVED = 'archived', // 已归档
}

// 业务状态枚举示例
export enum OrderStatus {
  CREATED = 'created', // 已创建
  CONFIRMED = 'confirmed', // 已确认
  PROCESSING = 'processing', // 处理中
  SHIPPED = 'shipped', // 已发货
  DELIVERED = 'delivered', // 已送达
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}
```

### 4. 数值字段标准

#### 4.1 精度和范围定义

```typescript
// 价格相关字段
price: number; // 价格 (保留2位小数)
cost_price: number; // 成本价 (保留2位小数)
market_price: number; // 市场价 (保留2位小数)

// 数量相关字段
quantity: integer; // 整数数量
stock_quantity: integer; // 库存数量
weight: number; // 重量 (保留3位小数)
volume: number; // 体积 (保留3位小数)

// 百分比字段
discount_rate: number; // 折扣率 (0-1之间的小数)
rating_score: number; // 评分 (0-5之间的数值)
completion_rate: number; // 完成率 (0-1之间的小数)
```

#### 4.2 数值约束标准

```typescript
// 数据库约束示例
price DECIMAL(10,2) CHECK (price >= 0),           // 非负价格
quantity INTEGER CHECK (quantity >= 0),           // 非负数量
rating_score DECIMAL(3,2) CHECK (rating_score BETWEEN 0 AND 5), // 评分范围
discount_rate DECIMAL(3,2) CHECK (discount_rate BETWEEN 0 AND 1) // 折扣率范围
```

### 5. 字符串字段标准

#### 5.1 长度和格式规范

```typescript
// 基本信息字段
name: string(100); // 姓名 (最多100字符)
title: string(200); // 标题 (最多200字符)
description: string(1000); // 描述 (最多1000字符)
content: text; // 内容 (长文本)

// 编码字段
code: string(20); // 业务编码 (最多20字符)
serial_number: string(50); // 序列号 (最多50字符)
barcode: string(30); // 条形码 (最多30字符)

// 联系信息字段
email: string(255); // 邮箱 (标准邮箱格式)
phone: string(20); // 电话 (标准电话格式)
url: string(500); // 网址 (URL格式)
```

#### 5.2 格式验证规则

```typescript
// 正则表达式验证规则
const ValidationRules = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/.+/,
  CODE: /^[A-Z0-9_\-]{1,20}$/, // 大写字母、数字、下划线、连字符
  SLUG: /^[a-z0-9\-]{1,50}$/, // 小写字母、数字、连字符
};
```

## 🏗️ 数据模型标准

### 1. 基础实体模型

#### 1.1 通用实体接口

```typescript
// 所有业务实体的基础接口
export interface BaseEntity {
  // 标识字段
  id: string; // 全局唯一标识符 (UUID)

  // 审计字段
  created_at: string; // 创建时间 (UTC)
  created_by: string; // 创建人ID
  updated_at: string; // 更新时间 (UTC)
  updated_by: string; // 更新人ID

  // 状态字段
  status: CommonStatus; // 业务状态
  is_active: boolean; // 激活标志
  is_deleted: boolean; // 删除标志

  // 版本控制
  version: number; // 数据版本号
  tenant_id?: string; // 租户ID (多租户场景)
}

// 业务实体扩展接口
export interface BusinessEntity extends BaseEntity {
  // 业务相关字段
  name: string; // 实体名称
  code?: string; // 业务编码
  description?: string; // 描述信息
  tags?: string[]; // 标签数组
}
```

#### 1.2 标准实体示例

```typescript
// 用户实体标准
export interface StandardUser extends BusinessEntity {
  username: string; // 用户名
  email: string; // 邮箱
  phone?: string; // 手机号
  avatar_url?: string; // 头像URL
  last_login_at?: string; // 最后登录时间
  login_count: number; // 登录次数
}

// 设备实体标准
export interface StandardDevice extends BusinessEntity {
  brand: string; // 品牌
  model: string; // 型号
  category: string; // 分类
  specifications?: Record<string, any>; // 规格参数
  release_date?: string; // 发布日期
  warranty_period?: number; // 保修期(月)
}
```

### 2. 关系模型标准

#### 2.1 一对一关系

```typescript
// 用户详情 (一对一关系)
export interface UserDetail {
  user_id: string; // 关联用户ID
  real_name: string; // 真实姓名
  id_card: string; // 身份证号
  birthday: string; // 生日
  gender: 'male' | 'female' | 'other'; // 性别
  address: string; // 地址
}
```

#### 2.2 一对多关系

```typescript
// 用户地址 (一对多关系)
export interface UserAddress {
  id: string;
  user_id: string; // 关联用户ID
  type: 'home' | 'work' | 'other'; // 地址类型
  recipient: string; // 收件人
  phone: string; // 联系电话
  province: string; // 省份
  city: string; // 城市
  district: string; // 区县
  detail_address: string; // 详细地址
  is_default: boolean; // 是否默认地址
}
```

#### 2.3 多对多关系

```typescript
// 用户角色关联 (多对多关系)
export interface UserRole {
  user_id: string; // 用户ID
  role_id: string; // 角色ID
  assigned_at: string; // 分配时间
  assigned_by: string; // 分配人
  expiry_date?: string; // 过期时间
}
```

### 3. 历史记录模型

#### 3.1 操作日志标准

```typescript
export interface OperationLog {
  id: string;
  entity_type: string; // 实体类型
  entity_id: string; // 实体ID
  operation_type: 'create' | 'update' | 'delete' | 'query'; // 操作类型
  operator_id: string; // 操作人ID
  operator_ip: string; // 操作IP
  before_data?: string; // 变更前数据 (JSON)
  after_data?: string; // 变更后数据 (JSON)
  operation_time: string; // 操作时间
  remarks?: string; // 备注
}
```

#### 3.2 数据变更历史

```typescript
export interface DataHistory {
  id: string;
  table_name: string; // 表名
  record_id: string; // 记录ID
  field_name: string; // 字段名
  old_value?: string; // 旧值
  new_value?: string; // 新值
  changed_at: string; // 变更时间
  changed_by: string; // 变更人
  change_reason?: string; // 变更原因
}
```

## 🔍 数据质量标准

### 1. 完整性约束

#### 1.1 必填字段规则

```sql
-- 核心必填字段
ALTER TABLE users
ADD CONSTRAINT users_name_not_null CHECK (name IS NOT NULL),
ADD CONSTRAINT users_email_not_null CHECK (email IS NOT NULL),
ADD CONSTRAINT users_status_not_null CHECK (status IS NOT NULL);

-- 业务必填字段
ALTER TABLE orders
ADD CONSTRAINT orders_amount_positive CHECK (amount > 0),
ADD CONSTRAINT orders_quantity_positive CHECK (quantity > 0);
```

#### 1.2 默认值设置

```sql
-- 合理的默认值
ALTER TABLE entities
ALTER COLUMN status SET DEFAULT 'active',
ALTER COLUMN is_active SET DEFAULT true,
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN version SET DEFAULT 1;
```

### 2. 一致性约束

#### 2.1 外键约束

```sql
-- 强制引用完整性
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_order_id
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
```

#### 2.2 业务规则约束

```sql
-- 业务逻辑约束
ALTER TABLE products
ADD CONSTRAINT chk_product_price_non_negative
CHECK (price >= 0),

ADD CONSTRAINT chk_product_stock_non_negative
CHECK (stock_quantity >= 0),

ADD CONSTRAINT chk_product_category_valid
CHECK (category IN ('electronics', 'clothing', 'books', 'home'));
```

### 3. 唯一性约束

#### 3.1 业务唯一性

```sql
-- 业务关键字段唯一性
ALTER TABLE users
ADD CONSTRAINT uk_users_email UNIQUE (email),
ADD CONSTRAINT uk_users_phone UNIQUE (phone);

ALTER TABLE products
ADD CONSTRAINT uk_products_code UNIQUE (product_code);
```

#### 3.2 组合唯一性

```sql
-- 复合唯一约束
ALTER TABLE user_roles
ADD CONSTRAINT uk_user_roles_unique
UNIQUE (user_id, role_id, tenant_id);

ALTER TABLE inventory_records
ADD CONSTRAINT uk_inventory_unique
UNIQUE (product_id, warehouse_id, batch_number);
```

## 📚 标准文档管理

### 1. 数据字典规范

#### 1.1 字段说明模板

```markdown
### 字段名: user_email

- **中文名称**: 用户邮箱
- **数据类型**: VARCHAR(255)
- **约束条件**: NOT NULL, UNIQUE
- **格式要求**: 标准邮箱格式
- **业务含义**: 用户的主要联系方式和登录凭证
- **取值范围**: 符合RFC 5322标准的邮箱地址
- **默认值**: 无
- **示例值**: user@example.com
- **相关字段**: user_phone, user_username
```

#### 1.2 枚举值说明模板

```markdown
### 枚举类型: OrderStatus

- **中文名称**: 订单状态
- **枚举值**:
  - `created`: 已创建 - 订单刚提交，尚未确认
  - `confirmed`: 已确认 - 商家已确认订单
  - `processing`: 处理中 - 正在准备商品
  - `shipped`: 已发货 - 商品已发出
  - `delivered`: 已送达 - 商品已送达客户
  - `completed`: 已完成 - 订单已完成
  - `cancelled`: 已取消 - 订单已被取消
```

### 2. 版本管理规范

#### 2.1 标准版本号格式

```
主版本号.次版本号.修订号
例如: 1.2.3
```

#### 2.2 版本变更规则

- **主版本号**: 重大结构性变更，可能不兼容
- **次版本号**: 新增功能，向后兼容
- **修订号**: Bug修复，向后兼容

#### 2.3 变更记录格式

```markdown
## 版本变更记录

### v1.2.0 (2026-03-01)

**新增功能**:

- 添加用户标签管理功能
- 支持多语言描述字段

**修改内容**:

- 调整订单状态枚举值
- 优化价格字段精度

**废弃内容**:

- 移除旧的用户等级字段
```

## 🛠️ 实施指南

### 1. 渐进式改造策略

#### 1.1 第一阶段：新系统实施

- 所有新建表和字段严格遵循新标准
- 建立标准检查工具和验证机制

#### 1.2 第二阶段：存量系统改造

- 优先改造核心业务表
- 保持对外接口兼容性
- 逐步替换旧字段

#### 1.3 第三阶段：全面标准化

- 完成所有系统的标准化改造
- 建立自动化检查和报警机制
- 形成标准化文化

### 2. 工具支持

#### 2.1 标准检查工具

```typescript
// 数据标准验证工具
export class DataStandardValidator {
  static validateEntity(entity: any, entityType: string): ValidationResult {
    // 字段命名检查
    // 数据类型检查
    // 约束条件检查
    // 业务规则检查
  }

  static generateStandardReport(entities: any[]): StandardReport {
    // 生成合规性报告
    // 识别不符合项
    // 提供改进建议
  }
}
```

#### 2.2 自动化转换工具

```typescript
// 数据迁移和转换工具
export class DataMigrationTool {
  static convertFieldName(oldName: string): string {
    // 字段名转换逻辑
    const mapping = {
      create_time: 'created_at',
      update_time: 'updated_at',
      user_name: 'username',
    };
    return mapping[oldName] || oldName;
  }

  static migrateTableStructure(
    oldTable: string,
    newTable: string
  ): MigrationResult {
    // 表结构迁移逻辑
  }
}
```

---

_文档版本: v1.0_  
_最后更新: 2026年2月28日_  
_维护团队: 数据标准委员会_
