# 管理后台API接口技术文档

## 📋 概述

本文档详细说明管理后台各模块的API接口规范和技术实现细节。

## 🎯 接口规范

### 通用响应格式

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 通用请求头

```http
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
X-Requested-With: XMLHttpRequest
```

---

## 系统概览模块 API

### 获取系统指标数据

```http
GET /api/admin/system-dashboard/metrics
```

**请求参数:**

```typescript
interface MetricsQuery {
  timeRange?: 'day' | 'week' | 'month' | 'year';
  metrics?: string[]; // 指定需要的指标
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 12345,
      "activeToday": 1234,
      "growthRate": 12.5
    },
    "devices": {
      "total": 8765,
      "online": 6543,
      "offline": 2222
    },
    "orders": {
      "today": 456,
      "thisMonth": 12345,
      "totalRevenue": 987654
    }
  },
  "timestamp": "2026-02-28T10:30:00Z"
}
```

### 获取系统告警列表

```http
GET /api/admin/system-dashboard/alerts
```

**请求参数:**

```typescript
interface AlertQuery {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'acknowledged' | 'resolved';
  page?: number;
  pageSize?: number;
}
```

### 更新告警状态

```http
PUT /api/admin/system-dashboard/alerts/{alertId}
```

**请求体:**

```typescript
interface UpdateAlertRequest {
  status: 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedNotes?: string;
}
```

---

## 用户管理模块 API

### 获取用户列表

```http
GET /api/admin/users
```

**请求参数:**

```typescript
interface UserListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  sortBy?: 'createdAt' | 'lastLogin' | 'name';
  sortOrder?: 'asc' | 'desc';
}
```

### 创建新用户

```http
POST /api/admin/users
```

**请求体:**

```typescript
interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
  department?: string;
  roleIds: string[];
  isActive: boolean;
}
```

### 批量操作用户

```http
POST /api/admin/users/bulk-actions
```

**请求体:**

```typescript
interface BulkUserAction {
  action: 'delete' | 'activate' | 'deactivate' | 'assignRole';
  userIds: string[];
  roleId?: string; // 仅在assignRole时需要
}
```

### 导入用户数据

```http
POST /api/admin/users/import
Content-Type: multipart/form-data

Form Data:
- file: CSV文件
- mapping: 字段映射配置
```

---

## 设备管理模块 API

### 获取设备列表

```http
GET /api/admin/devices
```

**请求参数:**

```typescript
interface DeviceListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'online' | 'offline' | 'maintenance';
  groupId?: string;
  tagIds?: string[];
  sortBy?: 'lastSeen' | 'batteryLevel' | 'storageUsed';
}
```

### 创建设备分组

```http
POST /api/admin/device-groups
```

**请求体:**

```typescript
interface CreateDeviceGroup {
  name: string;
  description?: string;
  parentId?: string;
}
```

### 管理设备标签

```http
POST /api/admin/device-tags
```

**请求体:**

```typescript
interface CreateDeviceTag {
  name: string;
  color: string;
  description?: string;
}
```

### 为设备分配标签

```http
POST /api/admin/devices/{deviceId}/tags
```

**请求体:**

```typescript
interface AssignTagsRequest {
  tagIds: string[];
}
```

---

## 店铺管理模块 API

### 获取店铺列表

```http
GET /api/admin/shops
```

**请求参数:**

```typescript
interface ShopListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'pending';
  serviceTypes?: string[];
  minRating?: number;
}
```

### 审核店铺资质

```http
PUT /api/admin/shops/{shopId}/verification
```

**请求体:**

```typescript
interface VerifyShopRequest {
  status: 'approved' | 'rejected';
  notes?: string;
  documents?: {
    id: string;
    verified: boolean;
    notes?: string;
  }[];
}
```

---

## 内容管理模块 API

### 获取内容列表

```http
GET /api/admin/content
```

**请求参数:**

```typescript
interface ContentListQuery {
  page?: number;
  pageSize?: number;
  type?: 'article' | 'tutorial' | 'news';
  status?: 'draft' | 'pending' | 'published' | 'archived';
  categoryId?: string;
  authorId?: string;
}
```

### 创建内容

```http
POST /api/admin/content
```

**请求体:**

