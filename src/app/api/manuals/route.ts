import { NextRequest, NextResponse } from 'next/server';
import {
  enhancedManualsService,
  ManualDTO,
} from '@/services/enhanced-manuals.service';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 鑾峰彇璇存槑涔﹀垪 * GET /api/manualsproductId=xxx&status=published,draft&userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const statusParam = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const statuses = statusParam  statusParam.split(',') : undefined;

    let manuals;
    if (productId) {
      manuals = await enhancedManualsService.getProductManuals(
        productId,
        statuses
      );
    } else if (userId) {
      manuals = await enhancedManualsService.getUserManuals(userId, statuses);
    } else {
      // 鑾峰彇鎵€鏈夎鏄庝功锛堜粎绠＄悊鍛橈級
      const { data, error } = await supabase
        .from('product_manuals')
        .select(
          `
          *,
          product:products(name, model, brand:brands(name)),
          creator:auth_users(email)
        `
        )
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw new Error(`鑾峰彇璇存槑涔﹀垪琛ㄥけ ${error.message}`);
      }

      manuals = data;
    }

    return NextResponse.json({
      success: true,
      data: manuals,
      pagination: {
        page,
        limit,
        total: manuals.length,
      },
    });
  } catch (error) {
    console.error('鑾峰彇璇存槑涔﹀垪琛ㄩ敊', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '鑾峰彇璇存槑涔﹀垪琛ㄥけ,
      },
      { status: 500 }
    );
  }
}

/**
 * 鍒涘缓鏂拌鏄庝功
 * POST /api/manuals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呰鍙傛暟
    const requiredFields = [
      'productId',
      'title',
      'content',
      'languageCodes',
      'createdBy',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `缂哄皯蹇呰鍙傛暟: ${field}`,
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
      createdBy: body.createdBy,
    };

    const manual = await enhancedManualsService.createManual(manualDTO);

    return NextResponse.json({
      success: true,
      data: manual,
      message: '璇存槑涔﹀垱寤烘垚,
    });
  } catch (error) {
    console.error('鍒涘缓璇存槑涔﹂敊', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '鍒涘缓璇存槑涔﹀け,
      },
      { status: 400 }
    );
  }
}

