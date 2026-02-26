const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLinkQuery() {
  console.log('🧪 测试链接查询API...');
  
  try {
    // 测试统一链接库表是否存在
    const { data: tableData, error: tableError } = await supabase
      .from('unified_link_library')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.log('❌ unified_link_library 表不存在或无法访问');
      console.log('错误信息:', tableError.message);
      
      // 检查现有的表
      console.log('\n🔍 检查现有表...');
      const { data: existingTables } = await supabase
        .from('hot_link_pool')
        .select('count')
        .limit(1);
      
      if (existingTables) {
        console.log('✅ hot_link_pool 表存在，记录数:', existingTables[0].count);
      }
      
      return;
    }
    
    console.log('✅ unified_link_library 表存在');
    
    // 测试查询功能
    console.log('\n🔍 测试查询功能...');
    const { data: links, error: queryError } = await supabase
      .from('unified_link_library')
      .select('url, title, priority, source')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(3);
    
    if (queryError) {
      console.log('❌ 查询失败:', queryError.message);
      return;
    }
    
    console.log('✅ 查询成功');
    console.log('📊 返回结果数:', links.length);
    
    links.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`);
      console.log(`   URL: ${link.url}`);
    });
    
    // 测试关键词搜索
    console.log('\n🔍 测试关键词搜索...');
    const { data: searchResults, error: searchError } = await supabase
      .from('unified_link_library')
      .select('title, source, priority')
      .eq('status', 'active')
      .or('title.ilike.%iPhone%,title.ilike.%电池%')
      .order('priority', { ascending: false })
      .limit(3);
    
    if (searchError) {
      console.log('❌ 搜索失败:', searchError.message);
    } else {
      console.log('✅ 搜索成功');
      console.log('📊 搜索结果数:', searchResults.length);
      searchResults.forEach((link, index) => {
        console.log(`${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 执行测试
testLinkQuery().catch(console.error);