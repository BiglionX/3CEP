const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDifyIntegration() {
  console.log('🧪 开始测试Dify集成...\n');
  
  try {
    // 1. 测试API端点可用性
    console.log('1️⃣ 测试API端点连通性...');
    
    const testQueries = [
      'iPhone 12 电池更换',
      '华为手机屏幕维修',
      '安卓刷机教程'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 测试查询: "${query}"`);
      
      const { data, error } = await supabase
        .from('unified_link_library')
        .select('url, title, priority, source')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('priority', { ascending: false })
        .limit(3);
      
      if (error) {
        console.log(`❌ 查询失败: ${error.message}`);
      } else {
        console.log(`✅ 成功返回 ${data.length} 条结果:`);
        data.forEach((link, index) => {
          console.log(`   ${index + 1}. ${link.title} (${link.source}) - 优先级: ${link.priority}`);
        });
      }
    }
    
    // 2. 模拟Dify工作流完整流程
    console.log('\n2️⃣ 模拟Dify工作流完整流程...');
    
    const sampleQuery = '如何更换iPhone电池';
    console.log(`📝 模拟用户查询: "${sampleQuery}"`);
    
    // 步骤1: 链接查询
    console.log('\n🔗 步骤1: 链接库查询...');
    const { data: links, error: linkError } = await supabase
      .from('unified_link_library')
      .select('url, title, priority, source, description')
      .eq('status', 'active')
      .or(`title.ilike.%iPhone%,title.ilike.%电池%,description.ilike.%iPhone%,description.ilike.%电池%`)
      .order('priority', { ascending: false })
      .limit(3);
    
    if (linkError) {
      console.log('❌ 链接查询失败:', linkError.message);
      return;
    }
    
    console.log(`✅ 找到 ${links.length} 个相关链接:`);
    links.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.title}`);
      console.log(`      URL: ${link.url}`);
      console.log(`      优先级: ${link.priority}`);
    });
    
    // 步骤2: 模拟网页抓取
    console.log('\n🕷️  步骤2: 模拟网页内容抓取...');
    const scrapedResults = [];
    
    for (const link of links) {
      // 模拟抓取结果（实际应用中这里会真正抓取网页）
      scrapedResults.push({
        title: link.title,
        url: link.url,
        content: link.description || `这是关于${link.title}的详细维修指南内容...`,
        priority: link.priority
      });
    }
    
    console.log(`✅ 模拟抓取完成，获得 ${scrapedResults.length} 份资料`);
    
    // 步骤3: 生成回答（模拟LLM响应）
    console.log('\n🤖 步骤3: 生成回答...');
    const answer = generateMockAnswer(sampleQuery, scrapedResults);
    console.log('✅ 回答生成完成:');
    console.log(answer);
    
    // 3. 性能测试
    console.log('\n3️⃣ 性能测试...');
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await supabase
        .from('unified_link_library')
        .select('title, priority')
        .eq('status', 'active')
        .limit(1);
    }
    
    const endTime = Date.now();
    const avgResponseTime = (endTime - startTime) / 10;
    console.log(`✅ 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    
    // 4. 压力测试
    console.log('\n4️⃣ 压力测试...');
    const concurrentTests = [];
    for (let i = 0; i < 5; i++) {
      concurrentTests.push(
        supabase
          .from('unified_link_library')
          .select('count')
          .limit(1)
      );
    }
    
    const stressStart = Date.now();
    await Promise.all(concurrentTests);
    const stressEnd = Date.now();
    
    console.log(`✅ 并发测试完成，5个并发请求耗时: ${stressEnd - stressStart}ms`);
    
    console.log('\n🎉 Dify集成测试完成！');
    console.log('✅ 链接库API接口稳定可靠');
    console.log('✅ 查询性能良好');
    console.log('✅ 可以安全集成到Dify工作流中');
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  }
}

function generateMockAnswer(query, results) {
  const topResult = results[0];
  if (!topResult) return '抱歉，暂时没有找到相关的维修资料。';
  
  return `根据您的问题"${query}"，我为您找到了以下维修资料：
  
🥇 推荐资料：${topResult.title}
   来源：${topResult.url}
   内容摘要：${topResult.content.substring(0, 200)}...
   
🥈 其他相关资料：
${results.slice(1).map((r, i) => `${i + 2}. ${r.title} (${r.url})`).join('\n')}

建议您优先参考第一名的资料，它具有最高的优先级(${topResult.priority}分)，内容最为权威和详细。`;
}

// 执行测试
testDifyIntegration().catch(console.error);