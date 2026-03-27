/**
 * 数据源管理 API - 更新
 * PUT /api/admin/data-sources/update/[id]
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();

    const {
      name,
      type,
      description,
      connection_config,
      sync_frequency,
      sync_enabled,
    } = body;

    // 更新数据源
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (connection_config !== undefined)
      updateData.connection_config = connection_config;
    if (sync_frequency !== undefined)
      updateData.sync_frequency = sync_frequency;
    if (sync_enabled !== undefined) updateData.sync_enabled = sync_enabled;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('external_data_sources')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: '数据源更新成功',
    });
  } catch (error: any) {
    console.error('更新数据源失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
