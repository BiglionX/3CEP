import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 瀵煎叆鐢ㄦ埛鏁版嵁鎺ュ彛
export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('importType') as string;

    if (!file) {
      return NextResponse.json(
        { error: '璇烽€夋嫨瑕佸鍏ョ殑鏂囦欢' },
        { status: 400 }
      );
    }

    // 妫€鏌ユ枃浠剁被?    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '鍙敮?CSV 锟?Excel 鏂囦欢鏍煎紡' },
        { status: 400 }
      );
    }

    // 妯℃嫙鏂囦欢澶勭悊
    console.log('瀵煎叆鏂囦欢:', file.name, '绫诲瀷:', importType);

    // 杩欓噷搴旇瑙ｆ瀽鏂囦欢鍐呭骞堕獙璇佹暟鎹牸?    // 涓轰簡婕旂ず锛屾垜浠繑鍥炴ā鎷熺殑鎴愬姛鍝嶅簲

    return NextResponse.json({
      success: true,
      message: '鐢ㄦ埛鏁版嵁瀵煎叆鎴愬姛',
      importedCount: 15,
      failedCount: 2,
      errors: ['锟?锟? 閭鏍煎紡涓嶆?, '锟?锟? 鐢ㄦ埛鍚嶅凡瀛樺湪'],
    });
  } catch (error) {
    console.error('瀵煎叆鐢ㄦ埛鏁版嵁澶辫触:', error);
    return NextResponse.json({ error: '瀵煎叆澶辫触' }, { status: 500 });
  }
}

