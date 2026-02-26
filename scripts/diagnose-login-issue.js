#!/usr/bin/env node

/**
 * 登录问题诊断脚本
 * 检查管理员账户和相关表的状态
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function diagnoseLoginIssue() {
  console.log('🔍 开始诊断登录问题...');
  console.log('========================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const adminEmail = '1055603323@qq.com';
  
  try {
    console.log('\n1️⃣ 检查用户是否存在...');
    
    // 通过Supabase管理API获取用户列表
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ 获取用户列表失败:', listError.message);
      return;
    }
    
    const targetUser = users.users.find(user => user.email === adminEmail);
    
    if (targetUser) {
      console.log('✅ 找到目标用户:');
      console.log(`   ID: ${targetUser.id}`);
      console.log(`   邮箱: ${targetUser.email}`);
      console.log(`   邮箱确认: ${targetUser.email_confirmed_at ? '✅ 已确认' : '❌ 未确认'}`);
      console.log(`   用户元数据:`, targetUser.user_metadata);
    } else {
      console.log('❌ 未找到目标用户');
      return;
    }
    
    console.log('\n2️⃣ 检查数据库表结构...');
    
    // 检查必要的表是否存在
    const requiredTables = ['admin_users', 'permissions', 'user_profiles_ext'];
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ 表 ${tableName} 不存在或无法访问:`, error.message);
        } else {
          console.log(`✅ 表 ${tableName} 存在`);
        }
      } catch (tableError) {
        console.log(`❌ 表 ${tableName} 检查失败:`, tableError.message);
      }
    }
    
    console.log('\n3️⃣ 检查管理员记录...');
    
    // 尝试查询admin_users表
    try {
      const { data: adminRecords, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', adminEmail);
      
      if (adminError) {
        console.log('⚠️  admin_users表查询失败:', adminError.message);
        console.log('可能需要创建管理员表');
      } else {
        console.log('✅ admin_users表查询成功');
        if (adminRecords && adminRecords.length > 0) {
          console.log('📋 管理员记录:', adminRecords[0]);
        } else {
          console.log('❌ 未找到管理员记录');
        }
      }
    } catch (adminQueryError) {
      console.log('❌ 管理员记录查询异常:', adminQueryError.message);
    }
    
    console.log('\n4️⃣ 测试登录流程...');
    
    // 测试登录
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: '12345678'
      });
      
      if (loginError) {
        console.log('❌ 登录测试失败:', loginError.message);
      } else {
        console.log('✅ 登录测试成功');
        console.log('用户会话:', !!loginData.session);
        
        // 检查是否被识别为管理员
        if (loginData.user) {
          const { data: adminCheck } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', loginData.user.id)
            .eq('is_active', true)
            .single();
          
          console.log(`管理员身份: ${adminCheck ? '✅ 是' : '❌ 否'}`);
        }
        
        // 登出测试用户
        await supabase.auth.signOut();
      }
    } catch (loginTestError) {
      console.log('❌ 登录测试异常:', loginTestError.message);
    }
    
    console.log('\n5️⃣ 生成修复建议...');
    
    const issues = [];
    const fixes = [];
    
    // 检查表是否存在
    try {
      await supabase.from('admin_users').select('count').limit(1);
    } catch (tableError) {
      issues.push('admin_users表不存在');
      fixes.push('需要执行数据库迁移创建管理员相关表');
    }
    
    // 检查管理员记录
    try {
      const { data: adminRecords } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', adminEmail);
      
      if (!adminRecords || adminRecords.length === 0) {
        issues.push('缺少管理员记录');
        fixes.push('需要为用户创建管理员记录');
      }
    } catch (recordError) {
      issues.push('无法查询管理员记录');
      fixes.push('需要先创建管理员表');
    }
    
    if (issues.length > 0) {
      console.log('\n🚨 发现问题:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 修复建议:');
      fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
      });
      
      console.log('\n💡 建议执行以下修复脚本:');
      console.log('   node scripts/fix-login-issues.js');
    } else {
      console.log('\n✅ 未发现明显问题，登录应该可以正常工作');
    }
    
  } catch (error) {
    console.error('\n❌ 诊断过程中发生错误:', error.message);
    console.error('详细错误:', error);
  }
}

// 执行诊断
diagnoseLoginIssue();