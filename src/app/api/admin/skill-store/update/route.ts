import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
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
    if (!id || !name || !nameEn || !category || !version || !description) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 检查 Skill 是否存在
    const { data: existingSkill, error: checkError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill 不存在',
        },
        { status: 404 }
      );
    }

    // 检查版本是否重复 (同一个 skill_id + version)
    const { data: versionExists } = await supabase
      .from('skills')
      .select('id')
      .eq('skill_code', existingSkill.skill_code)
      .eq('version', version)
      .neq('id', id)
      .single();

    if (versionExists) {
      return NextResponse.json(
        {
          success: false,
          error: `版本号 ${version} 已存在，请使用新的版本号`,
        },
        { status: 409 }
      );
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

    // 如果是重大版本更新，标记为需要重新审核
    const needsReview =
      existingSkill.version.split('.')[0] !== version.split('.')[0];

    // 更新 Skill (实际上是创建一个新版本)
    const { data: updatedSkill, error: updateError } = await supabase
      .from('skills')
      .insert({
        // 继承原 Skill 的属性
        skill_code: existingSkill.skill_code,
        name,
        name_en: nameEn, // 不允许修改
        category,
        version,
        description,
        api_endpoint: apiEndpoint || null,
        parameters: parameters || null,
        token_cost: tokenCost ? parseInt(tokenCost, 10) : 0,
        tags: tags || [],
        // 状态管理
        review_status: needsReview ? 'pending' : existingSkill.review_status,
        shelf_status: needsReview ? 'off_shelf' : existingSkill.shelf_status,
        // 审计字段
        created_by: userId,
        updated_by: userId,
        parent_skill_id: id, // 关联父版本
      })
      .select()
      .single();

    if (updateError) {
      console.error('更新 Skill 失败:', updateError);
      throw updateError;
    }

    // 记录版本历史
    await supabase
      .from('skill_version_history')
      .insert({
        skill_id: id,
        old_version: existingSkill.version,
        new_version: version,
        changes: {
          name:
            existingSkill.name !== name
              ? { from: existingSkill.name, to: name }
              : undefined,
          description:
            existingSkill.description !== description
              ? { from: existingSkill.description, to: description }
              : undefined,
          category:
            existingSkill.category !== category
              ? { from: existingSkill.category, to: category }
              : undefined,
          api_endpoint:
            existingSkill.api_endpoint !== apiEndpoint
              ? { from: existingSkill.api_endpoint, to: apiEndpoint }
              : undefined,
          parameters:
            JSON.stringify(existingSkill.parameters) !==
            JSON.stringify(parameters)
              ? { from: existingSkill.parameters, to: parameters }
              : undefined,
        },
        changed_by: userId,
      })
      .catch(() => {
        // 如果版本历史表不存在，忽略错误
        console.warn('skill_version_history 表不存在，跳过版本历史记录');
      });

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        message: needsReview
          ? 'Skill 更新成功，重大版本变更需要重新审核'
          : 'Skill 更新成功',
        data: updatedSkill,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('更新 Skill 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误，请稍后重试',
      },
      { status: 500 }
    );
  }
}
