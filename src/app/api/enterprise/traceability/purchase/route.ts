import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// 模拟数据（用于测试）
const mockStats = {
  totalPurchased: 5000,
  totalGenerated: 3200,
  totalAvailable: 2800,
  consumedCodes: 400,
  usedCodes: 850,
  activeCodes: 2800,
  totalScans: 1230,
};

const mockOrders = [
  {
    id: '1',
    batch_id: 'QR-20240301-001',
    internal_code: 'ABC-001',
    product_name: '智能手机 X200',
    product_model: 'X200-Pro',
    product_category: '手机',
    quantity: 1000,
    generated_count: 1000,
    status: 'completed',
    created_at: '2024-03-01T00:00:00Z',
    completed_at: '2024-03-01T12:00:00Z',
  },
  {
    id: '2',
    batch_id: 'QR-20240302-001',
    internal_code: 'ABC-002',
    product_name: '平板电脑 Pad300',
    product_model: 'Pad300-WiFi',
    product_category: '平板',
    quantity: 500,
    generated_count: 500,
    status: 'completed',
    created_at: '2024-03-02T00:00:00Z',
    completed_at: '2024-03-02T12:00:00Z',
  },
  {
    id: '3',
    batch_id: 'QR-20240303-001',
    internal_code: 'ABC-003',
    product_name: '智能手表 Watch100',
    product_model: 'Watch100-Sport',
    product_category: '可穿戴',
    quantity: 2000,
    generated_count: 0,
    status: 'pending',
    created_at: '2024-03-03T00:00:00Z',
  },
];

// 获取企业的溯源码购买记录和消耗统计
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // 如果未登录，返回模拟数据用于测试
    if (authError || !user) {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type');

      if (type === 'stats') {
        return NextResponse.json({ success: true, stats: mockStats });
      }
      return NextResponse.json({ success: true, orders: mockOrders });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'stats' | 'orders' | 'codes'

    // 获取企业信息
    const { data: enterprise } = await supabase
      .from('enterprise_users')
      .select('id, enterprise_name')
      .eq('user_id', user.id)
      .single();

    if (!enterprise) {
      return NextResponse.json({ error: '企业信息不存在' }, { status: 404 });
    }

    if (type === 'stats') {
      // 获取消耗统计
      const { data: stats } = await supabase
        .from('enterprise_qr_codes')
        .select('id, scanned_count, is_active, created_at')
        .eq('enterprise_id', enterprise.id);

      const totalCodes = stats?.length || 0;
      const usedCodes =
        stats?.filter((s: any) => s.scanned_count > 0).length || 0;
      const activeCodes = stats?.filter((s: any) => s.is_active).length || 0;
      const consumedCodes = totalCodes - activeCodes;

      // 获取批次统计
      const { data: batches } = await supabase
        .from('enterprise_qr_batches')
        .select('id, quantity, generated_count, status, created_at')
        .eq('enterprise_id', enterprise.id);

      const totalPurchased =
        batches?.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0) ||
        0;
      const totalGenerated =
        batches?.reduce(
          (sum: number, b: any) => sum + (b.generated_count || 0),
          0
        ) || 0;

      return NextResponse.json({
        success: true,
        stats: {
          totalPurchased,
          totalGenerated,
          totalAvailable: totalGenerated - consumedCodes,
          consumedCodes,
          usedCodes,
          activeCodes,
          totalScans:
            stats?.reduce(
              (sum: number, s: any) => sum + (s.scanned_count || 0),
              0
            ) || 0,
        },
      });
    }

    if (type === 'orders') {
      // 获取购买订单
      const { data: orders } = await supabase
        .from('enterprise_qr_batches')
        .select('*')
        .eq('enterprise_id', enterprise.id)
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({
        success: true,
        orders: orders || [],
      });
    }

    // 获取溯源码列表
    const { data: codes } = await supabase
      .from('enterprise_qr_codes')
      .select('*')
      .eq('enterprise_id', enterprise.id)
      .order('created_at', { ascending: false })
      .limit(100);

    return NextResponse.json({
      success: true,
      codes: codes || [],
    });
  } catch (error) {
    console.error('Error fetching traceability purchase data:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 创建溯源码购买订单
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const {
      internalCode,
      productName,
      productModel,
      category,
      quantity,
      startDate,
      endDate,
    } = body;

    if (!internalCode || !productName || !quantity) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 获取企业信息
    const { data: enterprise } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!enterprise) {
      return NextResponse.json({ error: '企业信息不存在' }, { status: 404 });
    }

    // 生成批次ID
    const batchId = `QR-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // 创建批次记录
    const { data: batch, error: batchError } = await supabase
      .from('enterprise_qr_batches')
      .insert({
        batch_id: batchId,
        enterprise_id: enterprise.id,
        internal_code: internalCode,
        product_name: productName,
        product_model: productModel,
        product_category: category,
        quantity: quantity,
        status: 'pending',
        start_date: startDate || null,
        end_date: endDate || null,
        config: {
          format: 'png',
          size: 300,
        },
      })
      .select()
      .single();

    if (batchError) {
      console.error('Batch error:', batchError);
      return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      batch,
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
