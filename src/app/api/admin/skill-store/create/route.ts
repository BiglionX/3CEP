import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      category,
      version,
      description,
      apiEndpoint,
      parameters,
      tokenCost,
      tags,
    } = body;

    // 验证必填字段
    if (!name || !nameEn || !category || !version || !description) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    // 初始化 Supabase 客户端 (使用服务角色密钥绕过 RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查 Skill 是否已存在 (通过英文名称 + 版本号)
    const { data: existingSkill, error: checkError } = await supabase
      .from('skills')
      .select('id')
      .eq('name_en', nameEn)
      .eq('version', version)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 表示没有找到记录，这是正常的
      throw checkError;
    }

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: `该 Skill (英文名称：${nameEn}, 版本：${version}) 已存在`,
        },
        { status: 409 }
      );
    }

    // 解析标签
    const tagArray = tags
      ? typeof tags === 'string'
        ? tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : tags
      : [];

    // 解析参数配置
    let parsedParameters = null;
    if (parameters) {
      try {
        parsedParameters =
          typeof parameters === 'string' ? JSON.parse(parameters) : parameters;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: '参数配置必须是有效的 JSON 格式',
          },
          { status: 400 }
        );
      }
    }

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

    // 生成 skill_code (基于英文名称)
    const skillCode = nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');

    // 插入新 Skill
    const { data: newSkill, error: insertError } = await supabase
      .from('skills')
      .insert({
        name,
        name_en: nameEn,
        skill_code: skillCode,
        category,
        version,
        description,
        api_endpoint: apiEndpoint || null,
        parameters: parsedParameters,
        token_cost: tokenCost ? parseInt(tokenCost, 10) : 0,
        tags: tagArray,
        review_status: 'pending', // 默认为待审核状态
        shelf_status: 'off_shelf', // 默认为下架状态
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('插入 Skill 失败:', insertError);
      throw insertError;
    }

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        message: 'Skill 创建成功，等待审核',
        data: newSkill,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('创建 Skill 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
