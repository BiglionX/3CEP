import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'generate_report':
        // 浣跨敤鐜版湁鐨刧enerateMarketIntelligenceReport鏂规硶
        const { data, error } = await supabase
          .from('market_intelligence_reports')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(`鏌ヨ鏈€鏂版姤鍛婂け? ${error.message}`);
        }

        return NextResponse.json({
          success: true,
          report: data || null,
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('甯傚満鎯呮姤API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const commodity = searchParams.get('commodity');
    const region = searchParams.get('region');

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'latest_report':
        const { data: latestData, error: latestError } = await supabase
          .from('market_intelligence_reports')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (latestError && latestError.code !== 'PGRST116') {
          throw new Error(`鏌ヨ鏈€鏂版姤鍛婂け? ${latestError.message}`);
        }

        return NextResponse.json({
          success: true,
          report: latestData || null,
        });

      case 'price_indices':
        // 鏌ヨ浠锋牸鎸囨暟鏁版嵁
        const { data: indicesData, error: indicesError } = await supabase
          .from('international_price_indices')
          .select('*')
          .limit(50);

        if (indicesError) {
          throw new Error(`鏌ヨ浠锋牸鎸囨暟澶辫触: ${indicesError.message}`);
        }

        return NextResponse.json({
          success: true,
          priceIndices: indicesData || [],
        });

      case 'supply_demand':
        if (!commodity) {
          return NextResponse.json(
            { success: false, error: '缂哄皯commodity鍙傛暟' },
            { status: 400 }
          );
        }
        // 杩斿洖妯℃嫙鐨勪緵闇€鍒嗘瀽鏁版嵁
        return NextResponse.json({
          success: true,
          analysis: {
            commodity,
            region: region || 'global',
            supply_level: 'balanced',
            demand_level: 'moderate',
            supply_demand_ratio: 1.2,
            market_pressure: 'neutral',
            key_insights: ['渚涢渶鍩烘湰骞宠　', '浠锋牸璧板娍绋冲畾', '甯傚満鎯呯华涓?],
          },
        });

      case 'health_check':
        return NextResponse.json({
          success: true,
          message: '甯傚満鎯呮姤鏈嶅姟杩愯姝ｅ父',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('甯傚満鎯呮姤GET API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

