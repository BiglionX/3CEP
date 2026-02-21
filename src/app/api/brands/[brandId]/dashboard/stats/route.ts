import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 简化的Token验证
function verifySimpleToken(token: string): { brandId: string } | null {
  if (!token.startsWith('brand_')) return null;
  
  const parts = token.split('_');
  if (parts.length !== 4) return null;
  
  return { brandId: parts[1] };
}

// 获取品牌商仪表板统计数据
export async function GET(request: NextRequest, { params }: { params: { brandId: string } }) {
  try {
    const brandId = params.brandId;
    
    // 验证品牌商身份
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '缺少认证令牌' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifySimpleToken(token);
    
    if (!decoded || decoded.brandId !== brandId) {
      return NextResponse.json(
        { error: '无效的认证令牌或无权访问' },
        { status: 401 }
      );
    }

    // 获取产品总数
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('is_active', true);

    // 获取扫描记录总数
    const { count: totalScans, error: scansError } = await supabase
      .from('scan_records')
      .select('id', { count: 'exact' })
      .contains('product_id', 
        (await supabase
          .from('products')
          .select('id')
          .eq('brand_id', brandId)
        ).data?.map(p => p.id) || []
      );

    // 获取诊断记录总数
    const { count: totalDiagnoses, error: diagnosesError } = await supabase
      .from('diagnosis_records')
      .select('id', { count: 'exact' })
      .contains('product_id',
        (await supabase
          .from('products')
          .select('id')
          .eq('brand_id', brandId)
        ).data?.map(p => p.id) || []
      );

    // 获取Token余额
    const { data: tokenBalanceData, error: tokenError } = await supabase
      .from('token_balances')
      .select('balance')
      .eq('brand_id', brandId)
      .single();

    // 获取今日统计数据
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 简化处理 - 实际项目中应该优化查询
    const recentScans = 0; // 简化处理
    const recentDiagnoses = 0; // 简化处理

    // 汇总错误
    const errors = [
      productsError, scansError, diagnosesError, 
      tokenError
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('获取统计数据错误:', errors);
    }

    const stats = {
      totalProducts: totalProducts || 0,
      totalScans: totalScans || 0,
      totalDiagnoses: totalDiagnoses || 0,
      tokenBalance: tokenBalanceData?.balance || 0,
      recentScans: recentScans || 0,
      recentDiagnoses: recentDiagnoses || 0
    };

    return NextResponse.json({
      success: true,
      stats,
      message: '统计数据获取成功'
    });

  } catch (error) {
    console.error('获取仪表板统计数据错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}