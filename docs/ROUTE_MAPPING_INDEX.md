# 路由映射关系与API索引

## 🗺️ 路由架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│ Module Router   │────│ Component Tree  │
│   Router        │    │   Manager       │    │    Renderer     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Route Handler  │    │  Module Loader  │    │  Page Renderer  │
│     Layer       │    │     System      │    │     Engine      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📡 API端点映射

### 认证相关API
```
POST    /api/v1/auth/login              # 用户登录
POST    /api/v1/auth/register           # 用户注册
POST    /api/v1/auth/refresh            # 刷新令牌
POST    /api/v1/auth/logout             # 用户登出
GET     /api/v1/auth/me                 # 获取当前用户信息
POST    /api/v1/auth/password/reset     # 重置密码
POST    /api/v1/auth/verify-email       # 验证邮箱
```

### 用户管理API
```
GET     /api/v1/users                   # 获取用户列表
GET     /api/v1/users/{id}              # 获取用户详情
PUT     /api/v1/users/{id}              # 更新用户信息
DELETE  /api/v1/users/{id}              # 删除用户
GET     /api/v1/users/{id}/profile      # 获取用户档案
PUT     /api/v1/users/{id}/profile      # 更新用户档案
```

### 维修服务API
```
GET     /api/v1/repair/work-orders                  # 获取工单列表
POST    /api/v1/repair/work-orders                  # 创建工单
GET     /api/v1/repair/work-orders/{id}             # 获取工单详情
PUT     /api/v1/repair/work-orders/{id}             # 更新工单
DELETE  /api/v1/repair/work-orders/{id}             # 删除工单
POST    /api/v1/repair/work-orders/{id}/assign      # 分配技师
POST    /api/v1/repair/work-orders/{id}/complete    # 完成工单
GET     /api/v1/repair/technicians                  # 获取技师列表
GET     /api/v1/repair/technicians/{id}             # 获取技师详情
GET     /api/v1/repair/customers                    # 获取客户列表
GET     /api/v1/repair/diagnostics                  # 设备诊断接口
```

### B2B贸易API
```
# 采购管理
GET     /api/v1/procurement/orders                  # 采购订单列表
POST    /api/v1/procurement/orders                  # 创建采购订单
GET     /api/v1/procurement/orders/{id}             # 采购订单详情
PUT     /api/v1/procurement/orders/{id}             # 更新采购订单
GET     /api/v1/procurement/suppliers               # 供应商列表
GET     /api/v1/procurement/suppliers/{id}          # 供应商详情

# 销售管理
GET     /api/v1/trading/orders                      # 销售订单列表
POST    /api/v1/trading/orders                      # 创建销售订单
GET     /api/v1/trading/orders/{id}                 # 销售订单详情
PUT     /api/v1/trading/orders/{id}                 # 更新销售订单
GET     /api/v1/trading/customers                   # 客户列表
GET     /api/v1/trading/customers/{id}              # 客户详情

# 物流跟踪
GET     /api/v1/logistics/shipments                 # 货运列表
GET     /api/v1/logistics/shipments/{id}            # 货运详情
POST    /api/v1/logistics/shipments/{id}/track      # 更新货运状态
GET     /api/v1/logistics/carriers                  # 承运商列表
```

### 配件商城API
```
GET     /api/v1/parts/categories                    # 商品分类
GET     /api/v1/parts/products                      # 商品列表
GET     /api/v1/parts/products/{id}                 # 商品详情
POST    /api/v1/parts/products                      # 创建商品
PUT     /api/v1/parts/products/{id}                 # 更新商品
GET     /api/v1/parts/cart                          # 获取购物车
POST    /api/v1/parts/cart                          # 添加到购物车
DELETE  /api/v1/parts/cart/{itemId}                 # 从购物车删除
POST    /api/v1/parts/checkout                      # 结算订单
```

### 数据分析API
```
GET     /api/v1/analytics/dashboard                 # 仪表板数据
GET     /api/v1/analytics/metrics                   # 关键指标
GET     /api/v1/analytics/reports                   # 报告列表
POST    /api/v1/analytics/reports                   # 生成报告
GET     /api/v1/analytics/charts                    # 图表数据
POST    /api/v1/analytics/query                     # 自定义查询
```

### 系统管理API
```
GET     /api/v1/admin/system/status                 # 系统状态
GET     /api/v1/admin/users                         # 用户管理
GET     /api/v1/admin/logs                          # 系统日志
POST    /api/v1/admin/config                        # 系统配置
GET     /api/v1/admin/monitoring                    # 监控数据
POST    /api/v1/admin/maintenance                   # 维护操作
```

