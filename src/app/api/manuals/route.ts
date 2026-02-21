import { NextRequest, NextResponse } from 'next/server';
import { enhancedManualsService, ManualDTO } from '@/services/enhanced-manuals.service';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取说明书列表
 * GET /api/manuals?productId=xxx&status=published,draft&userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const statuses = statusParam ? statusParam.split(',') : undefined;

    let manuals;
    if (productId) {
      manuals = await enhancedManualsService.getProductManuals(productId, statuses);
    } else if (userId) {
      manuals = await enhancedManualsService.getUserManuals(userId, statuses);
    } else {
      // 获取所有说明书（仅管理员）
      const { data, error } = await supabase
        .from('product_manuals')
        .select(`
          *,
          product:products(name, model, brand:brands(name)),
          creator:auth_users(email)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw new Error(`获取说明书列表失败: ${error.message}`);
      }

      manuals = data;
    }

    return NextResponse.json({
      success: true,
      data: manuals,
      pagination: {
        page,
        limit,
        total: manuals.length
      }
    });

  } catch (error) {
    console.error('获取说明书列表错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '获取说明书列表失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 创建新说明书
 * POST /api/manuals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必要参数
    const requiredFields = ['productId', 'title', 'content', 'languageCodes', 'createdBy'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `缺少必要参数: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    const manualDTO: ManualDTO = {
      productId: body.productId,
      title: body.title,
      content: body.content,
      languageCodes: body.languageCodes,
      coverImageUrl: body.coverImageUrl,
      videoUrl: body.videoUrl,
      versionNotes: body.versionNotes,
      createdBy: body.createdBy
    };

    const manual = await enhancedManualsService.createManual(manualDTO);

    return NextResponse.json({
      success: true,
      data: manual,
      message: '说明书创建成功'
    });

  } catch (error) {
    console.error('创建说明书错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message || '创建说明书失败' 
      },
      { status: 400 }
    );
  }
}