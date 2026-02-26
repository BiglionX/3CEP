import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FileStorageService, EnterpriseDocumentService } from '@/services/file-storage-service';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 验证用户身份
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const version = formData.get('version') as string || '1.0';
    const tags = formData.get('tags') as string;
    const accessLevel = formData.get('access_level') as string || 'private';
    const enterpriseId = formData.get('enterprise_id') as string;

    // 验证必需字段
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要上传的文件' },
        { status: 400 }
      );
    }

    if (!title || !category || !enterpriseId) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 上传文件到存储
    const uploadResult = await FileStorageService.uploadFile(
      file,
      `enterprise/${enterpriseId}/documents`,
      user.id
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    // 保存文档记录到数据库
    const documentData = {
      enterprise_id: enterpriseId,
      title,
      description: description || '',
      file_name: file.name,
      file_path: uploadResult.fileId!,
      file_size: file.size,
      file_type: file.type,
      file_extension: file.name.split('.').pop() || '',
      category,
      version,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      access_level: accessLevel,
      uploaded_by: user.id,
      status: 'pending' // 默认状态为待审核
    };

    const saveResult = await EnterpriseDocumentService.saveDocumentRecord(documentData);

    if (!saveResult.success) {
      // 如果数据库保存失败，删除已上传的文件
      if (uploadResult.fileId) {
        await FileStorageService.deleteFile(uploadResult.fileId);
      }
      
      return NextResponse.json(
        { success: false, error: saveResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        document: saveResult.data,
        fileUrl: uploadResult.fileUrl
      },
      message: '文件上传成功'
    });

  } catch (error) {
    console.error('文件上传API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // 验证用户身份
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get('enterprise_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '缺少企业ID参数' },
        { status: 400 }
      );
    }

    // 获取文档列表
    const result = await EnterpriseDocumentService.getEnterpriseDocuments(enterpriseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 应用过滤条件
    let filteredDocuments = result.data;
    
    if (category && category !== 'all') {
      filteredDocuments = filteredDocuments.filter((doc: any) => doc.category === category);
    }
    
    if (status && status !== 'all') {
      filteredDocuments = filteredDocuments.filter((doc: any) => doc.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filteredDocuments,
      total: filteredDocuments.length
    });

  } catch (error) {
    console.error('获取文档列表API错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}