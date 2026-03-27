# Skill 详情页访问路径指南

## 📍 详情页路由

**Skill 详情页路由**: `/admin/skill-store/[id]`

这是一个动态路由，`[id]` 是具体 Skill 的 UUID。

**示例**:

```
/admin/skill-store/550e8400-e29b-41d4-a716-446655440000
/admin/skill-store/c56a4180-65aa-40ec-a945-1f23163beef8
```

---

## 🚪 进入详情页的 3 种方式

### 方式一：从"Skill 商店"列表页进入 ⭐ 主要入口

**路径**:

```
商店管理 → Skill 商店 → 点击 Skill 名称
```

**具体步骤**:

1. 访问 `/admin/skill-store` (在"商店管理"菜单下)
2. 在列表中看到所有 Skills
3. **点击任意 Skill 的名称**（蓝色链接）
4. 自动跳转到详情页 `/admin/skill-store/{skillId}`

**代码位置**: [`src/app/admin/skill-store/components/SkillTable.tsx`](file://d:\BigLionX\3cep\src\app\admin\skill-store\components\SkillTable.tsx#L151-L163)

```tsx
<button
  onClick={() => (window.location.href = `/admin/skill-store/${skill.id}`)}
  className="text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors"
>
  <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
    {skill.name}
  </div>
  <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
    {skill.description}
  </div>
</button>
```

---

### 方式二：从"Skills 管理"子菜单进入

虽然"Skills 管理"菜单下没有直接的详情页入口，但可以通过其子页面间接访问：

#### 2.1 从"Skill 审核"进入

```
Skills 管理 → Skill 审核 → 点击 Skill 名称 → 详情页
```

#### 2.2 从"分类管理"进入

```
Skills 管理 → 分类管理 → 查看该分类下的 Skills → 点击名称 → 详情页
```

#### 2.3 从其他子菜单进入

类似的，从以下菜单也可以进入详情页：

- ✅ 标签管理
- ✅ 上下架管理
- ✅ 评论管理
- ✅ 文档管理
- ✅ 数据分析
- ✅ 推荐系统
- ✅ 测试沙箱

**共同点**: 这些页面都会展示 Skill 列表或相关信息，点击 Skill 名称即可进入详情页。

---

### 方式三：直接访问 URL

如果你知道具体的 Skill ID，可以直接访问：

```
http://localhost:3001/admin/skill-store/{skillId}
```

**示例**:

```
http://localhost:3001/admin/skill-store/550e8400-e29b-41d4-a716-446655440000
```

---

## 🎯 详情页功能

进入详情页后，你可以：

### 1. 查看完整信息

- ✅ Skill 基本信息（名称、描述、分类等）
- ✅ 审核状态和上下架状态
- ✅ 统计数据（浏览量、使用次数、评分等）
- ✅ 版本历史信息

### 2. 执行操作

- ✅ **编辑** - 点击"编辑"按钮进入编辑页 `/admin/skill-store/[id]/edit`
- ✅ **上下架** - 切换上架/下架状态
- ✅ **查看版本历史** - 展开查看所有版本变更记录
- ✅ **回滚版本** - 回滚到历史任意版本

### 3. 快捷入口

从详情页可以跳转到：

- ✅ 编辑页面
- ✅ 评论管理
- ✅ 文档管理
- ✅ 上下架管理

---

## 📋 完整的导航流程图

```
管理后台 (/admin)
│
├─ 商店管理 (一级菜单)
│   └─ Skill 商店 (菜单项)
│       └─ Skill 列表页 (/admin/skill-store)
│           └─ [点击 Skill 名称]
│               └─ Skill 详情页 (/admin/skill-store/[id])
│                   ├─ [点击编辑] → 编辑页 (/admin/skill-store/[id]/edit)
│                   ├─ [查看版本历史] → 展开版本列表
│                   └─ [回滚版本] → 切换到历史版本
│
└─ Skills 管理 (一级菜单)
    ├─ Skill 审核 (/admin/skill-audit)
    │   └─ [点击 Skill 名称] → 详情页
    ├─ 分类管理 (/admin/skill-categories)
    │   └─ [查看分类下的 Skills] → [点击名称] → 详情页
    ├─ 标签管理 (/admin/skill-tags)
    │   └─ [查看标签下的 Skills] → [点击名称] → 详情页
    ├─ 上下架管理 (/admin/skill-store/shelf-management)
    │   └─ [点击 Skill 名称] → 详情页
    ├─ 评论管理 (/admin/skill-reviews)
    │   └─ [查看评论对应的 Skill] → [点击名称] → 详情页
    ├─ 文档管理 (/admin/skill-documents)
    │   └─ [查看文档对应的 Skill] → [点击名称] → 详情页
    ├─ 数据分析 (/admin/skill-analytics)
    │   └─ [查看技能分析] → [点击名称] → 详情页
    ├─ 推荐系统 (/admin/skill-recommendations)
    │   └─ [查看推荐技能] → [点击名称] → 详情页
    └─ 测试沙箱 (/admin/skill-sandboxes)
        └─ [查看沙箱对应的 Skill] → [点击名称] → 详情页
```

---

## 🔍 实际使用场景

### 场景 1: 查看某个 Skill 的详细信息

```
1. 打开管理后台
2. 展开"商店管理"菜单
3. 点击"Skill 商店"
4. 在列表中找到目标 Skill
5. 点击 Skill 名称（蓝色链接）
6. 进入详情页查看完整信息
```

### 场景 2: 编辑 Skill

```
1. 通过上述方式进入详情页
2. 点击右上角的"编辑"按钮
3. 进入编辑页面 `/admin/skill-store/[id]/edit`
4. 修改信息并保存
```

### 场景 3: 查看版本历史

```
1. 进入详情页
2. 滚动到"版本历史"卡片
3. 点击"展开全部"
4. 查看所有版本记录
5. 可以点击"回滚"回到任意版本
```

### 场景 4: 审核 Skill

```
方法 A: 通过"Skills 管理" → "Skill 审核"
1. 点击"Skills 管理"菜单
2. 点击"Skill 审核"
3. 在待审核列表中找到目标 Skill
4. 点击 Skill 名称进入详情页
5. 在详情页进行审核操作

方法 B: 直接在审核页面操作
1. 在审核页面直接点击"审核"按钮
2. 填写审核意见并提交
```

---

## 💡 快速访问技巧

### 技巧 1: 收藏常用 Skill 的详情页

如果你有经常需要查看的 Skill，可以：

1. 进入该 Skill 的详情页
2. 浏览器添加书签
3. 下次直接从书签访问

### 技巧 2: 从浏览器地址栏复制 ID

如果你需要从其他地方快速访问：

1. 从 API 响应或其他地方获取 Skill ID
2. 拼接 URL: `/admin/skill-store/{ID}`
3. 直接在浏览器访问

### 技巧 3: 使用浏览器的后退按钮

详情页有返回按钮，会返回到上一个页面：

- 如果从列表页进入 → 返回列表页
- 如果从审核页进入 → 返回审核页
- 如果从其他页面进入 → 返回对应页面

---

## 🎨 UI 特征

### 详情页的标识

当你进入详情页时，会看到：

1. **顶部导航栏**
   - 左侧：返回箭头按钮
   - 中间：Skill 名称（大标题）
   - 右侧：编辑按钮

2. **状态标签**
   - 审核状态（绿色/黄色/红色）
   - 上下架状态（绿色/灰色/红色）

3. **信息卡片**
   - 基础信息卡片
   - 统计数据卡片
   - 版本历史卡片（可展开）

---

## ✅ 总结

### 主要入口（推荐）

```
商店管理 → Skill 商店 → 点击 Skill 名称 → 详情页
```

### 次要入口

```
Skills 管理 → 任意子菜单 → 找到相关 Skill → 点击名称 → 详情页
```

### 直接访问

```
URL: /admin/skill-store/{skillId}
```

### 关键要点

- ✅ **详情页是动态路由**，需要具体的 Skill ID
- ✅ **从列表页进入是最自然的方式**
- ✅ **所有展示 Skill 列表的地方都可以进入详情页**
- ✅ **详情页是查看和管理 Skill 的核心页面**

---

**更新时间**: 2026-03-26
**维护者**: Development Team
