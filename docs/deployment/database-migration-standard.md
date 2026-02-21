# 数据库迁移规范

## 目录

1. [迁移原则](#迁移原则)
2. [迁移流程](#迁移流程)
3. [命名规范](#命名规范)
4. [安全考虑](#安全考虑)
5. [回滚策略](#回滚策略)
6. [验证标准](#验证标准)

## 迁移原则

### 核心原则

1. **向后兼容性** - 确保迁移过程不影响现有功能
2. **原子性操作** - 每个迁移应该是独立的、可回滚的单元
3. **零停机时间** - 生产环境迁移应尽量避免服务中断
4. **可审计性** - 所有变更都有完整记录和版本控制
5. **安全性** - 敏感数据处理遵循安全最佳实践

### 迁移分类

#### 结构迁移 (Schema Migration)

- 表结构变更
- 索引添加/删除
- 约束修改
- 存储过程更新

#### 数据迁移 (Data Migration)

- 数据清洗和转换
- 数据归档
- 历史数据处理
- 数据同步

#### 功能迁移 (Functional Migration)

- 业务逻辑调整
- 权限模型变更
- 工作流重构

## 迁移流程

### 预迁移阶段

#### 1. 需求分析

```markdown
需求文档应包含：

- 变更背景和目的
- 影响范围评估
- 风险识别
- 回滚预案
- 时间窗口要求
```

#### 2. 设计评审

```sql
-- 迁移设计方案检查清单
□ 表结构设计合理性
□ 索引策略优化
□ 约束条件设置
□ 性能影响评估
□ 并发处理方案
```

#### 3. 环境准备

```bash
# 开发环境验证
npm run migrate:dev --dry-run

# 测试环境验证
npm run migrate:test --dry-run

# 预生产环境验证
npm run migrate:staging --dry-run
```

### 执行阶段

#### 迁移脚本编写规范

```sql
-- 001_add_user_profiles_table.sql
-- Migration: 添加用户档案表
-- Author: developer@example.com
-- Date: 2026-02-20
-- Version: 1.0.0
-- Dependencies: None
-- Rollback: 001_drop_user_profiles_table.sql

BEGIN;

-- 创建用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
ON user_profiles(user_id);

-- 添加约束
ALTER TABLE user_profiles
ADD CONSTRAINT unique_user_profile
UNIQUE (user_id);

-- 添加触发器更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加RLS策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profiles"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

COMMIT;
```

#### 数据迁移脚本示例

```sql
-- 002_migrate_existing_users.sql
-- Migration: 迁移现有用户数据到新档案表
-- Author: developer@example.com
-- Date: 2026-02-20
-- Version: 1.0.0
-- Dependencies: 001_add_user_profiles_table.sql

BEGIN;

-- 迁移现有用户数据
INSERT INTO user_profiles (user_id, display_name, created_at, updated_at)
SELECT
    id as user_id,
    COALESCE(raw_user_meta_data->>'display_name', email) as display_name,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 更新统计信息
ANALYZE user_profiles;

COMMIT;
```

### 验证阶段

#### 自动化验证

```bash
# 运行迁移验证套件
npm run migrate:validate

# 检查表结构一致性
npm run migrate:check-schema

# 验证数据完整性
npm run migrate:check-data-integrity
```

#### 手动验证清单

```sql
-- 验证脚本
SELECT 'Table exists' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables
           WHERE table_name = 'user_profiles'
       ) THEN 'PASS' ELSE 'FAIL' END as result;

SELECT 'Index exists' as check_name,
       CASE WHEN EXISTS (
           SELECT 1 FROM pg_indexes
           WHERE tablename = 'user_profiles'
           AND indexname = 'idx_user_profiles_user_id'
       ) THEN 'PASS' ELSE 'FAIL' END as result;

SELECT 'Data migrated' as check_name,
       CASE WHEN (
           SELECT COUNT(*) FROM user_profiles
       ) = (
           SELECT COUNT(*) FROM auth.users
       ) THEN 'PASS' ELSE 'FAIL' END as result;
```

## 命名规范

### 文件命名

```
{序号}_{描述}_{类型}.sql

示例:
001_add_user_profiles_table.sql
002_migrate_existing_users_data.sql
003_alter_appointments_add_priority.sql
```

### 序号规则

- 三位数字前缀 (001, 002, ...)
- 按时间顺序递增
- 不允许跳号或重复

### 注释规范

每个迁移文件必须包含：

```sql
-- Migration: 简短描述
-- Author: 作者邮箱
-- Date: YYYY-MM-DD
-- Version: 版本号
-- Dependencies: 依赖的其他迁移文件
-- Rollback: 对应回滚文件名
-- Description: 详细变更说明
```

## 安全考虑

### 敏感数据处理

```sql
-- 敏感字段加密存储
ALTER TABLE user_profiles
ADD COLUMN encrypted_phone TEXT;

-- 数据脱敏处理
UPDATE user_profiles
SET phone = '***-****-' || RIGHT(phone, 4)
WHERE phone IS NOT NULL;
```

### 权限控制

```sql
-- 最小权限原则
GRANT SELECT, INSERT, UPDATE ON user_profiles TO application_user;
GRANT USAGE ON SCHEMA public TO application_user;

-- 禁止直接表访问
REVOKE ALL ON TABLE user_profiles FROM PUBLIC;
```

### 审计日志

```sql
-- 创建审计日志表
CREATE TABLE migration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_file VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_by VARCHAR(100),
    status VARCHAR(20),
    duration_ms INTEGER,
    error_message TEXT
);

-- 记录迁移执行
INSERT INTO migration_audit_log (migration_file, executed_by, status, duration_ms)
VALUES ('001_add_user_profiles_table.sql', CURRENT_USER, 'SUCCESS', 1250);
```

## 回滚策略

### 回滚脚本编写

```sql
-- 001_drop_user_profiles_table.sql
-- Rollback: 删除用户档案表
-- Author: developer@example.com
-- Date: 2026-02-20

BEGIN;

-- 删除RLS策略
DROP POLICY IF EXISTS "Users can view own profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON user_profiles;

-- 删除触发器
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 删除索引
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- 删除约束
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS unique_user_profile;

-- 删除表
DROP TABLE IF EXISTS user_profiles CASCADE;

COMMIT;
```

### 回滚条件判断

```sql
-- 安全回滚检查
DO $$
BEGIN
    -- 检查是否有依赖数据
    IF EXISTS (SELECT 1 FROM some_dependent_table WHERE profile_id IS NOT NULL) THEN
        RAISE EXCEPTION 'Cannot rollback: dependent data exists';
    END IF;

    -- 执行回滚
    -- 回滚逻辑...
END $$;
```

### 紧急回滚流程

```bash
# 紧急回滚命令
npm run migrate:rollback --to=版本号

# 强制回滚（危险操作）
npm run migrate:force-rollback --to=版本号
```

## 验证标准

### 迁移前验证

```bash
# 环境检查
npm run migrate:pre-check

检查项目：
□ 数据库版本兼容性
□ 磁盘空间充足
□ 备份已完成
□ 依赖服务正常
□ 权限配置正确
```

### 迁移后验证

```bash
# 完整性验证
npm run migrate:post-check

验证内容：
□ 表结构正确性
□ 数据完整性
□ 索引有效性
□ 约束条件满足
□ 性能基准测试
□ 功能回归测试
```

### 生产验证清单

```sql
-- 生产环境验证SQL
-- 1. 表结构验证
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'appointments')
ORDER BY table_name, ordinal_position;

-- 2. 数据量验证
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'appointments' as table_name, COUNT(*) as row_count FROM appointments;

-- 3. 性能验证
EXPLAIN ANALYZE
SELECT * FROM user_profiles WHERE user_id = 'some-user-id';
```

### 监控指标

迁移后应监控的关键指标：

```yaml
监控项:
  - 名称: 数据库连接数
    阈值: < 80% 最大连接数
    告警: critical

  - 名称: 查询响应时间
    阈值: < 1000ms (p95)
    告警: warning

  - 名称: 错误率
    阈值: < 1%
    告警: critical

  - 名称: 磁盘IO等待时间
    阈值: < 50ms
    告警: warning
```

## 最佳实践

### 开发环境实践

```sql
-- 使用事务确保原子性
BEGIN;
-- 迁移操作...
COMMIT;

-- 或者使用保存点
SAVEPOINT migration_step_1;
-- 操作1...
SAVEPOINT migration_step_2;
-- 操作2...
```

### 生产环境实践

```bash
# 分批处理大数据量迁移
npm run migrate:batch --batch-size=1000 --delay=1000

# 监控迁移进度
npm run migrate:monitor

# 生成迁移报告
npm run migrate:report
```

### 版本控制

```bash
# 迁移文件提交规范
git add supabase/migrations/001_*.sql
git commit -m "feat(database): add user profiles table and migration"
```

---

_最后更新: 2026-02-20_
_版本: 1.0.0_
