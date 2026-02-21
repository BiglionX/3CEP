#!/usr/bin/env node

/**
 * 数据库健康检查脚本
 * 验证数据库连接、表结构完整性和基本功能
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🏥 FixCycle 数据库健康检查\n');
console.log('=====================================\n');

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// 定义关键表和期望的结构
const REQUIRED_TABLES = [
  { name: 'devices', minColumns: 10 },
  { name: 'fault_types', minColumns: 8 },
  { name: 'hot_links', minColumns: 10 },
  { name: 'repair_shops', minColumns: 15 },
  { name: 'parts', minColumns: 5 },
  { name: 'part_prices', minColumns: 5 },
  { name: 'system_config', minColumns: 3 }
];

const HEALTH_CHECK_QUERIES = [
  {
    name: '数据库连接测试',
    query: () => supabase.from('system_config').select('count()', { count: 'exact' }).limit(1)
  },
  {
    name: '表结构完整性检查',
    query: async () => {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) return { error };
      
      const existingTables = data.map(t => t.table_name);
      const missingTables = REQUIRED_TABLES.filter(table => 
        !existingTables.includes(table.name)
      );
      
      return { 
        data: { 
          existing: existingTables.length,
          required: REQUIRED_TABLES.length,
          missing: missingTables.map(t => t.name)
        }
      };
    }
  },
  {
    name: 'RLS策略检查',
    query: async () => {
      // 检查关键表是否启用了RLS
      const rlsResults = {};
      
      for (const table of REQUIRED_TABLES.slice(0, 4)) { // 只检查新表
        try {
          const { data, error } = await supabase
            .from('pg_class')
            .select('relname, relrowsecurity')
            .eq('relname', table.name);
          
          if (!error && data.length > 0) {
            rlsResults[table.name] = data[0].relrowsecurity;
          }
        } catch (e) {
          rlsResults[table.name] = 'unknown';
        }
      }
      
      return { data: rlsResults };
    }
  },
  {
    name: '基础数据检查',
    query: async () => {
      const dataCheck = {};
      
      // 检查系统配置
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('key')
          .limit(5);
        
        dataCheck.system_config = error ? 0 : data.length;
      } catch (e) {
        dataCheck.system_config = 0;
      }
      
      return { data: dataCheck };
    }
  }
];

async function runHealthCheck() {
  let passedChecks = 0;
  let totalChecks = HEALTH_CHECK_QUERIES.length;
  
  console.log('📋 执行健康检查项目:\n');
  
  for (let i = 0; i < HEALTH_CHECK_QUERIES.length; i++) {
    const check = HEALTH_CHECK_QUERIES[i];
    console.log(`[${i + 1}/${totalChecks}] ${check.name}`);
    console.log('----------------------------------------');
    
    try {
      const result = await check.query();
      
      if (result.error) {
        console.log(`  ❌ 失败: ${result.error.message}`);
      } else {
        console.log('  ✅ 通过');
        
        // 显示详细结果
        if (check.name === '表结构完整性检查' && result.data) {
          console.log(`     现有表: ${result.data.existing} 个`);
          console.log(`     要求表: ${result.data.required} 个`);
          if (result.data.missing.length > 0) {
            console.log(`     缺失表: ${result.data.missing.join(', ')}`);
          }
        } else if (check.name === 'RLS策略检查' && result.data) {
          Object.entries(result.data).forEach(([table, enabled]) => {
            const status = enabled === true ? '✅ 已启用' : '❌ 未启用';
            console.log(`     ${table}: ${status}`);
          });
        } else if (check.name === '基础数据检查' && result.data) {
          Object.entries(result.data).forEach(([table, count]) => {
            const status = count > 0 ? `✅ 有数据(${count}条)` : '⚠️ 无数据';
            console.log(`     ${table}: ${status}`);
          });
        }
        
        passedChecks++;
      }
    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`);
    }
    
    console.log(); // 空行分隔
  }
  
  // 输出总结
  console.log('=====================================');
  console.log('🏆 健康检查总结');
  console.log('=====================================');
  
  const passRate = Math.round((passedChecks / totalChecks) * 100);
  console.log(`📊 通过率: ${passedChecks}/${totalChecks} (${passRate}%)`);
  
  if (passRate >= 90) {
    console.log('🎉 数据库状态: 优秀 - 生产就绪');
  } else if (passRate >= 75) {
    console.log('👍 数据库状态: 良好 - 基本正常');
  } else if (passRate >= 60) {
    console.log('⚠️  数据库状态: 一般 - 需要关注');
  } else {
    console.log('❌ 数据库状态: 较差 - 需要修复');
  }
  
  // 建议
  console.log('\n💡 建议措施:');
  if (passRate < 100) {
    console.log('1. 检查失败的健康检查项目');
    console.log('2. 运行数据库迁移: npm run db:migrate');
  }
  
  if (passRate >= 75) {
    console.log('3. 运行完整测试套件验证功能');
    console.log('4. 准备部署到下一环境');
  }
  
  console.log('\n✨ 健康检查完成！');
  
  // 返回适当的退出码
  process.exit(passRate >= 75 ? 0 : 1);
}

// 执行健康检查
runHealthCheck().catch(error => {
  console.error('❌ 健康检查执行失败:', error.message);
  process.exit(1);
});