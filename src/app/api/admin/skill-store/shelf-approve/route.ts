import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 Skill ID',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取当前用户信息
    const authHeader = request.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // 上架操作
    const { data, error } = await supabase
      .from('skills')
      .update({
        shelf_status: 'on_shelf',
        last_shelf_time: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', skillId)
      .select();

    if (error) {
      console.error('上架失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Skill 已成功上架',
      data,
    });
  } catch (error: any) {
    console.error('上架失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
