import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/traceability/verify/:code - 验证溯源码
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    // 调用验证函数
    const { data, error } = await supabase.rpc('verify_traceability_code', {
      p_code: code,
    });

    if (error) {
      throw new Error(`验证失败: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '溯源码不存在',
        },
        { status: 404 }
      );
    }

    const result = data[0];

    // 记录扫描
    await supabase.from('inventory.traceability_scans').insert([
      {
        traceability_code_id: null, // 需要先查询获取 ID
        scanned_at: new Date().toISOString(),
        scan_result: result.is_valid ? 'success' : 'failed',
      },
    ]);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('验证溯源码失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '验证溯源码失败' },
      { status: 500 }
    );
  }
}
