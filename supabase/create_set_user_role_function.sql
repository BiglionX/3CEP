-- =====================================================
-- 创建设置用户角色的 RPC 函数
-- 用于在应用中安全地设置 session 变量
-- =====================================================

-- 如果存在旧函数，先删除
DROP FUNCTION IF EXISTS set_user_role(text);

-- 创建新函数
CREATE OR REPLACE FUNCTION set_user_role(role text)
RETURNS void AS $$
BEGIN
  -- 设置 session 变量用于 RLS 权限检查
  PERFORM set_config('app.settings.current_user_role', role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加注释
COMMENT ON FUNCTION set_user_role IS '设置当前用户的角色（用于 RLS 权限检查）';

-- 验证函数已创建
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'set_user_role';

-- 测试函数（可选）
-- SELECT set_user_role('admin');
-- SELECT current_setting('app.settings.current_user_role', true);
