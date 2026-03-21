#!/usr/bin/env node

/**
 * 强制刷新认证会话，同步管理员权限
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function forceRefreshSession() {
  console.log('🔄 强制刷新认证会话...\n');
  console.log('=====================================\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. 获取当前用户
    console.log('📋 步骤 1: 获取当前用户信息\n');

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(
      '6c83c463-bd84-4f3a-9e61-383b00bc3cfb' // 用户 ID
    );

    if (userError) {
      console.log('❌ 获取用户失败:', userError.message);
      return;
    }

    console.log('✅ 当前用户信息:');
    console.log('-----------------------------------');
    console.log(`  ID:           ${user.id}`);
    console.log(`  Email:        ${user.email}`);
    console.log(`  Role:         ${user.role}`);
    console.log(`  User Metadata:`);
    console.log(
      `    - roles:    ${JSON.stringify(user.user_metadata?.roles || [])}`
    );
    console.log('-----------------------------------\n');

    // 2. 更新 user_metadata 添加 admin 角色
    console.log('📋 步骤 2: 更新 user_metadata 添加 admin 角色\n');

    const { data: updateData, error: updateError } =
      await supabase.auth.admin.updateUserById(
        '6c83c463-bd84-4f3a-9e61-383b00bc3cfb',
        {
          user_metadata: {
            ...user.user_metadata,
            roles: ['admin'],
            is_admin: true,
          },
        }
      );

    if (updateError) {
      console.log('❌ 更新失败:', updateError.message);
      return;
    }

    console.log('✅ user_metadata 更新成功:');
    console.log('-----------------------------------');
    console.log(
      `  roles:        ${JSON.stringify(updateData.user.user_metadata?.roles || [])}`
    );
    console.log(`  is_admin:     ${updateData.user.user_metadata?.is_admin}`);
    console.log('-----------------------------------\n');

    // 3. 验证更新结果
    console.log('📋 步骤 3: 验证更新结果\n');

    const {
      data: { user: verifiedUser },
      error: verifyError,
    } = await supabase.auth.admin.getUserById(
      '6c83c463-bd84-4f3a-9e61-383b00bc3cfb'
    );

    if (!verifyError) {
      console.log('✅ 验证成功:');
      console.log('-----------------------------------');
      console.log(
        `  roles:        ${JSON.stringify(verifiedUser.user_metadata?.roles || [])}`
      );
      console.log(`  is_admin:     ${verifiedUser.user_metadata?.is_admin}`);
      console.log('-----------------------------------\n');
    }

    console.log('🎉 会话刷新完成！\n');
    console.log('=====================================');
    console.log('📱 下一步操作:');
    console.log('-----------------------------------');
    console.log('1. 清除浏览器缓存 (Ctrl+Shift+Delete)');
    console.log('2. 强制刷新页面 (Ctrl+Shift+R)');
    console.log('3. 重新登录系统');
    console.log('4. 检查角色显示是否为"超级管理员"');
    console.log('-----------------------------------\n');
  } catch (error) {
    console.error('❌ 刷新过程中发生错误:', error.message);
    console.error(error.stack);
  }
}

forceRefreshSession();
