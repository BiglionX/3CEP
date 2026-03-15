import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 绠€鍖栫殑Token鐢熸垚锛堝疄闄呴」鐩腑搴斾娇鐢↗WT搴擄級
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

// 鍝佺墝鍟嗙櫥褰旳PI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, apiKey } = body;

    // 楠岃瘉杈撳叆鍙傛暟
    if (!email && !apiKey) {
      return NextResponse.json(
        { error: '璇彁渚涢偖绠卞瘑鐮佹垨API Key' },
        { status: 400 }
      );
    }

    let brand;

    if (email && password) {
      // 瀵嗙爜鐧诲綍
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('contact_email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: '鎴栧瘑鐮侀敊 }, { status: 401 });
      }

      // 杩欓噷搴旇楠岃瘉瀵嗙爜锛岀畝鍖栧      // 瀹為檯椤圭洰涓簲璇ヤ娇鐢╞crypt绛夊姞瀵嗗簱
      brand = data;
    } else if (apiKey) {
      // API Key鐧诲綍
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('api_key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: '犳晥鐨凙PI Key' }, { status: 401 });
      }

      brand = data;
    }

    // 鐢熸垚绠€鍖朤oken
    const token = generateSimpleToken(brand.id);

    // 闅愯棌鏁忔劅淇℃伅
    const { api_key, ...brandInfo } = brand;

    return NextResponse.json({
      success: true,
      token,
      brand: brandInfo,
      message: '鐧诲綍鎴愬姛',
    });
  } catch (error) {
    console.error('鍝佺墝鍟嗙櫥褰曢敊', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// 楠岃瘉Token涓棿export async function authenticateBrand(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: '缂哄皯璁よ瘉ょ墝', status: 401 };
    }

    const token = authHeader.substring(7);
    const decoded = verifySimpleToken(token);

    if (!decoded) {
      return { error: '犳晥鐨勮璇佷护, status: 401 };
    }

    return { brandId: decoded.brandId };
  } catch (error) {
    return { error: '璁よ瘉澶辫触', status: 500 };
  }
}

