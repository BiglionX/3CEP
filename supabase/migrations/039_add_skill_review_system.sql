-- ====================================================================
-- Skill 评论反馈系统 - 最终修复版 (含依赖检查)
-- ====================================================================
-- 说明：先检查并创建依赖表，再创建评论系统
-- 执行顺序：在 038_add_shelf_management_fields.sql 之后执行
-- ====================================================================

-- ====================================================================
-- 第一步：检查并确保基础表存在
-- ====================================================================

-- 1. 检查 skills 表是否存在
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills') THEN
    RAISE NOTICE 'skills 表不存在，请先执行 034_add_skill_store_management.sql';
  ELSE
    RAISE NOTICE 'skills 表已存在 ✓';
  END IF;
END $$;

-- 2. 检查 admin_users 表是否存在
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    RAISE NOTICE 'admin_users 表不存在，正在创建...';

    CREATE TABLE admin_users (
      id uuid primary key default uuid_generate_v4(),
      user_id uuid references auth.users(id) on delete cascade,
      email varchar(255) not null unique,
      role varchar(50) not null default 'viewer',
      is_active boolean default true,
      created_by uuid references auth.users(id),
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    );

    CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
    CREATE INDEX idx_admin_users_role ON admin_users(role);
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE 'admin_users 表已创建 ✓';
  ELSE
    RAISE NOTICE 'admin_users 表已存在 ✓';
  END IF;
END $$;

-- ====================================================================
-- 第二步：创建 Skill 评论表
-- ====================================================================

DROP TABLE IF EXISTS skill_reviews CASCADE;

CREATE TABLE skill_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER,
  title VARCHAR(200),
  content TEXT NOT NULL,
  parent_id UUID,
  is_approved BOOLEAN DEFAULT FALSE,
  is_offensive BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第三步：添加约束
-- ====================================================================

ALTER TABLE skill_reviews
ADD CONSTRAINT check_rating_range
CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- ====================================================================
-- 第四步：创建索引
-- ====================================================================

CREATE INDEX idx_skill_reviews_skill_id ON skill_reviews(skill_id);
CREATE INDEX idx_skill_reviews_user_id ON skill_reviews(user_id);
CREATE INDEX idx_skill_reviews_parent_id ON skill_reviews(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_skill_reviews_created_at ON skill_reviews(created_at DESC);
CREATE INDEX idx_skill_reviews_rating ON skill_reviews(rating);
CREATE INDEX idx_skill_reviews_is_approved ON skill_reviews(is_approved);

-- ====================================================================
-- 第五步：启用 RLS
-- ====================================================================

ALTER TABLE skill_reviews ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 第六步：创建 RLS 策略
-- ====================================================================

-- 所有人可以查看已审核通过的评论
DROP POLICY IF EXISTS "view_approved_reviews" ON skill_reviews;
CREATE POLICY "view_approved_reviews" ON skill_reviews
  FOR SELECT
  USING (is_approved = true);

-- 认证用户可以创建自己的评论
DROP POLICY IF EXISTS "create_own_reviews" ON skill_reviews;
CREATE POLICY "create_own_reviews" ON skill_reviews
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户可以修改自己的评论
DROP POLICY IF EXISTS "update_own_reviews" ON skill_reviews;
CREATE POLICY "update_own_reviews" ON skill_reviews
  FOR UPDATE
  USING (user_id = auth.uid());

-- 用户可以删除自己的评论
DROP POLICY IF EXISTS "delete_own_reviews" ON skill_reviews;
CREATE POLICY "delete_own_reviews" ON skill_reviews
  FOR DELETE
  USING (user_id = auth.uid());

-- 管理员可以查看所有评论
DROP POLICY IF EXISTS "admin_view_all_reviews" ON skill_reviews;
CREATE POLICY "admin_view_all_reviews" ON skill_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- 管理员可以审核评论
DROP POLICY IF EXISTS "admin_approve_reviews" ON skill_reviews;
CREATE POLICY "admin_approve_reviews" ON skill_reviews
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

-- ====================================================================
-- 第七步：显示完成信息
-- ====================================================================

DO $$
DECLARE
  v_col_count INTEGER;
  v_idx_count INTEGER;
  v_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_col_count
    FROM information_schema.columns
    WHERE table_name = 'skill_reviews';

  SELECT COUNT(*) INTO v_idx_count
    FROM pg_indexes
    WHERE tablename = 'skill_reviews';

  SELECT COUNT(*) INTO v_policy_count
    FROM pg_policies
    WHERE tablename = 'skill_reviews';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Skill 评论反馈系统安装完成!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '表名：skill_reviews';
  RAISE NOTICE '列数：%', v_col_count;
  RAISE NOTICE '索引数：%', v_idx_count;
  RAISE NOTICE 'RLS 策略数：%', v_policy_count;
  RAISE NOTICE '========================================';
END $$;
