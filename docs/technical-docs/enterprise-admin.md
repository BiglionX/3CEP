# 企业管理后台技术文档

## 🎯 系统概述

企业管理后台是FixCycle平台为企业用户提供的综合性管理平台，集成了用户管理、权限控制、数据分析等核心功能模块。

## 🏗️ 系统架构

### 技术栈
- **前端框架**：Next.js 14 + TypeScript
- **UI组件库**：Tailwind CSS + Shadcn UI
- **状态管理**：React Hooks + Context API
- **后端服务**：Supabase + PostgreSQL
- **权限控制**：RBAC模型
- **文件存储**：Supabase Storage

### 核心模块结构
```
企业管理后台/
├── 仪表板模块 (/enterprise/admin/dashboard)
├── 智能体管理 (/enterprise/admin/agents)
├── 采购管理 (/enterprise/admin/procurement)
├── 有奖问答管理 (/enterprise/admin/reward-qa)
├── 新品众筹管理 (/enterprise/admin/crowdfunding)
├── 企业资料管理 (/enterprise/admin/documents)
├── 设备管理 (/enterprise/admin/devices)
├── 数据分析 (/enterprise/admin/analytics)
├── 团队管理 (/enterprise/admin/team)
└── 系统设置 (/enterprise/admin/settings)
```

## 🔐 权限控制系统

### RBAC权限模型
```javascript
// 企业专用权限配置
const enterprisePermissions = {
  // 有奖问答管理权限
  'enterprise_reward_qa_view': ['admin', 'manager', 'content_manager'],
  'enterprise_reward_qa_create': ['admin', 'manager', 'content_manager'],
  'enterprise_reward_qa_manage': ['admin', 'manager'],
  'enterprise_reward_qa_approve': ['admin', 'manager'],
  
  // 新品众筹管理权限
  'enterprise_crowdfunding_view': ['admin', 'manager', 'procurement_specialist'],
  'enterprise_crowdfunding_create': ['admin', 'manager', 'procurement_specialist'],
  'enterprise_crowdfunding_manage': ['admin', 'manager'],
  'enterprise_crowdfunding_approve': ['admin', 'manager'],
  
  // 企业资料管理权限
  'enterprise_documents_view': ['admin', 'manager', 'content_manager'],
  'enterprise_documents_upload': ['admin', 'manager', 'content_manager'],
  'enterprise_documents_manage': ['admin', 'manager'],
  'enterprise_documents_approve': ['admin', 'manager']
};
```

### 权限检查Hook
```typescript
export function useEnterprisePermission() {
  const user = useUser();
  const { roles, isLoading } = user;
  
  const hasPermission = (permission: string): boolean => {
    if (isLoading) return false;
    if (!user) return false;
    
    // 超级管理员拥有所有权限
    if (roles.includes('admin')) return true;
    
    // 检查具体权限
    return checkPermission(roles, permission);
  };
  
  return { hasPermission, roles, isLoading };
}
```

## 📊 数据库设计

### 核心数据表

#### 企业管理用户表
```sql
CREATE TABLE enterprise_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  company_license VARCHAR(100),
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  business_license_url TEXT,
  status VARCHAR(20) DEFAULT 'pending_review',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 企业团队成员表
```sql
CREATE TABLE enterprise_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions JSONB,
  status VARCHAR(20) DEFAULT 'active',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 企业操作日志表
```sql
CREATE TABLE enterprise_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎮 核心功能实现

### 1. 仪表板模块
```typescript
interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalOrders: number;
  pendingOrders: number;
  monthlySpend: number;
  savingsRate: number;
}

const StatCard = ({ title, value, icon: Icon, change }: any) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className="text-xs text-muted-foreground">
          <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          本月对比
        </p>
      )}
    </CardContent>
  </Card>
);
```

### 2. 智能体管理
```typescript
interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
}

