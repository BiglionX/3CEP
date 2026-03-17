# 安装和运行 Supabase 迁移脚本

## 方法一：使用 Supabase CLI

### 1. 安装 Supabase CLI

#### Windows (使用 npm):

```bash
npm install -g supabase
```

#### Windows (使用 winget):

```bash
winget install supabase.cli
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 链接到项目

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 4. 运行所有未应用的迁移

```bash
supabase db push
```

### 5. 运行单个迁移文件

```bash
supabase db execute --file supabase/migrations/031_add_agent_registry_and_status_tables.sql
```

### 6. 查看迁移状态

```bash
supabase migration list
```

---

## 方法二：通过 Supabase Dashboard（快速方式）

1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **SQL Editor** (左侧导航栏)
4. 点击 **New Query**
5. 复制迁移文件内容
6. 粘贴到编辑器
7. 点击 **Run** 或按 Ctrl+Enter

---

## 方法三：使用 psql 直接连接

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/031_add_agent_registry_and_status_tables.sql
```

---

## 本项目新增的迁移文件

- `031_add_agent_registry_and_status_tables.sql` - 智能体注册和状态管理表

---

## 常见问题

### 找不到项目引用 (Project Ref)

- 在 Supabase Dashboard 的项目设置中可以找到
- 格式类似: `abcdefghijklmnopqrst`

### 权限错误

- 确保使用有足够权限的账号登录
- Dashboard 方式需要项目的 Owner 或 Developer 权限

### 迁移冲突

- 如果已经执行过迁移，可以跳过或使用 `supabase migration repair`
