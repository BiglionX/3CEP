/**
 * ュ織鍒嗘瀽婕旂ずAPI
 * 灞曠ずュ織鍒嗘瀽澧炲己鍔熻兘
 */

import { NextResponse } from 'next/server';
import { logAnalyzerService } from '@/modules/procurement-intelligence/services/log-analyzer.service';

// 妯℃嫙ュ織鏉＄洰鎺ュ彛
interface LogEntry {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: Date;
  context: Record<string, any>;
  traceId: string;
}

export async function GET() {
  try {
    // 鐢熸垚涓€浜涙祴璇曟棩蹇楁暟    const testLogs: LogEntry[] = [
      {
        level: 'INFO',
        message: '渚涘簲鍟嗗尮閰嶆湇鍔″惎鍔ㄦ垚,
        timestamp: new Date(Date.now() - 300000),
        context: { service: 'supplier-matching', version: '1.2.0' },
      },
      {
        level: 'WARN',
        message: '鏁版嵁搴撹繛鎺ユ睜浣跨敤鐜囪揪5%',
        timestamp: new Date(Date.now() - 240000),
        context: { service: 'database-pool', usage: 85 },
      },
      {
        level: 'ERROR',
        message: '渚涘簲鍟咥PI璋冪敤瓒呮椂',
        timestamp: new Date(Date.now() - 180000),
        context: { service: 'supplier-api', timeout: 5000 },
      },
      {
        level: 'INFO',
        message: '閲囪喘璁㈠崟鍒涘缓鎴愬姛',
        timestamp: new Date(Date.now() - 120000),
        context: { service: 'procurement-order', orderId: 'PO-2026-001' },
      },
      {
        level: 'ERROR',
        message: '牸璁＄畻鏈嶅姟寮傚父: 犳晥鐨勪环鏍煎弬,
        timestamp: new Date(Date.now() - 60000),
        context: { service: 'price-calculator', error: 'Invalid parameters' },
      },
      {
        level: 'WARN',
        message: '鍐呭浣跨敤鐜囪秴0%锛屽缓璁墿,
        timestamp: new Date(),
        context: { service: 'memory-monitor', usage: 92 },
      },
    ];

    // 娣诲姞ュ織鍒板垎鏋愬櫒
    for (const log of testLogs) {
      logAnalyzerService.addLogEntry({
        level: log.level as any,
        message: log.message,
        timestamp: log.timestamp,
        context: log.context,
        traceId: log.traceId,
      });
    }

    // 瑙﹀彂鍒嗘瀽
    const analysisResult = await logAnalyzerService.triggerAnalysis();

    // 鑾峰彇鑱氬悎缁熻
    const aggregation = await logAnalyzerService.getLogAggregation(1);

    return NextResponse.json({
      success: true,
      message: 'ュ織鍒嗘瀽婕旂ず瀹屾垚',
      data: {
        analysis: analysisResult,
        aggregation: aggregation,
        config: logAnalyzerService.getConfig(),
      },
    });
  } catch (error) {
    console.error('ュ織鍒嗘瀽婕旂ず澶辫触:', error);
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

    // 鏍规嵁璇眰鏇存柊閰嶇疆
    if (body.config) {
      logAnalyzerService.setConfig(body.config);
    }

    return NextResponse.json({
      success: true,
      message: '閰嶇疆鏇存柊鎴愬姛',
      config: logAnalyzerService.getConfig(),
    });
  } catch (error) {
    console.error('閰嶇疆鏇存柊澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