## 🔗 路由与模块映射关系

### 模块路由配置
```typescript
// src/config/routes.ts
export const ROUTE_MAPPING = {
  // 认证模块路由
  auth: {
    base: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  
  // 维修服务模块路由
  repair: {
    base: '/repair-shop',
    dashboard: '/repair-shop/dashboard',
    workOrders: '/repair-shop/work-orders',
    workOrderDetail: '/repair-shop/work-orders/[id]',
    newWorkOrder: '/repair-shop/work-orders/new',
    diagnostics: '/repair-shop/diagnostics',
    customers: '/repair-shop/customers',
    settings: '/repair-shop/settings'
  },
  
  // B2B采购模块路由
  procurement: {
    importer: {
      base: '/importer',
      dashboard: '/importer/dashboard',
      procurement: '/importer/procurement',
      suppliers: '/importer/suppliers',
      logistics: '/importer/logistics',
      customs: '/importer/customs'
    },
    exporter: {
      base: '/exporter',
      dashboard: '/exporter/dashboard',
      trading: '/exporter/trading',
      customers: '/exporter/customers',
      shipping: '/exporter/shipping',
      compliance: '/exporter/compliance'
    }
  },
  
  // 管理后台路由
  admin: {
    base: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    shops: '/admin/shops',
    orders: '/admin/orders',
    content: '/admin/content',
    analytics: '/admin/analytics',
    system: '/admin/system'
  }
};
```

### 权限路由守卫
```typescript
// src/middleware/route-guard.ts
class RouteGuard {
  static checkRouteAccess(
    route: string,
    userRole: string,
    permissions: string[]
  ): boolean {
    const routePermissions = this.getRoutePermissions(route);
    
    // 检查是否需要认证
    if (routePermissions.requiresAuth && !userRole) {
      return false;
    }
    
    // 检查角色权限
    if (routePermissions.roles && !routePermissions.roles.includes(userRole)) {
      return false;
    }
    
    // 检查具体权限
    if (routePermissions.permissions) {
      return routePermissions.permissions.every(perm => 
        permissions.includes(perm)
      );
    }
    
    return true;
  }
  
  private static getRoutePermissions(route: string): RoutePermission {
    const permissionMap: Record<string, RoutePermission> = {
      '/admin': {
        requiresAuth: true,
        roles: ['admin', 'super_admin'],
        permissions: ['admin.access']
      },
      '/repair-shop': {
        requiresAuth: true,
        roles: ['repair_shop', 'technician'],
        permissions: ['repair.access']
      },
      '/importer': {
        requiresAuth: true,
        roles: ['importer'],
        permissions: ['procurement.access']
      },
      '/exporter': {
        requiresAuth: true,
        roles: ['exporter'],
        permissions: ['trading.access']
      }
    };
    
    return permissionMap[route] || { requiresAuth: false };
  }
}
```

## 📚 API文档索引

### OpenAPI 规范结构
```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: FixCycle API
  description: 智能循环经济平台API接口
  version: 3.0.0
  contact:
    name: API Support
    email: api-support@fixcycle.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.fixcycle.com/v1
    description: Production server
  - url: https://staging-api.fixcycle.com/v1
    description: Staging server
  - url: http://localhost:3001/api/v1
    description: Development server

components:
  schemas:
    # 用户相关模型
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [user, admin, repair_shop, importer, exporter]
        createdAt:
          type: string
          format: date-time
    
    # 工单相关模型
    WorkOrder:
      type: object
      properties:
        id:
          type: string
          format: uuid
        orderNumber:
          type: string
        customerId:
          type: string
          format: uuid
        status:
          type: string
          enum: [created, assigned, in_progress, completed, cancelled]
        priority:
          type: string
          enum: [low, medium, high, urgent]
        description:
          type: string
        createdAt:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []

paths:
  # 认证相关路径在单独文件中定义
  /auth/login:
    $ref: './paths/auth/login.yaml'
  /auth/register:
    $ref: './paths/auth/register.yaml'
  
  # 维修服务路径
  /repair/work-orders:
    $ref: './paths/repair/work-orders.yaml'
  /repair/work-orders/{id}:
    $ref: './paths/repair/work-order-detail.yaml'
```

### API文档生成配置
```javascript
// scripts/generate-api-docs.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

class APIDocumentationGenerator {
  static generateSwaggerSpec() {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'FixCycle API Documentation',
          version: '3.0.0',
          description: '智能循环经济平台API接口文档'
        },
        servers: [
          {
            url: 'http://localhost:3001/api/v1',
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: [
        './src/modules/*/api/**/*.ts',
        './src/modules/*/controllers/**/*.ts',
        './src/tech/api/controllers/**/*.ts'
      ]
    };
    
    return swaggerJsdoc(options);
  }
  
  static setupSwaggerUI(app) {
    const swaggerSpec = this.generateSwaggerSpec();
    
    // Swagger UI 路由
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true
      }
    }));
    
    // OpenAPI JSON 端点
    app.get('/api/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
}
```

