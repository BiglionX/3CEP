/**
 * 浼佷笟璁㈤槄绠＄悊API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩? */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 妯℃嫙浼佷笟璁㈤槄鏁版嵁
const mockEnterpriseSubscriptions = [
  {
    id: 'sub-enterprise-001',
    user_id: 'user-1',
    company_name: '绉戞妧鏈夐檺鍏徃',
    plan: 'enterprise',
    status: 'active',
    member_count: 25,
    max_members: 50,
    token_budget: 10000,
    used_tokens: 6247,
    remaining_tokens: 3753,
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    auto_renew: true,
    billing_cycle: 'annual',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-03-01T15:30:00Z',
  },
];

// 妯℃嫙鍥㈤槦鏁版嵁
const mockTeams = [
  {
    id: 'team-sales',
    subscription_id: 'sub-enterprise-001',
    name: '閿€鍞洟?,
    description: '璐熻矗瀹㈡埛寮€鍙戝拰閿€鍞笟?,
    members: 8,
    assigned_agents: ['agent-1', 'agent-4'],
    usage: 2156,
    budget: 3000,
    created_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 'team-procurement',
    subscription_id: 'sub-enterprise-001',
    name: '閲囪喘鍥㈤槦',
    description: '璐熻矗渚涘簲鍟嗙鐞嗗拰閲囪喘涓氬姟',
    members: 6,
    assigned_agents: ['agent-2'],
    usage: 1847,
    budget: 2500,
    created_at: '2026-01-20T09:15:00Z',
  },
  {
    id: 'team-support',
    subscription_id: 'sub-enterprise-001',
    name: '瀹㈡湇鍥㈤槦',
    description: '璐熻矗瀹㈡埛鏈嶅姟鍜屾敮鎸佸伐?,
    members: 11,
    assigned_agents: ['agent-3', 'agent-5'],
    usage: 2244,
    budget: 4500,
    created_at: '2026-02-01T11:20:00Z',
  },
];

// 妯℃嫙鍥㈤槦鎴愬憳鏁版嵁
let mockTeamMembers = [
  {
    id: 'member-1',
    team_id: 'team-sales',
    user_id: 'user-2',
    name: '寮犵粡?,
    email: 'zhang.manager@company.com',
    role: 'admin',
    assigned_agents: ['agent-1', 'agent-2'],
    joined_date: '2026-01-15',
    last_active: '2026-03-01T14:30:00Z',
    status: 'active',
  },
  {
    id: 'member-2',
    team_id: 'team-procurement',
    user_id: 'user-3',
    name: '鏉庝富?,
    email: 'li.supervisor@company.com',
    role: 'member',
    assigned_agents: ['agent-3'],
    joined_date: '2026-01-20',
    last_active: '2026-03-01T11:15:00Z',
    status: 'active',
  },
  {
    id: 'member-3',
    team_id: 'team-support',
    user_id: 'user-4',
    name: '鐜嬩笓?,
    email: 'wang.specialist@company.com',
    role: 'member',
    assigned_agents: ['agent-1', 'agent-4'],
    joined_date: '2026-02-01',
    last_active: '2026-03-01T09:45:00Z',
    status: 'active',
  },
];

