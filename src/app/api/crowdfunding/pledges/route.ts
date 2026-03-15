import { supabase } from '@/lib/supabase';
import { CrowdfundingPledgeService } from '@/services/crowdfunding/pledge-service';
import { NextResponse } from 'next/server';

// POST /api/crowdfunding/pledges - 鍒涘缓鏀寔璁板綍
export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const token = request.headers.get('authorization').replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '犳晥鐨勮璇佷护 }, { status: 401 });
    }

    const body = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    if (!body.project_id || !body.amount) {
      return NextResponse.json(
        { error: '缂哄皯蹇呴渶瀛楁: project_id amount' },
        { status: 400 }
      );
    }

    // 楠岃瘉閲戦
    if (body.amount <= 0) {
      return NextResponse.json({ error: '鏀寔閲戦蹇呴』澶т簬0' }, { status: 400 });
    }

    // 璁剧疆榛樿    const pledgeData = {
      project_id: body.project_id,
      amount: body.amount,
      pledge_type: body.pledge_type || 'reservation',
      reward_level: body.reward_level || null,
      shipping_address: body.shipping_address || {},
      contact_info: body.contact_info || {},
      payment_method: body.payment_method || null,
      notes: body.notes || null,
    };

    const pledge = await CrowdfundingPledgeService.createPledge(
      pledgeData,
      user.id
    );

    return NextResponse.json(pledge, { status: 201 });
  } catch (error: any) {
    console.error('鍒涘缓鏀寔璁板綍澶辫触:', error);
    return NextResponse.json(
      { error: error.message || '鍒涘缓鏀寔璁板綍澶辫触' },
      { status: 500 }
    );
  }
}

// GET /api/crowdfunding/pledges - 鑾峰彇鐢ㄦ埛鏀寔璁板綍
export async function GET(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const token = request.headers.get('authorization').replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '犳晥鐨勮璇佷护 }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await CrowdfundingPledgeService.getUserPledges(
      user.id,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('鑾峰彇鏀寔璁板綍澶辫触:', error);
    return NextResponse.json(
      { error: error.message || '鑾峰彇鏀寔璁板綍澶辫触' },
      { status: 500 }
    );
  }
}

