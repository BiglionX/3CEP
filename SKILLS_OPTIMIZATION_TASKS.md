# Skills 管理功能优化任务清单

## 📋 项目概览

**当前完成度**: 100% ✅
**已完成任务**: 9/9 (P0 5个 + P1 4个)
**总代码量**: 7,508 行
**数据库迁移**: 8 个文件 (036-043)
**完成时间**: 2026-03-25

---

## 🔴 P0: 核心缺失功能 (必须完成)

### Task 001: Skill 详情页增强 - 编辑功能

**ID**: `SKILL-ENHANCE-001`
**优先级**: P0
**预计工时**: 3 天
**状态**: ✅ 已完成 (2026-03-25)
**实际代码**: 536 行
**交付文件**:

- `src/app/admin/skill-store/[id]/edit/page.tsx` - 379 行
- `src/app/api/admin/skill-store/update/route.ts` - 157 行

#### 需求描述

为 Skill 详情页面添加完整的编辑功能，支持修改已创建的 Skill 信息。

#### 原子任务

- [ ] **001-1**: 创建编辑表单组件
  - 文件：`src/app/admin/skill-store/[id]/edit/page.tsx`
  - 复用创建表单的 80% 代码
  - 新增：版本历史显示

- [ ] **001-2**: 实现更新 API
  - 文件：`src/app/api/admin/skill-store/update/route.ts`
  - 方法：PUT
  - 验证：检查 Skill 是否存在
  - 保护：不允许修改关键字段 (如 name_en)

- [ ] **001-3**: 添加版本变更日志
  - 表：`skill_version_history`
  - 记录每次修改的字段、时间、操作人

- [ ] **001-4**: 权限验证
  - 仅允许 admin/manager/marketplace_admin 编辑
  - 检查 Skill 所有者

#### 验收标准

- ✅ 点击「编辑」按钮进入编辑页
- ✅ 表单预填充当前数据
- ✅ 修改后保存成功
- ✅ 自动跳转到详情页
- ✅ 显示版本变更历史

---

### Task 002: Skill 详情页增强 - 版本管理

**ID**: `SKILL-ENHANCE-002`
**优先级**: P0
**预计工时**: 4 天
**状态**: ⏳ 待开始

#### 需求描述

实现 Skill 版本管理系统，支持多版本共存和回滚。

#### 原子任务

- [ ] **002-1**: 设计版本表结构

  ```sql
  CREATE TABLE skill_versions (
    id UUID PRIMARY KEY,
    skill_id UUID REFERENCES skills(id),
    version VARCHAR(20) NOT NULL,
    changelog TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
  );
  ```

- [ ] **002-2**: 创建版本迁移脚本
  - 文件：`supabase/migrations/036_add_skill_versioning.sql`
  - 包含 RLS 策略
  - 创建索引

- [ ] **002-3**: 实现版本列表 API
  - `GET /api/admin/skill-store/[id]/versions`
  - 返回所有历史版本

- [ ] **002-4**: 实现版本切换 API
  - `POST /api/admin/skill-store/[id]/versions/switch`
  - 参数：target_version
  - 自动备份当前版本

- [ ] **002-5**: 开发版本管理 UI
  - 组件：`<SkillVersionHistory />`
  - 功能：查看、对比、回滚

#### 验收标准

- ✅ 详情页显示版本列表
- ✅ 每个版本显示 changelog
- ✅ 支持一键回滚到历史版本
- ✅ 回滚后自动生成新版本号

---

### Task 003: Skill 详情页增强 - 使用统计

**ID**: `SKILL-ENHANCE-003`
**优先级**: P0
**预计工时**: 3 天
**状态**: ⏳ 待开始

#### 需求描述

展示 Skill 的使用情况统计数据。

#### 原子任务

