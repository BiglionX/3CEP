-- =====================================================
-- Grant permissions to service role for product_library schema
-- =====================================================
-- Description: Grant necessary permissions to the service role (authenticated)
--              to access the product_library schema
-- Execute this in Supabase SQL Editor

-- 1. Grant usage on schema
GRANT USAGE ON SCHEMA product_library TO authenticated;
GRANT USAGE ON SCHEMA product_library TO anon;
GRANT USAGE ON SCHEMA product_library TO service_role;

-- 2. Grant all privileges on all tables in product_library schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA product_library TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA product_library TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA product_library TO service_role;

-- 3. Grant all privileges on all sequences (for auto-increment IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA product_library TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA product_library TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA product_library TO service_role;

-- 4. Grant execute on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA product_library TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA product_library TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA product_library TO service_role;

-- 5. Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT ALL ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_library GRANT EXECUTE ON FUNCTIONS TO service_role;

-- Verify grants
SELECT
  n.nspname as schema_name,
  c.relname as table_name,
  r.rolname as role_name,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'v' THEN 'view'
    WHEN 'S' THEN 'sequence'
    WHEN 'f' THEN 'foreign table'
  END as object_type
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
CROSS JOIN pg_roles r
WHERE n.nspname = 'product_library'
  AND r.rolname IN ('authenticated', 'anon', 'service_role')
ORDER BY c.relname, r.rolname;
