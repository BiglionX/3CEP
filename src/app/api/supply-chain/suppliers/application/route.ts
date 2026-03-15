/**
 * 渚涘簲鍟嗗叆椹荤敵璇稟PI
 */

import { NextResponse } from 'next/server';
// import { SupplierService } from '@/supply-chain'; // 鍚庣画瀹炵幇

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      contactPerson,
      phone,
      email,
      address,
      country,
      businessLicense,
      companyProfile,
    } = body;

    // 鍙傛暟楠岃瘉
    const requiredFields = [
      'name',
      'contactPerson',
      'phone',
      'email',
      'address',
      'country',
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `缂哄皯蹇呰鍙傛暟: ${field}` },
          { status: 400 }
        );
      }
    }

    // 楠岃瘉鏍煎紡
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '鏍煎紡涓嶆 }, { status: 400 });
    }

    // 楠岃瘉鎵嬫満鍙牸寮忥紙绠€鍗曢獙璇侊級
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: '鎵嬫満鍙牸寮忎笉姝ｇ‘' }, { status: 400 });
    }

    // 妯℃嫙渚涘簲鍟嗙敵璇峰鐞嗭紙瀹為檯搴旇璋冪敤SupplierService    const applicationId = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 妯℃嫙澶勭悊堕棿
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 妯℃嫙90%鐨勬垚鍔熺巼
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        data: {
          applicationId,
          status: 'pending_review',
          message: '渚涘簲鍟嗗叆椹荤敵璇峰凡鎻愪氦锛岃绛夊緟瀹℃牳',
        },
      });
    } else {
      return NextResponse.json(
        {
          error: '鐢宠鎻愪氦澶辫触',
          details: '绯荤粺绻佸繖锛岃绋嶅悗閲嶈瘯',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('渚涘簲鍟嗙敵璇烽敊', error);
    return NextResponse.json(
      {
        error: '鐢宠澶勭悊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

