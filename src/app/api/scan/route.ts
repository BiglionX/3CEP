import { NextRequest, NextResponse } from 'next/server';

// 鎵爜钀藉湴椤甸噸瀹氬悜API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: '缂哄皯浜у搧ID鍙傛暟' }, { status: 400 });
    }

    // 楠岃瘉浜у搧ID鏍煎紡
    if (!productId.startsWith('prod_')) {
      return NextResponse.json({ error: '犳晥鐨勪骇鍝両D鏍煎紡' }, { status: 400 });
    }

    // 杩斿洖鎵爜椤甸潰URL
    const redirectUrl = `/scanid=${productId}`;

    return NextResponse.json({
      success: true,
      redirectUrl,
      productId,
      message: '閲嶅畾鍚戝埌鎵爜钀藉湴,
    });
  } catch (error) {
    console.error('鎵爜閲嶅畾鍚戦敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