```typescript
interface CreateContentRequest {
  title: string;
  content: string;
  type: 'article' | 'tutorial' | 'news';
  categoryId: string;
  tags: string[];
  featuredImage?: string;
  metaDescription?: string;
  publishAt?: string;
  status: 'draft' | 'pending' | 'published';
}
```

---

## 财务管理模块 API

### 获取财务统计数据

```http
GET /api/admin/finance/statistics
```

**请求参数:**

```typescript
interface FinanceStatsQuery {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  groupBy?: 'category' | 'paymentMethod' | 'customer';
}
```

### 获取收支明细

```http
GET /api/admin/finance/transactions
```

**请求参数:**

```typescript
interface TransactionQuery {
  page?: number;
  pageSize?: number;
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}
```

---

## 采购中心模块 API

### 获取采购订单列表

```http
GET /api/admin/procurement/orders
```

**请求参数:**

```typescript
interface OrderListQuery {
  page?: number;
  pageSize?: number;
  status?:
    | 'pending'
    | 'approved'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled';
  supplierId?: string;
  startDate?: string;
  endDate?: string;
}
```

### 创建采购订单

```http
POST /api/admin/procurement/orders
```

**请求体:**

```typescript
interface CreateOrderRequest {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
  deliveryAddress: string;
  expectedDeliveryDate: string;
  notes?: string;
}
```

### 获取供应商列表

```http
GET /api/admin/procurement/suppliers
```

**请求参数:**

```typescript
interface SupplierListQuery {
  page?: number;
  pageSize?: number;
  status?: 'active' | 'inactive' | 'blacklisted';
  rating?: number;
  category?: string;
}
```

---

## 仓储管理模块 API

### 获取库存列表

```http
GET /api/admin/inventory/items
```

**请求参数:**

```typescript
interface InventoryQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy?: 'quantity' | 'lastUpdated' | 'value';
}
```

### 库存操作记录

```http
POST /api/admin/inventory/transactions
```

**请求体:**

```typescript
interface InventoryTransaction {
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment';
  itemId: string;
  quantity: number;
  warehouseId: string;
  locationId?: string;
  referenceNumber?: string;
  notes?: string;
  batchNumber?: string;
  expiryDate?: string;
}
```

### 获取仓库位置

```http
GET /api/admin/inventory/locations
```

**请求参数:**

```typescript
interface LocationQuery {
  warehouseId?: string;
  type?: 'area' | 'shelf' | 'bin';
  status?: 'available' | 'occupied' | 'reserved';
}
```

---

## 诊断服务模块 API

### 获取诊断记录

```http
GET /api/admin/diagnostics
```

**请求参数:**

```typescript
interface DiagnosticQuery {
  page?: number;
  pageSize?: number;
  deviceId?: string;
  status?: 'completed' | 'failed' | 'pending';
  confidenceMin?: number;
  faultType?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

### 获取诊断统计

```http
GET /api/admin/diagnostics/statistics
```

**请求参数:**

```typescript
interface DiagnosticStatsQuery {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  groupBy?: 'faultType' | 'technician' | 'deviceModel';
}
```

---

## 配件市场模块 API

### 获取商品列表

```http
GET /api/admin/parts-market
```

**请求参数:**

```typescript
interface PartsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  priceMin?: number;
  priceMax?: number;
  supplierId?: string;
}
```

### 获取销售统计

```http
GET /api/admin/parts-market/sales-statistics
```

**请求参数:**

```typescript
interface SalesStatsQuery {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  productId?: string;
  categoryId?: string;
}
```

---

## 市场运营管理模块 API ⭐ 新增

### 获取市场统计数据

```http
GET /api/admin/marketplace/statistics
```

**请求参数:**

```typescript
interface MarketplaceStatsQuery {
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  groupBy?: 'day' | 'week' | 'month';
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 125680.5,
      "totalOrders": 3456,
      "totalAgents": 128,
      "totalSkills": 256,
      "activeDevelopers": 89,
      "monthlyGrowth": 15.8
    },
    "revenueTrend": [
      {
        "month": "2026-03",
        "revenue": 25680.5,
        "orders": 567
      }
    ],
    "topDevelopers": [
      {
        "id": "dev-001",
        "name": "张三",
        "email": "zhangsan@example.com",
        "totalProducts": 12,
        "totalSales": 456,
        "revenue": 12580.0
      }
    ]
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

