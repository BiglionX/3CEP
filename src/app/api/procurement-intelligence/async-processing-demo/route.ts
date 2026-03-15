/**
 * 寮傛诲姟澶勭悊婕旂ずAPI
 * 灞曠ず鑰楁椂鎿嶄綔鐨勫紓姝ュ鐞嗚兘 */

import { NextResponse } from 'next/server';
import { asyncBusinessService } from '@/modules/procurement-intelligence/services/async-business.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'demo';

  try {
    switch (action) {
      case 'demo':
        return await demonstrateAsyncProcessing();

      case 'stats':
        return await getAsyncStats();

      case 'test':
        return await runAsyncTest();

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('寮傛澶勭悊婕旂ずAPI閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍐呴儴鏈嶅姟鍣ㄩ敊,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'analyze-suppliers':
        return await submitSupplierAnalysis(data);

      case 'analyze-market':
        return await submitMarketAnalysis(data);

      case 'assess-risk':
        return await submitRiskAssessment(data);

      case 'batch-process':
        return await submitBatchProcess(data);

      case 'check-status':
        return await checkTaskStatus(data);

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被,
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('寮傛澶勭悊API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '璇眰澶勭悊澶辫触',
      },
      { status: 400 }
    );
  }
}

/**
 * 婕旂ず寮傛澶勭悊鑳藉姏
 */
async function demonstrateAsyncProcessing() {
  console.log('馃殌 寮€濮嬪紓姝ュ鐞嗚兘鍔涙紨);

  const demoResults = {
    timestamp: new Date().toISOString(),
    capabilities: [] as any[],
  };

  // 婕旂ず渚涘簲鍟嗗垎鏋愬紓姝ュ  const supplierDemo = await demoSupplierAnalysisAsync();
  demoResults.capabilities.push({
    name: '渚涘簲鍟嗗垎鏋愬紓姝ュ,
    description: '灏嗗鏉傜殑渚涘簲鍟嗗尮閰嶅拰鍒嗘瀽杞崲涓哄悗鍙颁换,
    ...supplierDemo,
  });

  // 婕旂ず甯傚満鍒嗘瀽寮傛澶勭悊
  const marketDemo = await demoMarketAnalysisAsync();
  demoResults.capabilities.push({
    name: '甯傚満鍒嗘瀽寮傛澶勭悊',
    description: '鎵归噺澶勭悊甯傚満牸瓒嬪娍鍒嗘瀽诲姟',
    ...marketDemo,
  });

  // 婕旂ず椋庨櫓璇勪及寮傛澶勭悊
  const riskDemo = await demoRiskAssessmentAsync();
  demoResults.capabilities.push({
    name: '椋庨櫓璇勪及寮傛澶勭悊',
    description: '骞惰鎵ц澶氱淮搴﹂闄╁垎,
    ...riskDemo,
  });

  console.log('寮傛澶勭悊鑳藉姏婕旂ず瀹屾垚');

  return NextResponse.json({
    success: true,
    data: demoResults,
  });
}

/**
 * 渚涘簲鍟嗗垎鏋愬紓姝ユ紨 */
async function demoSupplierAnalysisAsync() {
  const requestData = {
    companyId: 'COMP_DEMO_001',
    requirements: '闇€瑕侀珮璐ㄩ噺鐢靛瓙鍏冨櫒朵緵搴斿晢',
    budgetRange: { min: 100000, max: 500000 },
    region: '鍗庝笢鍦板尯',
  };

  // 鎻愪氦寮傛诲姟
  const startTime = Date.now();
  const taskId = await asyncBusinessService.analyzeSuppliersAsync(requestData);
  const submissionTime = Date.now() - startTime;

  // 绔嬪嵆妫€鏌ヤ换鍔＄姸鎬侊紙搴旇杩樺湪澶勭悊涓級
  const initialStatus = await asyncBusinessService.getTaskStatus(taskId);

  // 绛夊緟诲姟瀹屾垚
  const completedTask = await asyncBusinessService.waitForTaskCompletion(
    taskId,
    60000
  );

  return {
    taskId,
    submission: {
      timeMs: submissionTime,
      status: initialStatus.success  'completed' : 'processing',
    },
    completion: {
      timeMs: completedTask.duration,
      success: completedTask.success,
      result: completedTask.result,
    },
    performance: {
      concurrency: 5,
      timeoutMs: 60000,
    },
  };
}

/**
 * 甯傚満鍒嗘瀽寮傛婕旂ず
 */
async function demoMarketAnalysisAsync() {
  const requestData = {
    productIds: ['PROD001', 'PROD002', 'PROD003'],
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31',
    },
    regions: ['鍗庝笢', '鍗庡崡', '鍗庡寳'],
  };

  const taskId = await asyncBusinessService.analyzeMarketAsync(requestData);

  // 涓嶇瓑寰呭畬鎴愶紝灞曠ず寮傛鐗  const status = await asyncBusinessService.getTaskStatus(taskId);

  return {
    taskId,
    immediateStatus: status,
    taskType: 'market-analysis',
    estimatedDuration: '2-5 minutes',
  };
}

