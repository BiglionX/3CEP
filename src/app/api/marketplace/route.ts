/**
 * 鏅鸿兘浣撳競API 璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 妯℃嫙鏁版嵁 - 瀹為檯寮€鍙戜腑杩炴帴鐪熷疄鏁版嵁const mockMarketplaceAgents = [
  {
    id: '1',
    name: '閿€鍞姪鎵嬫櫤鑳戒綋',
    description: '涓撲笟鐨勯攢鍞璇濆姪鎵嬶紝鑳藉鑷姩璺熻繘瀹㈡埛銆佺敓鎴愭姤峰崟鍜屽悎,
    category: 'sales',
    version: '2.1.0',
    price: 99.99,
    token_cost_per_use: 0.5,
    rating: 4.8,
    download_count: 1250,
    developer_id: 'dev-001',
    developer: {
      name: 'AI Solutions Inc.',
      avatar: '',
      verified: true,
    },
    tags: ['閿€, 'CRM', '鑷姩],
    featured: true,
    status: 'published',
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-02-28T14:22:00Z',
  },
  {
    id: '2',
    name: '閲囪喘鏅鸿兘,
    description: '鏅鸿兘閲囪喘鍐崇瓥鍔╂墜锛屾敮鎸佷緵搴斿晢姣斾环銆侀闄╄瘎板拰鍚堝悓绠＄悊',
    category: 'procurement',
    version: '1.5.2',
    price: 149.99,
    token_cost_per_use: 0.8,
    rating: 4.6,
    download_count: 890,
    developer_id: 'dev-002',
    developer: {
      name: 'Procurement Pro',
      avatar: '',
      verified: true,
    },
    tags: ['閲囪喘', '渚涘簲, '鎴愭湰樺寲'],
    featured: true,
    status: 'published',
    created_at: '2026-01-20T09:15:00Z',
    updated_at: '2026-02-25T16:45:00Z',
  },
  {
    id: '3',
    name: '瀹㈡湇鏀寔鏈哄櫒,
    description: '24/7鏅鸿兘瀹㈡湇鏀寔锛屾敮鎸佸璇█銆佹儏缁瘑鍒拰闂鍗囩骇',
    category: 'support',
    version: '3.0.1',
    price: 79.99,
    token_cost_per_use: 0.3,
    rating: 4.9,
    download_count: 2100,
    developer_id: 'dev-003',
    developer: {
      name: 'Customer Care AI',
      avatar: '',
      verified: false,
    },
    tags: ['瀹㈡湇', '鏀寔', '澶氳瑷€'],
    featured: false,
    status: 'published',
    created_at: '2026-02-01T11:20:00Z',
    updated_at: '2026-02-29T09:30:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'featured';
    const featuredOnly = searchParams.get('featured') === 'true';

    // 杩囨护鏁版嵁
    let filteredAgents = [...mockMarketplaceAgents];

    // 鍒嗙被杩囨护
    if (category !== 'all') {
      filteredAgents = filteredAgents.filter(
        agent => agent.category === category
      );
    }

    // 鎼滅储杩囨护
    if (search) {
      filteredAgents = filteredAgents.filter(
        agent =>
          agent.name.toLowerCase().includes(search.toLowerCase()) ||
          agent.description.toLowerCase().includes(search.toLowerCase()) ||
          agent.tags.some(tag =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    // 绮鹃€夎繃    if (featuredOnly) {
      filteredAgents = filteredAgents.filter(agent => agent.featured);
    }

    // 鎺掑簭
    filteredAgents.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.download_count - a.download_count;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default: // featured
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
      }
    });

    // 鍒嗛〉
    const total = filteredAgents.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedAgents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        category,
        search,
        sortBy,
        featuredOnly,
      },
    });
  } catch (error: any) {
    console.error('鑾峰彇甯傚満鏅鸿兘浣撳け', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鏅鸿兘浣撳垪琛ㄥけ,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛璁よ瘉澶辫触' },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽璇眰    const body = await request.json();

    // 楠岃瘉蹇呰瀛楁
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: '鏅鸿兘浣撳悕绉般€佹弿杩板拰鍒嗙被涓哄繀濉」',
        },
        { status: 400 }
      );
    }

    // 鍒涘缓鏂扮殑甯傚満鏅鸿兘浣擄紙妯℃嫙    const newAgent = {
      id: `agent-${Date.now()}`,
      name: body.name.trim(),
      description: body.description.trim(),
      category: body.category,
      version: body.version || '1.0.0',
      price: body.price || 0,
      token_cost_per_use: body.token_cost_per_use || 0,
      rating: 0,
      download_count: 0,
      developer_id: user.id,
      developer: {
        name: body.developer_name || '鍖垮悕寮€鍙,
        avatar: '',
        verified: false,
      },
      tags: body.tags || [],
      featured: false,
      status: 'pending', // 寰呭鏍哥姸      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 鍦ㄥ疄闄呭疄鐜颁腑锛岃繖閲屼細淇濆鍒版暟鎹簱
    // await supabase.from('agent_marketplace').insert(newAgent);

    return NextResponse.json(
      {
        success: true,
        message: '鏅鸿兘浣撴彁浜ゆ垚鍔燂紝绛夊緟瀹℃牳',
        data: newAgent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('鍒涘缓甯傚満鏅鸿兘浣撳け', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