## 🔄 路由版本管理

### API版本控制策略
```typescript
// src/config/api-versions.ts
export const API_VERSIONS = {
  CURRENT: 'v1',
  SUPPORTED: ['v1'],
  DEPRECATED: ['v0'],
  END_OF_LIFE: []
};

export const VERSION_HEADERS = {
  REQUEST: 'X-API-Version',
  RESPONSE: 'X-API-Version',
  DEPRECATED: 'Warning'
};

// 版本路由处理器
class VersionRouter {
  static handleVersion(req: Request, res: Response, next: NextFunction) {
    const requestedVersion = req.headers[VERSION_HEADERS.REQUEST] || API_VERSIONS.CURRENT;
    
    if (API_VERSIONS.SUPPORTED.includes(requestedVersion)) {
      req.apiVersion = requestedVersion;
      res.set(VERSION_HEADERS.RESPONSE, requestedVersion);
      next();
    } else if (API_VERSIONS.DEPRECATED.includes(requestedVersion)) {
      res.set(VERSION_HEADERS.WARNING, `API version ${requestedVersion} is deprecated`);
      req.apiVersion = requestedVersion;
      next();
    } else {
      res.status(400).json({
        error: 'UNSUPPORTED_API_VERSION',
        supportedVersions: API_VERSIONS.SUPPORTED
      });
    }
  }
}
```

## 📈 路由性能监控

### 路由性能指标
```typescript
// src/middleware/route-monitoring.ts
class RoutePerformanceMonitor {
  private static metrics: Map<string, RouteMetrics> = new Map();
  
  static middleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const route = req.route?.path || req.originalUrl;
    
    // 响应结束时记录指标
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      this.recordMetrics(route, {
        duration,
        statusCode,
        method: req.method,
        timestamp: new Date()
      });
    });
    
    next();
  }
  
  private static recordMetrics(route: string, data: RouteMetricData) {
    if (!this.metrics.has(route)) {
      this.metrics.set(route, {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        statusCodes: {}
      });
    }
    
    const metrics = this.metrics.get(route)!;
    metrics.totalRequests++;
    metrics.avgResponseTime = 
      (metrics.avgResponseTime * (metrics.totalRequests - 1) + data.duration) / metrics.totalRequests;
    
    if (!metrics.statusCodes[data.statusCode]) {
      metrics.statusCodes[data.statusCode] = 0;
    }
    metrics.statusCodes[data.statusCode]++;
    
    metrics.errorRate = 
      (Object.keys(metrics.statusCodes)
        .filter(code => parseInt(code) >= 400)
        .reduce((sum, code) => sum + metrics.statusCodes[parseInt(code)], 0) / metrics.totalRequests) * 100;
  }
  
  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}
```

## 🛠️ 路由调试工具

### 路由映射可视化
```typescript
// scripts/visualize-routes.js
class RouteVisualizer {
  static generateRouteTree() {
    const routeTree = {
      '/': '首页',
      '/auth': {
        '/login': '登录',
        '/register': '注册',
        '/forgot-password': '忘记密码'
      },
      '/repair-shop': {
        '/dashboard': '仪表板',
        '/work-orders': {
          '/': '工单列表',
          '/new': '新建工单',
          '/[id]': '工单详情'
        },
        '/diagnostics': '设备诊断'
      },
      '/importer': {
        '/dashboard': '进口商仪表板',
        '/procurement': '采购管理',
        '/suppliers': '供应商管理'
      },
      '/exporter': {
        '/dashboard': '出口商仪表板',
        '/trading': '销售管理',
        '/customers': '客户管理'
      }
    };
    
    return routeTree;
  }
  
  static exportAsMermaid() {
    const tree = this.generateRouteTree();
    let mermaid = 'graph TD\n';
    
    function traverse(obj, parent = 'ROOT') {
      Object.entries(obj).forEach(([key, value]) => {
        const nodeId = key.replace(/[\/\[\]]/g, '_');
        mermaid += `    ${parent} --> ${nodeId}["${value}"]\n`;
        
        if (typeof value === 'object') {
          traverse(value, nodeId);
        }
      });
    }
    
    traverse(tree);
    return mermaid;
  }
}
```

---
_索引版本: v1.0_
_最后更新: 2026年2月21日_
_维护人员: 架构团队_