/**
 * 椋庨櫓璇勪及寮傛婕旂ず
 */
async function demoRiskAssessmentAsync() {
  const requestData = {
    projectId: 'PROJECT_RISK_001',
    suppliers: ['SUP001', 'SUP002', 'SUP003'],
    contractValue: 2000000,
  };

  const taskId = await asyncBusinessService.assessRiskAsync(requestData);

  return {
    taskId,
    taskType: 'risk-assessment',
    priority: 'high',
    timeoutMs: 180000,
  };
}

/**
 * 鑾峰彇寮傛澶勭悊鍣ㄧ粺璁′俊 */
async function getAsyncStats() {
  const stats = asyncBusinessService.getProcessorStats();

  return NextResponse.json({
    success: true,
    data: {
      queueStats: stats,
      processorStatus: 'running',
      capabilities: {
        maxConcurrency: 5,
        queueSize: 100,
        defaultTimeout: 30000,
      },
    },
  });
}

/**
 * 杩愯寮傛澶勭悊娴嬭瘯
 */
async function runAsyncTest() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
  };

  try {
    // 娴嬭瘯诲姟鎻愪氦
    const testTaskId = await asyncBusinessService.analyzeSuppliersAsync({
      companyId: 'TEST_COMP',
      requirements: '娴嬭瘯璇眰',
    });

    testResults.tests.push({
      name: '诲姟鎻愪氦娴嬭瘯',
      passed: !!testTaskId,
      details: `诲姟ID: ${testTaskId}`,
    });

    // 娴嬭瘯鐘舵€佹煡    const status = await asyncBusinessService.getTaskStatus(testTaskId);
    testResults.tests.push({
      name: '鐘舵€佹煡璇㈡祴,
      passed: !!status,
      details: `诲姟鐘 ${status  (status.success  '鎴愬姛' : '澶勭悊) : '鏈壘}`,
    });

    // 娴嬭瘯鎵瑰    const batchTasks = await asyncBusinessService.batchProcessAsync([
      {
        type: 'supplier',
        data: { companyId: 'BATCH1', requirements: '鎵归噺娴嬭瘯1' },
      },
      {
        type: 'market',
        data: {
          productIds: ['TEST'],
          dateRange: { start: '2024-01-01', end: '2024-01-31' },
        },
      },
    ]);

    testResults.tests.push({
      name: '鎵瑰鐞嗘祴,
      passed: batchTasks.length === 2,
      details: `鍒涘缓${batchTasks.length} 涓换鍔,
    });
  } catch (error) {
    testResults.tests.push({
      name: '寮傛澶勭悊娴嬭瘯',
      passed: false,
      details: `娴嬭瘯澶辫触: ${(error as Error).message}`,
    });
  }

  const passedTests = testResults.tests.filter(t => t.passed).length;
  const totalTests = testResults.tests.length;

  return NextResponse.json({
    success: true,
    data: {
      ...testResults,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        passRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
      },
    },
  });
}

/**
 * 鎻愪氦渚涘簲鍟嗗垎鏋愪换 */
async function submitSupplierAnalysis(data: any) {
  const taskId = await asyncBusinessService.analyzeSuppliersAsync(data);

  return NextResponse.json({
    success: true,
    data: {
      taskId,
      message: '渚涘簲鍟嗗垎鏋愪换鍔″凡鎻愪氦',
      estimatedCompletion: '1-2 minutes',
    },
  });
}

/**
 * 鎻愪氦甯傚満鍒嗘瀽诲姟
 */
async function submitMarketAnalysis(data: any) {
  const taskId = await asyncBusinessService.analyzeMarketAsync(data);

  return NextResponse.json({
    success: true,
    data: {
      taskId,
      message: '甯傚満鍒嗘瀽诲姟宸叉彁,
      estimatedCompletion: '2-5 minutes',
    },
  });
}

/**
 * 鎻愪氦椋庨櫓璇勪及诲姟
 */
async function submitRiskAssessment(data: any) {
  const taskId = await asyncBusinessService.assessRiskAsync(data);

  return NextResponse.json({
    success: true,
    data: {
      taskId,
      message: '椋庨櫓璇勪及诲姟宸叉彁,
      estimatedCompletion: '3-5 minutes',
    },
  });
}

/**
 * 鎵归噺澶勭悊诲姟
 */
async function submitBatchProcess(data: any) {
  const taskIds = await asyncBusinessService.batchProcessAsync(data.requests);

  return NextResponse.json({
    success: true,
    data: {
      taskIds,
      message: `宸叉彁${taskIds.length} 涓紓姝ヤ换鍔,
      estimatedCompletion: 'varies by task type',
    },
  });
}

/**
 * 妫€鏌ヤ换鍔＄姸 */
async function checkTaskStatus(data: { taskId: string }) {
  const status = await asyncBusinessService.getTaskStatus(data.taskId);

  if (!status) {
    return NextResponse.json(
      {
        success: false,
        error: '诲姟涓嶅鍦ㄦ垨宸插畬鎴愭竻,
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: status,
  });
}

