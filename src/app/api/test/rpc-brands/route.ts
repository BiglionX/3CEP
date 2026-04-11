import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

/**
 * GET /api/test/rpc-brands
 * 测试 RPC 调用
 */
export async function GET() {
  try {
    // 调试信息（开发环境）
    // console.log('=== 开始测试 RPC 调用 ===');

    // 1. 测试函数是否存在
    const { data: _functions, error: funcError } = await supabaseAdmin
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'get_brands');

    if (funcError) {
      // console.error('查询函数失败:', funcError);
    } else {
      // console.log('找到的函数:', functions);
    }

    // 2. 尝试调用函数
    // console.log('调用 get_brands RPC...');
    const { data, error } = await supabaseAdmin.rpc('get_brands', {
      p_page: 0,
      p_limit: 5,
      p_search: '',
    });

    if (error) {
      // console.error('RPC调用失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }

    // console.log('RPC调用成功，返回数据条数:', data?.length || 0);
    // console.log('第一条数据:', data?.[0]);

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      sample: data?.[0] || null,
      allData: data,
    });
  } catch (err: any) {
    // console.error('测试异常:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
}
