-- 企业设备管理表
-- Migration: create_enterprise_devices_table.sql
-- 创建时间: 2026-03-17
-- 版本: 1.0.0
-- 注意：此表依赖于 enterprise-core-tables.sql 中的 enterprise_users 表

-- ====================================================================
-- 第一部分：企业设备管理表
-- ====================================================================

-- 企业设备管理表
CREATE TABLE IF NOT EXISTS enterprise_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL REFERENCES enterprise_users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- computer, mobile, tablet, iot, server
  status VARCHAR(50) DEFAULT 'offline', -- online, offline, maintenance
  os VARCHAR(100),
  ip_address VARCHAR(45) UNIQUE, -- 支持IPv4和IPv6
  mac_address VARCHAR(17),
  last_active_at TIMESTAMP WITH TIME ZONE,
  cpu_usage DECIMAL(5,2) DEFAULT 0, -- CPU使用率(0-100)
  memory_usage DECIMAL(5,2) DEFAULT 0, -- 内存使用率(0-100)
  storage_usage DECIMAL(5,2) DEFAULT 0, -- 存储使用率(0-100)
  location VARCHAR(255),
  department VARCHAR(100), -- 所属部门
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 分配给谁使用
  specifications JSONB, -- 设备规格参数
  installed_at TIMESTAMP WITH TIME ZONE, -- 安装/上线时间
  warranty_expiry DATE, -- 保修到期日
  notes TEXT, -- 备注信息
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 第二部分：索引优化
-- ====================================================================

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_enterprise_id ON enterprise_devices(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_type ON enterprise_devices(type);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_status ON enterprise_devices(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_ip_address ON enterprise_devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_mac_address ON enterprise_devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_last_active ON enterprise_devices(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_department ON enterprise_devices(department);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_assigned_to ON enterprise_devices(assigned_to);

-- 创建复合索引
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_status_type ON enterprise_devices(status, type);
CREATE INDEX IF NOT EXISTS idx_enterprise_devices_enterprise_status ON enterprise_devices(enterprise_id, status);

-- ====================================================================
-- 第三部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_enterprise_devices_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为企业设备表添加触发器
DROP TRIGGER IF EXISTS update_enterprise_devices_updated_at ON enterprise_devices;
CREATE TRIGGER update_enterprise_devices_updated_at
    BEFORE UPDATE ON enterprise_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_enterprise_devices_updated_at_column();

-- ====================================================================
-- 第四部分：约束和检查
-- ====================================================================

-- 添加设备类型约束
ALTER TABLE enterprise_devices 
ADD CONSTRAINT chk_device_type CHECK (
  type IN (
    'computer',  -- 计算机
    'mobile',   -- 手机
    'tablet',   -- 平板
    'iot',      -- 物联网设备
    'server',   -- 服务器
    'laptop',   -- 笔记本电脑
    'monitor',  -- 显示器
    'printer'   -- 打印机
  )
);

-- 添加设备状态约束
ALTER TABLE enterprise_devices 
ADD CONSTRAINT chk_device_status CHECK (
  status IN (
    'online',        -- 在线
    'offline',       -- 离线
    'maintenance',   -- 维护中
    'retired'       -- 已退役
  )
);

-- 添加使用率检查约束
ALTER TABLE enterprise_devices 
ADD CONSTRAINT chk_cpu_usage CHECK (cpu_usage >= 0 AND cpu_usage <= 100);
ALTER TABLE enterprise_devices 
ADD CONSTRAINT chk_memory_usage CHECK (memory_usage >= 0 AND memory_usage <= 100);
ALTER TABLE enterprise_devices 
ADD CONSTRAINT chk_storage_usage CHECK (storage_usage >= 0 AND storage_usage <= 100);

-- ====================================================================
-- 第五部分：表注释
-- ====================================================================

-- 添加表和列注释
COMMENT ON TABLE enterprise_devices IS '企业设备管理表';
COMMENT ON COLUMN enterprise_devices.enterprise_id IS '所属企业ID';
COMMENT ON COLUMN enterprise_devices.name IS '设备名称';
COMMENT ON COLUMN enterprise_devices.type IS '设备类型：computer,mobile,tablet,iot,server,laptop,monitor,printer';
COMMENT ON COLUMN enterprise_devices.status IS '设备状态：online,offline,maintenance,retired';
COMMENT ON COLUMN enterprise_devices.os IS '操作系统';
COMMENT ON COLUMN enterprise_devices.ip_address IS 'IP地址';
COMMENT ON COLUMN enterprise_devices.mac_address IS 'MAC地址';
COMMENT ON COLUMN enterprise_devices.last_active_at IS '最后活跃时间';
COMMENT ON COLUMN enterprise_devices.cpu_usage IS 'CPU使用率(0-100)';
COMMENT ON COLUMN enterprise_devices.memory_usage IS '内存使用率(0-100)';
COMMENT ON COLUMN enterprise_devices.storage_usage IS '存储使用率(0-100)';
COMMENT ON COLUMN enterprise_devices.location IS '物理位置';
COMMENT ON COLUMN enterprise_devices.department IS '所属部门';
COMMENT ON COLUMN enterprise_devices.assigned_to IS '分配给的用户ID';
COMMENT ON COLUMN enterprise_devices.specifications IS '设备规格参数(JSON)';
COMMENT ON COLUMN enterprise_devices.installed_at IS '安装/上线时间';
COMMENT ON COLUMN enterprise_devices.warranty_expiry IS '保修到期日期';
COMMENT ON COLUMN enterprise_devices.notes IS '备注信息';
COMMENT ON COLUMN enterprise_devices.created_by IS '创建者';
COMMENT ON COLUMN enterprise_devices.updated_by IS '更新者';

-- ====================================================================
-- 第六部分：视图创建
-- ====================================================================

-- 创建企业设备状态概览视图
CREATE OR REPLACE VIEW enterprise_device_status_overview AS
SELECT 
    ed.enterprise_id,
    ed.type,
    ed.status,
    COUNT(*) as device_count,
    AVG(ed.cpu_usage) as avg_cpu_usage,
    AVG(ed.memory_usage) as avg_memory_usage,
    AVG(ed.storage_usage) as avg_storage_usage
FROM enterprise_devices ed
GROUP BY ed.enterprise_id, ed.type, ed.status
ORDER BY ed.enterprise_id, ed.type, ed.status;

COMMENT ON VIEW enterprise_device_status_overview IS '企业设备状态概览视图';

-- 创建企业设备活跃设备视图
CREATE OR REPLACE VIEW enterprise_active_devices AS
SELECT 
    ed.id,
    ed.enterprise_id,
    ed.name,
    ed.type,
    ed.ip_address,
    ed.os,
    ed.location,
    ed.department,
    ed.cpu_usage,
    ed.memory_usage,
    ed.storage_usage,
    ed.last_active_at,
    au.email as assigned_user_email
FROM enterprise_devices ed
LEFT JOIN auth.users au ON ed.assigned_to = au.id
WHERE ed.status = 'online'
ORDER BY ed.last_active_at DESC;

COMMENT ON VIEW enterprise_active_devices IS '企业活跃设备视图';

-- ====================================================================
-- 第七部分：RLS策略（行级安全）
-- ====================================================================

-- 启用RLS
ALTER TABLE enterprise_devices ENABLE ROW LEVEL SECURITY;

-- 企业只能看到自己的设备
DROP POLICY IF EXISTS "Enterprises can view their own devices" ON enterprise_devices;
CREATE POLICY "Enterprises can view their own devices"
ON enterprise_devices FOR SELECT
USING (enterprise_id IN (
  SELECT id FROM enterprise_users WHERE user_id = auth.uid()
));

-- 企业可以插入自己的设备
DROP POLICY IF EXISTS "Enterprises can insert their own devices" ON enterprise_devices;
CREATE POLICY "Enterprises can insert their own devices"
ON enterprise_devices FOR INSERT
WITH CHECK (enterprise_id IN (
  SELECT id FROM enterprise_users WHERE user_id = auth.uid()
));

-- 企业可以更新自己的设备
DROP POLICY IF EXISTS "Enterprises can update their own devices" ON enterprise_devices;
CREATE POLICY "Enterprises can update their own devices"
ON enterprise_devices FOR UPDATE
USING (enterprise_id IN (
  SELECT id FROM enterprise_users WHERE user_id = auth.uid()
))
WITH CHECK (enterprise_id IN (
  SELECT id FROM enterprise_users WHERE user_id = auth.uid()
));

-- 企业可以删除自己的设备
DROP POLICY IF EXISTS "Enterprises can delete their own devices" ON enterprise_devices;
CREATE POLICY "Enterprises can delete their own devices"
ON enterprise_devices FOR DELETE
USING (enterprise_id IN (
  SELECT id FROM enterprise_users WHERE user_id = auth.uid()
));

-- ====================================================================
-- 第八部分：初始化示例数据（可选）
-- ====================================================================

-- 插入示例企业设备数据（仅用于测试）
-- 注意：实际使用时需要根据真实的企业ID和用户ID插入
/*
-- 获取示例企业ID（假设）
DO $$
DECLARE
  sample_enterprise_id UUID;
  sample_user_id UUID;
BEGIN
  -- 获取第一个企业ID
  SELECT id INTO sample_enterprise_id FROM enterprise_users LIMIT 1;
  
  -- 获取第一个用户ID
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_enterprise_id IS NOT NULL THEN
    INSERT INTO enterprise_devices (
      enterprise_id,
      name,
      type,
      status,
      os,
      ip_address,
      mac_address,
      last_active_at,
      cpu_usage,
      memory_usage,
      storage_usage,
      location,
      department,
      assigned_to,
      specifications,
      installed_at,
      notes
    ) VALUES 
      (
        sample_enterprise_id,
        '开发服务器-01',
        'server',
        'online',
        'Ubuntu 22.04',
        '192.168.1.101',
        '00:1A:2B:3C:4D:5E',
        NOW(),
        45.5,
        62.3,
        78.2,
        '北京机房A',
        '技术部',
        sample_user_id,
        '{"cpu": "Intel Xeon E5-2680 v4", "memory": "64GB", "storage": "2TB SSD"}',
        '2026-01-15 10:00:00+08',
        '主要开发环境服务器'
      ),
      (
        sample_enterprise_id,
        '生产服务器-01',
        'server',
        'online',
        'Ubuntu 22.04',
        '192.168.1.102',
        '00:1A:2B:3C:4D:5F',
        NOW() - INTERVAL '5 minutes',
        78.2,
        85.6,
        92.1,
        '上海机房B',
        '运维部',
        sample_user_id,
        '{"cpu": "AMD EPYC 7742", "memory": "128GB", "storage": "4TB SSD"}',
        '2026-01-10 14:00:00+08',
        '生产环境主服务器'
      );
  END IF;
END $$;
*/

-- ====================================================================
-- 第九部分：实用函数
-- ====================================================================

-- 获取企业设备统计信息
CREATE OR REPLACE FUNCTION get_enterprise_device_stats(p_enterprise_id UUID)
RETURNS TABLE(
  total_devices BIGINT,
  online_devices BIGINT,
  offline_devices BIGINT,
  maintenance_devices BIGINT,
  retired_devices BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_devices,
    COUNT(*) FILTER (WHERE status = 'online') as online_devices,
    COUNT(*) FILTER (WHERE status = 'offline') as offline_devices,
    COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_devices,
    COUNT(*) FILTER (WHERE status = 'retired') as retired_devices
  FROM enterprise_devices
  WHERE enterprise_id = p_enterprise_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_enterprise_device_stats IS '获取企业设备统计信息';

-- 更新设备最后活跃时间
CREATE OR REPLACE FUNCTION update_device_last_active(p_device_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE enterprise_devices
  SET last_active_at = NOW()
  WHERE id = p_device_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_device_last_active IS '更新设备最后活跃时间';

-- ====================================================================
-- 第十部分：更新核心视图和函数
-- ====================================================================

-- 删除旧的企业概览视图（如果存在）
DROP VIEW IF EXISTS enterprise_overview CASCADE;

-- 重新创建企业概览视图，添加设备统计
CREATE VIEW enterprise_overview AS
SELECT 
  eu.id,
  eu.company_name,
  eu.status,
  eu.subscription_plan,
  (SELECT COUNT(*) FROM enterprise_team_members 
   WHERE enterprise_id = eu.id AND status = 'active') as team_size,
  (SELECT COUNT(*) FROM enterprise_agents 
   WHERE enterprise_id = eu.id AND status = 'active') as agents_count,
  COALESCE(eta.balance, 0) as token_balance,
  (SELECT COUNT(*) FROM enterprise_devices 
   WHERE enterprise_id = eu.id) as devices_count
FROM enterprise_users eu
LEFT JOIN enterprise_token_accounts eta ON eu.id = eta.enterprise_id;

COMMENT ON VIEW enterprise_overview IS '企业概览视图（已更新，包含设备统计）';

-- 更新企业统计函数，添加设备统计
CREATE OR REPLACE FUNCTION get_enterprise_stats(p_enterprise_id UUID)
RETURNS TABLE(
  team_size BIGINT,
  active_agents BIGINT,
  total_devices BIGINT,
  online_devices BIGINT,
  token_balance DECIMAL(15,2),
  pending_documents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM enterprise_team_members 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as team_size,
    (SELECT COUNT(*) FROM enterprise_agents 
     WHERE enterprise_id = p_enterprise_id AND status = 'active') as active_agents,
    (SELECT COUNT(*) FROM enterprise_devices 
     WHERE enterprise_id = p_enterprise_id) as total_devices,
    (SELECT COUNT(*) FROM enterprise_devices 
     WHERE enterprise_id = p_enterprise_id AND status = 'online') as online_devices,
    (SELECT COALESCE(balance, 0) FROM enterprise_token_accounts 
     WHERE enterprise_id = p_enterprise_id) as token_balance,
    (SELECT COUNT(*) FROM enterprise_documents 
     WHERE enterprise_id = p_enterprise_id AND status = 'pending') as pending_documents;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_enterprise_stats IS '获取企业统计信息（已更新，包含设备统计）';
