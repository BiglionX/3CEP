import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  FileStorageService,
  EnterpriseDocumentService,
} from '@/services/file-storage-service';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥 },
        { status: 401 }
      );
    }

    // 鑾峰彇琛ㄥ崟鏁版嵁
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const version = (formData.get('version') as string) || '1.0';
    const tags = formData.get('tags') as string;
    const accessLevel = (formData.get('access_level') as string) || 'private';
    const enterpriseId = formData.get('enterprise_id') as string;

    // 楠岃瘉蹇呴渶瀛楁
    if (!file) {
      return NextResponse.json(
        { success: false, error: '璇烽€夋嫨瑕佷笂犵殑鏂囦欢' },
        { status: 400 }
      );
    }

    if (!title || !category || !enterpriseId) {
      return NextResponse.json(
        { success: false, error: '璇峰～鍐欐墍鏈夊繀濉瓧 },
        { status: 400 }
      );
    }

    // 涓婁紶鏂囦欢鍒板    const uploadResult = await FileStorageService.uploadFile(
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

    // 淇濆鏂囨。璁板綍鍒版暟鎹簱
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
      tags: tags
         tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
      access_level: accessLevel,
      uploaded_by: user.id,
      status: 'pending', // 榛樿鐘舵€佷负寰呭    };

    const saveResult =
      await EnterpriseDocumentService.saveDocumentRecord(documentData);

    if (!saveResult.success) {
      // 濡傛灉鏁版嵁搴撲繚瀛樺け璐ワ紝鍒犻櫎宸蹭笂犵殑鏂囦欢
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
        fileUrl: uploadResult.fileUrl,
      },
      message: '鏂囦欢涓婁紶鎴愬姛',
    });
  } catch (error) {
    console.error('鏂囦欢涓婁紶API閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 楠岃瘉鐢ㄦ埛韬唤
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥 },
        { status: 401 }
      );
    }

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const enterpriseId = searchParams.get('enterprise_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '缂哄皯佷笟ID鍙傛暟' },
        { status: 400 }
      );
    }

    // 鑾峰彇鏂囨。鍒楄〃
    const result =
      await EnterpriseDocumentService.getEnterpriseDocuments(enterpriseId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 搴旂敤杩囨护鏉′欢
    let filteredDocuments = result.data;

    if (category && category !== 'all') {
      filteredDocuments = filteredDocuments.filter(
        (doc: any) => doc.category === category
      );
    }

    if (status && status !== 'all') {
      filteredDocuments = filteredDocuments.filter(
        (doc: any) => doc.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredDocuments,
      total: filteredDocuments.length,
    });
  } catch (error) {
    console.error('鑾峰彇鏂囨。鍒楄〃API閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