### 获取开发者统计数据

```http
GET /api/admin/marketplace/developer-stats
```

**请求参数:**

```typescript
interface DeveloperStatsQuery {
  timeRange?: 'week' | 'month' | 'year' | 'all';
  sortBy?: 'revenue' | 'orders' | 'rating';
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDevelopers": 89,
      "totalRevenue": 125680.50,
      "totalOrders": 3456,
      "totalAgents": 128,
      "totalSkills": 256
    },
    "developers": [
      {
        "id": "dev-001",
        "email": "zhangsan@example.com",
        "name": "张三",
        "avatar": "https://...",
        "role": "developer",
        "agentsCount": 12,
        "skillsCount": 8,
        "totalRevenue": 12580.00,
        "totalOrders": 456,
        "avgRating": 4.8,
        "agents": [...],
        "skills": [...]
      }
    ],
    "timeRange": "month",
    "sortBy": "revenue"
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

### 获取收入统计数据

```http
GET /api/admin/marketplace/revenue-stats
```

**请求参数:**

```typescript
interface RevenueStatsQuery {
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  groupBy?: 'day' | 'week' | 'month';
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "totalRevenue": 125680.5,
    "totalOrders": 3456,
    "averageOrderValue": 36.35,
    "revenueByCategory": [
      {
        "category": "sales",
        "revenue": 45680.5,
        "orders": 1234
      }
    ],
    "revenueTrend": [
      {
        "period": "2026-03-01",
        "revenue": 1250.0,
        "orders": 45
      }
    ]
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

---

## 智能体商店管理模块 API ⭐ 新增

### 获取智能体统计数据

```http
GET /api/admin/agent-store/statistics
```

**请求参数:**

```typescript
interface AgentStoreStatsQuery {
  status?: 'all' | 'pending' | 'approved' | 'rejected';
  shelfStatus?: 'all' | 'on_shelf' | 'off_shelf';
}
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "totalAgents": 128,
    "pendingReview": 15,
    "approved": 98,
    "rejected": 15,
    "onShelf": 85,
    "offShelf": 13,
    "categoryStats": [
      {
        "category": "sales",
        "count": 45,
        "percentage": 35.2
      }
    ],
    "todayOrders": 56,
    "todayRevenue": 2580.0
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

---

## 开发者管理模块 API ⭐ 新增

### 获取开发者列表

```http
GET /api/admin/developers/list
```

**请求参数:**

```typescript
interface DeveloperListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  sortBy?: 'joinDate' | 'revenue' | 'orders';
  sortOrder?: 'asc' | 'desc';
}
```

**响应示例:**

```json
{
  "success": true,
  "data": [
    {
      "id": "dev-001",
      "name": "张三",
      "email": "zhangsan@example.com",
      "avatar": "https://...",
      "role": "developer",
      "status": "active",
      "totalAgents": 12,
      "totalSkills": 8,
      "totalRevenue": 12580.0,
      "totalOrders": 456,
      "avgRating": 4.8,
      "joinDate": "2026-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 89,
    "totalPages": 5
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

### 获取开发者统计数据

```http
GET /api/admin/developers/statistics
```

**响应示例:**

```json
{
  "success": true,
  "data": {
    "totalDevelopers": 89,
    "activeDevelopers": 75,
    "inactiveDevelopers": 10,
    "suspendedDevelopers": 4
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

### 切换开发者状态

```http
POST /api/admin/developers/toggle-status
```

**请求体:**

```typescript
interface ToggleDeveloperStatusRequest {
  developerId: string;
  newStatus: 'active' | 'inactive' | 'suspended';
  reason?: string;
}
```

**响应示例:**

```json
{
  "success": true,
  "message": "开发者状态已更新",
  "data": {
    "developerId": "dev-001",
    "previousStatus": "active",
    "newStatus": "suspended",
    "updatedAt": "2026-03-23T10:30:00Z"
  },
  "timestamp": "2026-03-23T10:30:00Z"
}
```

---

## 🔐 权限控制

### 管理员角色定义

| 角色名称   | 标识                | 权限说明                                 |
| ---------- | ------------------- | ---------------------------------------- |
| 超级管理员 | `admin`             | 所有权限，可访问所有管理功能             |
| 市场管理员 | `marketplace_admin` | 市场运营、开发者管理、智能体审核相关权限 |
| 财务管理员 | `finance_manager`   | 财务管理、收益统计、提现审核相关权限     |
| 普通管理员 | `manager`           | 基础管理权限，部分受限功能               |

### 权限验证中间件

### 管理员角色定义

| 角色名称   | 标识                | 权限说明                                 |
| ---------- | ------------------- | ---------------------------------------- |
| 超级管理员 | `admin`             | 所有权限，可访问所有管理功能             |
| 市场管理员 | `marketplace_admin` | 市场运营、开发者管理、智能体审核相关权限 |
| 财务管理员 | `finance_manager`   | 财务管理、收益统计、提现审核相关权限     |
| 普通管理员 | `manager`           | 基础管理权限，部分受限功能               |

### 权限验证中间件

### 权限标识规范

```
[module].[action]

示例:
- users.view        # 查看用户
- users.manage      # 管理用户
- users.delete      # 删除用户
- devices.create    # 创建设备
- shops.verify      # 审核店铺
```

### RBAC权限检查中间件

```typescript
// middleware/auth.ts
export function checkPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const hasPermission = await rbacService.checkPermission(
      user.roleId,
      permission
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
      });
    }

    next();
  };
}
```

---

## 📊 错误处理

### 标准错误码

| 错误码    | 描述         | HTTP状态码 |
| --------- | ------------ | ---------- |
| AUTH_001  | 未授权访问   | 401        |
| AUTH_002  | 权限不足     | 403        |
| VALID_001 | 参数验证失败 | 400        |
| DATA_001  | 数据不存在   | 404        |
| DATA_002  | 数据冲突     | 409        |
| SYS_001   | 系统内部错误 | 500        |
| RATE_001  | 请求频率超限 | 429        |

### 错误响应格式

```json
{
  "success": false,
  "error": "VALID_001",
  "message": "参数验证失败",
  "details": {
    "field": "email",
    "message": "邮箱格式不正确"
  },
  "timestamp": "2026-02-28T10:30:00Z"
}
```

---

## 🛠️ 开发规范

### TypeScript接口定义

```typescript
// types/admin.ts
export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### API控制器结构

