# 审计日志系统使用说明

## 📋 系统概述

审计日志系统用于记录和追踪管理后台的所有重要操作，包括用户行为、数据变更、系统配置等，为安全管理、问题排查和合规审计提供完整的数据支持。

## 🚀 功能特性

### 1. 自动日志记录

- **全覆盖监控**：自动记录所有管理后台操作
- **详细信息采集**：记录用户、时间、IP、操作详情等完整信息
- **智能解析**：自动识别操作类型和资源类型

### 2. 日志查看与筛选

- **多维度筛选**：按用户、资源类型、操作类型、时间范围筛选
- **分页浏览**：支持大量日志的高效浏览
- **实时更新**：页面数据自动刷新

### 3. 数据导出

- **CSV 格式导出**：支持将筛选后的日志导出为 CSV 文件
- **UTF-8 编码**：确保中文内容正确显示
- **批量导出**：支持大量数据的一键导出

## 🛠️ 技术实现

### 数据库表结构

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 核心服务

- **AuditService**：提供日志记录、查询、导出等核心功能
- **auditMiddleware**：自动拦截和记录管理后台操作
- **AuditTrailViewer**：前端日志查看界面组件

## 📖 使用指南

### 访问审计日志

1. 登录管理后台
2. 在左侧导航菜单中点击"审计日志"
3. 进入审计日志查看页面

### 筛选日志

- **资源类型**：选择特定类型的资源（用户、店铺、教程等）
- **操作类型**：筛选特定操作（创建、更新、删除等）
- **时间范围**：指定日期范围查看历史日志

### 导出日志

1. 设置好筛选条件
2. 点击"导出日志"按钮
3. 系统将自动下载 CSV 格式的日志文件

## 🔧 开发说明

### 添加新的审计日志记录

```typescript
import { AuditService } from '@/services/audit-service';

// 手动记录操作日志
await AuditService.logAction({
  user_id: currentUser.id,
  user_email: currentUser.email,
  action: 'custom_action',
  resource: 'custom_resource',
  resource_id: '123',
  old_value: oldValue,
  new_value: newValue,
});
```

### 扩展筛选条件

在 `AuditTrailViewer.tsx` 中添加新的筛选字段：

```typescript
const [filters, setFilters] = useState({
  resource: '',
  action: '',
  date_from: '',
  date_to: '',
  // 添加新的筛选条件
  custom_filter: '',
});
```

## ⚠️ 注意事项

1. **性能优化**：对于大量日志数据，建议定期清理过期记录
2. **隐私保护**：敏感操作日志需要特别保护和访问控制
3. **存储管理**：监控数据库存储空间，及时清理历史数据
4. **权限控制**：只有管理员才能访问审计日志功能

## 📊 监控指标

系统会自动收集以下指标：

- 日志记录成功率
- 查询响应时间
- 导出文件大小
- 用户访问频次

## 🔧 维护建议

1. **定期备份**：建议每日备份审计日志数据
2. **性能监控**：监控日志查询和导出性能
3. **容量规划**：根据业务增长预估存储需求
4. **安全审计**：定期审查日志记录的完整性和准确性

---

_最后更新：2024 年_
