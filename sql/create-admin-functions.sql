-- 创建用于执行DDL语句的自定义函数
-- 这个函数可以在Supabase控制台中手动执行

CREATE OR REPLACE FUNCTION execute_ddl(ddl_statement TEXT)
RETURNS TEXT AS $$
BEGIN
    EXECUTE ddl_statement;
    RETURN 'Success: ' || ddl_statement;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 给超级用户权限
GRANT EXECUTE ON FUNCTION execute_ddl(TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION execute_ddl(TEXT) TO service_role;

-- 创建管理员相关表的函数
CREATE OR REPLACE FUNCTION create_admin_tables()
RETURNS TEXT[] AS $$
DECLARE
    results TEXT[];
BEGIN
    -- 创建admin_users表
    BEGIN
        CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL UNIQUE,
            role VARCHAR(50) DEFAULT 'viewer',
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        results := array_append(results, 'admin_users表创建成功');
    EXCEPTION
        WHEN OTHERS THEN
            results := array_append(results, 'admin_users表创建失败: ' || SQLERRM);
    END;

    -- 创建permissions表
    BEGIN
        CREATE TABLE IF NOT EXISTS permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role VARCHAR(50) NOT NULL,
            resource VARCHAR(100) NOT NULL,
            action VARCHAR(50) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        results := array_append(results, 'permissions表创建成功');
    EXCEPTION
        WHEN OTHERS THEN
            results := array_append(results, 'permissions表创建失败: ' || SQLERRM);
    END;

    -- 创建索引
    BEGIN
        CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
        CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
        CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
        CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);
        results := array_append(results, '索引创建成功');
    EXCEPTION
        WHEN OTHERS THEN
            results := array_append(results, '索引创建失败: ' || SQLERRM);
    END;

    -- 插入默认权限数据
    BEGIN
        INSERT INTO permissions (role, resource, action, description) VALUES
            ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
            ('content_reviewer', 'content', 'review', '内容审核权限'),
            ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
            ('finance', 'finance', 'manage', '财务管理权限'),
            ('viewer', 'dashboard', 'view', '查看仪表板权限')
        ON CONFLICT DO NOTHING;
        results := array_append(results, '默认权限数据插入成功');
    EXCEPTION
        WHEN OTHERS THEN
            results := array_append(results, '权限数据插入失败: ' || SQLERRM);
    END;

    RETURN results;
END;
$$ LANGUAGE plpgsql;

-- 给执行权限
GRANT EXECUTE ON FUNCTION create_admin_tables() TO postgres;
GRANT EXECUTE ON FUNCTION create_admin_tables() TO service_role;