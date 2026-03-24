/**
 * 智能体模板管理 API
 *
 * GET /api/agents/templates - 获取所有模板
 * POST /api/agents/templates - 创建自定义模板
 * DELETE /api/agents/templates/:id - 删除自定义模板
 */

import { PRESET_TEMPLATES } from '@/templates/agents/presets';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：获取所有模板（预设 + 自定义）
 */
export async function GET() {
  try {
    // 获取预设模板
    const presetTemplates = PRESET_TEMPLATES.map(t => ({
      ...t,
      isPreset: true,
    }));

    // 获取自定义模板
    const { data: customTemplates, error } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('is_preset', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const customTemplatesWithFlag = (customTemplates || []).map(t => ({
      ...t,
      isPreset: false,
    }));

    return NextResponse.json({
      success: true,
      data: [...presetTemplates, ...customTemplatesWithFlag],
      meta: {
        presetCount: presetTemplates.length,
        customCount: customTemplatesWithFlag.length,
        total: presetTemplates.length + customTemplatesWithFlag.length,
      },
    });
  } catch (error) {
    console.error('获取模板失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：创建自定义模板
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, icon, configuration } = body;

    // 验证必填字段
    if (!name || !configuration) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必填字段：name, configuration',
          },
        },
        { status: 400 }
      );
    }

    // 创建模板
    const newTemplate = {
      name,
      description: description || '',
      category: category || 'custom',
      icon: icon || '📄',
      configuration,
      is_preset: false,
      usage_count: 0,
    };

    const { data, error } = await supabase
      .from('agent_templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '模板创建成功',
      data: {
        ...data,
        isPreset: false,
      },
    });
  } catch (error) {
    console.error('创建模板失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: error instanceof Error ? error.message : '创建失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE 请求：删除自定义模板
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: '缺少模板 ID',
          },
        },
        { status: 400 }
      );
    }

    // 检查是否为预设模板
    const template = PRESET_TEMPLATES.find(t => t.id === id);
    if (template) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CANNOT_DELETE_PRESET',
            message: '不能删除预设模板',
          },
        },
        { status: 403 }
      );
    }

    // 删除自定义模板
    const { error } = await supabase
      .from('agent_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '模板已删除',
    });
  } catch (error) {
    console.error('删除模板失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : '删除失败',
        },
      },
      { status: 500 }
    );
  }
}
