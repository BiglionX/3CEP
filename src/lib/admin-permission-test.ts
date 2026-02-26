import { supabaseAdmin } from '@/lib/supabase';

// 测试修复后的管理员权限检查
export async function testAdminPermissionFix() {
  console.log('🧪 测试管理员权限检查修复...');
  
  try {
    // 使用已知的管理员用户ID进行测试
    const testUserId = '6c83c463-bd84-4f3a-9e61-383b00bc3cfb';
    
    console.log('执行修复后的查询...');
    
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .single();
    
    console.log('查询结果:');
    console.log('Data:', data);
    console.log('Error:', error);
    
    const isAdmin = !error && data !== null;
    console.log('管理员权限检查结果:', isAdmin ? '✅ 是管理员' : '❌ 非管理员');
    
    return isAdmin;
    
  } catch (error) {
    console.error('测试执行失败:', error);
    return false;
  }
}

// 在客户端组件中使用的测试函数
export async function testClientSideAdminCheck() {
  console.log('📱 测试客户端管理员检查...');
  
  // 这里模拟客户端环境下的检查
  // 实际应用中会通过API路由来执行
  const response = await fetch('/api/test-admin-check');
  const result = await response.json();
  
  console.log('客户端检查结果:', result);
  return result.isAdmin;
}