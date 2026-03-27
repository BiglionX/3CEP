/**
 * 数据源管理 API - 创建
 * POST /api/admin/data-sources/create
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
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

    // 验证必填字段
    if (!name || !type || !connection_config) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    // 创建数据源
    const { data, error } = await supabase
      .from('external_data_sources')
      .insert({
        name,
        type,
        description: description || null,
        connection_config,
        sync_frequency: sync_frequency || 300,
        sync_enabled: sync_enabled || false,
        status: 'active',
        health_status: 'unknown',
        created_by: (await getUser(request))?.id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: '数据源创建成功',
    });
  } catch (error: any) {
    console.error('创建数据源失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function getUser(request: NextRequest) {
  // TODO: 实现用户认证逻辑
  return null;
}
