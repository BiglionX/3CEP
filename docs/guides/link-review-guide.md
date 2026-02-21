# 🔗 热点链接审核模块使用指南

## 📋 模块概述

热点链接审核模块是FixCycle管理系统的重要组成部分，用于管理和审核从互联网抓取的热点内容链接。管理员可以在此模块中查看待审核链接、预览内容详情，并进行发布或驳回操作。

## 🏗️ 系统架构

### 核心组件
- **数据库表**: `hot_link_pool`, `articles`, `article_categories`
- **API接口**: `/api/admin/links/pending`
- **前端页面**: `/admin/links/pending`
- **权限控制**: 基于RBAC的角色访问控制

### 表结构设计

#### hot_link_pool (热点链接池)
```sql
- id: UUID主键
- url: 链接地址 (唯一)
- title: 标题
- description: 描述
- source: 来源平台
- category/sub_category: 分类信息
- image_url: 封面图片
- likes/views/share_count: 互动数据
- ai_tags: JSON格式的AI打标结果
- status: 状态 (pending_review/promoted/rejected)
- reviewed_at/by: 审核时间和审核人
- article_id: 关联的文章ID
```

#### articles (文章表)
```sql
- id: UUID主键
- title: 文章标题
- content: 文章内容
- summary: 摘要
- cover_image_url: 封面图片
- author_id: 作者ID
- status: 状态 (draft/published/archived)
- tags: JSON标签
- view_count/like_count: 访问统计数据
```

## 🚀 部署指南

### 1. 数据库部署
在Supabase控制台执行SQL脚本：
```bash
# 手动部署方式
1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 执行 manual-deploy-links.sql 文件内容
```

或者使用自动化脚本：
```bash
node scripts/deploy-link-review-tables.js
```

### 2. 功能验证
```bash
# 运行测试脚本
node scripts/test-link-review.js
```

## 💻 使用说明

### 访问路径
```
http://localhost:3000/admin/links/pending
```

### 主要功能

#### 1. 链接列表展示
- 显示待审核链接的基本信息
- 支持分页浏览
- 提供搜索和分类筛选
- 显示AI打标结果和置信度

#### 2. 内容预览
- 点击"查看详情"可查看完整内容
- 显示原始链接可在新窗口打开
- 展示封面图片和详细元数据

#### 3. 批量审核操作
**发布操作**：
- 选中一条或多条链接
- 点击"批量发布"按钮
- 系统自动创建对应文章并发布
- 更新链接状态为"已发布"

**驳回操作**：
- 选中需要驳回的链接
- 点击"批量驳回"按钮
- 填写驳回原因
- 更新链接状态为"已驳回"

### 界面元素说明

| 元素 | 功能 |
|------|------|
| 🔍 搜索框 | 按标题或描述搜索 |
| 🎯 分类筛选 | 按内容分类过滤 |
| ☑️ 复选框 | 选择单条或多条记录 |
| ✅ 发布按钮 | 批量发布选中链接 |
| ❌ 驳回按钮 | 批量驳回选中链接 |
| 👁️ 预览按钮 | 查看链接详情 |
| 🔗 外链按钮 | 打开原始链接 |

## 🔧 技术实现细节

### API接口设计

#### GET /api/admin/links/pending
```javascript
// 请求参数
?page=1&pageSize=20&status=pending_review&search=关键词

// 响应结构
{
  "data": [...],           // 链接数据列表
  "pagination": {
    "page": 1,             // 当前页码
    "pageSize": 20,        // 每页条数
    "total": 100,          // 总记录数
    "totalPages": 5        // 总页数
  }
}
```

#### POST /api/admin/links/pending
```javascript
// 发布请求
{
  "action": "publish",
  "ids": ["uuid1", "uuid2"]
}

// 驳回请求
{
  "action": "reject", 
  "ids": ["uuid1", "uuid2"],
  "rejectionReason": "内容质量不符合要求"
}
```

### 前端组件特性

#### 主要交互功能
- **实时数据刷新**: 操作完成后自动更新列表
- **状态提示**: 操作成功/失败的用户反馈
- **加载状态**: 数据加载时的视觉反馈
- **响应式设计**: 适配不同屏幕尺寸

#### 安全机制
- **权限验证**: 只有content_reviewer及以上权限可访问
- **CSRF保护**: 表单提交安全验证
- **输入验证**: 用户输入数据校验

## 📊 数据流说明

### 审核流程
```
1. 系统抓取热点链接 → hot_link_pool (status: pending_review)
2. 管理员审核 → 选择发布或驳回
3. 发布操作 → 创建articles记录 (status: published)
4. 驳回操作 → 更新hot_link_pool状态为rejected
5. 状态同步 → 更新关联字段和审核信息
```

### 数据关系
```
hot_link_pool ──article_id──→ articles
     ↓
   ai_tags (JSON)
     ↓
  分类信息 ← article_categories
```

## 🔍 监控和维护

### 日志记录
- 审核操作日志
- 系统错误日志
- 性能监控数据

### 常见问题排查

#### 数据不显示
```bash
# 检查表结构
SELECT * FROM hot_link_pool LIMIT 5;

# 验证RLS策略
SELECT * FROM pg_policy WHERE polname LIKE '%hot_link%';
```

#### 权限问题
```bash
# 检查用户角色
SELECT * FROM admin_users WHERE user_id = '当前用户ID';

# 验证权限配置
SELECT * FROM permissions WHERE role = 'content_reviewer';
```

## 📈 性能优化建议

### 数据库层面
- 合理使用索引 (status, scraped_at, likes等字段)
- 定期清理已处理的历史数据
- 优化分页查询性能

### 前端层面
- 实现虚拟滚动处理大量数据
- 图片懒加载减少初始加载时间
- 缓存常用分类和标签数据

## 🔄 后续扩展方向

### 功能增强
- [ ] 支持自定义审核流程
- [ ] 添加审核历史记录查询
- [ ] 实现智能推荐审核优先级
- [ ] 增加批量导入导出功能

### 技术升级
- [ ] 集成更强大的AI内容分析
- [ ] 添加实时协作审核功能
- [ ] 实现审核工作量统计报表
- [ ] 支持多语言内容审核

---

**版本**: 1.0.0  
**最后更新**: 2026-02-14  
**维护人员**: FixCycle开发团队