// 虚拟视图定义文件
// 基于Trino SQL语法定义跨数据源的统一视图

export interface VirtualViewDefinition {
  name: string;
  description: string;
  sql: string;
  sourceCatalogs: string[];
  refreshInterval?: number; // 刷新间隔（秒）
  cacheEnabled: boolean;
}

// 设备信息统一视图
export const DEVICE_INFO_VIEW: VirtualViewDefinition = {
  name: 'unified_device_info',
  description: '统一设备信息视图，整合lionfix和本地设备数据',
  sourceCatalogs: ['lionfix', 'fixcycle'],
  cacheEnabled: true,
  refreshInterval: 300, // 5分钟刷新
  sql: `
    SELECT 
      lf_d.id as device_id,
      lf_d.lionfix_id,
      fc_d.id as local_id,
      lf_d.brand,
      lf_d.model,
      lf_d.category,
      lf_d.series,
      lf_d.release_year,
      lf_d.specifications,
      lf_d.screen_size,
      lf_d.storage_options,
      lf_d.color_options,
      COALESCE(fc_d.status, lf_d.status, 'active') as status,
      CASE 
        WHEN fc_d.stock_quantity > 0 THEN 'available'
        WHEN fc_d.stock_quantity = 0 THEN 'limited'
        ELSE 'unavailable'
      END as availability,
      fc_d.stock_quantity,
      fc_d.min_stock,
      fc_d.max_stock,
      lf_d.created_at as lionfix_created_at,
      lf_d.updated_at as lionfix_updated_at,
      fc_d.created_at as local_created_at,
      fc_d.updated_at as local_updated_at
    FROM lionfix.devices lf_d
    LEFT JOIN fixcycle.devices fc_d ON lf_d.id = fc_d.lionfix_device_id
    WHERE lf_d.status = 'active'
  `
};

// 配件信息统一视图
export const PART_INFO_VIEW: VirtualViewDefinition = {
  name: 'unified_part_info',
  description: '统一配件信息视图，整合lionfix和本地配件数据',
  sourceCatalogs: ['lionfix', 'fixcycle'],
  cacheEnabled: true,
  refreshInterval: 600, // 10分钟刷新
  sql: `
    SELECT 
      lf_p.id as part_id,
      lf_p.lionfix_id,
      fc_p.id as local_id,
      lf_p.name,
      lf_p.category,
      lf_p.brand,
      lf_p.model,
      lf_p.part_number,
      lf_p.unit,
      lf_p.description,
      lf_p.specifications,
      lf_p.compatible_devices,
      lf_p.image_url,
      COALESCE(fc_p.status, lf_p.status, 'active') as status,
      fc_p.stock_quantity,
      fc_p.min_stock,
      fc_p.max_stock,
      fc_p.location,
      lf_p.created_at as lionfix_created_at,
      lf_p.updated_at as lionfix_updated_at,
      fc_p.created_at as local_created_at,
      fc_p.updated_at as local_updated_at
    FROM lionfix.parts lf_p
    LEFT JOIN fixcycle.parts fc_p ON lf_p.id = fc_p.lionfix_part_id
    WHERE lf_p.status = 'active'
  `
};

// 价格聚合视图
export const PRICE_AGGREGATION_VIEW: VirtualViewDefinition = {
  name: 'price_aggregation',
  description: '配件价格聚合视图，整合多平台价格信息',
  sourceCatalogs: ['lionfix', 'fixcycle'],
  cacheEnabled: true,
  refreshInterval: 1800, // 30分钟刷新
  sql: `
    WITH lionfix_prices AS (
      SELECT 
        ph.part_id,
        'lionfix_source' as platform,
        ph.price,
        ph.currency,
        ph.recorded_at as last_updated,
        ph.source_url as url
      FROM lionfix.price_history ph
      WHERE ph.recorded_at >= CURRENT_DATE - INTERVAL '30' DAY
    ),
    fixcycle_prices AS (
      SELECT 
        pp.part_id,
        pp.platform,
        pp.price,
        'CNY' as currency,
        pp.last_updated,
        pp.url
      FROM fixcycle.part_prices pp
      WHERE pp.last_updated >= CURRENT_DATE - INTERVAL '30' DAY
    ),
    all_prices AS (
      SELECT * FROM lionfix_prices
      UNION ALL
      SELECT * FROM fixcycle_prices
    )
    SELECT 
      ap.part_id,
      ARRAY_AGG(DISTINCT ap.platform) as platforms,
      COUNT(ap.platform) as price_count,
      AVG(ap.price) as avg_price,
      MIN(ap.price) as min_price,
      MAX(ap.price) as max_price,
      STDDEV(ap.price) as price_stddev,
      MAX(ap.last_updated) as last_updated,
      APPROX_PERCENTILE(ap.price, 0.5) as median_price
    FROM all_prices ap
    GROUP BY ap.part_id
  `
};

