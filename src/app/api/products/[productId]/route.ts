import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 获取单个产品信息
export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId;
    
    if (!productId) {
      return NextResponse.json(
        { error: '缺少产品ID参数' },
        { status: 400 }
      );
    }

    // 查询产品信息
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        model,
        category,
        qr_url,
        description,
        specifications,
        brand:brands (
          id,
          name,
          slug,
          logo_url,
          website_url
        ),
        manuals (
          id,
          title,
          language_codes,
          version,
          is_published,
          created_at
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('查询产品信息失败:', error);
      return NextResponse.json(
        { error: '产品未找到' },
        { status: 404 }
      );
    }

    // 记录扫描记录
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const countryCode = getUserCountryFromIP(ipAddress);

    await supabase
      .from('scan_records')
      .insert({
        product_id: product.id,
        user_agent: userAgent,
        ip_address: ipAddress,
        country_code: countryCode,
        scan_time: new Date().toISOString()
      } as any);

    return NextResponse.json({
      success: true,
      product,
      message: '产品信息获取成功'
    });

  } catch (error) {
    console.error('获取产品信息错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 更新产品信息
export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const productId = params.productId;
    const body = await request.json();
    const { updates } = body;

    if (!productId) {
      return NextResponse.json(
        { error: '缺少产品ID参数' },
        { status: 400 }
      );
    }

    // 验证更新字段
    const allowedFields = ['name', 'model', 'category', 'description', 'specifications'];
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {} as Record<string, any>);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: '没有有效的更新字段' },
        { status: 400 }
      );
    }

    // 更新产品信息
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', productId)
      .select(`
        id,
        name,
        model,
        category,
        description,
        specifications,
        brand:brands (
          id,
          name,
          slug
        )
      `)
      .single();

    if (error) {
      console.error('更新产品信息失败:', error);
      return NextResponse.json(
        { error: '产品更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: '产品信息更新成功'
    });

  } catch (error) {
    console.error('产品绑定错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 辅助函数：根据IP地址简单判断国家代码
function getUserCountryFromIP(ip: string): string {
  // 这是一个简化的实现，实际项目中应该使用专业的IP地理位置服务
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'LOCAL'; // 本地网络
  }
  
  // 简单的中国IP段判断（仅作示例）
  if (ip.startsWith('223.') || ip.startsWith('218.') || ip.startsWith('219.')) {
    return 'CN';
  }
  
  return 'OTHER'; // 其他地区
}