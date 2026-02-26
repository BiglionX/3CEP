import { cacheManager, generateCacheKey } from '@/utils/cache-manager';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 配件价格批量查询和实时更新
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { part_ids, refresh = false } = body;

    if (!part_ids || !Array.isArray(part_ids) || part_ids.length === 0) {
      return NextResponse.json(
        {
          code: 40001,
          message: '缺少配件ID列表',
          data: null,
        },
        { status: 400 }
      );
    }

    // 限制批量查询数量
    if (part_ids.length > 50) {
      return NextResponse.json(
        {
          code: 40001,
          message: '单次查询配件数量不能超过50个',
          data: null,
        },
        { status: 400 }
      );
    }

    const results = [];

    // 批量查询配件价格
    for (const partId of part_ids) {
      try {
        let priceData = null;

        if (refresh) {
          // 强制刷新 - 调用爬虫服务
          priceData = await fetchRealTimePrice(partId);
        } else {
          // 优先使用缓存数据
          priceData = await getCachedPrice(partId);

          // 如果缓存过期或不存在，则获取实时数据
          if (!priceData || isCacheExpired(priceData.updated_at)) {
            priceData = await fetchRealTimePrice(partId);
          }
        }

        results.push({
          part_id: partId,
          ...priceData,
        });
      } catch (error) {
        console.warn(`获取配件 ${partId} 价格失败:`, error);
        // 返回默认数据而不是失败
        results.push({
          part_id: partId,
          name: '未知配件',
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
    console.error('配件价格API错误:', error);
    return NextResponse.json(
      {
        code: 50001,
        message: '服务器内部错误',
        data: null,
      },
      { status: 500 }
    );
  }
}

// 获取缓存价格数据
async function getCachedPrice(partId: string) {
  try {
    // 生成缓存键
    const cacheKey = generateCacheKey('part_price', partId);

    // 尝试从Redis获取
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Redis缓存命中: ${partId}`);
      return cached;
    }

    // 从数据库获取
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

    // 存入Redis缓存
    await cacheManager.set(cacheKey, result, 3600); // 1小时缓存

    return result;
  } catch (error) {
    console.warn('获取缓存价格失败:', error);
    return null;
  }
}

// 获取实时价格数据
async function fetchRealTimePrice(partId: string) {
  try {
    // 获取配件基本信息
    const { data: partInfo, error: partError } = await supabase
      .from('parts')
      .select('name, brand, model')
      .eq('id', partId)
      .single();

    if (partError || !partInfo) {
      throw new Error('配件信息不存在');
    }

    // 模拟从多个电商平台获取价格
    const platforms = ['淘宝', '京东', '拼多多', '天猫'];
    const prices = [];
    let lowestPrice = Infinity;

    for (const platform of platforms) {
      // 模拟价格获取 - 实际应该调用真实的电商平台API
      const simulatedPrice = simulatePriceFetch(partInfo.name, platform);

      if (simulatedPrice > 0) {
        prices.push({
          platform,
          price: simulatedPrice,
          url: `https://${platform.toLowerCase()}.com/search?q=${encodeURIComponent(
            partInfo.name
          )}`,
          seller: `${platform}官方旗舰店`,
          is_authorized: platform === '天猫' || platform === '京东',
        });

        if (simulatedPrice < lowestPrice) {
          lowestPrice = simulatedPrice;
        }
      }
    }

    // 排序价格（从低到高）
    prices.sort((a, b) => a.price - b.price);

    const result = {
      name: partInfo.name,
      current_price: prices.length > 0 ? prices[0].price : 0,
      lowest_price: lowestPrice === Infinity ? 0 : lowestPrice,
      prices,
      platforms: prices.map(p => p.platform),
      updated_at: new Date().toISOString(),
    };

    // 更新缓存
    await updatePriceCache(partId, partInfo.name, result);

    return result;
  } catch (error) {
    console.error('获取实时价格失败:', error);
    throw error;
  }
}

// 模拟价格获取函数
function simulatePriceFetch(partName: string, platform: string): number {
  // 基于配件名称生成模拟价格
  const basePrice =
    (Math.abs(
      partName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) %
      1000) +
    100;

  // 不同平台的价格差异
  const platformMultipliers = {
    淘宝: 0.95,
    京东: 1.05,
    拼多多: 0.85,
    天猫: 1.02,
  };

  const multiplier =
    platformMultipliers[platform as keyof typeof platformMultipliers] || 1;
  const variation = (Math.random() - 0.5) * 0.2; // ±10% 波动

  return Math.round(basePrice * multiplier * (1 + variation));
}

// 更新价格缓存
async function updatePriceCache(
  partId: string,
  partName: string,
  priceData: any
) {
  try {
    // 更新数据库缓存
    const { error } = await supabase.from('part_prices_cache').upsert(
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
      console.warn('更新数据库价格缓存失败:', error);
    }

    // 更新Redis缓存
    const cacheKey = generateCacheKey('part_price', partId);
    await cacheManager.set(cacheKey, priceData, 3600);

    // 记录缓存更新日志
    console.log(`💾 价格缓存已更新: ${partId}`);
  } catch (error) {
    console.warn('更新价格缓存异常:', error);
  }
}

// 检查缓存是否过期 (1小时)
function isCacheExpired(updatedAt: string): boolean {
  const updateTime = new Date(updatedAt).getTime();
  const currentTime = Date.now();
  const oneHour = 60 * 60 * 1000;

  return currentTime - updateTime > oneHour;
}
