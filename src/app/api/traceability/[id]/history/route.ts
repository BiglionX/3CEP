import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/traceability/:id/history - 获取溯源历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const traceabilityId = params.id;

    // 查询溯源码完整信息
    const { data: code, error } = await supabase
      .from('v_full_traceability_info')
      .select('*')
      .eq('traceability_id', traceabilityId)
      .single();

    if (error || !code) {
      return NextResponse.json(
        { success: false, error: '溯源码不存在' },
        { status: 404 }
      );
    }

    // 解析生命周期事件
    const lifecycleEvents = Array.isArray(code.lifecycle_events)
      ? code.lifecycle_events.sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...code,
        lifecycleEvents,
      },
    });
  } catch (error) {
    console.error('获取溯源历史失败:', error);
    return NextResponse.json(
      { success: false, error: '获取溯源历史失败' },
      { status: 500 }
    );
  }
}

// POST /api/traceability/:id/event - 记录生命周期事件
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const traceabilityId = params.id;
    const body = await request.json();
    const { eventType, location, operator, notes, metadata } = body;

    if (!eventType) {
      return NextResponse.json(
        { success: false, error: '事件类型不能为空' },
        { status: 400 }
      );
    }

    // 调用数据库函数记录事件
    const { error } = await supabase.rpc('record_lifecycle_event', {
      p_traceability_code_id: traceabilityId,
      p_event_type: eventType,
      p_location: location || null,
      p_operator: operator || null,
      p_notes: notes || null,
      p_metadata: metadata || null,
    });

    if (error) {
      throw new Error(`记录事件失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '事件记录成功',
    });
  } catch (error) {
    console.error('记录生命周期事件失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '记录生命周期事件失败' },
      { status: 500 }
    );
  }
}
