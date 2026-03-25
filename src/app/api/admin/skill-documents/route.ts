import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 获取文档列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const category = searchParams.get('category');
    const isPublished = searchParams.get('published');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from('skill_documents').select('*');

    if (skillId) {
      query = query.eq('skill_id', skillId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublished === 'true') {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query
      .order('order_index')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('获取文档列表失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 创建文档
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      skillId,
      title,
      slug,
      content,
      contentType,
      summary,
      category,
      version,
      orderIndex,
      isPublished,
      isOfficial,
      metaTitle,
      metaDescription,
      keywords,
    } = body;

    if (!skillId || !title) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('skill_documents')
      .insert({
        skill_id: skillId,
        title,
        slug,
        content_type: contentType || 'markdown',
        content,
        summary,
        category: category || 'guide',
        version,
        order_index: orderIndex || 0,
        is_published: isPublished || false,
        is_official: isOfficial || false,
        published_at: isPublished ? new Date().toISOString() : null,
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: keywords || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('创建文档失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
