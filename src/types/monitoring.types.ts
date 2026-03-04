/**
 * 系统监控指标体系接口定义
 * FixCycle 6.0 监控系统核心数据结构
 */

// ==================== 基础类型定义 ====================

export interface MetricBase {
  /** 指标名称 */
  name: string;
  /** 指标描述 */
  description: string;
  /** 指标单位 */
  unit: string;
  /** 标签/维度 */
  labels?: Record<string, string>;
  /** 时间?*/
  timestamp: number;
}

export interface NumericMetric extends MetricBase {
  /** 数值类型指标?*/
  value: number;
}

export interface CounterMetric extends MetricBase {
  /** 计数器类型指标?*/
  count: number;
}

export interface GaugeMetric extends MetricBase {
  /** 仪表盘类型指标?*/
  value: number;
}

export interface HistogramMetric extends MetricBase {
  /** 直方图统计?*/
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

// ==================== 业务指标接口 ====================

/** 用户活跃度指?*/
export interface UserActivityMetrics {
  /** 日活跃用户数 */
  dau: number;
  /** 周活跃用户数 */
  wau: number;
  /** 月活跃用户数 */
  mau: number;
  /** 用户留存?*/
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  /** 在线用户?*/
  online_users: number;
  /** 会话时长分布 */
  session_duration: HistogramMetric;
}

/** 交易指标 */
export interface TransactionMetrics {
  /** 总交易额 */
  gmv: number;
  /** 订单数量 */
  order_count: number;
  /** 转化?*/
  conversion_rate: number;
  /** 平均订单金额 */
  aov: number;
  /** 复购?*/
  repeat_purchase_rate: number;
  /** 购物车转化率 */
  cart_conversion_rate: number;
}

/** 智能体市场指?*/
export interface AgentMarketMetrics {
  /** 智能体安装总数 */
  total_installs: number;
  /** 活跃智能体数 */
  active_agents: number;
  /** 日安装量 */
  daily_installs: number;
  /** Token总消?*/
  total_token_consumption: number;
  /** 日Token消?*/
  daily_token_consumption: number;
  /** 开发者总收?*/
  total_developer_revenue: number;
  /** 平台抽成 */
  platform_commission: number;
  /** 智能体平均评?*/
  avg_agent_rating: number;
}

/** 收入指标 */
export interface RevenueMetrics {
  /** 总收?*/
  total_revenue: number;
  /** 日收?*/
  daily_revenue: number;
  /** 月收?*/
  monthly_revenue: number;
  /** ARPU (平均每用户收? */
  arpu: number;
  /** 收入构成 */
  revenue_breakdown: {
    agent_sales: number;
    subscription: number;
    token_sales: number;
    commission: number;
  };
}

// ==================== 技术指标接?====================

/** 系统性能指标 */
export interface SystemPerformanceMetrics {
  /** API响应时间 */
  api_response_time: HistogramMetric;
  /** 页面加载时间 */
  page_load_time: HistogramMetric;
  /** 数据库查询时?*/
  db_query_time: HistogramMetric;
  /** 系统可用?*/
  availability: number;
  /** 错误?*/
  error_rate: number;
  /** 5xx错误?*/
  server_error_rate: number;
}

/** 资源使用指标 */
export interface ResourceMetrics {
  /** CPU使用?*/
  cpu_utilization: number;
  /** 内存使用?*/
  memory_utilization: number;
  /** 磁盘IO使用?*/
  disk_io_utilization: number;
  /** 网络带宽使用?*/
  network_utilization: number;
  /** 数据库连接数 */
  db_connections: number;
  /** 缓存命中?*/
  cache_hit_rate: number;
}

/** 应用性能指标 */
export interface ApplicationMetrics {
  /** QPS (每秒查询? */
  qps: number;
  /** TPS (每秒事务? */
  tps: number;
  /** 并发用户?*/
  concurrent_users: number;
  /** JavaScript错误?*/
  js_error_rate: number;
  /** 前端性能指标 */
  frontend_performance: {
    dom_ready_time: number;
    first_paint_time: number;
    first_contentful_paint: number;
    largest_contentful_paint: number;
  };
}

// ==================== 用户体验指标接口 ====================

/** 用户行为指标 */
export interface UserBehaviorMetrics {
  /** 平均会话时长 */
  avg_session_duration: number;
  /** 页面浏览深度 */
  avg_page_depth: number;
  /** 功能使用?*/
  feature_adoption: Record<string, number>;
  /** 搜索成功?*/
  search_success_rate: number;
  /** 购物流程完成?*/
  checkout_completion_rate: number;
  /** 用户满意度评?*/
  satisfaction_score: number;
}

/** 交互指标 */
export interface InteractionMetrics {
  /** 关键按钮点击?*/
  ctr: Record<string, number>;
  /** 表单提交成功?*/
  form_submission_success: number;
  /** 页面跳出?*/
  bounce_rate: number;
  /** 用户路径分析 */
  user_journey: {
    entry_points: Record<string, number>;
    exit_points: Record<string, number>;
    popular_paths: Array<{ path: string; count: number }>;
  };
}

// ==================== 安全指标接口 ====================

/** 访问安全指标 */
export interface AccessSecurityMetrics {
  /** 登录尝试次数 */
  login_attempts: CounterMetric;
  /** 登录失败次数 */
  failed_logins: CounterMetric;
  /** 恶意IP访问次数 */
  malicious_ip_access: CounterMetric;
  /** 权限越权尝试 */
  privilege_escalation_attempts: CounterMetric;
  /** 异常访问模式 */
  anomalous_access_patterns: number;
}

/** 数据安全指标 */
export interface DataSecurityMetrics {
  /** 数据泄露事件 */
  data_breach_incidents: CounterMetric;
  /** 数据完整性检查失?*/
  data_integrity_failures: CounterMetric;
  /** 加密操作失败 */
  encryption_failures: CounterMetric;
  /** 敏感数据访问统计 */
  sensitive_data_access: CounterMetric;
}

/** 应用安全指标 */
export interface ApplicationSecurityMetrics {
  /** XSS攻击检?*/
  xss_attacks_detected: CounterMetric;
  /** SQL注入检?*/
  sql_injection_detected: CounterMetric;
  /** CSRF攻击防护 */
  csrf_protection_triggers: CounterMetric;
  /** 安全扫描结果 */
  security_scan_results: {
    vulnerabilities: number;
    critical_issues: number;
    high_risk_issues: number;
  };
}

// ==================== 综合监控数据接口 ====================

/** 完整监控快照 */
export interface MonitoringSnapshot {
  /** 时间?*/
  timestamp: number;
  /** 业务指标 */
  business: {
    user_activity: UserActivityMetrics;
    transactions: TransactionMetrics;
    agent_market: AgentMarketMetrics;
    revenue: RevenueMetrics;
  };
  /** 技术指?*/
  technical: {
    system_performance: SystemPerformanceMetrics;
    resources: ResourceMetrics;
    application: ApplicationMetrics;
  };
  /** 用户体验指标 */
  user_experience: {
    behavior: UserBehaviorMetrics;
    interaction: InteractionMetrics;
  };
  /** 安全指标 */
  security: {
    access: AccessSecurityMetrics;
    data: DataSecurityMetrics;
    application: ApplicationSecurityMetrics;
  };
}

/** 指标阈值配?*/
export interface MetricThreshold {
  /** 指标名称 */
  metric_name: string;
  /** 警告阈?*/
  warning_threshold: number;
  /** 严重阈?*/
  critical_threshold: number;
  /** 比较操作?*/
  operator: '>' | '<' | '>=' | '<=' | '==';
  /** 告警级别 */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** 是否启用 */
  enabled: boolean;
  /** 告警描述 */
  description: string;
}

/** 告警事件 */
export interface AlertEvent {
  /** 告警ID */
  id: string;
  /** 告警规则ID */
  rule_id: string;
  /** 指标名称 */
  metric_name: string;
  /** 当前?*/
  current_value: number;
  /** 阈?*/
  threshold: number;
  /** 告警级别 */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** 告警消息 */
  message: string;
  /** 触发时间 */
  triggered_at: number;
  /** 解决时间 */
  resolved_at?: number;
  /** 状?*/
  status: 'triggered' | 'acknowledged' | 'resolved';
  /** 标签 */
  labels?: Record<string, string>;
}

/** 监控配置 */
export interface MonitoringConfig {
  /** 采集间隔(毫秒) */
  collection_interval: number;
  /** 数据保留时间(�? */
  retention_days: number;
  /** 告警评估间隔(�? */
  alert_evaluation_interval: number;
  /** 采样?*/
  sample_rate: number;
  /** 启用的指标列?*/
  enabled_metrics: string[];
  /** 告警通知配置 */
  notification_config: {
    email: boolean;
    sms: boolean;
    webhook: string[];
  };
}