// 用户行为分析视图
export const USER_BEHAVIOR_VIEW: VirtualViewDefinition = {
  name: 'user_behavior_analysis',
  description: '用户行为分析视图，整合用户操作和偏好数据',
  sourceCatalogs: ['fixcycle'],
  cacheEnabled: true,
  refreshInterval: 3600, // 1小时刷新
  sql: `
    SELECT 
      ub.user_id,
      ub.device_id,
      ub.part_id,
      ub.action_type,
      COUNT(*) as action_count,
      MIN(ub.created_at) as first_action,
      MAX(ub.created_at) as last_action,
      DATE_DIFF('day', MIN(ub.created_at), MAX(ub.created_at)) as activity_span_days
    FROM fixcycle.user_behaviors ub
    WHERE ub.created_at >= CURRENT_DATE - INTERVAL '90' DAY
    GROUP BY ub.user_id, ub.device_id, ub.part_id, ub.action_type
  `
};

// 维修记录分析视图
export const REPAIR_ANALYSIS_VIEW: VirtualViewDefinition = {
  name: 'repair_analysis',
  description: '维修记录分析视图，提供维修成功率和时效分析',
  sourceCatalogs: ['fixcycle'],
  cacheEnabled: true,
  refreshInterval: 7200, // 2小时刷新
  sql: `
    SELECT 
      rr.device_id,
      d.brand,
      d.model,
      d.category,
      COUNT(*) as total_repairs,
      COUNT(CASE WHEN rr.status = 'completed' THEN 1 END) as completed_repairs,
      AVG(CASE 
        WHEN rr.actual_end_time IS NOT NULL AND rr.actual_start_time IS NOT NULL 
        THEN DATE_DIFF('hour', rr.actual_start_time, rr.actual_end_time)
      END) as avg_repair_hours,
      AVG(rr.cost) as avg_repair_cost,
      MAX(rr.created_at) as last_repair_date
    FROM fixcycle.repair_records rr
    LEFT JOIN fixcycle.devices d ON rr.device_id = d.id
    WHERE rr.created_at >= CURRENT_DATE - INTERVAL '365' DAY
    GROUP BY rr.device_id, d.brand, d.model, d.category
  `
};

// 库存预警视图
export const INVENTORY_ALERT_VIEW: VirtualViewDefinition = {
  name: 'inventory_alerts',
  description: '库存预警视图，识别低库存和缺货配件',
  sourceCatalogs: ['fixcycle'],
  cacheEnabled: true,
  refreshInterval: 1800, // 30分钟刷新
  sql: `
    SELECT 
      p.id as part_id,
      p.name,
      p.category,
      p.brand,
      p.model,
      p.stock_quantity,
      p.min_stock,
      p.max_stock,
      CASE 
        WHEN p.stock_quantity <= 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.min_stock THEN 'low_stock'
        WHEN p.stock_quantity >= p.max_stock THEN 'over_stock'
        ELSE 'normal'
      END as stock_status,
      ROUND((p.stock_quantity::DECIMAL / NULLIF(p.min_stock, 0)) * 100, 2) as stock_ratio_percent
    FROM fixcycle.parts p
    WHERE p.status = 'active'
  `
};

// 导出所有视图定义
export const VIRTUAL_VIEWS = {
  DEVICE_INFO_VIEW,
  PART_INFO_VIEW,
  PRICE_AGGREGATION_VIEW,
  USER_BEHAVIOR_VIEW,
  REPAIR_ANALYSIS_VIEW,
  INVENTORY_ALERT_VIEW
};

// 视图管理服务
export class ViewManager {
  private views: Map<string, VirtualViewDefinition> = new Map();

  constructor() {
    // 初始化所有预定义视图
    Object.entries(VIRTUAL_VIEWS).forEach(([key, view]) => {
      this.views.set(view.name, view);
    });
  }

  // 获取视图定义
  getView(name: string): VirtualViewDefinition | undefined {
    return this.views.get(name);
  }

  // 获取所有视图
  getAllViews(): VirtualViewDefinition[] {
    return Array.from(this.views.values());
  }

  // 添加自定义视图
  addView(view: VirtualViewDefinition): void {
    this.views.set(view.name, view);
  }

  // 删除视图
  removeView(name: string): boolean {
    return this.views.delete(name);
  }

  // 检查视图是否存在
  hasView(name: string): boolean {
    return this.views.has(name);
  }

  // 获取需要刷新的视图
  getViewsNeedingRefresh(): VirtualViewDefinition[] {
    const now = Date.now();
    return Array.from(this.views.values()).filter(view => {
      if (!view.refreshInterval) return false;
      // 这里应该检查上次刷新时间，简化处理
      return true;
    });
  }
}