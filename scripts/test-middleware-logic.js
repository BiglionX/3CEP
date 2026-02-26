#!/usr/bin/env node

/**
 * 直接测试中间件行为
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testMiddlewareDirectly() {
  console.log('🧪 直接测试中间件逻辑...');
  console.log('========================');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('\n1️⃣ 模拟中间件的管理员检查逻辑...');
    
    // 获取用户信息
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.log('❌ 获取用户列表失败:', listError.message);
      return;
    }
    
    const targetUser = users.users.find(user => user.email === '1055603323@qq.com');
    if (!targetUser) {
      console.log('❌ 未找到目标用户');
      return;
    }
    
    console.log('✅ 找到目标用户:', targetUser.id);
    console.log('   邮箱:', targetUser.email);
    console.log('   元数据:', targetUser.user_metadata);
    
    // 模拟中间件的检查逻辑
    console.log('\n2️⃣ 模拟 checkAdminUser 函数...');
    
    // 检查用户元数据
    const hasMetadataAdmin = targetUser.user_metadata?.isAdmin === true;
    console.log('   元数据管理员标识:', hasMetadataAdmin);
    
    // 检查数据库（预期会失败）
    try {
      const { data: dbAdmin, error: dbError } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', targetUser.id)
        .eq('is_active', true)
        .single();
      
      const hasDbAdmin = !dbError && dbAdmin !== null;
      console.log('   数据库管理员检查:', hasDbAdmin);
      console.log('   数据库错误:', dbError?.message || '无错误');
    } catch (dbError) {
      console.log('   数据库检查异常:', dbError.message);
    }
    
    // 模拟完整的管理员检查逻辑
    const isAdmin = hasMetadataAdmin; // 优先使用元数据
    console.log('\n3️⃣ 最终管理员检查结果:', isAdmin);
    
    if (isAdmin) {
      console.log('🎉 用户应该能够访问管理后台！');
      console.log('\n建议解决方案:');
      console.log('1. 重启Next.js开发服务器以应用中间件更改');
      console.log('2. 清除浏览器缓存和Cookie');
      console.log('3. 直接访问 http://localhost:3001/admin/dashboard 测试');
    } else {
      console.log('❌ 用户无法访问管理后台');
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

testMiddlewareDirectly();