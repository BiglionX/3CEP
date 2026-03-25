import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hot'; // hot, similar, personalized
    const skillId = searchParams.get('skillId');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let recommendations;

    if (type === 'similar' && skillId) {
      // 获取相似 Skills
      const { data, error } = await supabase.rpc('get_similar_skills', {
        p_skill_id: skillId,
        p_limit: limit,
      });

      if (error) throw error;
      recommendations = data;
    } else if (type === 'personalized') {
      // 获取个性化推荐 (需要用户 ID)
      const userIdHeader = request.headers.get('x-user-id');

      if (!userIdHeader) {
        // 如果没有用户 ID，返回热门推荐
        const { data, error } = await supabase.rpc('get_hot_skills', {
          p_limit: limit,
        });
        if (error) throw error;
        recommendations = data;
      } else {
        const { data, error } = await supabase.rpc(
          'get_personalized_recommendations',
          {
            p_user_id: userIdHeader,
            p_limit: limit,
          }
        );
        if (error) throw error;
        recommendations = data;
      }
    } else {
      // 默认：热门推荐
      const { data, error } = await supabase.rpc('get_hot_skills', {
        p_limit: limit,
      });
      if (error) throw error;
      recommendations = data;
    }

    return NextResponse.json({
      success: true,
      data: recommendations || [],
    });
  } catch (error: any) {
    console.error('获取推荐失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
