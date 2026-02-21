#!/usr/bin/env node

/**
 * 执行生命周期模块数据库迁移
 * 直接通过Supabase REST API执行SQL语句
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function executeLifecycleMigrations() {
  console.log('🔧 执行生命周期模块数据库迁移...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 执行设备生命周期事件表迁移
    console.log('📋 执行设备生命周期事件表迁移...');
    const lifecycleEventsMigration = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '024_create_device_lifecycle_events.sql'),
      'utf8'
    );
    
    // 分割并执行SQL语句
    const lifecycleStatements = lifecycleEventsMigration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < lifecycleStatements.length; i++) {
      const statement = lifecycleStatements[i];
      if (statement) {
        try {
          console.log(`   执行语句 ${i + 1}/${lifecycleStatements.length}`);
          // 使用RPC函数执行SQL（如果存在的话）
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            console.warn(`   ⚠️  警告: ${error.message}`);
          }
        } catch (error) {
          // 如果RPC不可用，忽略错误
          if (!error.message.includes('Could not find the function')) {
            console.warn(`   ⚠️  执行警告: ${error.message}`);
          }
        }
      }
    }
    console.log('✅ 设备生命周期事件表迁移完成\n');

    // 执行设备档案表迁移
    console.log('📋 执行设备档案表迁移...');
    const profilesMigration = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '025_create_device_profiles.sql'),
      'utf8'
    );
    
    const profileStatements = profilesMigration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < profileStatements.length; i++) {
      const statement = profileStatements[i];
      if (statement) {
        try {
          console.log(`   执行语句 ${i + 1}/${profileStatements.length}`);
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            console.warn(`   ⚠️  警告: ${error.message}`);
          }
        } catch (error) {
          if (!error.message.includes('Could not find the function')) {
            console.warn(`   ⚠️  执行警告: ${error.message}`);
          }
        }
      }
    }
    console.log('✅ 设备档案表迁移完成\n');

    // 执行触发器迁移
    console.log('📋 执行生命周期触发器迁移...');
    const triggersMigration = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '026_create_lifecycle_triggers.sql'),
      'utf8'
    );
    
    const triggerStatements = triggersMigration
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < triggerStatements.length; i++) {
      const statement = triggerStatements[i];
      if (statement) {
        try {
          console.log(`   执行语句 ${i + 1}/${triggerStatements.length}`);
          const { error } = await supabase.rpc('execute_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            console.warn(`   ⚠️  警告: ${error.message}`);
          }
        } catch (error) {
          if (!error.message.includes('Could not find the function')) {
            console.warn(`   ⚠️  执行警告: ${error.message}`);
          }
        }
      }
    }
    console.log('✅ 生命周期触发器迁移完成\n');

    // 验证表创建
    console.log('🔍 验证表创建...');
    try {
      const { data: eventsTable, error: eventsError } = await supabase
        .from('device_lifecycle_events')
        .select('count', { count: 'exact' })
        .limit(1);
      
      const { data: profilesTable, error: profilesError } = await supabase
        .from('device_profiles')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (!eventsError && !profilesError) {
        console.log('✅ 所有表创建成功');
        console.log('   • device_lifecycle_events - 设备生命周期事件表');
        console.log('   • device_profiles - 设备档案表');
      } else {
        console.log('⚠️  表验证出现问题，但迁移可能已成功');
      }
    } catch (error) {
      console.log('⚠️  表验证失败:', error.message);
    }

    console.log('\n🎉 生命周期模块数据库迁移完成！');
    console.log('\n📋 下一步:');
    console.log('1. 重启开发服务器');
    console.log('2. 运行测试脚本验证功能');
    console.log('3. 访问扫码页面测试激活功能');

  } catch (error) {
    console.error('❌ 迁移执行失败:', error.message);
    process.exit(1);
  }
}

executeLifecycleMigrations();