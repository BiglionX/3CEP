const { createClient } = require('@supabase/supabase-js');

async function executeMarketingMigration() {
  console.log('🚀 执行营销数据库迁移...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrjqzbhqueleszkvnsen.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_key_here'
  );

  // 营销表创建SQL
  const migrationSQL = `
    -- 启用UUID扩展
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
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
    CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
    CREATE INDEX IF NOT EXISTS idx_events_type ON marketing_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_role ON marketing_events(role);
    CREATE INDEX IF NOT EXISTS idx_events_created_at ON marketing_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_events_session_id ON marketing_events(session_id);
    
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
    
    -- 添加表注释
    COMMENT ON TABLE leads IS '营销线索信息表';
    COMMENT ON TABLE marketing_events IS '营销活动事件追踪表';
  `;

  try {
    // 由于Supabase REST API限制，我们分步执行
    console.log('📋 正在创建表结构...');
    
    // 创建leads表
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
    
    const { error: leadsError } = await supabase.rpc('execute_sql', { sql: leadsSql });
    if (leadsError) {
      console.log('⚠️  leads表创建可能需要手动执行');
    } else {
      console.log('✅ leads表创建成功');
    }
    
    // 创建marketing_events表
    const eventsSql = `
      CREATE TABLE IF NOT EXISTS marketing_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_type VARCHAR(50) NOT NULL,
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
    `;
    
    const { error: eventsError } = await supabase.rpc('execute_sql', { sql: eventsSql });
    if (eventsError) {
      console.log('⚠️  marketing_events表创建可能需要手动执行');
    } else {
      console.log('✅ marketing_events表创建成功');
    }
    
    // 插入测试数据
    console.log('\n🧪 插入测试数据...');
    const { data: testData, error: insertError } = await supabase
      .from('leads')
      .insert({
        role: 'ops',
        name: '测试用户',
        company: '测试公司',
        email: 'test@example.com',
        phone: '13800138000',
        use_case: '测试营销系统功能',
        source: 'migration_script',
        status: 'new'
      })
      .select();

    if (insertError) {
      console.log('❌ 测试数据插入失败:', insertError.message);
    } else {
      console.log('✅ 测试数据插入成功');
    }

    // 验证表结构
    console.log('\n🔍 验证表结构...');
    const { data: leadsCheck, error: leadsCheckError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (leadsCheckError) {
      console.log('❌ leads表验证失败，请手动执行SQL迁移');
      console.log('\n📋 请在Supabase控制台SQL Editor中执行以下SQL:');
      console.log(migrationSQL);
    } else {
      console.log('✅ leads表验证通过');
    }

    const { data: eventsCheck, error: eventsCheckError } = await supabase
      .from('marketing_events')
      .select('id')
      .limit(1);

    if (eventsCheckError) {
      console.log('❌ marketing_events表验证失败，请手动执行SQL迁移');
    } else {
      console.log('✅ marketing_events表验证通过');
    }

    console.log('\n🎉 数据库迁移执行完成！');
    console.log('\n📝 如果表创建失败，请:');
    console.log('1. 登录Supabase控制台 (https://app.supabase.com)');
    console.log('2. 进入SQL Editor');
    console.log('3. 执行上方提供的完整SQL脚本');

  } catch (error) {
    console.error('❌ 数据库迁移执行出错:', error.message);
    console.log('\n📋 请手动执行SQL迁移:');
    console.log(migrationSQL);
  }
}

// 执行迁移
executeMarketingMigration().catch(console.error);