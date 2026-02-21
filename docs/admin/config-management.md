# 系统配置管理中心使用说明

## 📋 系统概述

配置管理中心提供了统一的系统配置管理界面，支持对各类系统参数进行集中管理和实时调整，包括站点设置、邮件配置、安全策略、上传限制等。

## 🚀 功能特性

### 1. 分类管理

- **系统配置**：站点基本信息、维护模式等核心设置
- **邮件配置**：SMTP 服务器、发件人设置等
- **安全配置**：密码策略、会话管理等安全相关设置
- **上传配置**：文件大小限制、类型控制等
- **API 配置**：接口限制、速率控制等

### 2. 多种配置类型支持

- **字符串类型**：普通文本配置
- **数字类型**：数值型配置项
- **布尔类型**：开关型配置（使用切换开关）
- **JSON 类型**：复杂结构配置

### 3. 权限控制

- **系统配置保护**：关键系统配置项禁止删除
- **操作审计**：所有配置变更自动记录到审计日志
- **管理员专属**：仅管理员可访问配置管理功能

## 🛠️ 技术实现

### 数据库表结构

```sql
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) DEFAULT 'string',
  is_encrypted BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 核心服务

- **ConfigService**：提供配置的增删改查、类型转换、批量操作等功能
- **ConfigManager**：前端配置管理界面组件
- **自动类型转换**：根据配置类型自动进行值的转换和验证

## 📖 使用指南

### 访问配置管理

1. 登录管理后台
2. 在左侧导航菜单中点击"系统配置"
3. 进入配置管理页面

### 修改现有配置

1. 找到要修改的配置项
2. 直接在输入框中修改值
3. 系统会自动保存更改
4. 成功保存后会有提示信息

### 添加新配置

1. 点击"添加配置"标签页
2. 填写配置键名（必须唯一）
3. 选择配置分类和类型
4. 输入配置值和描述
5. 点击"添加配置"按钮

### 配置类型说明

- **字符串**：直接输入文本内容
- **数字**：只能输入数字
- **布尔值**：使用开关控件切换
- **JSON**：输入有效的 JSON 格式字符串

## ⚙️ 核心配置项说明

### 系统配置 (system)

- `site_name`：站点显示名称
- `maintenance_mode`：维护模式开关
- `default_timezone`：系统默认时区
- `enable_registration`：是否允许用户注册

### 邮件配置 (email)

- `email_smtp_host`：SMTP 服务器地址
- `email_smtp_port`：SMTP 端口
- `email_from_address`：发件人邮箱
- `email_from_name`：发件人名称

### 安全配置 (security)

- `session_timeout`：会话超时时间（小时）
- `password_min_length`：密码最小长度

### 上传配置 (upload)

- `max_upload_size`：最大上传文件大小

### API 配置 (api)

- `enable_api_rate_limit`：是否启用 API 速率限制
- `api_rate_limit_requests`：每小时请求限制

## 🔧 开发说明

### 在代码中使用配置

```typescript
import { ConfigService } from '@/services/config-service';

// 获取配置值
const siteName = await ConfigService.getConfigValue('site_name', '默认名称');

// 更新配置
await ConfigService.updateConfig('site_name', '新站点名称');

// 批量更新
await ConfigService.batchUpdateConfigs({
  site_name: '新名称',
  maintenance_mode: 'true',
});
```

### 添加新的配置分类

在数据库中插入新的配置项时，指定相应的 category 值即可自动归类到对应标签页。

## ⚠️ 注意事项

1. **系统配置保护**：标记为"is_system"的配置项不能被删除
2. **类型安全**：修改配置时要注意数据类型匹配
3. **实时生效**：大部分配置修改后立即生效
4. **备份建议**：重要配置变更前建议先导出当前配置

## 📊 监控和维护

### 配置变更监控

- 所有配置变更都会记录到审计日志
- 可以追踪配置的历史变更记录
- 支持配置变更的回滚操作

### 性能优化

- 配置项会自动缓存以提高访问速度
- 避免频繁读取数据库
- 支持配置热更新

## 🔧 常见问题

### Q: 如何恢复默认配置？

A: 可以通过重新运行数据库迁移脚本来恢复默认配置项。

### Q: 配置项删除后如何恢复？

A: 系统配置项无法删除，自定义配置项删除后需要重新添加。

### Q: 如何批量导入配置？

A: 可以使用 ConfigService.batchUpdateConfigs 方法进行批量更新。

---

_最后更新：2024 年_
