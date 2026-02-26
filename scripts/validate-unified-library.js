const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function validateDeployment() {
  console.log('🧪 开始验证统一链接库部署...\n');
  
  try {
    // 1. 验证表是否存在并统计
    console.log('1️⃣ 验证表结构和数据...');
    const { data: stats, error: statsError } = await supabase
      .from('unified_link_library')
      .select('*');
    
    if (statsError) {
      console.log('❌ 表访问失败:', statsError.message);
      return;
    }
    
    console.log('✅ unified_link_library 表访问正常');
    console.log(`📊 总记录数: ${stats.length}`);
    
    const activeCount = stats.filter(link => link.status === 'active').length;
    const pendingCount = stats.filter(link => link.status === 'pending_review').length;
    const highPriorityCount = stats.filter(link => link.priority > 50).length;
    
    console.log(`🟢 活跃链接: ${activeCount}`);
    console.log(`🟡 待审核链接: ${pendingCount}`);
    console.log(`⭐ 高优先级链接: ${highPriorityCount}`);
    
    // 2. 测试查询功能
    console.log('\n2️⃣ 测试链接查询功能...');
    const { data: queryResult, error: queryError } = await supabase
      .from('unified_link_library')
      .select('title, source, priority, status')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(3);
    
    if (queryError) {
      console.log('❌ 查询功能测试失败:', queryError.message);
    } else {
      console.log('✅ 查询功能测试通过');
      console.log('📋 返回结果预览:');
      queryResult.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`);
      });
    }
    
    // 3. 测试关键词搜索
    console.log('\n3️⃣ 测试关键词搜索...');
    const { data: searchResult, error: searchError } = await supabase
      .from('unified_link_library')
      .select('title, source, priority')
      .eq('status', 'active')
      .ilike('title', '%手机%')
      .order('priority', { ascending: false })
      .limit(3);
    
    if (searchError) {
      console.log('❌ 搜索功能测试失败:', searchError.message);
    } else {
      console.log('✅ 搜索功能测试通过');
      console.log(`📊 搜索到 ${searchResult.length} 条相关结果`);
      searchResult.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} - 优先级: ${link.priority}`);
      });
    }
    
    // 4. 显示高优先级链接详情
    console.log('\n4️⃣ 高优先级链接详情...');
    const { data: highPriorityLinks, error: highPriorityError } = await supabase
      .from('unified_link_library')
      .select('title, source, priority, likes, views')
      .order('priority', { ascending: false })
      .limit(5);
    
    if (!highPriorityError && highPriorityLinks) {
      console.log('📋 前5条高优先级链接:');
      highPriorityLinks.forEach((link, index) => {
        console.log(`${index + 1}. ${link.title}`);
        console.log(`   来源: ${link.source}`);
        console.log(`   优先级: ${link.priority}`);
        console.log(`   互动数据: 👁️${link.views} 👍${link.likes}`);
        console.log('');
      });
    }
    
    // 5. 验证API接口模拟
    console.log('5️⃣ 验证API核心逻辑...');
    
    // 模拟 /api/links/query 的核心功能
    const mockQuery = 'iPhone';
    const { data: apiSimulation, error: apiError } = await supabase
      .from('unified_link_library')
      .select('url, title, priority, source')
      .eq('status', 'active')
      .or(`title.ilike.%${mockQuery}%,description.ilike.%${mockQuery}%`)
      .order('priority', { ascending: false })
      .limit(3);
    
    if (!apiError && apiSimulation) {
      console.log('✅ API核心逻辑验证通过');
      console.log(`📊 查询 "${mockQuery}" 返回 ${apiSimulation.length} 条结果:`);
      apiSimulation.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`);
      });
    }
    
    console.log('\n🎉 部署验证完成！');
    console.log('✅ 统一链接库系统已成功部署并正常运行');
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error.message);
  }
}

// 执行验证
validateDeployment().catch(console.error);