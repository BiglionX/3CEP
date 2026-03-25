import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, rating, title, content, parentId } = body;

    // 验证必填字段
    if (!skillId || !content) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: '评分必须在 1-5 之间',
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

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '未登录',
        },
        { status: 401 }
      );
    }

    // 检查 Skill 是否存在
    const { data: skill } = await supabase
      .from('skills')
      .select('id')
      .eq('id', skillId)
      .single();

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill 不存在',
        },
        { status: 404 }
      );
    }

    // 创建评论
    const { data: review, error } = await supabase
      .from('skill_reviews')
      .insert({
        skill_id: skillId,
        user_id: userId,
        rating: rating || null,
        title: title || null,
        content,
        parent_id: parentId || null,
        is_approved: false, // 需要审核
      })
      .select()
      .single();

    if (error) {
      console.error('创建评论失败:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '评论已提交，等待审核',
      data: review,
    });
  } catch (error: any) {
    console.error('创建评论失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
