import { supabaseAdmin } from '@/lib/supabase';

// 测试修复后的管理员权限检?export async function testAdminPermissionFix() {
  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🧪 测试管理员权限检查修?..')try {
    // 使用已知的管理员用户ID进行测试
    const testUserId = '6c83c463-bd84-4f3a-9e61-383b00bc3cfb';

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('执行修复后的查询...')const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .single();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查询结果:')// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Data:', data)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Error:', error)const isAdmin = !error && data !== null;
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('管理员权限检查结?', isAdmin ? '�?是管理员' : '�?非管理员')return isAdmin;
  } catch (error) {
    console.error('测试执行失败:', error);
    return false;
  }
}

// 在客户端组件中使用的测试函数
export async function testClientSideAdminCheck() {
  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('📱 测试客户端管理员检?..')// 这里模拟客户端环境下的检?  // 实际应用中会通过API路由来执?  const response = await fetch('/api/test-admin-check');
  const result = await response.json();

  // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('客户端检查结?', result)return result.isAdmin;
}
