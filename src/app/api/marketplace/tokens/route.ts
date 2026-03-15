/**
 * Token缁忔祹绯荤粺API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 妯℃嫙Token浣欓鏁版嵁
const mockTokenBalances = [
  {
    user_id: 'user-1',
    total_balance: 1250.5,
    available_balance: 1120.3,
    frozen_balance: 130.2,
    today_earnings: 45.8,
    monthly_earnings: 342.6,
    created_at: '2026-01-15T10:30:00Z',
    updated_at: '2026-03-01T15:30:00Z',
  },
];

// 妯℃嫙Token浜ゆ槗璁板綍
const mockTokenTransactions = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    type: 'earning',
    amount: 12.5,
    balance_after: 1250.5,
    description: '閿€鍞姪鎵嬫櫤鑳戒綋浣跨敤鏀跺叆',
    related_agent_id: 'agent-1',
    related_agent_name: '閿€鍞姪鎵嬫櫤鑳戒綋',
    created_at: '2026-03-01T15:30:00Z',
    status: 'completed',
  },
  {
    id: 'tx-2',
    user_id: 'user-1',
    type: 'purchase',
    amount: -500,
    balance_after: 1238.0,
    description: '璐拱鏍囧噯(500 Tokens)',
    created_at: '2026-03-01T10:15:00Z',
    status: 'completed',
  },
  {
    id: 'tx-3',
    user_id: 'user-1',
    type: 'usage',
    amount: -2.3,
    balance_after: 1738.0,
    description: '閲囪喘鏅鸿兘浣撲娇鐢ㄦ秷,
    related_agent_id: 'agent-2',
    related_agent_name: '閲囪喘鏅鸿兘,
    created_at: '2026-03-01T09:45:00Z',
    status: 'completed',
  },
  {
    id: 'tx-4',
    user_id: 'user-1',
    type: 'earning',
    amount: 8.2,
    balance_after: 1740.3,
    description: '瀹㈡湇鏀寔鏈哄櫒浜轰娇鐢ㄦ敹,
    related_agent_id: 'agent-3',
    related_agent_name: '瀹㈡湇鏀寔鏈哄櫒,
    created_at: '2026-02-29T16:20:00Z',
    status: 'completed',
  },
];

// Token璐拱濂楅
const tokenPackages = [
  {
    id: 'pkg-1',
    name: '鍩虹,
    tokens: 100,
    price: 99,
    bonus_percentage: 0,
    popular: false,
  },
  {
    id: 'pkg-2',
    name: '鏍囧噯,
    tokens: 500,
    price: 449,
    bonus_percentage: 10,
    popular: true,
  },
  {
    id: 'pkg-3',
    name: '涓撲笟,
    tokens: 1200,
    price: 999,
    bonus_percentage: 20,
    popular: false,
  },
  {
    id: 'pkg-4',
    name: '佷笟,
    tokens: 3000,
    price: 2299,
    bonus_percentage: 30,
    popular: false,
  },
];

export async function GET(request: Request) {
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

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'balance';

    switch (action) {
      case 'balance':
        // 鑾峰彇鐢ㄦ埛Token浣欓
        const balance = mockTokenBalances.find(b => b.user_id === user.id) || {
          user_id: user.id,
          total_balance: 0,
          available_balance: 0,
          frozen_balance: 0,
          today_earnings: 0,
          monthly_earnings: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: balance,
        });

      case 'transactions':
        // 鑾峰彇浜ゆ槗璁板綍
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type') || 'all';
        const search = searchParams.get('search') || '';

        let transactions = mockTokenTransactions.filter(
          tx => tx.user_id === user.id
        );

        // 绫诲瀷杩囨护
        if (type !== 'all') {
          transactions = transactions.filter(tx => tx.type === type);
        }

        // 鎼滅储杩囨护
        if (search) {
          transactions = transactions.filter(
            tx =>
              tx.description.toLowerCase().includes(search.toLowerCase()) ||
              (tx.related_agent_name &&
                tx.related_agent_name
                  .toLowerCase()
                  .includes(search.toLowerCase()))
          );
        }

        // 鎺掑簭锛堟寜堕棿鍊掑簭        transactions.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // 鍒嗛〉
        const total = transactions.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTransactions = transactions.slice(startIndex, endIndex);

        return NextResponse.json({
          success: true,
          data: paginatedTransactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });

      case 'packages':
        // 鑾峰彇璐拱濂楅
        return NextResponse.json({
          success: true,
          data: tokenPackages,
        });

      default:
        return NextResponse.json(
          { success: false, error: '犳晥鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Token API閿欒:', error);
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
    const { action, package_id, amount } = body;

    switch (action) {
      case 'purchase':
        // 璐拱Token
        if (!package_id) {
          return NextResponse.json(
            { success: false, error: '璇烽€夋嫨璐拱濂楅' },
            { status: 400 }
          );
        }

        const selectedPackage = tokenPackages.find(p => p.id === package_id);
        if (!selectedPackage) {
          return NextResponse.json(
            { success: false, error: '濂楅涓嶅 },
            { status: 404 }
          );
        }

        // 妯℃嫙鏀粯澶勭悊
        // 鍦ㄥ疄闄呭疄鐜颁腑锛岃繖閲屼細闆嗘垚鐪熷疄鐨勬敮樼綉
        // 璁＄畻濂栧姳Token
        const bonusTokens = Math.floor(
          selectedPackage.tokens * (selectedPackage.bonus_percentage / 100)
        );
        const totalTokens = selectedPackage.tokens + bonusTokens;

        // 鏇存柊鐢ㄦ埛浣欓锛堟ā鎷燂級
        const userBalance = mockTokenBalances.find(b => b.user_id === user.id);
        if (userBalance) {
          userBalance.total_balance += totalTokens;
          userBalance.available_balance += totalTokens;
          userBalance.updated_at = new Date().toISOString();
        } else {
          mockTokenBalances.push({
            user_id: user.id,
            total_balance: totalTokens,
            available_balance: totalTokens,
            frozen_balance: 0,
            today_earnings: 0,
            monthly_earnings: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // 璁板綍浜ゆ槗
        const newTransaction = {
          id: `tx-${Date.now()}`,
          user_id: user.id,
          type: 'purchase',
          amount: -selectedPackage.tokens, // 璐熸暟琛ㄧず鏀嚭
          balance_after: userBalance  userBalance.total_balance : totalTokens,
          description: `璐拱${selectedPackage.name} (${selectedPackage.tokens} Tokens)`,
          created_at: new Date().toISOString(),
          status: 'completed',
        };

        mockTokenTransactions.unshift(newTransaction);

        return NextResponse.json(
          {
            success: true,
            message: 'Token璐拱鎴愬姛',
            data: {
              package: selectedPackage,
              bonus_tokens: bonusTokens,
              total_tokens: totalTokens,
              transaction: newTransaction,
            },
          },
          { status: 201 }
        );

      case 'consume':
        // 娑堣€桾oken锛堟櫤鑳戒綋浣跨敤        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: '娑堣€楁暟閲忓繀椤诲ぇ' },
            { status: 400 }
          );
        }

        const balance = mockTokenBalances.find(b => b.user_id === user.id);
        if (!balance || balance.available_balance < amount) {
          return NextResponse.json(
            { success: false, error: 'Token浣欓涓嶈冻' },
            { status: 400 }
          );
        }

        // 鎵ｉ櫎Token
        balance.available_balance -= amount;
        balance.total_balance -= amount;
        balance.updated_at = new Date().toISOString();

        // 璁板綍娑堣€椾氦        const consumeTransaction = {
          id: `tx-${Date.now()}`,
          user_id: user.id,
          type: 'usage',
          amount: -amount,
          balance_after: balance.total_balance,
          description: body.description || '鏅鸿兘浣撲娇鐢ㄦ秷,
          related_agent_id: body.agent_id,
          related_agent_name: body.agent_name,
          created_at: new Date().toISOString(),
          status: 'completed',
        };

        mockTokenTransactions.unshift(consumeTransaction);

        return NextResponse.json({
          success: true,
          message: 'Token娑堣€楁垚,
          data: {
            consumed_amount: amount,
            remaining_balance: balance.available_balance,
            transaction: consumeTransaction,
          },
        });

      case 'earn':
        // 鑾峰緱Token鏀跺叆锛堝紑鍙戣€呮敹鐩婏級
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: '鏀跺叆鏁伴噺蹇呴』澶т簬0' },
            { status: 400 }
          );
        }

        const earnerBalance = mockTokenBalances.find(
          b => b.user_id === user.id
        );
        if (earnerBalance) {
          earnerBalance.total_balance += amount;
          earnerBalance.available_balance += amount;
          earnerBalance.today_earnings += amount;
          earnerBalance.monthly_earnings += amount;
          earnerBalance.updated_at = new Date().toISOString();
        } else {
          mockTokenBalances.push({
            user_id: user.id,
            total_balance: amount,
            available_balance: amount,
            frozen_balance: 0,
            today_earnings: amount,
            monthly_earnings: amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // 璁板綍鏀跺叆浜ゆ槗
        const earnTransaction = {
          id: `tx-${Date.now()}`,
          user_id: user.id,
          type: 'earning',
          amount: amount,
          balance_after: earnerBalance  earnerBalance.total_balance : amount,
          description: body.description || '鏅鸿兘浣撲娇鐢ㄦ敹,
          related_agent_id: body.agent_id,
          related_agent_name: body.agent_name,
          created_at: new Date().toISOString(),
          status: 'completed',
        };

        mockTokenTransactions.unshift(earnTransaction);

        return NextResponse.json({
          success: true,
          message: 'Token鏀跺叆璁板綍鎴愬姛',
          data: {
            earned_amount: amount,
            total_balance: earnerBalance  earnerBalance.total_balance : amount,
            transaction: earnTransaction,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: '犳晥鐨勬搷浣滅被 },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Token鎿嶄綔澶辫触:', error);
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

