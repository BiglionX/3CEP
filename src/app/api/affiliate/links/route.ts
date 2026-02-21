import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/affiliate/links - 获取配件的联盟链接
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partName = searchParams.get('partName');
    const partId = searchParams.get('partId');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '5');

    // 构建查询
    let query = supabase
      .from('part_affiliate_links')
      .select(`
        *,
        part_affiliate_mappings!left(*)
      `)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(limit);

    // 添加过滤条件
    if (partName) {
      query = query.ilike('part_name', `%${partName}%`);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取联盟链接失败:', error);
      return NextResponse.json(
        { error: '获取联盟链接失败' },
        { status: 500 }
      );
    }

    // 处理关联数据
    const processedLinks = data?.map(link => ({
      ...link,
      part_mappings: link.part_affiliate_mappings || []
    })) || [];

    return NextResponse.json({
      links: processedLinks,
      count: processedLinks.length
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// POST /api/affiliate/links - 生成带追踪参数的购买链接
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partName, partId, platform, utmSource, utmMedium, utmCampaign } = body;

    // 参数验证
    if (!partName) {
      return NextResponse.json(
        { error: '缺少必要参数: partName' },
        { status: 400 }
      );
    }

    // 查找匹配的联盟链接
    let query = supabase
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
      console.error('查询联盟链接失败:', linkError);
      return NextResponse.json(
        { error: '查询联盟链接失败' },
        { status: 500 }
      );
    }

    if (!affiliateLinks || affiliateLinks.length === 0) {
      return NextResponse.json(
        { 
          error: '未找到匹配的联盟链接',
          availableParts: await getAvailableParts()
        },
        { status: 404 }
      );
    }

    const affiliateLink = affiliateLinks[0];

    // 生成带追踪参数的最终链接
    const trackingParams = {
      utm_source: utmSource || 'fixcycle',
      utm_medium: utmMedium || 'affiliate',
      utm_campaign: utmCampaign || 'tutorial_purchase',
      fc_timestamp: Date.now().toString(),
      fc_part: encodeURIComponent(partName)
    };

    // 如果提供了具体的商品ID，替换模板中的占位符
    let finalUrl = affiliateLink.template_url;
    if (body.productId) {
      finalUrl = finalUrl.replace('{product_id}', body.productId);
    }

    // 添加追踪参数
    const url = new URL(finalUrl);
    Object.entries(trackingParams).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    // 记录点击追踪（异步）
    recordClickTracking(affiliateLink.id, partId, request, trackingParams);

    return NextResponse.json({
      success: true,
      data: {
        originalLink: affiliateLink,
        finalUrl: url.toString(),
        trackingParams,
        platform: affiliateLink.platform,
        partName
      }
    });

  } catch (error) {
    console.error('生成联盟链接错误:', error);
    return NextResponse.json(
      { error: '生成联盟链接失败' },
      { status: 500 }
    );
  }
}

// 异步记录点击追踪
async function recordClickTracking(
  affiliateLinkId: string,
  partId: string | null,
  request: Request,
  trackingParams: Record<string, string>
) {
  try {
    const headers = request.headers;
    const ipAddress = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';
    const userAgent = headers.get('user-agent') || '';
    const referrer = headers.get('referer') || '';

    // 解析UTM参数
    const utmSource = trackingParams.utm_source || '';
    const utmMedium = trackingParams.utm_medium || '';
    const utmCampaign = trackingParams.utm_campaign || '';

    await supabase
      .from('affiliate_click_tracking')
      .insert({
        affiliate_link_id: affiliateLinkId,
        part_id: partId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        campaign_id: utmCampaign
      });

  } catch (error) {
    console.error('记录点击追踪失败:', error);
    // 不影响主流程，静默处理
  }
}

// 获取可用的配件列表
async function getAvailableParts(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('part_affiliate_links')
      .select('part_name')
      .eq('is_active', true)
      .order('part_name');

    if (error) {
      console.error('获取配件列表失败:', error);
      return [];
    }

    // 去重并返回配件名称
    const partNames = [...new Set(data?.map(item => item.part_name) || [])];
    return partNames;

  } catch (error) {
    console.error('获取配件列表错误:', error);
    return [];
  }
}