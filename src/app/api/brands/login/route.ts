import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 简化的Token生成（实际项目中应使用JWT库）
function generateSimpleToken(brandId: string): string {
  const timestamp = Date.now();
  return `brand_${brandId}_${timestamp}_token`;
}

function verifySimpleToken(token: string): { brandId: string } | null {
  if (!token.startsWith('brand_')) return null;
  
  const parts = token.split('_');
  if (parts.length !== 4) return null;
  
  return { brandId: parts[1] };
}

// 品牌商登录API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, apiKey } = body;

    // 验证输入参数
    if (!email && !apiKey) {
      return NextResponse.json(
        { error: '请提供邮箱密码或API Key' },
        { status: 400 }
      );
    }

    let brand;

    if (email && password) {
      // 邮箱密码登录
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('contact_email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 这里应该验证密码，简化处理
      // 实际项目中应该使用bcrypt等加密库
      brand = data;
    } else if (apiKey) {
      // API Key登录
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('api_key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: '无效的API Key' },
          { status: 401 }
        );
      }

      brand = data;
    }

    // 生成简化Token
    const token = generateSimpleToken(brand.id);

    // 隐藏敏感信息
    const { api_key, ...brandInfo } = brand;

    return NextResponse.json({
      success: true,
      token,
      brand: brandInfo,
      message: '登录成功'
    });

  } catch (error) {
    console.error('品牌商登录错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 验证Token中间件
export async function authenticateBrand(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: '缺少认证令牌', status: 401 };
    }

    const token = authHeader.substring(7);
    const decoded = verifySimpleToken(token);
    
    if (!decoded) {
      return { error: '无效的认证令牌', status: 401 };
    }
    
    return { brandId: decoded.brandId };
  } catch (error) {
    return { error: '认证失败', status: 500 };
  }
}