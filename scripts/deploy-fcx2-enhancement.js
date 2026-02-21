#!/usr/bin/env node

/**
 * FCX2奖励机制扩展表结构部署脚本
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrjqzbhqueleszkvnsen.supabase.co',
  SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY_HERE'
};

async function deployFcx2Enhancement() {
  console.log('🚀 开始部署FCX2奖励机制扩展表结构...\n');
  
  const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SERVICE_KEY);
  
  try {
    // 读取SQL迁移文件
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '010_fcx2_reward_enhancement.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 读取迁移文件成功');
    console.log(`📊 文件大小: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 准备执行 ${statements.length} 条SQL语句...\n`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // 跳过注释和空语句
        if (statement.startsWith('DO $$') || statement.includes('RAISE NOTICE')) {
          console.log(`📋 通知语句 - ${statement.substring(0, 50)}...`);
          successCount++;
          continue;
        }
        
        // 执行SQL语句
        const { error } = await supabase.rpc('execute_sql', { sql: statement });
        
        if (error) {
          // 某些语句可能因为已存在而报错，这是正常的
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key')) {
            console.log(`🔧 语句 ${i + 1}: 对象已存在 - ${statement.substring(0, 30)}...`);
            successCount++;
          } else {
            console.log(`❌ 语句 ${i + 1}: 执行失败 - ${error.message}`);
            console.log(`   SQL: ${statement.substring(0, 100)}...`);
            failedCount++;
          }
        } else {
          console.log(`✅ 语句 ${i + 1}: 执行成功 - ${statement.substring(0, 30)}...`);
          successCount++;
        }
        
      } catch (error) {
        console.log(`❌ 语句 ${i + 1}: 执行异常 - ${error.message}`);
        failedCount++;
      }
    }
    
    console.log(`\n📈 执行结果:`);
    console.log(`✅ 成功: ${successCount} 条`);
    console.log(`❌ 失败: ${failedCount} 条`);
    
    if (failedCount === 0) {
      console.log('\n🎉 扩展表结构部署成功！');
      
      // 验证表创建
      console.log('\n🔍 验证表创建结果...');
      const testTables = [
        'equity_types',
        'user_equities',
        'level_change_logs',
        'fcx_reward_logs',
        'equity_redemption_logs'
      ];
      
      for (const tableName of testTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('count', { count: 'exact', head: true });
          
          if (!error) {
            console.log(`✅ 表 ${tableName} 创建成功`);
          } else {
            console.log(`⚠️  表 ${tableName} 验证失败: ${error.message}`);
          }
        } catch (error) {
          console.log(`⚠️  表 ${tableName} 验证异常: ${error.message}`);
        }
      }
      
      console.log('\n📊 检查初始数据...');
      try {
        const { data: equityTypes, error } = await supabase
          .from('equity_types')
          .select('name, level_requirement')
          .limit(10);
        
        if (!error && equityTypes && equityTypes.length > 0) {
          console.log(`🎁 初始化权益类型: ${equityTypes.length} 个`);
          equityTypes.forEach(et => {
            console.log(`   • ${et.name} (${et.level_requirement}级)`);
          });
        }
      } catch (error) {
        console.log('⚠️  初始数据检查跳过');
      }
      
      console.log('\n✨ FCX2奖励机制扩展部署完成');
      
    } else {
      console.log('\n⚠️  部分语句执行失败，请检查日志');
    }
    
  } catch (error) {
    console.error('❌ 部署过程发生错误:', error.message);
    process.exit(1);
  }
}

// 执行部署
if (require.main === module) {
  deployFcx2Enhancement();
}

module.exports = { deployFcx2Enhancement };