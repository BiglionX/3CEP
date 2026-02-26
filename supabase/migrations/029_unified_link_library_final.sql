-- Unified Link Library Deployment Script
-- This script creates the unified link library table and migrates data from existing tables

-- Step 1: Create the unified link library table
CREATE TABLE IF NOT EXISTS unified_link_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(100),
  category VARCHAR(50),
  sub_category VARCHAR(50),
  image_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  ai_tags JSONB,
  ai_quality_score DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'active',
  review_status VARCHAR(20) DEFAULT 'approved',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  article_id UUID
);

-- Step 2: Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_unified_link_library_url ON unified_link_library(url);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_status ON unified_link_library(status);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_priority ON unified_link_library(priority DESC);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_category_priority ON unified_link_library(category, priority DESC);
CREATE INDEX IF NOT EXISTS idx_unified_link_library_created_at ON unified_link_library(created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE unified_link_library ENABLE ROW LEVEL SECURITY;

-- Step 4: Create security policies
CREATE POLICY "Allow public read active links"
  ON unified_link_library FOR SELECT
  USING (status = 'active');

CREATE POLICY "Allow admin full access to links"
  ON unified_link_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.user_id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Step 5: Create trigger function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_link_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create trigger
CREATE TRIGGER trigger_update_link_library_updated_at
  BEFORE UPDATE ON unified_link_library
  FOR EACH ROW
  EXECUTE FUNCTION update_link_library_updated_at();

-- Step 7: Migrate data from hot_links table
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

-- Step 8: Migrate data from hot_link_pool table (higher priority)
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

-- Step 9: Set initial priorities for existing links
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

-- Step 10: Verify the deployment
SELECT '=== Unified Link Library Table Created Successfully ===' as status;

SELECT 
  COUNT(*) as total_links,
  COUNT(*) FILTER (WHERE status = 'active') as active_links,
  COUNT(*) FILTER (WHERE status = 'pending_review') as pending_links,
  COUNT(*) FILTER (WHERE priority > 50) as high_priority_links
FROM unified_link_library;

\echo '✅ Unified Link Library System Deployment Completed';