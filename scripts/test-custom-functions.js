#!/usr/bin/env node

/**
 * 测试自定义DDL执行函数
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testCustomFunctions() {
  console.log('🔧 测试自定义DDL执行函数...');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('\n1️⃣ 测试execute_ddl函数...');
    
    // 测试简单的DDL语句
    const testDDL = "SELECT 1 as test_column";
    const { data: ddlResult, error: ddlError } = await supabase
      .rpc('execute_ddl', { ddl_statement: testDDL });
    
    if (ddlError) {
      console.log('   execute_ddl函数不可用:', ddlError.message);
    } else {
      console.log('   execute_ddl函数测试结果:', ddlResult);
    }
    
    console.log('\n2️⃣ 测试create_admin_tables函数...');
    
    const { data: createResult, error: createError } = await supabase
      .rpc('create_admin_tables');
    
    if (createError) {
      console.log('   create_admin_tables函数不可用:', createError.message);
    } else {
      console.log('   create_admin_tables函数执行结果:');
      if (Array.isArray(createResult)) {
        createResult.forEach((msg, index) => {
          console.log(`     ${index + 1}. ${msg}`);
        });
      } else {
        console.log('   ', createResult);
      }
    }
    
    console.log('\n3️⃣ 验证表是否创建成功...');
    
    // 检查admin_users表
    const { data: adminTable, error: adminError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);
    
    if (adminError) {
      console.log('   admin_users表:', adminError.message);
    } else {
      console.log('   ✅ admin_users表已存在');
    }
    
    // 检查permissions表
    const { data: permTable, error: permError } = await supabase
      .from('permissions')
      .select('count')
      .limit(1);
    
    if (permError) {
      console.log('   permissions表:', permError.message);
    } else {
      console.log('   ✅ permissions表已存在');
    }
    
    console.log('\n📋 执行建议:');
    console.log('如果上述函数不可用，请通过Supabase控制台手动执行:');
    console.log('文件: sql/create-admin-functions.sql');
    console.log('然后调用: SELECT create_admin_tables();');
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

testCustomFunctions();