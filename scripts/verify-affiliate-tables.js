// 验证联盟链接表是否存在
const { createClient } = require('@supabase/supabase-js');

async function verifyAffiliateTables() {
  console.log('🔍 验证联盟链接表结构...\n');

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://hrjqzbhqueleszkvnsen.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ 缺少Supabase配置');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // 检查必需的表是否存在
    const requiredTables = [
      'part_affiliate_links',
      'part_affiliate_mappings',
      'affiliate_click_tracking',
      'affiliate_revenue_tracking',
    ];

    console.log('📋 检查表存在性:');
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: 存在`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      }
    }

    // 检查初始数据
    console.log('\n📋 检查初始数据:');
    try {
      const { data, error } = await supabase
        .from('part_affiliate_links')
        .select('*')
        .limit(5);

      if (error) {
        console.log('❌ 无法查询初始数据:', error.message);
      } else {
        console.log(`✅ 找到 ${data?.length || 0} 条初始数据`);
        if (data && data.length > 0) {
          console.log('📋 示例数据:');
          data.forEach((item, index) => {
            console.log(
              `   ${index + 1}. ${item.part_name} (${item.platform})`
            );
          });
        }
      }
    } catch (error) {
      console.log('❌ 数据查询异常:', error.message);
    }

    // 测试插入数据
    console.log('\n📋 测试数据插入:');
    try {
      const testData = {
        part_name: '测试配件',
        platform: 'jd',
        base_url: 'https://test.jd.com/',
        affiliate_params: { test: 'param' },
        template_url: 'https://test.jd.com/{product_id}',
        is_active: true,
        priority: 1,
      };

      const { data, error } = await supabase
        .from('part_affiliate_links')
        .insert(testData)
        .select();

      if (error) {
        console.log('❌ 数据插入失败:', error.message);
      } else {
        console.log('✅ 数据插入成功');
        if (data && data.length > 0) {
          const insertedId = data[0].id;
          console.log(`   插入ID: ${insertedId}`);

          // 清理测试数据
          await supabase
            .from('part_affiliate_links')
            .delete()
            .eq('id', insertedId);
          console.log('   测试数据已清理');
        }
      }
    } catch (error) {
      console.log('❌ 插入测试异常:', error.message);
    }
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  }
}

verifyAffiliateTables();