```typescript
// controllers/admin/userController.ts
export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const query = this.parseQuery(req.query);
      const result = await userService.getUsers(query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private parseQuery(query: any): UserListQuery {
    return {
      page: parseInt(query.page) || 1,
      pageSize: parseInt(query.pageSize) || 20,
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };
  }

  private handleError(error: Error, res: Response) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'SYS_001',
      message: '系统内部错误',
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 📈 性能优化

### 分页查询优化

```sql
-- 优化后的分页查询
SELECT *, COUNT(*) OVER() as total_count
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
```

### 缓存策略

```typescript
// Redis缓存配置
const cacheConfig = {
  ttl: 300, // 5分钟
  prefix: 'admin:',
  compress: true,
};

// 缓存中间件
export function cacheMiddleware(keyGenerator: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = keyGenerator(req);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json;
    res.json = function (body: any) {
      redis.setex(cacheKey, cacheConfig.ttl, JSON.stringify(body));
      return originalJson.call(this, body);
    };

    next();
  };
}
```

---

## 🔒 安全措施

### 输入验证

```typescript
// 使用Joi进行输入验证
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  roleIds: Joi.array().items(Joi.string()).min(1),
});
```

### SQL注入防护

```typescript
// 使用参数化查询
const query = `
  SELECT * FROM users
  WHERE email = $1 AND status = $2
`;
const result = await db.query(query, [email, 'active']);
```

### XSS防护

```typescript
// 输出编码
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

---

## 📞 技术支持

- **API文档**: https://api.fixcycle.com/docs
- **开发者门户**: https://dev.fixcycle.com
- **技术支持**: dev@fixcycle.com

---

**文档版本**: v2.0
**最后更新**: 2026 年 3 月 23日
**API 版本**: v2.0
**更新日志**:

- ✅ 新增市场运营管理模块 API（开发者统计、收入统计）
- ✅ 新增智能体商店管理模块 API
- ✅ 新增开发者管理模块 API
- ✅ 更新管理员角色权限定义
