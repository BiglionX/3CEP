-- =====================================================
-- 创建刷新物化视图的 RPC 函数
-- =====================================================

-- 创建刷新函数
CREATE OR REPLACE FUNCTION refresh_agent_status_view()
RETURNS void AS $$
BEGIN
  -- 刷新最近 7 天的物化视图
  REFRESH MATERIALIZED VIEW CONCURRENTLY agent_status_last_7days;

  RAISE NOTICE '物化视图 agent_status_last_7days 已刷新';
END;
$$ LANGUAGE plpgsql;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION refresh_agent_status_view() TO authenticated;

COMMENT ON FUNCTION refresh_agent_status_view IS '刷新智能体状态最近 7 天统计物化视图';
