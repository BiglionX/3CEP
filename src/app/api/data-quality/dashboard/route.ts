import { dataQualityCronService } from '@/modules/data-center/monitoring/data-quality-cron';
import { dataQualityService } from '@/modules/data-center/monitoring/data-quality-service';
import { monitoringService } from '@/modules/data-center/monitoring/monitoring-service';
import { NextRequest, NextResponse } from 'next/server';

// GET璇锋眰澶勭悊 - 鏁版嵁璐ㄩ噺鐪嬫澘
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview';

    switch (view) {
      case 'overview':
        return await getOverviewDashboard();

      case 'details':
        return await getDetailedDashboard();

      case 'trends':
        return await getTrendDashboard();

      case 'alerts':
        return await getAlertsDashboard();

      default:
        return NextResponse.json(
          { error: '鏈煡鐨勭湅鏉胯鍥剧被? },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('鏁版嵁璐ㄩ噺鐪嬫澘API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST璇锋眰澶勭悊 - 鐪嬫澘鎿嶄綔
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'refresh':
        // 鍒锋柊鐪嬫澘鏁版嵁
        return await refreshDashboard();

      case 'trigger-check':
        // 瑙﹀彂鐗瑰畾妫€?        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: '缂哄皯妫€鏌ヨ鍒橧D' },
            { status: 400 }
          );
        }
        return await triggerSpecificCheck(ruleId);

      case 'trigger-job':
        // 瑙﹀彂瀹氭椂浠诲姟
        const { jobId } = params;
        if (!jobId) {
          return NextResponse.json({ error: '缂哄皯浠诲姟ID' }, { status: 400 });
        }
        return await triggerCronJob(jobId);

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鏁版嵁璐ㄩ噺鐪嬫澘鎿嶄綔閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇姒傝鐪嬫澘鏁版嵁
async function getOverviewDashboard() {
  // 鑾峰彇鏈€鏂扮殑璐ㄩ噺鎶ュ憡
  const qualityReport = await dataQualityService.generateQualityReport();

  // 鑾峰彇瀹氭椂浠诲姟鐘?  const cronJobs = dataQualityCronService.getAllJobs();
  const runningJobs = dataQualityCronService.getRunningJobs();

  // 鑾峰彇鐩戞帶缁熻鏁版嵁
  const monitoringStats = monitoringService.getMonitoringStats();

  // 鑾峰彇鏈€杩戠殑鍛婅
  const recentAlerts = monitoringService.getActiveAlerts().slice(0, 5);

  const dashboardData = {
    overview: {
      qualityScore: qualityReport.summary.overallScore,
      totalTables: qualityReport.summary.totalTables,
      totalChecks: qualityReport.summary.totalChecks,
      passedChecks: qualityReport.summary.passedChecks,
      warningChecks: qualityReport.summary.warningChecks,
      failedChecks: qualityReport.summary.failedChecks,
      lastUpdated: new Date().toISOString(),
    },

    cronJobs: {
      total: cronJobs.length,
      running: runningJobs.length,
      configs: cronJobs.map(job => ({
        id: job.id,
        name: job.name,
        schedule: job.schedule,
        enabled: job.enabled,
        running: runningJobs.includes(job.id),
      })),
    },

    monitoring: {
      totalMetrics: monitoringStats.totalMetrics,
      activeAlerts: monitoringStats.activeAlerts,
      totalAlertRules: monitoringStats.totalAlertRules,
    },

    recentAlerts: recentAlerts.map(alert => ({
      id: alert.id,
      name: alert.ruleName,
      severity: alert.severity,
      triggeredAt: alert.triggeredAt,
      resolved: !!alert.resolvedAt,
    })),

    recommendations: qualityReport.recommendations,

    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(dashboardData);
}

// 鑾峰彇璇︾粏鐪嬫澘鏁版嵁
async function getDetailedDashboard() {
  // 鑾峰彇鎵€鏈夋鏌ヨ鍒欏拰鏈€鏂扮粨?  const allRules = dataQualityService.getAllCheckRules();
  const latestResults = dataQualityService.getCheckHistory(50);

  // 鎸夎〃鍒嗙粍鐨勭粨?  const resultsByTable: Record<string, any[]> = {};
  latestResults.forEach(result => {
    if (!resultsByTable[result.tableName]) {
      resultsByTable[result.tableName] = [];
    }
    resultsByTable[result.tableName].push(result);
  });

  // 璁＄畻姣忎釜琛ㄧ殑璐ㄩ噺鍒嗘暟
  const tableScores: Record<string, number> = {};
  Object.entries(resultsByTable).forEach(([tableName, results]) => {
    const latestResult = results[results.length - 1];
    tableScores[tableName] = 100 - latestResult.issuePercentage;
  });

  const detailedData = {
    tables: Object.keys(resultsByTable).map(tableName => ({
      name: tableName,
      score: Math.round(tableScores[tableName] || 0),
      checkCount: resultsByTable[tableName].length,
      latestCheck:
        resultsByTable[tableName][resultsByTable[tableName].length - 1]
          ?.timestamp,
      issues: resultsByTable[tableName]
        .filter(r => r.status !== 'passed')
        .map(r => ({
          ruleName: r.ruleName,
          issueType: r.checkType,
          issueCount: r.issueCount,
          percentage: r.issuePercentage,
          severity: r.severity,
        })),
    })),

    rules: allRules.map(rule => {
      const ruleResults = dataQualityService.getRuleCheckResults(rule.id, 5);
      const latestResult = ruleResults[ruleResults.length - 1];

      return {
        id: rule.id,
        name: rule.name,
        tableName: rule.tableName,
        columnName: rule.columnName,
        checkType: rule.checkType,
        threshold: rule.threshold,
        enabled: rule.enabled,
        severity: rule.severity,
        lastExecution: latestResult?.timestamp,
        lastStatus: latestResult?.status,
        issuePercentage: latestResult?.issuePercentage || 0,
      };
    }),

    trends: generateQualityTrends(latestResults),

    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(detailedData);
}

// 鑾峰彇瓒嬪娍鐪嬫澘鏁版嵁
async function getTrendDashboard() {
  const history = dataQualityService.getCheckHistory(100);

  // 鎸夋棩鏈熷垎缁勮绠楁瘡鏃ュ钩鍧囪川閲忓垎?  const dailyScores: Record<string, number[]> = {};

  history.forEach(result => {
    const date = result.timestamp.split('T')[0]; // YYYY-MM-DD
    if (!dailyScores[date]) {
      dailyScores[date] = [];
    }
    dailyScores[date].push(100 - result.issuePercentage);
  });

  const trendData = {
    dailyTrends: Object.entries(dailyScores)
      .map(([date, scores]) => ({
        date,
        averageScore: Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        ),
        checkCount: scores.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)),

    issueTrends: generateIssueTrends(history),

    performanceTrends: generatePerformanceTrends(history),

    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(trendData);
}

// 鑾峰彇鍛婅鐪嬫澘鏁版嵁
async function getAlertsDashboard() {
  const allAlerts = monitoringService.getActiveAlerts();

  // 鎸変弗閲嶇▼搴﹀垎?  const alertsBySeverity: Record<string, any[]> = {
    critical: [],
    emergency: [],
    warning: [],
    info: [],
  };

  allAlerts.forEach(alert => {
    alertsBySeverity[alert.severity].push({
      id: alert.id,
      name: alert.ruleName,
      description: `瑙勫垯: ${alert.ruleName} - 褰撳墠? ${alert.currentValue}`,
      severity: alert.severity,
      triggeredAt: alert.triggeredAt,
      resolved: !!alert.resolvedAt,
      resolveTime: alert.resolvedAt,
    });
  });

  const alertsData = {
    bySeverity: alertsBySeverity,
    total: allAlerts.length,
    unresolved: allAlerts.filter(a => !a.resolvedAt).length,
    recent: allAlerts.slice(0, 20).map(alert => ({
      ...alert,
      timeSinceTriggered: getTimeSince(alert.triggeredAt),
    })),

    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(alertsData);
}

// 鍒锋柊鐪嬫澘鏁版嵁
async function refreshDashboard() {
  // 鎵ц蹇€熸鏌ヤ互鏇存柊鏁版嵁
  const quickResults = await dataQualityService.runAllChecks();

  return NextResponse.json({
    message: '鐪嬫澘鏁版嵁鍒锋柊瀹屾垚',
    refreshedChecks: quickResults.length,
    timestamp: new Date().toISOString(),
  });
}

// 瑙﹀彂鐗瑰畾妫€?async function triggerSpecificCheck(ruleId: string) {
  const result = await dataQualityService.executeCheckRule(ruleId);

  if (!result) {
    return NextResponse.json(
      { error: '妫€鏌ヨ鍒欎笉瀛樺湪鎴栨湭鍚敤' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: '妫€鏌ユ墽琛屽畬?,
    result,
    timestamp: new Date().toISOString(),
  });
}

// 瑙﹀彂瀹氭椂浠诲姟
async function triggerCronJob(jobId: string) {
  try {
    await dataQualityCronService.triggerJob(jobId);

    return NextResponse.json({
      message: '瀹氭椂浠诲姟瑙﹀彂鎴愬姛',
      jobId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 鐢熸垚璐ㄩ噺瓒嬪娍鏁版嵁
function generateQualityTrends(results: any[]) {
  const trends: Record<string, { dates: string[]; scores: number[] }> = {};

  results.forEach(result => {
    const checkType = result.checkType;
    if (!trends[checkType]) {
      trends[checkType] = { dates: [], scores: [] };
    }

    const date = result.timestamp.split('T')[0];
    if (!trends[checkType].dates.includes(date)) {
      trends[checkType].dates.push(date);
      trends[checkType].scores.push(100 - result.issuePercentage);
    }
  });

  return trends;
}

// 鐢熸垚闂瓒嬪娍鏁版嵁
function generateIssueTrends(results: any[]) {
  const issueCounts: Record<string, number> = {};

  results.forEach(result => {
    if (result.issueCount > 0) {
      const issueType = result.checkType;
      issueCounts[issueType] =
        (issueCounts[issueType] || 0) + result.issueCount;
    }
  });

  return issueCounts;
}

// 鐢熸垚鎬ц兘瓒嬪娍鏁版嵁
function generatePerformanceTrends(results: any[]) {
  const executionTimes: number[] = results.map(r => r.executionTime);

  return {
    average: Math.round(
      executionTimes.reduce((sum, time) => sum + time, 0) /
        executionTimes.length
    ),
    min: Math.min(...executionTimes),
    max: Math.max(...executionTimes),
    trend:
      executionTimes.length > 1
        ? executionTimes[executionTimes.length - 1] > executionTimes[0]
          ? 'increasing'
          : 'decreasing'
        : 'stable',
  };
}

// 璁＄畻鏃堕棿?function getTimeSince(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}澶╁墠`;
  if (diffHours > 0) return `${diffHours}灏忔椂鍓峘;
  if (diffMinutes > 0) return `${diffMinutes}鍒嗛挓鍓峘;
  return '鍒氬垰';
}