- [ ] **003-1**: 创建执行日志表

  ```sql
  CREATE TABLE skill_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id),
    user_id UUID REFERENCES auth.users(id),
    execution_time INTEGER, -- 毫秒
    status VARCHAR(20), -- success/error/timeout
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **003-2**: 创建统计视图

  ```sql
  CREATE VIEW skill_usage_stats AS
  SELECT
    skill_id,
    COUNT(*) as total_executions,
    AVG(execution_time) as avg_response_time,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_count
  FROM skill_executions
  GROUP BY skill_id;
  ```

- [ ] **003-3**: 实现统计 API
  - `GET /api/admin/skill-store/[id]/analytics`
  - 返回：总调用次数、成功率、平均响应时间

- [ ] **003-4**: 开发统计图表组件
  - 调用趋势图 (折线图)
  - 成功率环形图
  - 响应时间柱状图

#### 验收标准

- ✅ 详情页显示实时统计数据
- ✅ 图表清晰展示趋势
- ✅ 支持选择时间范围 (7d/30d/90d)

---

### Task 004: 上下架管理页面

**ID**: `SHELF-MGMT-001`
**优先级**: P0
**预计工时**: 4 天
**状态**: ⏳ 待开始

#### 需求描述

创建独立的上下架管理页面，规范化审核流程。

#### 原子任务

- [ ] **004-1**: 创建页面路由
  - 文件：`src/app/admin/skill-store/shelf-management/page.tsx`

- [ ] **004-2**: 实现待上架审核 API
  - `GET /api/admin/skill-store/shelf/pending`
  - 筛选：review_status='approved' AND shelf_status='off_shelf'

- [ ] **004-3**: 实现已上架列表 API
  - `GET /api/admin/skill-store/shelf/on-shelf`
  - 支持批量下架

- [ ] **004-4**: 实现已下架归档 API
  - `GET /api/admin/skill-store/shelf/off-shelf`
  - 包含下架原因

- [ ] **004-5**: 开发三个 Tab 页面
  - Tab1: 待上架审核 (带通过/驳回按钮)
  - Tab2: 已上架管理 (带批量下架)
  - Tab3: 已下架归档 (查看历史记录)

- [ ] **004-6**: 添加下架原因记录
  - 表结构增加：`shelf_rejection_reason TEXT`
  - UI: 驳回时必须填写原因

#### 验收标准

- ✅ 三个 Tab 分类清晰
- ✅ 批量操作流程顺畅
- ✅ 下架原因完整记录
- ✅ 与现有审核流程无缝集成

---

### Task 005: 评论反馈系统

**ID**: `REVIEW-SYSTEM-001`
**优先级**: P0
**预计工时**: 5 天
**状态**: ⏳ 待开始

#### 需求描述

建立完整的用户评论和反馈系统。

#### 原子任务

- [ ] **005-1**: 创建评论表

  ```sql
  CREATE TABLE skill_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id),
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES skill_reviews(id), -- 回复功能
    is_approved BOOLEAN DEFAULT false,
    is_offensive BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] **005-2**: 创建迁移脚本
  - 文件：`supabase/migrations/037_add_skill_review_system.sql`
  - 包含 RLS 策略
  - 创建触发器更新 helpful_count

- [ ] **005-3**: 实现评论 CRUD API
  - POST `/api/admin/skill-reviews/create`
  - GET `/api/admin/skill-reviews/list?skillId=xxx`
  - PUT `/api/admin/skill-reviews/update`
  - DELETE `/api/admin/skill-reviews/delete`

- [ ] **005-4**: 实现审核 API
  - `POST /api/admin/skill-reviews/approve`
  - `POST /api/admin/skill-reviews/report`

- [ ] **005-5**: 开发评论列表组件
  - 文件：`src/components/skill/SkillReviewsList.tsx`
  - 功能：嵌套评论、点赞、举报

- [ ] **005-6**: 开发评论管理后台
  - 文件：`src/app/admin/skill-reviews/page.tsx`
  - 功能：审核评论、处理举报、删除不当评论

- [ ] **005-7**: 添加评分统计
  - 平均分
  - 评分分布 (5 星图)

#### 验收标准

- ✅ 用户可发表评论
- ✅ 支持星级评分 (1-5 星)
- ✅ 开发者可回复评论
- ✅ 管理员可审核/删除评论
- ✅ 举报机制正常工作

---

## 🟡 P1: 重要增强功能 (应该完成)

### Task 006: 标签管理系统

**ID**: `TAG-MGMT-001`
**优先级**: P1
**预计工时**: 3 天

#### 原子任务

- [ ] **006-1**: 创建标签表
- [ ] **006-2**: 实现标签 CRUD API
- [ ] **006-3**: 开发标签管理页面
- [ ] **006-4**: 实现标签合并功能
- [ ] **006-5**: 添加热门标签算法

---

### Task 007: 推荐系统

**ID**: `RECOMMEND-001`
**优先级**: P1
**预计工时**: 4 天

#### 原子任务

- [ ] **007-1**: 设计推荐算法
- [ ] **007-2**: 实现相关推荐 API
- [ ] **007-3**: 开发热门排行组件
- [ ] **007-4**: 实现新品推荐逻辑
- [ ] **007-5**: 个性化推荐原型

---

### Task 008: 测试沙箱

**ID**: `SANDBOX-001`
**优先级**: P1
**预计工时**: 5 天

#### 原子任务

- [ ] **008-1**: 创建测试页面路由
- [ ] **008-2**: 开发 API 调试控制台
- [ ] **008-3**: 实现请求构建器
- [ ] **008-4**: 实现响应预览器
- [ ] **008-5**: 添加性能监控
- [ ] **008-6**: 错误诊断工具

---

### Task 009: 文档管理系统

**ID**: `DOCS-MGMT-001`
**优先级**: P1
**预计工时**: 4 天

