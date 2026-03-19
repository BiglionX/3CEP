/**
 * 鐢ㄦ埛琛屼负鍒嗘瀽婕旂ずAPI
 * 灞曠ず鐢ㄦ埛琛屼负杩借釜鍜屽垎鏋愬姛 */

import { NextResponse } from 'next/server';
import { userBehaviorAnalyzer } from '@/modules/procurement-intelligence/services/user-behavior-analyzer.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user-001';
    const days = parseInt(searchParams.get('days') || '7');

    // 鐢熸垚涓€浜涙紨绀烘暟    generateDemoData(userId);

    // 鎵ц鐢ㄦ埛琛屼负鍒嗘瀽
    const analysisResult = await userBehaviorAnalyzer.analyzeUserBehavior(
      userId,
      days
    );

    // 鑾峰彇氳瘽缁熻
    const sessionStats = userBehaviorAnalyzer.getSessionStats(days);

    return NextResponse.json({
      success: true,
      message: '鐢ㄦ埛琛屼负鍒嗘瀽瀹屾垚',
      data: {
        analysis: analysisResult,
        sessionStats: sessionStats,
        config: userBehaviorAnalyzer.getConfig(),
      },
    });
  } catch (error) {
    console.error('鐢ㄦ埛琛屼负鍒嗘瀽澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.event) {
      // 璁板綍鐢ㄦ埛琛屼负浜嬩欢
      userBehaviorAnalyzer.recordEvent(body.event);

      return NextResponse.json({
        success: true,
        message: '鐢ㄦ埛琛屼负浜嬩欢璁板綍鎴愬姛',
      });
    } else if (body.config) {
      // 鏇存柊閰嶇疆
      userBehaviorAnalyzer.setConfig(body.config);

      return NextResponse.json({
        success: true,
        message: '閰嶇疆鏇存柊鎴愬姛',
        config: userBehaviorAnalyzer.getConfig(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '犳晥鐨勮姹傛暟,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('鐢ㄦ埛琛屼负鍒嗘瀽璇眰澶勭悊澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 鐢熸垚婕旂ず鏁版嵁
 */
function generateDemoData(userId: string): void {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const baseTime = Date.now() - 24 * 60 * 60 * 1000; // 24灏忔椂
  // 鐢熸垚椤甸潰娴忚浜嬩欢
  const pages = [
    '/',
    '/procurement/dashboard',
    '/procurement/suppliers',
    '/procurement/analytics',
    '/settings/profile',
  ];

  pages.forEach((page, index) => {
    userBehaviorAnalyzer.recordEvent({
      userId,
      sessionId,
      eventType: 'page_view',
      eventName: 'page_view',
      pageUrl: page,

      referrer: index === 0 ? '' : pages[index - 1],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ipAddress: '192.168.1.100',
      deviceInfo: {
        deviceType: 'desktop',
        os: 'Windows 10',
        browser: 'Chrome',
      },
      context: {
        pageTitle: getPageTitle(page),
      },
    });
  });

  // 鐢熸垚鐐瑰嚮浜嬩欢
  userBehaviorAnalyzer.recordEvent({
    userId,
    sessionId,
    eventType: 'click',
    eventName: 'search_button_click',
    elementId: 'search-btn',
    elementText: '鎼滅储',
    pageUrl: '/procurement/dashboard',

    context: {
      searchTerm: '鐢靛瓙鍏冧欢',
    },
  });

  // 鐢熸垚琛ㄥ崟鎻愪氦浜嬩欢
  userBehaviorAnalyzer.recordEvent({
    userId,
    sessionId,
    eventType: 'form_submit',
    eventName: 'supplier_filter_submit',
    pageUrl: '/procurement/suppliers',

    context: {
      filters: {
        category: '鐢靛瓙鍏冧欢',
        priceRange: '0-1000',
      },
    },
  });

  // 鐢熸垚杞寲浜嬩欢
  userBehaviorAnalyzer.recordEvent({
    userId,
    sessionId,
    eventType: 'form_submit',
    eventName: 'purchase',
    pageUrl: '/procurement/checkout',

    context: {
      orderValue: 2500,
      itemCount: 3,
    },
  });

  // 鐢熸垚鍙︿竴涓細  const sessionId2 = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  userBehaviorAnalyzer.recordEvent({
    userId,
    sessionId: sessionId2,
    eventType: 'page_view',
    eventName: 'page_view',
    pageUrl: '/',

    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    ipAddress: '192.168.1.101',
    deviceInfo: {
      deviceType: 'mobile',
      os: 'iOS 14',
      browser: 'Safari',
    },
  });

  userBehaviorAnalyzer.recordEvent({
    userId,
    sessionId: sessionId2,
    eventType: 'click',
    eventName: 'quick_quote_click',
    elementId: 'quick-quote-btn',
    elementText: '蹇€熸姤,
    pageUrl: '/',
  });
}

/**
 * 鏍规嵁椤甸潰璺緞鑾峰彇椤甸潰鏍囬
 */
function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': '棣栭〉',
    '/procurement/dashboard': '閲囪喘〃,
    '/procurement/suppliers': '渚涘簲鍟嗙,
    '/procurement/analytics': '鏁版嵁鍒嗘瀽',
    '/settings/profile': '涓汉璁剧疆',
  };

  return titles[path] || '鏈煡椤甸潰';
}

