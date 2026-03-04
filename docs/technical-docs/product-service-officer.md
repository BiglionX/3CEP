# 产品服务官功能文档

## 🎯 功能概述

产品服务官是FixCycle平台为企业提供的智能化售后服务管理解决方案，通过数字化手段提升企业客户服务效率和质量。

## 🏗️ 系统架构

### 核心组件

```
产品服务官/
├── 售后服务主页 (/enterprise/after-sales)
├── 配件管理系统 (/enterprise/after-sales/parts)
├── 电子说明书系统 (/enterprise/after-sales/manuals)
├── 维修技巧库 (/enterprise/after-sales/tips)
├── 软件升级中心 (/enterprise/after-sales/software)
├── 有奖问答平台 (/enterprise/after-sales/quiz)
├── 新品众筹系统 (/enterprise/after-sales/crowdfunding)
└── 企业资料中心 (/enterprise/after-sales/documents)
```

## 🔧 主要功能模块

### 1. 二维码管理

**功能描述**：为每台设备生成唯一二维码，实现快速识别和服务追踪

**技术特点**：

- 基于UUID的唯一标识生成
- 支持批量二维码打印
- 设备信息快速绑定
- 服务历史追溯查询

**API接口**：

```javascript
// 生成设备二维码
POST /api/enterprise/devices/qrcode
{
  "device_id": "uuid",
  "product_model": "型号",
  "serial_number": "序列号"
}

// 查询设备信息
GET /api/enterprise/devices/{device_id}
```

### 2. 多语言电子说明书

**功能描述**：提供中英日韩等多种语言的电子说明书和操作指南

**支持语言**：

- 中文 (zh-CN)
- 英文 (en-US)
- 日文 (ja-JP)
- 韩文 (ko-KR)

**文档格式**：

- PDF技术文档
- HTML在线手册
- 视频操作指导
- 交互式教程

### 3. 配件管理系统

**功能描述**：统一管理设备配件信息、库存和供应链

**核心功能**：

- 配件信息维护
- 库存状态监控
- 供应商管理
- 价格比较分析
- 采购订单处理

### 4. 维修技巧库

**功能描述**：收集和分享设备维修经验和最佳实践

**内容类型**：

- 文字教程
- 图解步骤
- 视频演示
- 常见问题解答
- 故障排除指南

### 5. 软件升级管理

**功能描述**：管理设备固件和软件的版本更新

**功能特性**：

- 版本发布管理
- 升级包分发
- 兼容性检查
- 升级进度监控
- 回滚机制支持

## 🎮 有奖问答系统

### 功能架构

```
有奖问答/
├── 问答活动管理
├── 题目库维护
├── 用户参与追踪
├── 奖励发放机制
└── 数据统计分析
```

### 核心表结构

```sql
-- 企业有奖问答表
CREATE TABLE enterprise_reward_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  answer_options JSONB NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  reward_points INTEGER,
  reward_fc_amount DECIMAL(10,2),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户答题记录表
CREATE TABLE user_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES enterprise_reward_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  reward_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);
```

## 💰 新品众筹系统

### 功能架构

```
新品众筹/
├── 项目创建和管理
├── 资金筹集追踪
├── 支持者管理
├── 回报机制设置
└── 项目履约管理
```

### 核心表结构

```sql
-- 企业新品众筹表
CREATE TABLE enterprise_crowdfunding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  product_model VARCHAR(100),
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  min_contribution DECIMAL(10,2) NOT NULL,
  max_contribution DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  delivery_date DATE,
  supporters_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  funding_progress DECIMAL(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 众筹支持记录表
CREATE TABLE crowdfunding_supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES enterprise_crowdfunding(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  contribution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reward_level VARCHAR(50),
  shipping_address JSONB,
  status VARCHAR(20) DEFAULT 'confirmed'
);
```

## 📁 企业资料管理

### 功能特性

- **文件存储**：基于Supabase Storage的安全文件存储
- **权限控制**：细粒度的访问权限管理
- **版本管理**：文件版本历史追踪
- **审批流程**：自动化文档审批机制

### 核心表结构

```sql
-- 企业文档表
CREATE TABLE enterprise_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  category VARCHAR(50),
  tags TEXT[],
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'pending_review',
  uploaded_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文档分类表
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES document_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 安全与权限

### 权限体系

基于RBAC模型的企业权限管理：

- `enterprise_reward_qa_view` - 查看有奖问答
- `enterprise_reward_qa_create` - 创建问答活动
- `enterprise_crowdfunding_view` - 查看众筹项目
- `enterprise_documents_upload` - 上传企业文档

### 数据安全措施

- 企业数据物理隔离
- 敏感信息AES-256加密
- 操作日志完整审计
- 定期安全漏洞扫描

## 📊 API接口规范

### 认证机制

使用JWT Token进行API认证：

```javascript
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};
```

### 错误处理

标准错误响应格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

## 🚀 部署与运维

### 环境要求

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Supabase >= 2.0
- Redis >= 6.x (缓存)

### 部署步骤

1. 数据库迁移执行
2. 环境变量配置
3. 依赖包安装
4. 服务启动验证
5. 健康检查测试

---

**文档版本**：v1.0  
**最后更新**：2026年2月25日
