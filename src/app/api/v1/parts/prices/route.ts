import { cacheManager, generateCacheKey } from '@/tech/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 閰嶄欢浠锋牸鎵归噺鏌ヨ鍜屽疄鏃舵洿?export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { part_ids, refresh = false } = body;

    if (!part_ids || !Array.isArray(part_ids) || part_ids.length === 0) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缂哄皯閰嶄欢ID鍒楄〃',
          data: null,
        },
        { status: 400 }
      );
    }

    // 闄愬埗鎵归噺鏌ヨ鏁伴噺
    if (part_ids.length > 50) {
      return NextResponse.json(
        {
          code: 40001,
          message: '鍗曟鏌ヨ閰嶄欢鏁伴噺涓嶈兘瓒呰繃50锟?,
          data: null,
        },
        { status: 400 }
      );
    }

    const results = [];

    // 鎵归噺鏌ヨ閰嶄欢浠锋牸
    for (const partId of part_ids) {
      try {
        let priceData = null;

        if (refresh) {
          // 寮哄埗鍒锋柊 - 璋冪敤鐖櫕鏈嶅姟
          priceData = await fetchRealTimePrice(partId);
        } else {
          // 浼樺厛浣跨敤缂撳瓨鏁版嵁
          priceData = await getCachedPrice(partId);

          // 濡傛灉缂撳瓨杩囨湡鎴栦笉瀛樺湪锛屽垯鑾峰彇瀹炴椂鏁版嵁
          if (!priceData || isCacheExpired(priceData.updated_at)) {
            priceData = await fetchRealTimePrice(partId);
          }
        }

        results.push({
          part_id: partId,
          ...priceData,
        });
      } catch (error) {
        console.warn(`鑾峰彇閰嶄欢 ${partId} 浠锋牸澶辫触:`, error);
        // 杩斿洖榛樿鏁版嵁鑰屼笉鏄け?        results.push({
          part_id: partId,
          name: '鏈煡閰嶄欢',
          current_price: 0,
          lowest_price: 0,
          prices: [],
          platforms: [],
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      code: 0,
      message: 'ok',
      data: results,
      refreshed: refresh,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('閰嶄欢浠锋牸API閿欒:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        data: null,
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇缂撳瓨浠锋牸鏁版嵁
async function getCachedPrice(partId: string) {
  try {
    // 鐢熸垚缂撳瓨?    const cacheKey = generateCacheKey('part_price', partId);

    // 灏濊瘯浠嶳edis鑾峰彇
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log(`馃摝 Redis缂撳瓨鍛戒腑: ${partId}`);
      return cached;
    }

    // 浠庢暟鎹簱鑾峰彇
    const { data, error } = await supabase
      .from('part_prices_cache')
      .select('*')
      .eq('part_id', partId)
      .single();

    if (error) {
      return null;
    }

    const result = {
      name: data.part_name,
      current_price: data.current_price,
      lowest_price: data.lowest_price,
      prices: data.price_details || [],
      platforms: data.platforms || [],
      updated_at: data.updated_at,
    };

    // 瀛樺叆Redis缂撳瓨
    await cacheManager.set(cacheKey, result, 3600); // 1灏忔椂缂撳瓨

    return result;
  } catch (error) {
    console.warn('鑾峰彇缂撳瓨浠锋牸澶辫触:', error);
    return null;
  }
}

// 鑾峰彇瀹炴椂浠锋牸鏁版嵁
async function fetchRealTimePrice(partId: string) {
  try {
    // 鑾峰彇閰嶄欢鍩烘湰淇℃伅
    const { data: partInfo, error: partError } = await supabase
      .from('parts')
      .select('name, brand, model')
      .eq('id', partId)
      .single();

    if (partError || !partInfo) {
      throw new Error('閰嶄欢淇℃伅涓嶅瓨?);
    }

    // 妯℃嫙浠庡涓數鍟嗗钩鍙拌幏鍙栦环?    const platforms = ['娣樺疂', '浜笢', '鎷煎?, '澶╃尗'];
    const prices = [];
    let lowestPrice = Infinity;

    for (const platform of platforms) {
      // 妯℃嫙浠锋牸鑾峰彇 - 瀹為檯搴旇璋冪敤鐪熷疄鐨勭數鍟嗗钩鍙癆PI
      const simulatedPrice = simulatePriceFetch(partInfo.name, platform);

      if (simulatedPrice > 0) {
        prices.push({
          platform,
          price: simulatedPrice,
          url: `https://${platform.toLowerCase()}.com/search?q=${encodeURIComponent(
            partInfo.name
          )}`,
          seller: `${platform}瀹樻柟鏃楄埌搴梎,
          is_authorized: platform === '澶╃尗' || platform === '浜笢',
        });

        if (simulatedPrice < lowestPrice) {
          lowestPrice = simulatedPrice;
        }
      }
    }

    // 鎺掑簭浠锋牸锛堜粠浣庡埌楂橈級
    prices.sort((a, b) => a.price - b.price);

    const result = {
      name: partInfo.name,
      current_price: prices.length > 0 ? prices[0].price : 0,
      lowest_price: lowestPrice === Infinity ? 0 : lowestPrice,
      prices,
      platforms: prices.map(p => p.platform),
      updated_at: new Date().toISOString(),
    };

    // 鏇存柊缂撳瓨
    await updatePriceCache(partId, partInfo.name, result);

    return result;
  } catch (error) {
    console.error('鑾峰彇瀹炴椂浠锋牸澶辫触:', error);
    throw error;
  }
}

// 妯℃嫙浠锋牸鑾峰彇鍑芥暟
function simulatePriceFetch(partName: string, platform: string): number {
  // 鍩轰簬閰嶄欢鍚嶇О鐢熸垚妯℃嫙浠锋牸
  const basePrice =
    (Math.abs(
      partName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) %
      1000) +
    100;

  // 涓嶅悓骞冲彴鐨勪环鏍煎樊?  const platformMultipliers = {
    娣樺疂: 0.95,
    浜笢: 1.05,
    鎷煎? 0.85,
    澶╃尗: 1.02,
  };

  const multiplier =
    platformMultipliers[platform as keyof typeof platformMultipliers] || 1;
  const variation = (Math.random() - 0.5) * 0.2; // 卤10% 娉㈠姩

  return Math.round(basePrice * multiplier * (1 + variation));
}

// 鏇存柊浠锋牸缂撳瓨
async function updatePriceCache(
  partId: string,
  partName: string,
  priceData: any
) {
  try {
    // 鏇存柊鏁版嵁搴撶紦?    const { error } = await supabase.from('part_prices_cache').upsert(
      {
        part_id: partId,
        part_name: partName,
        current_price: priceData.current_price,
        lowest_price: priceData.lowest_price,
        price_details: priceData.prices,
        platforms: priceData.platforms,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'part_id',
      }
    );

    if (error) {
      console.warn('鏇存柊鏁版嵁搴撲环鏍肩紦瀛樺け?', error);
    }

    // 鏇存柊Redis缂撳瓨
    const cacheKey = generateCacheKey('part_price', partId);
    await cacheManager.set(cacheKey, priceData, 3600);

    // 璁板綍缂撳瓨鏇存柊鏃ュ織
    console.log(`馃捑 浠锋牸缂撳瓨宸叉洿? ${partId}`);
  } catch (error) {
    console.warn('鏇存柊浠锋牸缂撳瓨寮傚父:', error);
  }
}

// 妫€鏌ョ紦瀛樻槸鍚﹁繃?(1灏忔椂)
function isCacheExpired(updatedAt: string): boolean {
  const updateTime = new Date(updatedAt).getTime();
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000;

  return currentTime - updateTime > oneHour;
}

