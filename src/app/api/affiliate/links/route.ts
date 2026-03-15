import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/affiliate/links - 鑾峰彇閰嶄欢鐨勮仈鐩熼摼export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partName = searchParams.get('partName');
    const partId = searchParams.get('partId');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '5');

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('part_affiliate_links')
      .select(
        `
        *,
        part_affiliate_mappings!left(*)
      `
      )
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(limit);

    // 娣诲姞杩囨护鏉′欢
    if (partName) {
      query = query.ilike('part_name', `%${partName}%`);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error('鑾峰彇鑱旂洘炬帴澶辫触:', error);
      return NextResponse.json({ error: '鑾峰彇鑱旂洘炬帴澶辫触' }, { status: 500 });
    }

    // 澶勭悊鍏宠仈鏁版嵁
    const processedLinks =
      data.map(link => ({
        ...link,
        part_mappings: link.part_affiliate_mappings || [],
      })) || [];

    return NextResponse.json({
      links: processedLinks,
      count: processedLinks.length,
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// POST /api/affiliate/links - 鐢熸垚甯﹁拷韪弬鏁扮殑璐拱炬帴
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partName, partId, platform, utmSource, utmMedium, utmCampaign } =
      body;

    // 鍙傛暟楠岃瘉
    if (!partName) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: partName' },
        { status: 400 }
      );
    }

    // 鏌ユ壘鍖归厤鐨勮仈鐩熼摼    let query = supabase
      .from('part_affiliate_links')
      .select('*')
      .eq('is_active', true)
      .ilike('part_name', `%${partName}%`)
      .order('priority', { ascending: false })
      .limit(1);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: affiliateLinks, error: linkError } = await query;

    if (linkError) {
      console.error('鏌ヨ鑱旂洘炬帴澶辫触:', linkError);
      return NextResponse.json({ error: '鏌ヨ鑱旂洘炬帴澶辫触' }, { status: 500 });
    }

    if (!affiliateLinks || affiliateLinks.length === 0) {
      return NextResponse.json(
        {
          error: '鏈壘鍒板尮閰嶇殑鑱旂洘炬帴',
          availableParts: await getAvailableParts(),
        },
        { status: 404 }
      );
    }

    const affiliateLink = affiliateLinks[0];

    // 鐢熸垚甯﹁拷韪弬鏁扮殑鏈€缁堥摼    const trackingParams = {
      utm_source: utmSource || 'fixcycle',
      utm_medium: utmMedium || 'affiliate',
      utm_campaign: utmCampaign || 'tutorial_purchase',
      fc_timestamp: Date.now().toString(),
      fc_part: encodeURIComponent(partName),
    };

    // 濡傛灉鎻愪緵浜嗗叿浣撶殑鍟嗗搧ID锛屾浛鎹㈡ā鏉夸腑鐨勫崰浣嶇
    let finalUrl = affiliateLink.template_url;
    if (body.productId) {
      finalUrl = finalUrl.replace('{product_id}', body.productId);
    }

    // 娣诲姞杩借釜鍙傛暟
    const url = new URL(finalUrl);
    Object.entries(trackingParams).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    // 璁板綍鐐瑰嚮杩借釜锛堝紓姝ワ級
    recordClickTracking(affiliateLink.id, partId, request, trackingParams);

    return NextResponse.json({
      success: true,
      data: {
        originalLink: affiliateLink,
        finalUrl: url.toString(),
        trackingParams,
        platform: affiliateLink.platform,
        partName,
      },
    });
  } catch (error) {
    console.error('鐢熸垚鑱旂洘炬帴閿欒:', error);
    return NextResponse.json({ error: '鐢熸垚鑱旂洘炬帴澶辫触' }, { status: 500 });
  }
}

// 寮傛璁板綍鐐瑰嚮杩借釜
async function recordClickTracking(
  affiliateLinkId: string,
  partId: string | null,
  request: Request,
  trackingParams: Record<string, string>
) {
  try {
    const headers = request.headers;
    const ipAddress =
      headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
    const userAgent = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || '';

    // 瑙ｆ瀽UTM鍙傛暟
    const utmSource = trackingParams.utm_source || '';
    const utmMedium = trackingParams.utm_medium || '';
    const utmCampaign = trackingParams.utm_campaign || '';

    await supabase.from('affiliate_click_tracking').insert({
      affiliate_link_id: affiliateLinkId,
      part_id: partId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      campaign_id: utmCampaign,
    } as any);
  } catch (error) {
    console.error('璁板綍鐐瑰嚮杩借釜澶辫触:', error);
    // 涓嶅奖鍝嶄富娴佺▼锛岄潤榛樺  }
}

// 鑾峰彇鍙敤鐨勯厤跺垪async function getAvailableParts(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('part_affiliate_links')
      .select('part_name')
      .eq('is_active', true)
      .order('part_name');

    if (error) {
      console.error('鑾峰彇閰嶄欢鍒楄〃澶辫触:', error);
      return [];
    }

    // 鍘婚噸骞惰繑鍥為厤跺悕    const partNames = [...new Set(data.map(item => item.part_name) || [])];
    return partNames;
  } catch (error) {
    console.error('鑾峰彇閰嶄欢鍒楄〃閿欒:', error);
    return [];
  }
}

