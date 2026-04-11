import { NextResponse } from 'next/server';

/**
 * GET /api/test/supabase
 * 测试Supabase连接
 */
export async function GET() {
  try {
    // 调试信息（开发环境）
    // console.log('[Test API] 开始测试...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // console.log('[Test API] 环境变量检查:');
    // console.log('  - URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置');
    // console.log('  - Service Key:', serviceKey ? '✅ 已配置' : '❌ 未配置');

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          error: '环境变量未配置',
          hasUrl: !!supabaseUrl,
          hasKey: !!serviceKey,
        },
        { status: 500 }
      );
    }

    // 尝试导入supabase
    const { supabaseAdmin } = await import('@/lib/supabase');

    // console.log('[Test API] supabaseAdmin 已加载');

    // 测试简单查询
    const { data, error } = await supabaseAdmin
      .schema('product_library')
      .from('brands')
      .select('count')
      .limit(1);

    if (error) {
      // console.error('[Test API] Supabase查询错误:', error);
      return NextResponse.json(
        {
          error: 'Supabase查询失败',
          details: error,
        },
        { status: 500 }
      );
    }

    // console.log('[Test API] 测试成功');

    return NextResponse.json({
      success: true,
      message: 'Supabase连接正常',
      data,
    });
  } catch (err) {
    // console.error('[Test API] 异常:', err);
    return NextResponse.json(
      {
        error: '测试失败',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}
