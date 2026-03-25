import { readExcelFile, type ImportError } from '@/lib/excel-parser';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/skill-store/import
 *
 * 批量导入 Skills
 * 支持格式：.xlsx, .xls, .csv
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 2. 解析 FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '请上传文件' },
        { status: 400 }
      );
    }

    // 3. 验证文件格式
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        {
          success: false,
          error: '不支持的文件格式，请上传 .xlsx、.xls 或 .csv 文件',
        },
        { status: 400 }
      );
    }

    // 4. 解析 Excel 文件
    let importResult;
    try {
      importResult = await readExcelFile(file);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `文件解析失败：${error instanceof Error ? error.message : '未知错误'}`,
        },
        { status: 400 }
      );
    }

    const { data, errors, summary } = importResult;

    // 5. 如果有错误，返回详细错误信息
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          data: {
            summary,
            errors: errors.slice(0, 100), // 最多返回 100 个错误
          },
        },
        { status: 400 }
      );
    }

    // 6. 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 7. 获取当前用户
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户未认证' },
        { status: 401 }
      );
    }

    // 8. 检查名称重复
    const existingNames = new Set<string>();
    const nameList = data.map(skill => skill.name_en);

    const { data: existingSkills } = await supabase
      .from('skills')
      .select('name_en')
      .in('name_en', nameList);

    if (existingSkills) {
      existingSkills.forEach(skill => existingNames.add(skill.name_en));
    }

    const duplicateErrors: ImportError[] = [];
    data.forEach((skill, index) => {
      if (existingNames.has(skill.name_en)) {
        duplicateErrors.push({
          row: index + 2,
          field: 'name_en',
          message: `英文名称 "${skill.name_en}" 已存在`,
          value: skill.name_en,
        });
      }
    });

    if (duplicateErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: '发现重复的 Skill 名称',
          data: {
            summary: {
              ...summary,
              validRows: summary.validRows - duplicateErrors.length,
              invalidRows: duplicateErrors.length,
            },
            errors: duplicateErrors.slice(0, 100),
          },
        },
        { status: 400 }
      );
    }

    // 9. 批量插入数据 (使用事务)
    const skillsToInsert = data.map(skill => ({
      ...skill,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      shelf_status: 'off_shelf', // 默认下架状态
      review_status: 'pending', // 待审核状态
      view_count: 0,
      download_count: 0,
      usage_count: 0,
      rating: 0,
    }));

    const { data: insertedSkills, error: insertError } = await supabase
      .from('skills')
      .insert(skillsToInsert)
      .select();

    if (insertError) {
      console.error('批量插入失败:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: `数据库插入失败：${insertError.message}`,
        },
        { status: 500 }
      );
    }

    // 10. 返回成功结果
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRows: summary.totalRows,
          importedRows: insertedSkills?.length || 0,
          failedRows: 0,
          successRate: 1,
        },
        importedSkills: insertedSkills?.map(skill => ({
          id: skill.id,
          name_en: skill.name_en,
          title: skill.title,
          status: skill.review_status,
        })),
      },
      message: `成功导入 ${insertedSkills?.length || 0} 个 Skills`,
    });
  } catch (error) {
    console.error('导入失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
