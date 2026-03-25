-- ============================================
-- 数据中心核心表 RLS 策略配置 (通用版本)
-- 用途：为数据中心 5 张核心表启用行级安全策略
-- 执行方式：可在任何 SQL 客户端执行
-- ============================================

-- 开始配置数据中心核心表 RLS 策略

-- ============================================
-- 1. data_sources 表的 RLS 策略
-- ============================================

-- 启用 RLS
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- 创建策略：管理员可以查看所有数据源
CREATE POLICY "admin_view_data_sources" ON data_sources
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- 创建策略：只有数据管理员可以修改
CREATE POLICY "admin_manage_data_sources" ON data_sources
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- ============================================
-- 2. data_assets 表的 RLS 策略
-- ============================================

-- 启用 RLS
ALTER TABLE data_assets ENABLE ROW LEVEL SECURITY;

-- 创建策略：根据敏感级别控制访问
CREATE POLICY "view_data_assets_by_sensitivity" ON data_assets
    FOR SELECT
    USING (
        CASE
            WHEN sensitivity_level = 'public' THEN true
            WHEN sensitivity_level IN ('internal', 'confidential') THEN
                EXISTS (
                    SELECT 1 FROM admin_users au
                    WHERE au.email = current_setting('app.current_user_email', true)::text
                    AND au.is_active = true
                )
            WHEN sensitivity_level = 'restricted' THEN
                EXISTS (
                    SELECT 1 FROM admin_users au
                    WHERE au.email = current_setting('app.current_user_email', true)::text
                    AND au.role IN ('super_admin', 'admin', 'data_admin')
                )
            ELSE false
        END
    );

-- 创建策略：管理员可以管理所有资产
CREATE POLICY "admin_manage_data_assets" ON data_assets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- ============================================
-- 3. metadata_registry 表的 RLS 策略
-- ============================================

-- 启用 RLS
ALTER TABLE metadata_registry ENABLE ROW LEVEL SECURITY;

-- 创建策略：授权用户可以查看
CREATE POLICY "view_metadata_registry" ON metadata_registry
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.is_active = true
        )
    );

-- 创建策略：管理员可以管理
CREATE POLICY "admin_manage_metadata_registry" ON metadata_registry
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- ============================================
-- 4. data_quality_rules 表的 RLS 策略
-- ============================================

-- 启用 RLS
ALTER TABLE data_quality_rules ENABLE ROW LEVEL SECURITY;

-- 创建策略：授权用户可以查看规则
CREATE POLICY "view_quality_rules" ON data_quality_rules
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.is_active = true
        )
    );

-- 创建策略：只有管理员可以管理规则
CREATE POLICY "admin_manage_quality_rules" ON data_quality_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- ============================================
-- 5. data_lineage 表的 RLS 策略
-- ============================================

-- 启用 RLS
ALTER TABLE data_lineage ENABLE ROW LEVEL SECURITY;

-- 创建策略：授权用户可以查看血缘
CREATE POLICY "view_data_lineage" ON data_lineage
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.is_active = true
        )
    );

-- 创建策略：管理员可以管理血缘关系
CREATE POLICY "admin_manage_data_lineage" ON data_lineage
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.email = current_setting('app.current_user_email', true)::text
            AND au.role IN ('super_admin', 'admin', 'data_admin')
        )
    );

-- ============================================
-- 完成提示
-- ============================================
-- ============================================
-- 完成提示
-- ============================================
-- 数据中心核心表 RLS 策略配置完成!
--
-- 已配置 RLS 的表:
--   1. data_sources
--   2. data_assets
--   3. metadata_registry
--   4. data_quality_rules
--   5. data_lineage
--
-- 策略说明:
--   - 所有活跃的管理员用户可以查看数据
--   - 只有超级管理员、管理员和数据管理员可以修改数据
--   - data_assets 表根据敏感级别控制访问权限
