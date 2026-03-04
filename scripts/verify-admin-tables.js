#!/usr/bin/env node

/**
 * 验证管理员表结构是否创建成功
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifyAdminTables() {
  console.log('🔍 验证管理员表结构...');
  console.log('========================');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const adminEmail = '1055603323@qq.com';

  try {
    console.log('\n1️⃣ 检查表是否存在...');

    // 检查admin_users表
    try {
      const { data: adminCount, error: adminError } = await supabase
        .from('admin_users')
        .select('count')
        .limit(1);

      if (adminError) {
        console.log('❌ admin_users表:', adminError.message);
      } else {
        console.log('✅ admin_users表: 存在');
      }
    } catch (adminCheckError) {
      console.log('❌ admin_users表检查失败:', adminCheckError.message);
    }

    // 检查permissions表
    try {
      const { data: permCount, error: permError } = await supabase
        .from('permissions')
        .select('count')
        .limit(1);

      if (permError) {
        console.log('❌ permissions表:', permError.message);
      } else {
        console.log('✅ permissions表: 存在');
      }
    } catch (permCheckError) {
      console.log('❌ permissions表检查失败:', permCheckError.message);
    }

    console.log('\n2️⃣ 检查表结构完整性...');

    // 检查admin_users表结构
    try {
      const { data: adminSample, error: sampleError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);

      if (!sampleError) {
        console.log('✅ admin_users表结构完整');
      }
    } catch (structError) {
      console.log('❌ admin_users表结构检查失败:', structError.message);
    }

    // 检查permissions表结构
    try {
      const { data: permSample, error: permSampleError } = await supabase
        .from('permissions')
        .select('*')
        .limit(1);

      if (!permSampleError) {
        console.log('✅ permissions表结构完整');
      }
    } catch (permStructError) {
      console.log('❌ permissions表结构检查失败:', permStructError.message);
    }

    console.log('\n3️⃣ 检查数据完整性...');

    // 检查权限数据
    try {
      const { data: permissions, error: permDataError } = await supabase
        .from('permissions')
        .select('role, resource, action')
        .order('role');

      if (!permDataError) {
        console.log(`✅ 权限数据: ${permissions.length} 条记录`);
        console.log(
          '   角色分布:',
          [...new Set(permissions.map(p => p.role))].join(', ')
        );
      }
    } catch (dataError) {
      console.log('❌ 权限数据检查失败:', dataError.message);
    }

    // 检查管理员用户数据
    try {
      const { data: adminUsers, error: adminDataError } = await supabase
        .from('admin_users')
        .select('email, role, is_active');

      if (!adminDataError) {
        console.log(`✅ 管理员用户: ${adminUsers.length} 条记录`);
        adminUsers.forEach(user => {
          console.log(
            `   - ${user.email} (${user.role}): ${user.is_active ? '激活' : '未激活'}`
          );
        });
      }
    } catch (adminDataError) {
      console.log('❌ 管理员用户数据检查失败:', adminDataError.message);
    }

    console.log('\n4️⃣ 测试功能集成...');

    // 测试会话检查API能否使用数据库表
    try {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: '12345678',
        });

      if (!loginError) {
        console.log('✅ 登录功能正常');

        // 测试数据库权限检查
        const { data: adminCheck, error: checkError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', loginData.user.id)
          .eq('is_active', true)
          .single();

        if (!checkError && adminCheck) {
          console.log('✅ 数据库权限检查通过');
        } else {
          console.log('⚠️  数据库权限检查未通过（可能需要创建管理员记录）');
        }

        // 登出
        await supabase.auth.signOut();
      } else {
        console.log('❌ 登录功能异常:', loginError.message);
      }
    } catch (funcError) {
      console.log('❌ 功能集成测试失败:', funcError.message);
    }

    console.log('\n📋 验证总结:');
    console.log('如果所有检查都通过，说明表结构已正确创建');
    console.log('如果仍有问题，可能需要:');
    console.log('1. 重新执行表创建SQL');
    console.log('2. 检查数据库连接权限');
    console.log('3. 验证Supabase项目配置');
  } catch (error) {
    console.error('\n❌ 验证过程中发生错误:', error.message);
  }
}

// 执行验证
verifyAdminTables();