const AgentCard = ({ agent }: { agent: AgentTemplate }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex justify-between items-start">
        <CardTitle className="text-lg">{agent.name}</CardTitle>
        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
          {agent.status === 'active' ? '启用' : '停用'}
        </Badge>
      </div>
      <CardDescription>{agent.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline">{agent.category}</Badge>
      </div>
      <Button variant="outline" size="sm">配置</Button>
    </CardContent>
  </Card>
);
```

### 3. 采购管理
```typescript
interface PurchaseOrder {
  id: string;
  title: string;
  supplier: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  deadline: string;
}

const PurchaseOrderTable = ({ orders }: { orders: PurchaseOrder[] }) => (
  <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>订单标题</TableHead>
          <TableHead>供应商</TableHead>
          <TableHead>金额</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>截止日期</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.title}</TableCell>
            <TableCell>{order.supplier}</TableCell>
            <TableCell>¥{order.amount.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </TableCell>
            <TableCell>{order.deadline}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">查看详情</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
```

## 📈 数据分析模块

### 业务指标监控
```typescript
interface BusinessMetrics {
  serviceResponseTime: number; // 服务响应时间(小时)
  customerSatisfaction: number; // 客户满意度(%)
  repairSuccessRate: number; // 维修成功率(%)
  costBenefitRatio: number; // 成本效益比
  monthlyGrowth: number; // 月度增长率(%)
}

const MetricChart = ({ metrics }: { metrics: BusinessMetrics }) => {
  const chartData = [
    { name: '服务响应', value: metrics.serviceResponseTime },
    { name: '客户满意', value: metrics.customerSatisfaction },
    { name: '维修成功', value: metrics.repairSuccessRate },
    { name: '成本效益', value: metrics.costBenefitRatio }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};
```

## 🔧 API接口设计

### 企业用户管理API
```typescript
// 获取企业用户列表
GET /api/enterprise/users
Query Parameters: {
  page?: number,
  limit?: number,
  status?: string,
  search?: string
}

// 创建企业用户
POST /api/enterprise/users
Request Body: {
  company_name: string,
  company_license: string,
  contact_person: string,
  contact_phone: string,
  contact_email: string
}

// 更新企业用户状态
PUT /api/enterprise/users/{id}/status
Request Body: {
  status: 'approved' | 'rejected' | 'suspended',
  reason?: string
}
```

### 团队管理API
```typescript
// 获取团队成员列表
GET /api/enterprise/team
Headers: {
  'Authorization': 'Bearer {token}',
  'X-Enterprise-ID': '{enterprise_id}'
}

// 邀请团队成员
POST /api/enterprise/team/invite
Request Body: {
  email: string,
  role: string,
  permissions: string[]
}

// 更新成员权限
PUT /api/enterprise/team/{member_id}/permissions
Request Body: {
  permissions: string[]
}
```

## 🛡️ 安全措施

### 认证与授权
- JWT Token认证
- Session超时控制
- 多因素认证支持
- IP地址白名单

### 数据保护
- 敏感数据加密存储
- 数据传输HTTPS加密
- 定期安全审计
- 漏洞扫描防护

### 访问控制
- 基于角色的权限管理
- 操作日志完整记录
- 异常行为监控
- 权限变更审批流程

## 📋 部署配置

### 环境变量配置
```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 企业服务配置
ENTERPRISE_STORAGE_BUCKET=enterprise-documents
MAX_UPLOAD_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# 安全配置
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
SESSION_TIMEOUT=3600  # 1小时
```

### Docker部署配置
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 监控与日志

### 系统监控指标
- API响应时间
- 数据库查询性能
- 用户活跃度统计
- 错误率监控
- 系统资源使用率

### 日志级别配置
```typescript
const logLevels = {
  error: 'error',
  warn: 'warn', 
  info: 'info',
  debug: 'debug'
};

const logger = {
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta);
    // 发送到监控系统
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  info: (message: string, meta?: any) => {
    console.info(`[INFO] ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  }
};
```

---

**文档版本**：v1.0  
**最后更新**：2026年2月25日