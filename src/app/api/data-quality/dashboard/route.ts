import { dataQualityCronService } from "@/data-center/monitoring/data-quality-cron";
import { dataQualityService } from "@/data-center/monitoring/data-quality-service";
import { monitoringService } from "@/data-center/monitoring/monitoring-service";
import { NextRequest, NextResponse } from "next/server";

// GET请求处理 - 数据质量看板
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "overview";

    switch (view) {
      case "overview":
        return await getOverviewDashboard();

      case "details":
        return await getDetailedDashboard();

      case "trends":
        return await getTrendDashboard();

      case "alerts":
        return await getAlertsDashboard();

      default:
        return NextResponse.json(
          { error: "未知的看板视图类型" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("数据质量看板API错误:", error);
    return NextResponse.json(
      {
        error: error.message || "内部服务器错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST请求处理 - 看板操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case "refresh":
        // 刷新看板数据
        return await refreshDashboard();

      case "trigger-check":
        // 触发特定检查
        const { ruleId } = params;
        if (!ruleId) {
          return NextResponse.json(
            { error: "缺少检查规则ID" },
            { status: 400 }
          );
        }
        return await triggerSpecificCheck(ruleId);

      case "trigger-job":
        // 触发定时任务
        const { jobId } = params;
        if (!jobId) {
          return NextResponse.json({ error: "缺少任务ID" }, { status: 400 });
        }
        return await triggerCronJob(jobId);

      default:
        return NextResponse.json({ error: "未知的操作类型" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("数据质量看板操作错误:", error);
    return NextResponse.json(
      {
        error: error.message || "内部服务器错误",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 获取概览看板数据
async function getOverviewDashboard() {
  // 获取最新的质量报告
  const qualityReport = await dataQualityService.generateQualityReport();

  // 获取定时任务状态
  const cronJobs = dataQualityCronService.getAllJobs();
  const runningJobs = dataQualityCronService.getRunningJobs();

  // 获取监控统计数据
  const monitoringStats = monitoringService.getMonitoringStats();

  // 获取最近的告警
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
      configs: cronJobs.map((job) => ({
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

    recentAlerts: recentAlerts.map((alert) => ({
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

// 获取详细看板数据
async function getDetailedDashboard() {
  // 获取所有检查规则和最新结果
  const allRules = dataQualityService.getAllCheckRules();
  const latestResults = dataQualityService.getCheckHistory(50);

  // 按表分组的结果
  const resultsByTable: Record<string, any[]> = {};
  latestResults.forEach((result) => {
    if (!resultsByTable[result.tableName]) {
      resultsByTable[result.tableName] = [];
    }
    resultsByTable[result.tableName].push(result);
  });

  // 计算每个表的质量分数
  const tableScores: Record<string, number> = {};
  Object.entries(resultsByTable).forEach(([tableName, results]) => {
    const latestResult = results[results.length - 1];
    tableScores[tableName] = 100 - latestResult.issuePercentage;
  });

  const detailedData = {
    tables: Object.keys(resultsByTable).map((tableName) => ({
      name: tableName,
      score: Math.round(tableScores[tableName] || 0),
      checkCount: resultsByTable[tableName].length,
      latestCheck:
        resultsByTable[tableName][resultsByTable[tableName].length - 1]
          ?.timestamp,
      issues: resultsByTable[tableName]
        .filter((r) => r.status !== "passed")
        .map((r) => ({
          ruleName: r.ruleName,
          issueType: r.checkType,
          issueCount: r.issueCount,
          percentage: r.issuePercentage,
          severity: r.severity,
        })),
    })),

    rules: allRules.map((rule) => {
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

// 获取趋势看板数据
async function getTrendDashboard() {
  const history = dataQualityService.getCheckHistory(100);

  // 按日期分组计算每日平均质量分数
  const dailyScores: Record<string, number[]> = {};

  history.forEach((result) => {
    const date = result.timestamp.split("T")[0]; // YYYY-MM-DD
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

// 获取告警看板数据
async function getAlertsDashboard() {
  const allAlerts = monitoringService.getActiveAlerts();

  // 按严重程度分类
  const alertsBySeverity: Record<string, any[]> = {
    critical: [],
    emergency: [],
    warning: [],
    info: [],
  };

  allAlerts.forEach((alert) => {
    alertsBySeverity[alert.severity].push({
      id: alert.id,
      name: alert.ruleName,
      description: `规则: ${alert.ruleName} - 当前值: ${alert.currentValue}`,
      severity: alert.severity,
      triggeredAt: alert.triggeredAt,
      resolved: !!alert.resolvedAt,
      resolveTime: alert.resolvedAt,
    });
  });

  const alertsData = {
    bySeverity: alertsBySeverity,
    total: allAlerts.length,
    unresolved: allAlerts.filter((a) => !a.resolvedAt).length,
    recent: allAlerts.slice(0, 20).map((alert) => ({
      ...alert,
      timeSinceTriggered: getTimeSince(alert.triggeredAt),
    })),

    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(alertsData);
}

// 刷新看板数据
async function refreshDashboard() {
  // 执行快速检查以更新数据
  const quickResults = await dataQualityService.runAllChecks();

  return NextResponse.json({
    message: "看板数据刷新完成",
    refreshedChecks: quickResults.length,
    timestamp: new Date().toISOString(),
  });
}

// 触发特定检查
async function triggerSpecificCheck(ruleId: string) {
  const result = await dataQualityService.executeCheckRule(ruleId);

  if (!result) {
    return NextResponse.json(
      { error: "检查规则不存在或未启用" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "检查执行完成",
    result,
    timestamp: new Date().toISOString(),
  });
}

// 触发定时任务
async function triggerCronJob(jobId: string) {
  try {
    await dataQualityCronService.triggerJob(jobId);

    return NextResponse.json({
      message: "定时任务触发成功",
      jobId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 生成质量趋势数据
function generateQualityTrends(results: any[]) {
  const trends: Record<string, { dates: string[]; scores: number[] }> = {};

  results.forEach((result) => {
    const checkType = result.checkType;
    if (!trends[checkType]) {
      trends[checkType] = { dates: [], scores: [] };
    }

    const date = result.timestamp.split("T")[0];
    if (!trends[checkType].dates.includes(date)) {
      trends[checkType].dates.push(date);
      trends[checkType].scores.push(100 - result.issuePercentage);
    }
  });

  return trends;
}

// 生成问题趋势数据
function generateIssueTrends(results: any[]) {
  const issueCounts: Record<string, number> = {};

  results.forEach((result) => {
    if (result.issueCount > 0) {
      const issueType = result.checkType;
      issueCounts[issueType] =
        (issueCounts[issueType] || 0) + result.issueCount;
    }
  });

  return issueCounts;
}

// 生成性能趋势数据
function generatePerformanceTrends(results: any[]) {
  const executionTimes: number[] = results.map((r) => r.executionTime);

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
          ? "increasing"
          : "decreasing"
        : "stable",
  };
}

// 计算时间差
function getTimeSince(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}天前`;
  if (diffHours > 0) return `${diffHours}小时前`;
  if (diffMinutes > 0) return `${diffMinutes}分钟前`;
  return "刚刚";
}
