// 鏁版嵁璐ㄩ噺瓒嬪娍鍒嗘瀽API
import { NextRequest, NextResponse } from 'next/server';
import { trendAnalysisEngine } from '@/data-center/monitoring/trend-analysis-engine';
import { dataQualityService } from '@/data-center/monitoring/data-quality-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'trends';
    const metric = searchParams.get('metric');
    const days = parseInt(searchParams.get('days') || '30');

    switch (action) {
      case 'trends':
        // 鑾峰彇瓒嬪娍鍒嗘瀽缁撴灉
        if (!metric) {
          return NextResponse.json({ error: '缂哄皯鎸囨爣鍙傛暟' }, { status: 400 });
        }

        const trendResult = trendAnalysisEngine.analyzeTrend(metric);
        if (!trendResult) {
          return NextResponse.json(
            { error: '鏁版嵁涓嶈冻杩涜瓒嬪娍鍒嗘瀽' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          trend: trendResult,
          timestamp: new Date().toISOString(),
        });

      case 'anomalies':
        // 鑾峰彇寮傚父妫€娴嬬粨?        if (!metric) {
          return NextResponse.json({ error: '缂哄皯鎸囨爣鍙傛暟' }, { status: 400 });
        }

        const anomalyResult = trendAnalysisEngine.detectAnomalies(metric);
        return NextResponse.json({
          anomalies: anomalyResult,
          timestamp: new Date().toISOString(),
        });

      case 'historical':
        // 鑾峰彇鍘嗗彶鏁版嵁
        if (!metric) {
          return NextResponse.json({ error: '缂哄皯鎸囨爣鍙傛暟' }, { status: 400 });
        }

        const historicalData = trendAnalysisEngine.getHistoricalData(
          metric,
          days
        );
        return NextResponse.json({
          metric: metric,
          data: historicalData,
          count: historicalData.length,
          period: `${days}澶ー,
          timestamp: new Date().toISOString(),
        });

      case 'report':
        // 鐢熸垚瓒嬪娍鍒嗘瀽鎶ュ憡
        const allRules = dataQualityService.getAllCheckRules();
        const metrics = [...new Set(allRules.map(rule => rule.tableName))];

        const report = trendAnalysisEngine.generateTrendReport(metrics);
        return NextResponse.json({
          report: report,
          metricsAnalyzed: metrics,
          timestamp: new Date().toISOString(),
        });

      case 'available-metrics':
        // 鑾峰彇鍙敤鎸囨爣鍒楄〃
        const availableMetrics = Array.from(
          trendAnalysisEngine['trendHistory'].keys()
        );
        return NextResponse.json({
          metrics: availableMetrics,
          count: availableMetrics.length,
          timestamp: new Date().toISOString(),
        });

      case 'forecast':
        // 鑾峰彇棰勬祴鏁版嵁
        if (!metric) {
          return NextResponse.json({ error: '缂哄皯鎸囨爣鍙傛暟' }, { status: 400 });
        }

        const trendForForecast = trendAnalysisEngine.analyzeTrend(metric);
        if (!trendForForecast || !trendForForecast.forecast) {
          return NextResponse.json(
            { error: '鏃犳硶鐢熸垚棰勬祴鏁版嵁' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          metric: metric,
          forecast: trendForForecast.forecast,
          trend: trendForForecast.trend,
          confidence: trendForForecast.confidence,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瓒嬪娍鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'add-data-point':
        // 娣诲姞瓒嬪娍鏁版嵁?        const { metric, value, timestamp, metadata } = params;
        if (!metric || value === undefined) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鍙傛暟: metric 锟?value' },
            { status: 400 }
          );
        }

        trendAnalysisEngine.addDataPoint(metric, value, timestamp, metadata);

        return NextResponse.json({
          message: '鏁版嵁鐐规坊鍔犳垚?,
          metric: metric,
          value: value,
          timestamp: timestamp || new Date().toISOString(),
        });

      case 'bulk-add-data':
        // 鎵归噺娣诲姞鏁版嵁?        const { dataPoints } = params;
        if (!dataPoints || !Array.isArray(dataPoints)) {
          return NextResponse.json(
            { error: '缂哄皯鏈夋晥鐨勬暟鎹偣鏁扮粍' },
            { status: 400 }
          );
        }

        let addedCount = 0;
        dataPoints.forEach(point => {
          if (point.metric && point.value !== undefined) {
            trendAnalysisEngine.addDataPoint(
              point.metric,
              point.value,
              point.timestamp,
              point.metadata
            );
            addedCount++;
          }
        });

        return NextResponse.json({
          message: `鎵归噺娣诲姞?${addedCount} 涓暟鎹偣`,
          totalCount: dataPoints.length,
          addedCount: addedCount,
          timestamp: new Date().toISOString(),
        });

      case 'analyze-multiple':
        // 鍒嗘瀽澶氫釜鎸囨爣
        const { metrics } = params;
        if (!metrics || !Array.isArray(metrics)) {
          return NextResponse.json(
            { error: '缂哄皯鏈夋晥鐨勬寚鏍囨暟? },
            { status: 400 }
          );
        }

        const analysisResults =
          trendAnalysisEngine.analyzeMultipleMetrics(metrics);

        return NextResponse.json({
          message: `鍒嗘瀽?${metrics.length} 涓寚鏍嘸,
          metrics: metrics,
          results: {
            trends: analysisResults.trends.filter(t => t !== null).length,
            anomalies: analysisResults.anomalies.filter(a => a !== null).length,
          },
          detailedResults: analysisResults,
          timestamp: new Date().toISOString(),
        });

      case 'cleanup-old-data':
        // 娓呯悊杩囨湡鏁版嵁
        const { maxAgeDays } = params;
        const cleanupDays = maxAgeDays || 90;

        trendAnalysisEngine.cleanupOldData(cleanupDays);

        return NextResponse.json({
          message: `宸叉竻?${cleanupDays} 澶╁墠鐨勮繃鏈熸暟鎹甡,
          maxAgeDays: cleanupDays,
          timestamp: new Date().toISOString(),
        });

      case 'update-config':
        // 鏇存柊閰嶇疆锛堥渶瑕佷慨鏀箃rendAnalysisEngine浠ユ敮鎸侀厤缃洿鏂帮級
        return NextResponse.json({
          message: '閰嶇疆鏇存柊鍔熻兘鏆傛湭瀹炵幇',
          timestamp: new Date().toISOString(),
        });

      case 'export-data':
        // 瀵煎嚭瓒嬪娍鏁版嵁
        const { exportMetric, exportDays } = params;
        if (!exportMetric) {
          return NextResponse.json(
            { error: '缂哄皯瀵煎嚭鎸囨爣鍙傛暟' },
            { status: 400 }
          );
        }

        const exportData = trendAnalysisEngine.getHistoricalData(
          exportMetric,
          exportDays || 30
        );

        return NextResponse.json({
          metric: exportMetric,
          data: exportData,
          format: 'json',
          count: exportData.length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('瓒嬪娍鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

