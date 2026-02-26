const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function comprehensiveTest() {
  console.log('🧪 开始综合测试...\n');
  
  try {
    // 1. 测试数据库连接和表结构
    console.log('1️⃣ 测试数据库连接和表结构...');
    
    // 检查各个表的存在情况
    const tablesToCheck = ['hot_links', 'hot_link_pool', 'unified_link_library'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: 无法访问 (${error.message})`);
        } else {
          console.log(`✅ ${tableName}: 存在 (${data[0].count} 条记录)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: 检查失败`);
      }
    }
    
    // 2. 测试现有链接数据
    console.log('\n2️⃣ 测试现有链接数据...');
    
    const { data: hotLinks, error: hotLinksError } = await supabase
      .from('hot_links')
      .select('title, source, priority')
      .order('priority', { ascending: false })
      .limit(3);
    
    if (!hotLinksError && hotLinks) {
      console.log('✅ hot_links 表数据预览:');
      hotLinks.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} (${link.source})`);
      });
    }
    
    const { data: hotLinkPool, error: poolError } = await supabase
      .from('hot_link_pool')
      .select('title, source, status')
      .limit(3);
    
    if (!poolError && hotLinkPool) {
      console.log('✅ hot_link_pool 表数据预览:');
      hotLinkPool.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} (${link.source}) - 状态: ${link.status}`);
      });
    }
    
    // 3. 测试API接口模拟
    console.log('\n3️⃣ 测试API接口功能...');
    
    // 模拟链接查询API的核心逻辑
    const { data: queryResult, error: queryError } = await supabase
      .from('hot_link_pool')
      .select('url, title, priority, source')
      .eq('status', 'promoted') // 相当于active状态
      .order('priority', { ascending: false })
      .limit(3);
    
    if (!queryError && queryResult) {
      console.log('✅ 链接查询功能测试通过:');
      queryResult.forEach((link, index) => {
        console.log(`   ${index + 1}. ${link.title} (优先级: ${link.priority})`);
      });
    } else {
      console.log('❌ 链接查询功能测试失败:', queryError?.message);
    }
    
    // 4. 测试优先级管理功能
    console.log('\n4️⃣ 测试优先级管理功能...');
    
    // 获取需要调整优先级的链接
    const { data: priorityLinks, error: priorityError } = await supabase
      .from('hot_link_pool')
      .select('id, title, priority, likes, views')
      .limit(5);
    
    if (!priorityError && priorityLinks) {
      console.log('✅ 优先级调整测试:');
      
      const adjustedLinks = priorityLinks.map(link => {
        // 模拟自动调整算法
        const engagementScore = Math.min(
          (link.views || 0) / 100 + (link.likes || 0) / 10,
          100
        );
        const newPriority = Math.round(engagementScore);
        
        return {
          title: link.title,
          oldPriority: link.priority || 0,
          newPriority: newPriority
        };
      });
      
      adjustedLinks.forEach(link => {
        console.log(`   ${link.title}: ${link.oldPriority} → ${link.newPriority}`);
      });
    }
    
    // 5. 统计汇总
    console.log('\n5️⃣ 系统状态汇总...');
    
    // 获取各表的统计信息
    const stats = {};
    
    for (const tableName of tablesToCheck) {
      try {
        const { data } = await supabase
          .from(tableName)
          .select('status');
        
        if (data) {
          stats[tableName] = {
            total: data.length,
            active: data.filter(item => 
              item.status === 'active' || item.status === 'promoted'
            ).length,
            pending: data.filter(item => 
              item.status === 'pending_review'
            ).length
          };
        }
      } catch (err) {
        // 忽略错误
      }
    }
    
    console.log('📊 系统统计:');
    Object.entries(stats).forEach(([table, stat]) => {
      console.log(`   ${table}: 总计${stat.total}条 (活跃${stat.active}条, 待审核${stat.pending}条)`);
    });
    
    // 6. 建议和下一步行动
    console.log('\n🎯 测试结论和建议:');
    
    const hasHotLinks = stats['hot_links']?.total > 0;
    const hasHotLinkPool = stats['hot_link_pool']?.total > 0;
    
    if (hasHotLinks || hasHotLinkPool) {
      console.log('✅ 链接数据存在，系统基础功能正常');
      
      if (!stats['unified_link_library']) {
        console.log('⚠️  建议：需要创建统一链接库表来整合数据');
        console.log('   执行步骤:');
        console.log('   1. 在Supabase控制台运行 028_unified_link_library.sql');
        console.log('   2. 部署 /api/links/query API接口');
        console.log('   3. 部署 /api/links/priority 管理接口');
        console.log('   4. 部署管理后台页面');
      } else {
        console.log('✅ 统一链接库已部署');
      }
    } else {
      console.log('❌ 未检测到有效的链接数据');
    }
    
    console.log('\n🚀 下一步建议:');
    console.log('1. 如果表未创建，请在Supabase控制台手动执行SQL脚本');
    console.log('2. 启动开发服务器测试API接口');
    console.log('3. 验证Dify工作流集成');
    console.log('4. 进行端到端测试');
    
  } catch (error) {
    console.error('❌ 综合测试失败:', error.message);
  }
}

// 执行测试
comprehensiveTest().catch(console.error);