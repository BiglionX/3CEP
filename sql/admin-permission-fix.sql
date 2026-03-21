-- ============================================
-- 管理员权限修复脚本
-- 为当前用户 (1055603323@qq.com) 添加管理员权限
-- ============================================

-- 1. 检查 admin_users 表是否存在，不存在则创建
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    -- 创建 admin_users 表
    CREATE TABLE public.admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
    );

    RAISE NOTICE '已创建 admin_users 表';
  ELSE
    RAISE NOTICE 'admin_users 表已存在';
  END IF;
END $$;

-- 2. 启用 RLS（如果未启用）
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. 创建或替换 RLS 策略
DROP POLICY IF EXISTS "用户可查询自身管理员状态" ON public.admin_users;
CREATE POLICY "用户可查询自身管理员状态"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "管理员可管理管理员" ON public.admin_users;
CREATE POLICY "管理员可管理管理员"
  ON public.admin_users
  FOR ALL
  TO authenticated
  USING (TRUE);

-- 4. 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
ON public.admin_users(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_is_active
ON public.admin_users(is_active);

-- 5. 为当前用户 (1055603323@qq.com) 添加管理员记录
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 从 auth.users 和 auth.identities 表中查找用户 ID
  SELECT u.id INTO v_user_id
  FROM auth.users u
  JOIN auth.identities i ON u.id = i.user_id
  WHERE LOWER(i.email) = '1055603323@qq.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- 插入或更新管理员记录
    INSERT INTO public.admin_users (user_id, is_active)
    VALUES (v_user_id, true)
    ON CONFLICT (user_id) DO UPDATE
    SET is_active = true, updated_at = NOW();

    RAISE NOTICE '已为用户 % 添加管理员权限', v_user_id;
  ELSE
    RAISE WARNING '未找到用户 1055603323@qq.com';
  END IF;
END $$;

-- 6. 验证结果
SELECT
  au.id as admin_id,
  au.user_id,
  au.is_active,
  au.created_at,
  i.email as user_email,
  au.updated_at
FROM public.admin_users au
JOIN auth.identities i ON au.user_id = i.user_id
WHERE LOWER(i.email) = '1055603323@qq.com';
