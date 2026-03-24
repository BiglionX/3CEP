-- =====================================================
-- OPT-019: 实现高级统计分析
-- 创建每日统计聚合函数
-- =====================================================

-- 创建每日统计函数
CREATE OR REPLACE FUNCTION get_daily_analytics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  date TEXT,
  view_count BIGINT,
  install_count BIGINT,
  purchase_count BIGINT,
  revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      start_date::date,
      end_date::date,
      '1 day'::interval
    )::date AS day
  ),
  daily_views AS (
    SELECT
      DATE(viewed_at) AS day,
      COUNT(*) AS view_count
    FROM agent_views
    WHERE viewed_at >= start_date AND viewed_at <= end_date
    GROUP BY DATE(viewed_at)
  ),
  daily_installs AS (
    SELECT
      DATE(created_at) AS day,
      COUNT(*) AS install_count
    FROM user_agent_installations
    WHERE created_at >= start_date AND created_at <= end_date
    GROUP BY DATE(created_at)
  ),
  daily_purchases AS (
    SELECT
      DATE(created_at) AS day,
      COUNT(*) AS purchase_count,
      SUM(total_amount) AS revenue
    FROM agent_orders
    WHERE status = 'completed'
      AND created_at >= start_date AND created_at <= end_date
    GROUP BY DATE(created_at)
  )
  SELECT
    ds.day::TEXT AS date,
    COALESCE(dv.view_count, 0)::BIGINT AS view_count,
    COALESCE(di.install_count, 0)::BIGINT AS install_count,
    COALESCE(dp.purchase_count, 0)::BIGINT AS purchase_count,
    COALESCE(dp.revenue, 0)::NUMERIC AS revenue
  FROM date_series ds
  LEFT JOIN daily_views dv ON ds.day = dv.day
  LEFT JOIN daily_installs di ON ds.day = di.day
  LEFT JOIN daily_purchases dp ON ds.day = dp.day
  ORDER BY ds.day;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_daily_analytics IS '获取每日统计数据（浏览量、安装量、购买量、收入）';
