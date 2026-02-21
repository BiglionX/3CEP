const { createClient } = require('@supabase/supabase-js');

async function verifyMarketingTables() {
  console.log('🔍 验证营销数据表结构...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrjqzbhqueleszkvnsen.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_key_here'
  );

  try {
    // 检查leads表是否存在
    console.log('📋 检查 leads 表...');
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('count')
      .limit(1);

    if (leadsError && leadsError.code === '42P01') {
      console.log('❌ leads 表不存在，请先执行数据库迁移');
    } else if (leadsError) {
      console.log('❌ leads 表访问错误:', leadsError.message);
    } else {
      console.log('✅ leads 表存在且可访问');
    }

    // 检查marketing_events表是否存在
    console.log('\n📋 检查 marketing_events 表...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('marketing_events')
      .select('count')
      .limit(1);

    if (eventsError && eventsError.code === '42P01') {
      console.log('❌ marketing_events 表不存在，请先执行数据库迁移');
    } else if (eventsError) {
      console.log('❌ marketing_events 表访问错误:', eventsError.message);
    } else {
      console.log('✅ marketing_events 表存在且可访问');
    }

    // 如果表存在，插入测试数据
    if (!leadsError && !eventsError) {
      console.log('\n🧪 插入测试数据...');
      
      // 插入测试线索
      const { data: leadData, error: insertError } = await supabase
        .from('leads')
        .insert({
          role: 'ops',
          name: '测试用户',
          company: '测试公司',
          email: 'test@example.com',
          phone: '13800138000',
          use_case: '测试用例',
          source: 'test_script',
          status: 'new'
        })
        .select();

      if (insertError) {
        console.log('❌ 插入测试线索失败:', insertError.message);
      } else {
        console.log('✅ 测试线索插入成功');
        
        // 插入测试事件
        const { error: eventError } = await supabase
          .from('marketing_events')
          .insert({
            event_type: 'page_view',
            role: 'ops',
            page_path: '/landing/overview',
            source: 'test_script'
          });

        if (eventError) {
          console.log('❌ 插入测试事件失败:', eventError.message);
        } else {
          console.log('✅ 测试事件插入成功');
        }

        // 查询插入的数据
        console.log('\n📊 查询测试数据...');
        const { data: queryData, error: queryError } = await supabase
          .from('leads')
          .select('*')
          .eq('email', 'test@example.com');

        if (queryError) {
          console.log('❌ 查询测试数据失败:', queryError.message);
        } else {
          console.log('✅ 查询到', queryData.length, '条测试数据');
          if (queryData.length > 0) {
            console.log('  测试线索ID:', queryData[0].id);
          }
        }
      }
    }

    console.log('\n🎉 验证完成！');
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  }
}

// 执行验证
verifyMarketingTables().catch(console.error);