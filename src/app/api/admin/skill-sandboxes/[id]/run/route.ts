import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sandboxId,
      actualOutput,
      executionTime,
      memoryUsage,
      status,
      errorMessage,
    } = body;

    if (!sandboxId) {
      return NextResponse.json(
        { success: false, error: '缺少沙箱 ID' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 更新测试结果
    const { data, error } = await supabase
      .from('skill_sandboxes')
      .update({
        actual_output: actualOutput,
        execution_time: executionTime,
        memory_usage: memoryUsage,
        status: status || 'success',
        error_message: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sandboxId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('更新测试结果失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
