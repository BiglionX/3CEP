import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 创建测试用例
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, skillId, testName, inputParams, expectedOutput } = body;

    if (!userId || !skillId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('skill_sandboxes')
      .insert({
        user_id: userId,
        skill_id: skillId,
        test_name: testName,
        input_params: inputParams || {},
        expected_output: expectedOutput,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('创建测试失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 获取测试列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const skillId = searchParams.get('skillId');
    const status = searchParams.get('status');
    const isPublic = searchParams.get('public');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from('skill_sandboxes').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('获取测试列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
