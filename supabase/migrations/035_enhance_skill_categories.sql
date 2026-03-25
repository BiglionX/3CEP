-- ====================================================================
-- Skill Categories 表结构增强
-- ====================================================================
-- 说明：为 skill_categories 表添加 name_en 字段以支持国际化
-- 执行顺序：在 034_add_skill_store_management.sql 之后执行
-- ====================================================================

-- 1. 添加 name_en 字段 (如果不存在)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'skill_categories'
    AND column_name = 'name_en'
  ) THEN
    ALTER TABLE skill_categories ADD COLUMN name_en VARCHAR(100);
    RAISE NOTICE '已添加 name_en 字段到 skill_categories 表';
  ELSE
    RAISE NOTICE 'name_en 字段已存在';
  END IF;
END $$;

-- 2. 为 name_en 添加唯一约束 (如果不存在)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'skill_categories_name_en_key'
    AND table_name = 'skill_categories'
  ) THEN
    ALTER TABLE skill_categories ADD CONSTRAINT skill_categories_name_en_key UNIQUE (name_en);
    RAISE NOTICE '已为 name_en 添加唯一约束';
  ELSE
    RAISE NOTICE 'name_en 唯一约束已存在';
  END IF;
END $$;

-- 3. 更新现有数据的 name_en 值 (使用 slug 作为默认值)
UPDATE skill_categories
SET name_en = slug
WHERE name_en IS NULL;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_skill_categories_name_en ON skill_categories(name_en);

-- 5. 添加字段注释
COMMENT ON COLUMN skill_categories.name_en IS '英文名称/标识符 (用于 URL 和 API)';

-- 6. 验证修改
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'skill_categories'
AND column_name IN ('id', 'name', 'name_en', 'slug', 'description', 'sort_order', 'is_active')
ORDER BY ordinal_position;
