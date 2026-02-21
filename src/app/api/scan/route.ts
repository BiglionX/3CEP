import { NextRequest, NextResponse } from 'next/server';

// 扫码落地页重定向API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      return NextResponse.json(
        { error: '缺少产品ID参数' },
        { status: 400 }
      );
    }

    // 验证产品ID格式
    if (!productId.startsWith('prod_')) {
      return NextResponse.json(
        { error: '无效的产品ID格式' },
        { status: 400 }
      );
    }

    // 返回扫码页面URL
    const redirectUrl = `/scan?id=${productId}`;
    
    return NextResponse.json({
      success: true,
      redirectUrl,
      productId,
      message: '重定向到扫码落地页'
    });

  } catch (error) {
    console.error('扫码重定向错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}