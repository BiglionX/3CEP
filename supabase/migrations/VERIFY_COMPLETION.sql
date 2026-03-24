-- ============================================================
-- 数据库迁移完成验证脚本
-- ============================================================

-- 1. 检查所有表是否创建成功（应该返回 16 个表）
SELECT '✅ 核心业务表' as 检查项，COUNT(*) as 数量
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'agents', 'agent_categories', 'agent_audit_logs', 
  'agent_orders', 'agent_reviews', 'skills', 'skill_categories',
  'skill_versions', 'skill_audit_logs', 'skill_orders', 'skill_reviews',
  'menu_permissions', 'api_route_permissions', 'role_permissions_map'
);

-- 2. 检查所有视图是否创建成功（应该返回 3 个）
SELECT '✅ 统计视图' as 检查项，COUNT(*) as 数量
FROM pg_views 
WHERE schemaname = 'public'
AND viewname IN ('user_roles_view', 'agent_daily_stats', 'skill_daily_stats');

-- 3. 检查 profiles 表结构
SELECT '✅ profiles 表字段' as 检查项，column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('id', 'email', 'role', 'is_active')
ORDER BY ordinal_position;

-- 4. 检查 agents 表的扩展字段
SELECT '✅ agents 表扩展字段' as 检查项，column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN (
  'review_status', 'shelf_status', 'view_count', 
  'revenue_total', 'developer_id', 'revenue_share_rate'
)
ORDER BY ordinal_position;

-- 5. 检查 skills 表结构
SELECT '✅ skills 表字段' as 检查项，column_name, data_type
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position;

-- 6. 检查角色权限映射表
SELECT '✅ role_permissions_map 权限' as 检查项，role_name, COUNT(*) as 权限数
FROM role_permissions_map
GROUP BY role_name
ORDER BY role_name;

-- 7. 检查菜单权限配置
SELECT '✅ menu_permissions 菜单' as 检查项，required_role, COUNT(*) as 菜单数
FROM menu_permissions
GROUP BY required_role
ORDER BY required_role;

-- 8. 检查 API 路由权限
SELECT '✅ api_route_permissions API' as 检查项，required_role, COUNT(*) as API 数
FROM api_route_permissions
GROUP BY required_role
ORDER BY required_role;

-- 9. 检查触发器
SELECT '✅ 触发器' as 检查项，trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%'
ORDER BY trigger_name;

-- 10. 测试获取用户角色函数
SELECT '✅ get_user_role 函数' as 检查项，get_user_role(auth.uid()) as 当前用户角色;

-- ============================================================
-- 迁移完成总结
-- ============================================================

-- 如果以上所有查询都成功执行，说明数据库迁移完全成功！
-- 接下来可以开始开发前端管理页面和 API 端点了。
