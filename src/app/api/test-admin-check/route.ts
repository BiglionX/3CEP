import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 测试管理员权限API路由...');
    
    // 使用已知的管理员用户ID进行测试
    const testUserId = '6c83c463-bd84-4f3a-9e61-383b00bc3cfb';
    
    // 执行管理员权限检查
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('user_id', testUserId)
      .eq('is_active', true)
      .single();
    
    const isAdmin = !error && data !== null;
    
    console.log('API测试结果:');
    console.log('User ID:', testUserId);
    console.log('Is Admin:', isAdmin);
    console.log('Data:', data);
    console.log('Error:', error);
    
    return NextResponse.json({
      success: true,
      isAdmin: isAdmin,
      userId: testUserId,
      data: data,
      error: error?.message || null
    });
    
  } catch (error: any) {
    console.error('API测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}