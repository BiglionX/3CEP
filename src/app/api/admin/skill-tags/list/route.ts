import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tags, error } = await supabase
      .from('skill_tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('获取标签列表失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: tags || [],
    });
  } catch (error: any) {
    console.error('获取标签列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
