import { exportToCSV, exportToExcel } from '@/lib/excel-parser';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/skill-store/export
 *
 * 导出 Skills 数据为 Excel/CSV
 * 支持筛选、自定义字段、异步导出
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 2. 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx'; // xlsx, csv
    const category = searchParams.get('category');
    const shelfStatus = searchParams.get('shelf_status');
    const reviewStatus = searchParams.get('review_status');
    const fields = searchParams.get('fields')?.split(',') || []; // 自定义字段

    // 3. 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. 构建查询
    const queryParams: any = {};

    if (category) queryParams.category = category;
    if (shelfStatus) queryParams.shelf_status = shelfStatus;
    if (reviewStatus) queryParams.review_status = reviewStatus;

    // 5. 获取数据
    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .match(queryParams);

    if (error) {
      console.error('导出查询失败:', error);
      return NextResponse.json(
        { success: false, error: `数据库查询失败：${error.message}` },
        { status: 500 }
      );
    }

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可导出的数据' },
        { status: 404 }
      );
    }

    // 6. 格式化数据
    const exportData = skills.map(skill => ({
      name_en: skill.name_en,
      title: skill.title,
      description: skill.description,
      category: skill.category,
      version: skill.version,
      shelf_status: skill.shelf_status,
      review_status: skill.review_status,
      rating: skill.rating,
      view_count: skill.view_count,
      download_count: skill.download_count,
      usage_count: skill.usage_count,
      author_id: skill.author_id,
      cover_image_url: skill.cover_image_url,
      download_url: skill.download_url,
      tags: Array.isArray(skill.tags) ? skill.tags.join(', ') : '',
      created_at: skill.created_at,
      updated_at: skill.updated_at,
    }));

    // 7. 根据格式生成文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `skills_export_${timestamp}`;

    if (format === 'csv') {
      // CSV 格式
      const csvContent = exportToCSV(exportData, filename);

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      // Excel 格式
      const excelBuffer = exportToExcel(exportData, filename);

      return new NextResponse(Buffer.from(excelBuffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error('导出失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
