import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, targetVersionId } = body;

    if (!skillId || !targetVersionId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取目标版本信息
    const { data: targetVersion, error: fetchError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', targetVersionId)
      .single();

    if (fetchError || !targetVersion) {
      return NextResponse.json(
        {
          success: false,
          error: '目标版本不存在',
        },
        { status: 404 }
      );
    }

    // 获取当前 Skill 信息
    const { data: currentSkill } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (!currentSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill 不存在',
        },
        { status: 404 }
      );
    }

    // 验证是否属于同一个 Skill (skill_code 相同)
    if (currentSkill.skill_code !== targetVersion.skill_code) {
      return NextResponse.json(
        {
          success: false,
          error: '不能切换到不同 Skill 的版本',
        },
        { status: 400 }
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

    // 回滚操作：将目标版本的内容复制到当前 Skill
    const { data: rolledBackSkill, error: updateError } = await supabase
      .from('skills')
      .update({
        name: targetVersion.name,
        description: targetVersion.description,
        api_endpoint: targetVersion.api_endpoint,
        parameters: targetVersion.parameters,
        token_cost: targetVersion.token_cost,
        tags: targetVersion.tags,
        // 版本号也回滚到目标版本
        version: targetVersion.version,
        // 状态设置为已审核和上架 (假设原版本是已审核的)
        review_status: 'approved',
        shelf_status: 'on_shelf',
        updated_by: userId,
      })
      .eq('id', skillId)
      .select()
      .single();

    if (updateError) {
      console.error('回滚 Skill 失败:', updateError);
      throw updateError;
    }

    // 记录回滚操作到版本历史
    await supabase
      .from('skill_version_history')
      .insert({
        skill_id: skillId,
        old_version: currentSkill.version,
        new_version: targetVersion.version,
        changes: {
          rollback: {
            from: currentSkill.id,
            to: targetVersion.id,
            reason: '版本回滚',
          },
        },
        changed_by: userId,
      })
      .catch(() => {
        console.warn('skill_version_history 表不存在，跳过版本历史记录');
      });

    return NextResponse.json({
      success: true,
      message: `已成功回滚到版本 ${targetVersion.version}`,
      data: rolledBackSkill,
    });
  } catch (error: any) {
    console.error('版本回滚失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    );
  }
}
