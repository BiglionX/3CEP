const { createClient } = require('@supabase/supabase-js');

async function initializeMarketingTables() {
  console.log('🚀 初始化营销数据表...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrjqzbhqueleszkvnsen.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_key_here'
  );

  // 营销表结构SQL
  const marketingSchema = `
    -- 创建营销线索表
    CREATE TABLE IF NOT EXISTS leads (
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
    );

    -- 创建营销事件追踪表
    CREATE TABLE IF NOT EXISTS marketing_events (
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
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_role ON leads(role);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_type ON marketing_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_role ON marketing_events(role);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON marketing_events(created_at);

    -- 创建更新时间触发器函数
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- 创建触发器
    DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
    CREATE TRIGGER update_leads_updated_at 
        BEFORE UPDATE ON leads 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    // 由于Supabase REST API不能直接执行DDL，我们需要分步创建
    
    // 1. 先尝试创建leads表
    console.log('📋 创建 leads 表...');
    const leadsSql = `
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        company VARCHAR(200),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        use_case TEXT,
        source VARCHAR(100) DEFAULT 'landing_page',
        utm_source VARCHAR(100),
        utm_medium VARCHAR(100),
        utm_campaign VARCHAR(100),
        status VARCHAR(20) DEFAULT 'new',
        assigned_to UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 注意：这里我们只能通过Supabase控制台手动执行SQL
    console.log('请在Supabase控制台执行以下SQL:');
    console.log(marketingSchema);
    
    // 2. 验证表是否创建成功
    console.log('\n🔍 验证表结构...');
    
    const { error: leadsCheck } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
      
    if (leadsCheck && leadsCheck.code === '42P01') {
      console.log('❌ leads 表尚未创建，请先在Supabase控制台执行SQL');
      return;
    } else {
      console.log('✅ leads 表已存在');
    }
    
    const { error: eventsCheck } = await supabase
      .from('marketing_events')
      .select('id')
      .limit(1);
      
    if (eventsCheck && eventsCheck.code === '42P01') {
      console.log('❌ marketing_events 表尚未创建，请先在Supabase控制台执行SQL');
      return;
    } else {
      console.log('✅ marketing_events 表已存在');
    }

    // 3. 插入测试数据
    console.log('\n🧪 插入测试数据...');
    
    const { data: testData, error: insertError } = await supabase
      .from('leads')
      .insert({
        role: 'ops',
        name: '张经理',
        company: '测试科技有限公司',
        email: 'zhang@test.com',
        phone: '13800138000',
        use_case: '希望通过自动化提升客服效率',
        source: 'initialization_script',
        status: 'new'
      })
      .select();

    if (insertError) {
      console.log('❌ 插入测试数据失败:', insertError.message);
    } else {
      console.log('✅ 测试数据插入成功，ID:', testData[0].id);
    }

    console.log('\n🎉 营销表初始化完成！');
    console.log('\n📝 下一步:');
    console.log('1. 如表未创建，请复制上方SQL到Supabase控制台执行');
    console.log('2. 重启开发服务器');
    console.log('3. 访问 /landing/overview 测试营销页面');

  } catch (error) {
    console.error('❌ 初始化过程出错:', error.message);
  }
}

// 执行初始化
initializeMarketingTables().catch(console.error);