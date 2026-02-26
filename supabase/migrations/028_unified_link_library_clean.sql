-- Unified Link Library Table Structure (整合hot_links和hot_link_pool)
-- Migration: 028_unified_link_library_clean.sql
-- 创建时间: 2026-02-22
-- 版本: 1.0.0

-- ====================================================================
-- 第一部分：统一链接库主表
-- ====================================================================

-- 统一链接库表（整合原有两个表的功能）
CREATE TABLE IF NOT EXISTS unified_link_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  image_url TEXT,
  
  -- 交互数据
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- 优先级管理（核心功能）
  priority INTEGER DEFAULT 0, -- 数字越大越优先
  
  -- AI相关
  ai_tags JSONB, -- AI打标结果
  ai_quality_score DECIMAL(3,2), -- AI质量评分 0.00-1.00
  
  -- 状态管理
  status VARCHAR(20) DEFAULT 'active', -- active/inactive/pending_review/rejected
  review_status VARCHAR(20) DEFAULT 'approved', -- approved/pending/rejected
  
  -- 时间戳
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 审核相关
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  article_id UUID -- 关联的文章ID
);

-- ====================================================================
-- 第二部分：索引创建
-- ====================================================================

-- 基础索引
CREATE INDEX IF NOT EXISTS idx_unified_link_library_url ON unified_link_library(url);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_status ON unified_link_library(status);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_priority ON unified_link_library(priority DESC);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_created_at ON unified_link_library(created_at DESC);

-- 查询优化索引
CREATE INDEX IF NOT EXISTS idx_unified_link_library_category_priority ON unified_link_library(category, priority DESC);

-- ====================================================================
-- 第三部分：RLS安全策略
-- ====================================================================

-- 启用RLS
ALTER TABLE unified_link_library ENABLE ROW LEVEL SECURITY;

-- 公开读取权限（仅活跃链接）
CREATE POLICY "Allow public read active links"
  ON unified_link_library FOR SELECT
  USING (status = 'active');

-- 管理员完全访问权限
CREATE POLICY "Allow admin full access to links"
  ON unified_link_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- ====================================================================
-- 第四部分：触发器函数
-- ====================================================================

-- 自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_link_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_link_library_updated_at
  BEFORE UPDATE ON unified_link_library
  FOR EACH ROW
  EXECUTE FUNCTION update_link_library_updated_at();

-- ====================================================================
-- 第五部分：数据迁移
-- ====================================================================

-- 从hot_links表迁移数据
INSERT INTO unified_link_library (
  url, title, description, source, category, sub_category, 
  image_url, views, likes, share_count, scraped_at, created_at, status
)
SELECT 
  url, title, description, source, category, sub_category,
  image_url, views, likes, share_count, scraped_at, created_at,
  CASE 
    WHEN status = 'active' THEN 'active'
    ELSE 'inactive'
  END as status
FROM hot_links
WHERE url NOT IN (SELECT url FROM unified_link_library)
ON CONFLICT (url) DO NOTHING;

-- 从hot_link_pool表迁移数据（优先级更高）
INSERT INTO unified_link_library (
  url, title, description, source, category, sub_category,
  image_url, likes, views, share_count, ai_tags, 
  scraped_at, created_at, updated_at, status, review_status,
  reviewed_at, reviewed_by, rejection_reason, article_id
)
SELECT 
  url, title, description, source, category, sub_category,
  image_url, likes, views, share_count, ai_tags,
  scraped_at, created_at, updated_at,
  CASE 
    WHEN status = 'promoted' THEN 'active'
    WHEN status = 'pending_review' THEN 'pending_review'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE 'inactive'
  END as status,
  status as review_status,
  reviewed_at, reviewed_by, rejection_reason, article_id
FROM hot_link_pool
WHERE url NOT IN (SELECT url FROM unified_link_library)
ON CONFLICT (url) DO NOTHING;

-- ====================================================================
-- 第六部分：初始优先级设置
-- ====================================================================

-- 为现有链接设置初始优先级
UPDATE unified_link_library 
SET priority = CASE 
  WHEN source = 'iFixit' THEN 100
  WHEN source = '官方' THEN 90
  WHEN source ILIKE '%知乎%' THEN 80
  WHEN source ILIKE '%bilibili%' THEN 70
  WHEN likes > 100 THEN 60
  WHEN views > 1000 THEN 50
  ELSE 30
END
WHERE priority = 0;

-- ====================================================================
-- 第七部分：验证和清理
-- ====================================================================

-- 验证迁移结果
SELECT '=== 统一链接库表创建完成 ===' as status;

SELECT 
  COUNT(*) as total_links,
  COUNT(*) FILTER (WHERE status = 'active') as active_links,
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_links,
  COUNT(*) FILTER (WHERE priority > 50) as high_priority_links
FROM unified_link_library;

-- 显示表结构信息
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'unified_link_library' 
ORDER BY ordinal_position;

\echo '✅ 统一链接库系统部署完成';