-- ============================================
-- 数据中心测试数据插入脚本 (通用版本)
-- 用途：为数据中心核心表插入示例数据用于测试
-- 执行方式：可在任何 SQL 客户端直接执行
-- ============================================

-- 开始插入数据中心测试数据

-- ============================================
-- 1. 插入 data_sources (数据源) 测试数据
-- ============================================
INSERT INTO data_sources (name, display_name, description, source_type, connection_type, status, owner, department, tags, is_active) VALUES
('supabase_main', 'Supabase 主数据库', '项目主要的 PostgreSQL 数据库', 'database', 'postgresql', 'active', 'tech_team', '技术部', ARRAY['生产','核心'], true),
('n8n_workflow', 'N8N 工作流系统', '自动化工作流和数据同步', 'api', 'rest_api', 'active', 'automation_team', '自动化部', ARRAY['工作流','集成'], true),
('local_files', '本地文件系统', '存储本地 CSV 和 Excel 文件', 'file', 'filesystem', 'inactive', 'data_team', '数据部', ARRAY['文件','离线'], false),
('user_events', '用户行为事件流', '实时用户行为数据采集', 'stream', 'websocket', 'active', 'analytics_team', '数据分析部', ARRAY['实时','用户行为'], true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. 插入 data_assets (数据资产) 测试数据
-- ============================================
INSERT INTO data_assets (
  asset_code, name, display_name, description, asset_type,
  category, sub_category, source_id, schema_name, table_name,
  sensitivity_level, quality_score, business_owner, technical_owner,
  data_steward, department, tags, business_tags, technical_tags, is_active
) VALUES
-- 设备相关资产
('device_table_001', 'devices', '设备信息表', '存储所有设备的基本信息、状态和配置', 'table', '设备管理', '核心业务', NULL, 'public', 'devices', 'internal', 95.00, '张经理', '李工', '王数据官', '技术部', ARRAY['设备','硬件','IoT'], ARRAY['设备管理','资产跟踪'], ARRAY['postgresql','主表'], true),
('fault_types_001', 'fault_types', '故障类型表', '定义设备故障类型和分类体系', 'table', '设备管理', '辅助数据', NULL, 'public', 'fault_types', 'internal', 92.00, '张经理', '李工', '王数据官', '技术部', ARRAY['故障','分类'], ARRAY['质量管理'], ARRAY['postgresql','参考表'], true),
('parts_001', 'parts', '配件信息表', '设备配件的详细信息和库存', 'table', '配件管理', '库存', NULL, 'public', 'parts', 'internal', 88.00, '赵主任', '钱工', '孙库管', '仓储部', ARRAY['配件','库存'], ARRAY['供应链管理'], ARRAY['postgresql','库存表'], true),

-- 视图类资产
('parts_price_view_001', 'parts_price_analysis', '配件价格分析视图', '聚合各渠道配件价格信息的分析视图', 'view', '价格分析', '商务智能', NULL, 'public', 'parts_price_analysis', 'internal', 90.00, '王总监', '周开发', '吴分析师', '商务部', ARRAY['价格','分析','配件'], ARRAY['价格监控','市场竞争'], ARRAY['materialized_view','实时'], true),
('device_status_view_001', 'device_status_dashboard', '设备状态监控看板', '实时展示所有设备的运行状态和关键指标', 'view', '设备管理', '监控', NULL, 'public', 'device_status_view', 'internal', 96.00, '张经理', '郑开发', '王运维', '运维部', ARRAY['监控','实时','设备'], ARRAY['运营监控','预警'], ARRAY['view','实时计算'], true),

-- API 类资产
('user_behavior_api_001', 'user_behavior_events', '用户行为事件 API', '实时获取用户行为事件数据的 RESTful API', 'api', '用户行为', '数据采集', NULL, NULL, NULL, 'confidential', 94.00, '陈主任', '刘架构师', '杨数据科学家', '数据源部', ARRAY['用户','行为','实时'], ARRAY['用户画像','行为分析'], ARRAY['rest_api','websocket'], true),
('inventory_sync_api_001', 'inventory_sync', '库存同步 API', '同步各仓库库存数据的 API 接口', 'api', '库存管理', '集成', NULL, NULL, NULL, 'internal', 87.00, '钱经理', '孙高工', '周集成专员', '供应链部', ARRAY['库存','同步','集成'], ARRAY['多仓协同','实时库存'], ARRAY['rest_api','异步'], true),

-- 文件类资产
('import_template_001', 'device_import_template', '设备导入模板', '批量导入设备信息的 Excel 模板文件', 'file', '设备管理', '工具', NULL, NULL, '/templates/device_import.xlsx', 'internal', 100.00, '张经理', '李工', NULL, '技术部', ARRAY['模板','导入'], ARRAY['批量操作'], ARRAY['excel','xlsx'], true),

-- 报表类资产
('monthly_report_001', 'monthly_operation_report', '月度运营报表', '每月生成的设备运营和故障统计报表', 'report', '报表', '统计分析', NULL, NULL, '/reports/monthly_operation', 'confidential', 98.00, '李总', '周数据分析师', '吴报表专员', '运营部', ARRAY['报表','统计','月度'], ARRAY['管理决策','KPI'], ARRAY['pdf','自动生成'], true),

-- 仪表盘类资产
('ceo_dashboard_001', 'executive_dashboard', '高管驾驶舱', '面向 CEO 的核心业务指标仪表盘', 'dashboard', '管理决策', '高层视图', NULL, NULL, '/dashboards/ceo', 'restricted', 99.00, 'CEO', 'CTO', 'CDO', '总经办', ARRAY['高管','决策','核心指标'], ARRAY['战略管理','KPI 监控'], ARRAY['real-time','interactive'], true)

ON CONFLICT (asset_code) DO NOTHING;

-- ============================================
-- 3. 插入 metadata_registry (元数据注册) 测试数据
-- ============================================
INSERT INTO metadata_registry (
  registry_code, asset_id, field_name, field_display_name, field_type,
  data_type, is_nullable, is_primary_key, description, business_definition,
  created_by, updated_by
) VALUES
-- devices 表的字段元数据
('devices_id_meta', NULL, 'id', '设备 ID', 'string', 'uuid', false, true, '设备唯一标识符', '系统中每个设备的唯一标识', 'system', 'system'),
('devices_name_meta', NULL, 'name', '设备名称', 'string', 'varchar', false, false, '设备的显示名称', '用户可见的设备名称', 'system', 'system'),
('devices_status_meta', NULL, 'status', '设备状态', 'string', 'varchar', false, false, '设备当前运行状态', 'online:在线，offline:离线，maintenance:维护中', 'system', 'system'),
('devices_created_meta', NULL, 'created_at', '创建时间', 'date', 'timestamp', false, false, '设备记录创建时间', '设备首次录入系统的时间', 'system', 'system'),

-- fault_types 表的字段元数据
('fault_code_meta', NULL, 'fault_code', '故障编码', 'string', 'varchar', false, true, '故障类型的唯一编码', '用于快速识别故障类型的编码', 'system', 'system'),
('fault_name_meta', NULL, 'fault_name', '故障名称', 'string', 'varchar', false, false, '故障类型的显示名称', '用户友好的故障类型名称', 'system', 'system'),
('fault_severity_meta', NULL, 'severity_level', '严重程度', 'number', 'integer', false, false, '故障严重程度等级', '1-轻微，2-一般，3-严重，4-致命', 'system', 'system')

ON CONFLICT (registry_code) DO NOTHING;

-- ============================================
-- 4. 插入 data_quality_rules (数据质量规则) 测试数据
-- ============================================
INSERT INTO data_quality_rules (
  rule_code, rule_name, description, rule_type, severity,
  target_asset_id, target_field, rule_expression, threshold_value,
  threshold_operator, is_active, execution_schedule, created_by
) VALUES
-- 完整性规则
('completeness_device_name', '设备名称完整性检查', '确保所有设备都有名称', 'completeness', 'high', NULL, 'name', 'COUNT(*) FILTER (WHERE name IS NULL) = 0', 100.00, '>=', true, '0 */6 * * *', 'data_admin'),
('completeness_device_status', '设备状态完整性检查', '确保所有设备都有状态值', 'completeness', 'medium', NULL, 'status', 'COUNT(*) FILTER (WHERE status IS NULL) = 0', 100.00, '>=', true, '0 */6 * * *', 'data_admin'),

-- 准确性规则
('accuracy_device_status_valid', '设备状态有效性检查', '确保设备状态在允许范围内', 'accuracy', 'high', NULL, 'status', 'COUNT(*) FILTER (WHERE status NOT IN (''online'', ''offline'', ''maintenance'')) = 0', 100.00, '>=', true, '0 */2 * * *', 'data_admin'),

-- 一致性规则
('consistency_fault_code_format', '故障编码格式一致性', '确保故障编码符合命名规范', 'consistency', 'medium', NULL, 'fault_code', 'COUNT(*) FILTER (WHERE fault_code !~ ''^[A-Z]{2,4}_\d+$'') = 0', 95.00, '>=', true, '0 0 * * *', 'data_admin'),

-- 唯一性规则
('uniqueness_device_id', '设备 ID 唯一性检查', '确保设备 ID 不重复', 'uniqueness', 'critical', NULL, 'id', 'COUNT(*) = COUNT(DISTINCT id)', 100.00, '>=', true, '0 */1 * * *', 'data_admin'),

-- 及时性规则
('timeliness_device_update', '设备信息更新及时性', '确保设备信息定期更新', 'timeliness', 'low', NULL, 'updated_at', 'EXTRACT(EPOCH FROM (NOW() - MAX(updated_at))) / 3600 < 168', 90.00, '>=', true, '0 0 * * 1', 'data_admin')

ON CONFLICT (rule_code) DO NOTHING;

-- ============================================
-- 5. 插入 data_lineage (数据血缘) 测试数据
-- ============================================
INSERT INTO data_lineage (
  lineage_code, source_asset_id, source_field, target_asset_id, target_field,
  transformation_type, transformation_logic, transformation_description,
  process_name, process_type, schedule_type, frequency, is_active, created_by
) VALUES
-- 设备数据处理流程
('lineage_device_001', NULL, 'devices.*', NULL, 'device_status_view.*', 'direct', 'SELECT * FROM devices WHERE is_active = true', '从设备表直接查询活跃设备', 'device_status_etl', 'sql_script', 'batch', 'hourly', true, 'data_engineer'),

-- 价格分析数据处理
('lineage_price_001', NULL, 'parts.price, parts.cost', NULL, 'parts_price_analysis.avg_price', 'calculation', '(price + cost) / 2', '计算配件平均价格', 'price_calculation_job', 'sql_script', 'batch', 'daily', true, 'analyst'),

-- 用户行为数据流
('lineage_behavior_001', NULL, 'events.*', NULL, 'user_behavior_events.*', 'filter', 'SELECT * FROM events WHERE event_type IN (''click'', ''view'', ''purchase'')', '过滤特定类型的事件', 'behavior_stream_processor', 'stream', 'real_time', 'continuous', true, 'data_scientist'),

-- 库存数据聚合
('lineage_inventory_001', NULL, 'parts.quantity', NULL, 'inventory_sync.total_quantity', 'aggregation', 'SUM(quantity) GROUP BY warehouse_id', '按仓库聚合库存数量', 'inventory_aggregation', 'sql_script', 'batch', 'hourly', true, 'warehouse_manager')

ON CONFLICT (lineage_code) DO NOTHING;

-- ============================================
-- 完成提示
-- ============================================
-- ============================================
-- 完成提示
-- ============================================
-- 数据中心测试数据插入完成!
--
-- 插入的数据:
--   - data_sources: 4 条数据源记录
--   - data_assets: 10 条数据资产记录 (包括表、视图、API、文件等)
--   - metadata_registry: 7 条元数据注册记录
--   - data_quality_rules: 6 条数据质量规则
--   - data_lineage: 4 条数据血缘关系
--
-- 下一步:
--   1. 访问 http://localhost:3001/data-center/metadata 查看数据
--   2. 检查前端页面是否正确显示真实数据
--   3. 验证统计信息和筛选功能
