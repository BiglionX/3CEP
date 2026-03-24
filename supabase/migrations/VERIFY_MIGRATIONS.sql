-- ============================================================
-- 数据库迁移验证脚本
-- ============================================================

-- 1. 检查所有表是否存在（应该返回 14 行）
SELECT '表检查' as 检查类型，COUNT(*) as 数量
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'agents', 'agent_categories', 'agent_audit_logs',
  'agent_orders', 'agent_reviews', 'skills', 'skill_categories',
  'skill_versions', 'skill_audit_logs', 'skill_orders', 'skill_reviews',
  'menu_permissions', 'api_route_permissions'
);

-- 2. 检查所有视图是否存在（应该返回 3 行）
SELECT '视图检查' as 检查类型，COUNT(*) as 数量
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN ('user_roles_view', 'agent_daily_stats', 'skill_daily_stats');

-- 3. 检查 profiles 表的索引
SELECT 'profiles 表索引' as 检查类型，indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 4. 检查 agents 表的扩展字段
SELECT 'agents 表扩展字段' as 检查类型，column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN (
  'review_status', 'shelf_status', 'view_count',
  'revenue_total', 'developer_id', 'revenue_share_rate'
)
ORDER BY ordinal_position;

-- 5. 检查触发器
SELECT '触发器检查' as 检查类型，trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trigger_%'
ORDER BY trigger_name;

-- 6. 检查 RLS 是否启用
SELECT 'RLS 检查' as 检查类型，relname as 表名，relrowsecurity as 是否启用 RLS
FROM pg_class
WHERE relname IN ('profiles', 'agent_categories', 'agent_audit_logs', 'agent_orders', 'agent_reviews');

-- 7. 测试获取用户角色函数
SELECT '函数测试' as 检查类型，get_user_role(auth.uid()) as 当前用户角色;

-- 8. 检查默认分类数据
SELECT '智能体分类数据' as 检查类型，COUNT(*) as 分类数量
FROM agent_categories;

-- 9. 检查 skill 表结构（如果存在）
SELECT 'skills 表检查' as 检查类型，column_name, data_type
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position;

-- ============================================================
-- 验证完成提示
-- ============================================================

-- 如果以上查询都成功执行且返回预期结果，说明迁移成功！
-- 如果任何查询失败，请查看错误信息并修复后重新执行迁移文件。
