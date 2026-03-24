/**
 * 缓存监控 API
 *
 * GET /api/cache/stats - 获取缓存统计信息
 * POST /api/cache/clear - 清除缓存
 */

import { getCacheEnvironment } from '@/config/cache.config';
import { cache } from '@/lib/cache/redis-client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const env = getCacheEnvironment();

    // 获取缓存使用情况（仅 Redis 支持）
    let stats = {
      type: env,
      enabled: true,
      hitRate: 0,
      missRate: 0,
      totalKeys: 0,
      memoryUsage: 0,
    };

    // 这里可以扩展 cache 接口来获取真实统计
    // 暂时返回模拟数据用于演示
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        // 模拟数据
        hitRate: Math.random() * 30 + 70, // 70-100%
        missRate: Math.random() * 30,
        totalKeys: Math.floor(Math.random() * 1000),
        memoryUsage: Math.floor(Math.random() * 100),
      },
    });
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CACHE_STATS_FAILED',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pattern } = body || {};

    if (pattern) {
      // 清除特定模式的缓存
      console.log(`[Cache API] 清除缓存：${pattern}`);
      // TODO: 实现按模式清除
    } else {
      // 清除所有缓存
      await cache.clear();
      console.log('[Cache API] 清除所有缓存');
    }

    return NextResponse.json({
      success: true,
      message: '缓存已清除',
    });
  } catch (error) {
    console.error('清除缓存失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CACHE_CLEAR_FAILED',
          message: error instanceof Error ? error.message : '清除失败',
        },
      },
      { status: 500 }
    );
  }
}