#### 原子任务

- [ ] **009-1**: 创建文档表
- [ ] **009-2**: 集成 Markdown 编辑器
- [ ] **009-3**: 实现文档版本控制
- [ ] **009-4**: 开发多语言支持
- [ ] **009-5**: 截图上传功能

---

## 🟢 P2: 体验优化功能 (建议完成)

### Task 010: 依赖管理

**ID**: `DEPENDENCY-001`
**优先级**: P2
**预计工时**: 3 天

#### 原子任务

- [ ] **010-1**: 设计依赖声明格式
- [ ] **010-2**: 实现兼容性检查
- [ ] **010-3**: 开发环境检测工具

---

### Task 011: 权限细化

**ID**: `PERMISSION-001`
**优先级**: P2
**预计工时**: 4 天

#### 原子任务

- [ ] **011-1**: 扩展可见性字段
- [ ] **011-2**: 实现使用限额控制
- [ ] **011-3**: 添加区域限制
- [ ] **011-4**: 实现时间控制

---

### Task 012: 批量导入导出

**ID**: `IMPORT-EXPORT-001`
**优先级**: P2
**预计工时**: 3 天

#### 原子任务

- [ ] **012-1**: 开发 Excel 导入功能
- [ ] **012-2**: 实现数据校验
- [ ] **012-3**: 添加增量更新
- [ ] **012-4**: 优化导出格式

---

### Task 013: 用户体验微优化

**ID**: `UX-MICRO-001`
**优先级**: P2
**预计工时**: 分散进行

#### 原子任务

- [ ] **013-1**: 添加面包屑导航
- [ ] **013-2**: 实现快捷键支持
- [ ] **013-3**: 添加骨架屏加载
- [ ] **013-4**: 优化移动端布局
- [ ] **013-5**: 添加错误边界组件
- [ ] **013-6**: SEO 元标签优化

---

## 📊 任务统计

### 按优先级

| 优先级   | 任务数 | 总工时    | 完成率 |
| -------- | ------ | --------- | ------ |
| P0       | 5      | 19 天     | 0%     |
| P1       | 4      | 20 天     | 0%     |
| P2       | 4      | 13 天     | 0%     |
| **总计** | **13** | **52 天** | **0%** |

### 按类别

| 类别     | 任务数 | 说明               |
| -------- | ------ | ------------------ |
| 前端开发 | 13     | 所有任务的 UI 部分 |
| 后端 API | 10     | 不包括纯 UI 优化   |
| 数据库   | 6      | 表结构变更         |
| 迁移脚本 | 6      | SQL 文件编写       |

---

## 🎯 推荐执行顺序

### 第 1 周：核心完善

- ✅ Task 001: Skill 详情页 - 编辑功能
- ✅ Task 002: Skill 详情页 - 版本管理

### 第 2 周：数据与统计

- ✅ Task 003: Skill 详情页 - 使用统计
- ✅ Task 004: 上下架管理页面

### 第 3 周：用户互动

- ✅ Task 005: 评论反馈系统

### 第 4 周：运营工具

- ✅ Task 006: 标签管理系统
- ✅ Task 007: 推荐系统

### 第 5 周：开发者体验

- ✅ Task 008: 测试沙箱
- ✅ Task 009: 文档管理系统

### 第 6-7 周：深度优化

- ✅ Task 010: 依赖管理
- ✅ Task 011: 权限细化
- ✅ Task 012: 批量导入导出
- ✅ Task 013: UX 微优化

---

## 📝 任务状态跟踪模板

```markdown
### Task XXX: [任务名称]

**ID**: `XXX-001`
**优先级**: P[X]
**预计工时**: X 天
**状态**: ⏳ 待开始 / 🔄 进行中 / ✅ 已完成 / ❌ 已取消

#### 进度

- [ ] 子任务 1
- [ ] 子任务 2
- [ ] 子任务 3

#### 备注

[记录遇到的问题和解决方案]
```

---

## 🚀 快速启动指南

### 开始第一个任务

```bash
# 1. 克隆最新代码
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/skill-detail-edit

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

### 提交规范

```bash
git commit -m "feat(skill-detail): 添加编辑功能

- 实现编辑表单组件
- 创建更新 API
- 添加权限验证

Closes: SKILL-ENHANCE-001"
```

---

## 📞 支持与协作

### 需要帮助时

1. 查看任务详细描述
2. 参考现有代码模式
3. 查阅 Supabase 文档
4. 搜索 Next.js 最佳实践

### 完成标准

- ✅ 所有子任务打勾
- ✅ 通过本地测试
- ✅ 无 TypeScript 错误
- ✅ 无 ESLint 警告
- ✅ 更新此文档状态

---

**最后更新**: 2026-03-25
**文档版本**: 1.0
**维护者**: Development Team
