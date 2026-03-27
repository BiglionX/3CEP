# Skill 商店管理页面功能说明

## ✅ 确认：显示的是列表页

**菜单路径**:

```
商店管理 → Skill 商店
```

**对应路由**: `/admin/skill-store`

**页面类型**: **Skill 列表管理页面**（包含列表、统计、筛选等功能）

---

## 📋 页面功能组成

### 1. Skill 列表展示 ⭐ 核心功能

**组件**: [`SkillTable.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillTable.tsx)

**功能**:

- ✅ 表格形式展示所有 Skills
- ✅ 显示关键信息（名称、分类、价格、状态等）
- ✅ 点击 Skill 名称可进入详情页
- ✅ 支持批量操作（复选框）
- ✅ 分页显示（每页 20 条）

**表格列**:
| 列名 | 说明 |
|------|------|
| Skill 信息 | 名称 + 描述（可点击跳转详情） |
| 分类 | 技能分类（如代码生成、数据处理等） |
| 价格 | 以¥显示 |
| 审核状态 | 待审核/已通过/已驳回/草稿 |
| 上下架状态 | 上架中/已下架/已暂停 |
| 创建时间 | 格式化日期显示 |
| 操作 | 审核按钮、上下架切换按钮 |

---

### 2. 筛选和搜索功能

**组件**: [`SkillFilters.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillFilters.tsx)

**支持的筛选条件**:

- ✅ **搜索框** - 按名称或描述搜索
- ✅ **分类筛选** - 按技能分类过滤
- ✅ **审核状态** - pending/approved/rejected/draft
- ✅ **上下架状态** - on_shelf/off_shelf/suspended
- ✅ **排序方式** - 按创建时间、评分等排序
- ✅ **排序方向** - 升序/降序

---

### 3. 统计数据展示

**组件**: [`SkillStatsCards.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillStatsCards.tsx)

**统计卡片**:

- 📊 **总技能数** (`totalSkills`)
- ✅ **已上架技能数** (`onShelfSkills`)
- ✔️ **已审核技能数** (`approvedSkills`)
- ⏳ **待审核技能数** (`pendingReview`)

---

### 4. 数据可视化图表

**组件**: [`SkillCharts.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillCharts.tsx)

**图表类型**:

- 📈 **分类统计图** - 各分类的技能数量分布
- 📊 **审核状态图** - 不同审核状态的技能数量
- 📉 **上下架状态图** - 上架/下架/暂停的技能数量

**控制**: 可通过开关控制是否显示图表

---

### 5. 审核对话框

**组件**: [`SkillReviewDialog.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillReviewDialog.tsx)

**功能**:

- ✅ 审核待审核的 Skills
- ✅ 填写审核意见
- ✅ 选择通过或驳回
- ✅ 批量审核支持

---

## 🎯 完整功能清单

### 列表页功能（9 个）✅

1. ✅ **Skills 列表展示** - 表格形式
2. ✅ **筛选和搜索** - 多维度筛选
3. ✅ **分页浏览** - 每页 20 条
4. ✅ **统计卡片** - 实时数据概览
5. ✅ **数据图表** - 可视化分析
6. ✅ **审核操作** - 单个/批量审核
7. ✅ **上下架管理** - 快速切换状态
8. ✅ **批量选择** - 支持批量操作
9. ✅ **查看详情** - 点击进入详情页

---

## 🔗 与其他页面的关系

### 从列表页可以访问：

#### 1. Skill 详情页

```
列表页 → 点击 Skill 名称 → /admin/skill-store/[id]
```

**用途**: 查看完整信息、编辑、版本历史等

#### 2. 创建 Skill 页

```
列表页 → 点击"+ 新建"按钮 → /admin/skill-store/create
```

**用途**: 创建新的 Skill

#### 3. 编辑页

```
详情页 → 点击"编辑"按钮 → /admin/skill-store/[id]/edit
```

**用途**: 修改 Skill 信息

---

## 📂 页面文件结构

```
src/app/admin/skill-store/
├── page.tsx                      ⭐ 主页面（列表页）
├── create/
│   └── page.tsx                  创建页面
├── [id]/
│   ├── page.tsx                  详情页
│   └── edit/
│       └── page.tsx              编辑页
├── shelf-management/
│   └── page.tsx                  上下架管理页
└── components/                   📦 可复用组件
    ├── SkillTable.tsx            列表表格
    ├── SkillFilters.tsx          筛选器
    ├── SkillStatsCards.tsx       统计卡片
    ├── SkillCharts.tsx           图表
    └── SkillReviewDialog.tsx     审核对话框
```

---

## 💡 使用场景对比

### 场景 1: 查看所有 Skills

**使用列表页** ✅

```
访问：/admin/skill-store
功能：浏览所有 Skills，支持筛选和搜索
```

### 场景 2: 查看某个 Skill 的详细信息

**使用详情页** ✅

```
访问：/admin/skill-store/[id]
入口：从列表页点击 Skill 名称
功能：查看完整信息、版本历史、统计数据
```

### 场景 3: 创建新 Skill

**使用创建页** ✅

```
访问：/admin/skill-store/create
入口：列表页的"+ 新建"按钮
功能：填写表单创建新 Skill
```

### 场景 4: 编辑已有 Skill

**使用编辑页** ✅

```
访问：/admin/skill-store/[id]/edit
入口：详情页的"编辑"按钮
功能：修改 Skill 信息
```

### 场景 5: 审核 Skills

**两种方式**:

- **方式 A**: 在列表页直接审核（快速）
- **方式 B**: 进入详情页审核后返回（详细）

---

## 🎨 UI 特征

### 列表页的标识

当你访问 `/admin/skill-store` 时，会看到：

1. **顶部**: 页面标题 "Skill 商店管理"
2. **上部**: 统计卡片（4 个指标）
3. **中部**: 筛选条件区域
4. **中下部**: 数据图表（可选显示）
5. **底部**: Skills 列表表格

---

## ✅ 总结

### 问题回答

**问**: Skill 商店管理显示的是列表页吗？

**答**: **是的！** ✅

- **菜单项**: "Skill 商店" (`/admin/skill-store`)
- **页面类型**: **Skill 列表管理页**
- **主要内容**: Skills 列表 + 统计卡片 + 筛选器 + 数据图表

### 核心价值

这个列表页是 Skill 管理的**核心入口**，提供了：

- ✅ 完整的 Skills 概览
- ✅ 快速的筛选和搜索
- ✅ 便捷的审核和上下架操作
- ✅ 实时的数据统计
- ✅ 直观的图表分析

### 下一步

从列表页可以：

1. 点击 Skill 名称 → 查看详情
2. 点击"+ 新建" → 创建 Skill
3. 使用筛选器 → 快速定位目标
4. 查看统计 → 了解整体情况

---

**更新时间**: 2026-03-26
**维护者**: Development Team