// 浼佷笟濂楅閰嶇疆
const enterprisePlans = [
  {
    id: 'starter',
    name: '鍏ラ棬?,
    price: 999,
    max_members: 10,
    token_budget: 1000,
    features: ['鍩虹鏅鸿兘?, '鍥㈤槦绠＄悊', '浣跨敤缁熻'],
  },
  {
    id: 'professional',
    name: '涓撲笟?,
    price: 2999,
    max_members: 30,
    token_budget: 5000,
    features: ['鍏ㄩ儴鏅鸿兘?, '楂樼骇鍒嗘瀽', 'API璁块棶', '浼樺厛鏀寔'],
  },
  {
    id: 'enterprise',
    name: '浼佷笟?,
    price: 9999,
    max_members: 100,
    token_budget: 20000,
    features: ['鏃犻檺鏅鸿兘?, '涓撳睘鏀寔', '瀹氬埗寮€?, 'SLA淇濋殰'],
  },
];

export async function GET(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈? },
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

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'subscription';

    switch (action) {
      case 'subscription':
        // 鑾峰彇浼佷笟璁㈤槄淇℃伅
        const subscription = mockEnterpriseSubscriptions.find(
          s => s.user_id === user.id
        );

        if (!subscription) {
          return NextResponse.json({
            success: true,
            data: null,
            message: '鏈壘鍒颁紒涓氳?,
          });
        }

        return NextResponse.json({
          success: true,
          data: subscription,
        });

      case 'plans':
        // 鑾峰彇浼佷笟濂楅鍒楄〃
        return NextResponse.json({
          success: true,
          data: enterprisePlans,
        });

      case 'teams':
        // 鑾峰彇鍥㈤槦鍒楄〃
        const subscriptionId = searchParams.get('subscription_id');
        if (!subscriptionId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯璁㈤槄ID鍙傛暟' },
            { status: 400 }
          );
        }

        const teams = mockTeams.filter(
          t => t.subscription_id === subscriptionId
        );
        return NextResponse.json({
          success: true,
          data: teams,
        });

      case 'members':
        // 鑾峰彇鍥㈤槦鎴愬憳鍒楄〃
        const teamId = searchParams.get('team_id');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        let members = teamId
          ? mockTeamMembers.filter(m => m.team_id === teamId)
          : mockTeamMembers;

        // 鎼滅储杩囨护
        if (search) {
          members = members.filter(
            m =>
              m.name.toLowerCase().includes(search.toLowerCase()) ||
              m.email.toLowerCase().includes(search.toLowerCase())
          );
        }

        // 鍒嗛〉
        const total = members.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMembers = members.slice(startIndex, endIndex);

        return NextResponse.json({
          success: true,
          data: paginatedMembers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });

      case 'usage':
        // 鑾峰彇浣跨敤缁熻
        const usageStats = {
          daily_usage: [120, 156, 98, 203, 178, 245, 189],
          monthly_total: 6247,
          peak_usage_day: '2026-02-28',
          average_daily_usage: 208,
          forecast_next_month: 6872,
          team_usage: mockTeams.map(team => ({
            team_id: team.id,
            team_name: team.name,
            usage: team.usage,
            budget: team.budget,
            percentage: (team.usage / team.budget) * 100,
          })),
        };

        return NextResponse.json({
          success: true,
          data: usageStats,
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('浼佷笟璁㈤槄API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
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
        { success: false, error: '鐢ㄦ埛鏈? },
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

    // 瑙ｆ瀽璇锋眰?    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'subscribe':
        // 鍒涘缓浼佷笟璁㈤槄
        const { plan_id, company_name, billing_cycle } = body;

        if (!plan_id || !company_name) {
          return NextResponse.json(
            { success: false, error: '濂楅ID鍜屽叕鍙稿悕绉颁负蹇呭～? },
            { status: 400 }
          );
        }

        const plan = enterprisePlans.find(p => p.id === plan_id);
        if (!plan) {
          return NextResponse.json(
            { success: false, error: '濂楅涓嶅瓨? },
            { status: 404 }
          );
        }

        // 妯℃嫙鏀粯澶勭悊
        // 鍦ㄥ疄闄呭疄鐜颁腑锛岃繖閲屼細闆嗘垚鐪熷疄鐨勬敮浠樼綉?
        const newSubscription = {
          id: `sub-${Date.now()}`,
          user_id: user.id,
          company_name,
          plan: plan_id,
          status: 'active',
          member_count: 1,
          max_members: plan.max_members,
          token_budget: plan.token_budget,
          used_tokens: 0,
          remaining_tokens: plan.token_budget,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 涓€骞村悗
          auto_renew: billing_cycle === 'annual',
          billing_cycle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockEnterpriseSubscriptions.push(newSubscription);

        return NextResponse.json(
          {
            success: true,
            message: '浼佷笟璁㈤槄鍒涘缓鎴愬姛',
            data: newSubscription,
          },
          { status: 201 }
        );

      case 'create_team':
        // 鍒涘缓鍥㈤槦
        const { subscription_id, name, description } = body;

        if (!subscription_id || !name) {
          return NextResponse.json(
            { success: false, error: '璁㈤槄ID鍜屽洟闃熷悕绉颁负蹇呭～? },
            { status: 400 }
          );
        }

        const subscriptionExists = mockEnterpriseSubscriptions.some(
          s => s.id === subscription_id && s.user_id === user.id
        );

        if (!subscriptionExists) {
          return NextResponse.json(
            { success: false, error: '璁㈤槄涓嶅瓨鍦ㄦ垨鏃犳潈? },
            { status: 404 }
          );
        }

        const newTeam = {
          id: `team-${Date.now()}`,
          subscription_id,
          name,
          description: description || '',
          members: 0,
          assigned_agents: [],
          usage: 0,
          budget: 0,
          created_at: new Date().toISOString(),
        };

        mockTeams.push(newTeam);

        return NextResponse.json(
          {
            success: true,
            message: '鍥㈤槦鍒涘缓鎴愬姛',
            data: newTeam,
          },
          { status: 201 }
        );

      case 'add_member':
        // 娣诲姞鍥㈤槦鎴愬憳
        const { team_id, email, role } = body;

        if (!team_id || !email) {
          return NextResponse.json(
            { success: false, error: '鍥㈤槦ID鍜岄偖绠变负蹇呭～? },
            { status: 400 }
          );
        }

        const team = mockTeams.find(t => t.id === team_id);
        if (!team) {
          return NextResponse.json(
            { success: false, error: '鍥㈤槦涓嶅瓨? },
            { status: 404 }
          );
        }

        // 妫€鏌ユ垚鍛樻暟閲忛檺?        const subscription = mockEnterpriseSubscriptions.find(
          s => s.id === team.subscription_id
        );

        if (
          subscription &&
          subscription.member_count >= subscription.max_members
        ) {
          return NextResponse.json(
            { success: false, error: '宸茶揪鍒版渶澶ф垚鍛樻暟閲忛檺? },
            { status: 400 }
          );
        }

        const newMember = {
          id: `member-${Date.now()}`,
          team_id,
          user_id: `user-${Date.now()}`, // 妯℃嫙鐢ㄦ埛ID
          name: email.split('@')[0], // 绠€鍗曠殑鐢ㄦ埛鍚嶆彁?          email,
          role: role || 'member',
          assigned_agents: [],
          joined_date: new Date().toISOString().split('T')[0],
          last_active: new Date().toISOString(),
          status: 'active',
        };

        mockTeamMembers.push(newMember);

        // 鏇存柊鍥㈤槦鎴愬憳?        if (subscription) {
          subscription.member_count += 1;
          subscription.updated_at = new Date().toISOString();
        }
        team.members += 1;

        return NextResponse.json(
          {
            success: true,
            message: '鎴愬憳娣诲姞鎴愬姛',
            data: newMember,
          },
          { status: 201 }
        );

      case 'assign_agent':
        // 鍒嗛厤鏅鸿兘浣撶粰鍥㈤槦鎴栨垚?        const { target_id, target_type, agent_ids } = body; // target_type: 'team' or 'member'

        if (
          !target_id ||
          !target_type ||
          !agent_ids ||
          !Array.isArray(agent_ids)
        ) {
          return NextResponse.json(
            { success: false, error: '鐩爣ID銆佺被鍨嬪拰鏅鸿兘浣揑D涓哄繀濉」' },
            { status: 400 }
          );
        }

        if (target_type === 'team') {
          const team = mockTeams.find(t => t.id === target_id);
          if (team) {
            team.assigned_agents = [
              ...new Set([...team.assigned_agents, ...agent_ids]),
            ];
          }
        } else if (target_type === 'member') {
          const member = mockTeamMembers.find(m => m.id === target_id);
          if (member) {
            member.assigned_agents = [
              ...new Set([...member.assigned_agents, ...agent_ids]),
            ];
          }
        }

        return NextResponse.json({
          success: true,
          message: '鏅鸿兘浣撳垎閰嶆垚?,
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('浼佷笟璁㈤槄鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈? },
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

    // 瑙ｆ瀽璇锋眰?    const body = await request.json();
    const { action, id } = body;

    switch (action) {
      case 'update_subscription':
        // 鏇存柊璁㈤槄璁剧疆
        const subscription = mockEnterpriseSubscriptions.find(
          s => s.id === id && s.user_id === user.id
        );

        if (!subscription) {
          return NextResponse.json(
            { success: false, error: '璁㈤槄涓嶅瓨鍦ㄦ垨鏃犳潈? },
            { status: 404 }
          );
        }

        // 鏇存柊鍏佽鐨勫瓧?        if (body.auto_renew !== undefined) {
          subscription.auto_renew = body.auto_renew;
        }
        if (body.billing_cycle) {
          subscription.billing_cycle = body.billing_cycle;
        }

        subscription.updated_at = new Date().toISOString();

        return NextResponse.json({
          success: true,
          message: '璁㈤槄璁剧疆鏇存柊鎴愬姛',
          data: subscription,
        });

      case 'update_team':
        // 鏇存柊鍥㈤槦淇℃伅
        const team = mockTeams.find(t => t.id === id);
        if (!team) {
          return NextResponse.json(
            { success: false, error: '鍥㈤槦涓嶅瓨? },
            { status: 404 }
          );
        }

        if (body.name) team.name = body.name;
        if (body.description) team.description = body.description;
        if (body.budget) team.budget = body.budget;

        return NextResponse.json({
          success: true,
          message: '鍥㈤槦淇℃伅鏇存柊鎴愬姛',
        });

      case 'update_member':
        // 鏇存柊鎴愬憳淇℃伅
        const member = mockTeamMembers.find(m => m.id === id);
        if (!member) {
          return NextResponse.json(
            { success: false, error: '鎴愬憳涓嶅瓨? },
            { status: 404 }
          );
        }

        if (body.role) member.role = body.role;
        if (body.status) member.status = body.status;

        return NextResponse.json({
          success: true,
          message: '鎴愬憳淇℃伅鏇存柊鎴愬姛',
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('浼佷笟璁㈤槄鏇存柊澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈? },
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

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || '';
    const id = searchParams.get('id') || '';

    switch (action) {
      case 'team':
        // 鍒犻櫎鍥㈤槦
        const teamIndex = mockTeams.findIndex(t => t.id === id);
        if (teamIndex === -1) {
          return NextResponse.json(
            { success: false, error: '鍥㈤槦涓嶅瓨? },
            { status: 404 }
          );
        }

        // 鍒犻櫎鍥㈤槦鍙婂叾鎵€鏈夋垚?        mockTeams.splice(teamIndex, 1);
        mockTeamMembers = mockTeamMembers.filter(m => m.team_id !== id);

        return NextResponse.json({
          success: true,
          message: '鍥㈤槦鍒犻櫎鎴愬姛',
        });

      case 'member':
        // 鍒犻櫎鎴愬憳
        const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
        if (memberIndex === -1) {
          return NextResponse.json(
            { success: false, error: '鎴愬憳涓嶅瓨? },
            { status: 404 }
          );
        }

        // 鏇存柊鍥㈤槦鎴愬憳?        const member = mockTeamMembers[memberIndex];
        const team = mockTeams.find(t => t.id === member.team_id);
        if (team) {
          team.members = Math.max(0, team.members - 1);
        }

        const subscription = mockEnterpriseSubscriptions.find(
          s => s.id === (team?.subscription_id || '')
        );
        if (subscription) {
          subscription.member_count = Math.max(
            0,
            subscription.member_count - 1
          );
          subscription.updated_at = new Date().toISOString();
        }

        mockTeamMembers.splice(memberIndex, 1);

        return NextResponse.json({
          success: true,
          message: '鎴愬憳鍒犻櫎鎴愬姛',
        });

      default:
        return NextResponse.json(
          { success: false, error: '鏃犳晥鐨勬搷浣滅被? },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('浼佷笟璁㈤槄鍒犻櫎澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

