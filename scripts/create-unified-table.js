const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createUnifiedTable() {
  console.log('🚀 创建统一链接库表...');
  
  try {
    // 先检查表是否已存在
    const { data: existing } = await supabase
      .from('unified_link_library')
      .select('count')
      .limit(1);
    
    if (existing) {
      console.log('✅ unified_link_library 表已存在');
      return;
    }
    
    // 创建表的SQL语句
    const createTableSQL = `
      CREATE TABLE unified_link_library (
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
    `;
    
    // 由于直接执行DDL有困难，我们采用另一种方式
    // 先创建一个临时表来测试连接
    console.log('🔧 测试数据库连接...');
    
    const { data, error } = await supabase
      .from('hot_link_pool')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ 数据库连接测试失败:', error.message);
      return;
    }
    
    console.log('✅ 数据库连接正常');
    console.log('📊 当前hot_link_pool记录数:', data[0].count);
    
    // 由于无法直接执行DDL，我们建议通过Supabase控制台手动执行
    console.log('\n📋 请在Supabase控制台SQL编辑器中执行以下SQL:');
    console.log(createTableSQL);
    
    // 同时创建索引
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_unified_link_library_url ON unified_link_library(url);
      CREATE INDEX IF NOT EXISTS idx_unified_link_library_status ON unified_link_library(status);
      CREATE INDEX IF NOT EXISTS idx_unified_link_library_priority ON unified_link_library(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_unified_link_library_category_priority ON unified_link_library(category, priority DESC);
    `;
    
    console.log('\n📋 索引创建SQL:');
    console.log(createIndexesSQL);
    
    // 启用RLS
    const rlsSQL = `
      ALTER TABLE unified_link_library ENABLE ROW LEVEL SECURITY;
      
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
    `;
    
    console.log('\n📋 RLS策略SQL:');
    console.log(rlsSQL);
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
  }
}

// 执行
createUnifiedTable().catch(console.error);