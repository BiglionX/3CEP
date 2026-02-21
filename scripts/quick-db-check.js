const { createClient } = require('@supabase/supabase-js');

async function quickDatabaseSetup() {
  console.log('🚀 快速数据库配置检查...\n');
  
  const supabase = createClient(
    'https://hrjqzbhqueleszkvnsen.supabase.co',
    'sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711'
  );

  try {
    // 检查现有表
    console.log('📋 检查现有表结构...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ 无法获取表信息:', tablesError.message);
      return;
    }

    const existingTables = tables.map(t => t.table_name);
    console.log('📊 现有表:', existingTables.join(', '));

    // 检查是否已有营销表
    const hasLeadsTable = existingTables.includes('leads');
    const hasEventsTable = existingTables.includes('marketing_events');
    const hasMetricsTable = existingTables.includes('performance_metrics');

    console.log('\n🔍 营销表状态:');
    console.log(`  leads表: ${hasLeadsTable ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`  marketing_events表: ${hasEventsTable ? '✅ 存在' : '❌ 缺失'}`);
    console.log(`  performance_metrics表: ${hasMetricsTable ? '✅ 存在' : '❌ 缺失'}`);

    if (hasLeadsTable && hasEventsTable && hasMetricsTable) {
      console.log('\n🎉 所有营销表已存在，数据库配置完成！');
      
      // 验证数据插入
      console.log('\n🧪 测试数据插入...');
      const { data: testData, error: insertError } = await supabase
        .from('leads')
        .insert({
          role: 'ops',
          name: '自动测试用户',
          company: '测试公司',
          email: `auto-test-${Date.now()}@example.com`,
          phone: '13800138000',
          use_case: '自动化配置验证',
          source: 'auto_setup'
        })
        .select();

      if (insertError) {
        console.log('❌ 测试数据插入失败:', insertError.message);
      } else {
        console.log('✅ 测试数据插入成功');
        console.log('📋 插入的测试数据ID:', testData[0].id);
      }

    } else {
      console.log('\n⚠️  需要创建缺失的表');
      console.log('请在Supabase控制台SQL Editor中执行以下脚本:');
      console.log('\n--- 复制以下SQL到Supabase ---\n');
      
      if (!hasLeadsTable) {
        console.log(`
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL CHECK (role IN ('ops', 'tech', 'biz', 'partner', 'other')),
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  use_case TEXT,
  source VARCHAR(100) DEFAULT 'landing_page',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'rejected')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      }

      if (!hasEventsTable) {
        console.log(`
CREATE TABLE marketing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'cta_click', 'form_submit', 'lead_submit', 'demo_try')),
  role VARCHAR(50),
  page_path VARCHAR(255),
  source VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      }

      if (!hasMetricsTable) {
        console.log(`
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_load_time INTEGER,
  api_response_time INTEGER,
  first_contentful_paint INTEGER,
  largest_contentful_paint INTEGER,
  cumulative_layout_shift NUMERIC(6,4),
  first_input_delay INTEGER,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`);
      }

      console.log('\n--- SQL脚本结束 ---\n');
    }

  } catch (error) {
    console.error('❌ 配置检查出错:', error.message);
  }
}

// 执行检查
quickDatabaseSetup().catch(console.error);