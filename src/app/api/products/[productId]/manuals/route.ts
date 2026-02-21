// 产品说明书API路由

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ManualUploadService, ManualUploadDTO } from '@/services/manual-upload.service';
import { Database } from '@/lib/database.types';

const manualService = new ManualUploadService();

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.split(',') || ['published'];
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    
    const productId = params.productId;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: '产品ID不能为空' },
        { status: 400 }
      );
    }

    let manuals;
    if (includeDrafts) {
      // 如果请求包含草稿，则需要认证
      const supabase = createRouteHandlerClient<Database>({ cookies });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: '需要登录才能查看草稿' },
          { status: 401 }
        );
      }
      
      manuals = await manualService.getProductManuals(productId);
    } else {
      // 只返回已发布的说明书
      manuals = await manualService.getProductManuals(productId, status);
    }

    return NextResponse.json({
      success: true,
      data: manuals
    });

  } catch (error) {
    console.error('获取说明书列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取说明书列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录才能上传说明书' },
        { status: 401 }
      );
    }

    const productId = params.productId;
    const body = await request.json();
    
    const uploadDTO: ManualUploadDTO = {
      productId,
      title: body.title,
      content: body.content,
      languageCodes: body.languageCodes,
      versionNotes: body.versionNotes,
      createdBy: session.user.id
    };

    const manual = await manualService.uploadManual(uploadDTO);

    return NextResponse.json({
      success: true,
      data: manual,
      message: '说明书上传成功'
    });

  } catch (error: any) {
    console.error('上传说明书失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '上传说明书失败' },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { manualId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录才能更新说明书' },
        { status: 401 }
      );
    }

    const manualId = params.manualId;
    const body = await request.json();
    
    // 验证用户权限（只能更新自己创建的说明书）
    const existingManual = await manualService.getManualById(manualId);
    if (!existingManual) {
      return NextResponse.json(
        { success: false, error: '说明书不存在' },
        { status: 404 }
      );
    }

    if (existingManual.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权更新此说明书' },
        { status: 403 }
      );
    }

    const manual = await manualService.updateManual(manualId, {
      title: body.title,
      content: body.content,
      languageCodes: body.languageCodes,
      versionNotes: body.versionNotes
    });

    return NextResponse.json({
      success: true,
      data: manual,
      message: '说明书更新成功'
    });

  } catch (error: any) {
    console.error('更新说明书失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '更新说明书失败' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { manualId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录才能删除说明书' },
        { status: 401 }
      );
    }

    const manualId = params.manualId;
    
    // 验证用户权限
    const existingManual = await manualService.getManualById(manualId);
    if (!existingManual) {
      return NextResponse.json(
        { success: false, error: '说明书不存在' },
        { status: 404 }
      );
    }

    if (existingManual.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权删除此说明书' },
        { status: 403 }
      );
    }

    // 从数据库删除说明书
    const { error } = await supabase
      .from('product_manuals')
      .delete()
      .eq('id', manualId);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: '说明书删除成功'
    });

  } catch (error: any) {
    console.error('删除说明书失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '删除说明书失败' },
      { status: 500 }
    );
  }
}