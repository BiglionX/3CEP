// 鑷姩淇绠＄悊API
import { NextRequest, NextResponse } from 'next/server';
import { issueIdentificationEngine } from '@/modules/data-center/monitoring/issue-identification-engine';
import {
  autoFixCoordinator,
  fixEffectivenessEvaluator,
} from '@/modules/data-center/monitoring/auto-fix-executor';
import { dataQualityService } from '@/modules/data-center/monitoring/data-quality-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'suggestions';

    switch (action) {
      case 'suggestions':
        // 鑾峰彇鑷姩淇寤鸿
        const recentResults = dataQualityService.getCheckHistory(50);
        const suggestions =
          await issueIdentificationEngine.identifyIssues(recentResults);

        return NextResponse.json({
          suggestions: suggestions,
          count: suggestions.length,
          timestamp: new Date().toISOString(),
        });

      case 'patterns':
        // 鑾峰彇闂妯″紡
        // 娉ㄦ剰锛氳繖閲岄渶瑕佷慨鏀筰ssueIdentificationEngineユ毚闇瞤atterns
        return NextResponse.json({
          message: '鍔熻兘鏆傛湭瀹炵幇',
          timestamp: new Date().toISOString(),
        });

      case 'execution-status':
        // 鑾峰彇鎵ц鐘        const stats = autoFixCoordinator.getExecutionStats();
        return NextResponse.json({
          executionStats: stats,
          timestamp: new Date().toISOString(),
        });

      case 'effectiveness':
        // 鑾峰彇淇鏁堟灉璇勪及
        const issueType = searchParams.get('issueType');
        const effectiveness = fixEffectivenessEvaluator.getHistoricalStats(
          issueType || undefined
        );
        return NextResponse.json({
          effectiveness: effectiveness,
          issueType: issueType || 'all',
          timestamp: new Date().toISOString(),
        });

      case 'config':
        // 鑾峰彇褰撳墠閰嶇疆
        const config = autoFixCoordinator.getConfig();
        return NextResponse.json({
          configuration: config,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鑷姩淇API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
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
      case 'analyze-issues':
        // 鍒嗘瀽鏁版嵁璐ㄩ噺闂骞剁敓鎴愪慨澶嶅缓        const { checkResults } = params;
        if (!checkResults || !Array.isArray(checkResults)) {
          return NextResponse.json(
            { error: '缂哄皯鏈夋晥鐨勬鏌ョ粨鏋滄暟 },
            { status: 400 }
          );
        }

        const suggestions =
          await issueIdentificationEngine.identifyIssues(checkResults);

        return NextResponse.json({
          message: `鐢熸垚${suggestions.length} 涓慨澶嶅缓璁甡,
          suggestions: suggestions,
          summary: {
            totalSuggestions: suggestions.length,
            highConfidence: suggestions.filter(s => s.confidence > 0.8).length,
            mediumConfidence: suggestions.filter(
              s => s.confidence > 0.5 && s.confidence <= 0.8
            ).length,
            lowConfidence: suggestions.filter(s => s.confidence <= 0.5).length,
          },
          timestamp: new Date().toISOString(),
        });

      case 'execute-fix':
        // 鎵ц鍗曚釜淇
        const { suggestion } = params;
        if (!suggestion) {
          return NextResponse.json(
            { error: '缂哄皯淇寤鸿鏁版嵁' },
            { status: 400 }
          );
        }

        const executionResults = await autoFixCoordinator.batchExecute([
          suggestion,
        ]);
        const executionStatus = executionResults[0];

        // 璇勪及淇鏁堟灉
        const evaluation = fixEffectivenessEvaluator.evaluateEffectiveness(
          suggestion,
          executionStatus
        );

        return NextResponse.json({
          message: '淇鎵ц瀹屾垚',
          suggestion: suggestion,
          executionStatus: executionStatus,
          effectivenessEvaluation: evaluation,
          timestamp: new Date().toISOString(),
        });

      case 'execute-plan':
        // 鎵ц淇璁″垝
        const { fixPlan } = params;
        if (!fixPlan) {
          return NextResponse.json(
            { error: '缂哄皯淇璁″垝鏁版嵁' },
            { status: 400 }
          );
        }

        const planResults = await autoFixCoordinator.executePlan(fixPlan);

        // 璇勪及鏁翠綋鏁堟灉
        const planEvaluations = fixPlan.suggestions.map((suggestion, index) => {
          const executionStatus = planResults[index];
          return {
            suggestionId: suggestion.issueId,
            evaluation: fixEffectivenessEvaluator.evaluateEffectiveness(
              suggestion,
              executionStatus
            ),
          };
        });

        const successfulExecutions = planResults.filter(
          r => r.status === 'completed'
        ).length;
        const failedExecutions = planResults.filter(
          r => r.status === 'failed'
        ).length;

        return NextResponse.json({
          message: `淇璁″垝鎵ц瀹屾垚 (${successfulExecutions}鎴愬姛, ${failedExecutions}澶辫触)`,
          plan: fixPlan,
          executionResults: planResults,
          evaluations: planEvaluations,
          summary: {
            total: planResults.length,
            successful: successfulExecutions,
            failed: failedExecutions,
            successRate:
              planResults.length > 0
                 (successfulExecutions / planResults.length) * 100
                : 0,
          },
          timestamp: new Date().toISOString(),
        });

      case 'cancel-execution':
        // 鍙栨秷鎵ц
        const { suggestionId } = params;
        if (!suggestionId) {
          return NextResponse.json({ error: '缂哄皯寤鸿ID' }, { status: 400 });
        }

        const cancelled =
          await autoFixCoordinator.cancelExecution(suggestionId);

        return NextResponse.json({
          message: cancelled  '鎵ц宸插彇 : '鍙栨秷澶辫触鎴栨墽琛屽凡瀹屾垚',
          suggestionId: suggestionId,
          cancelled: cancelled,
          timestamp: new Date().toISOString(),
        });

      case 'update-config':
        // 鏇存柊閰嶇疆
        const { configUpdates } = params;
        if (!configUpdates) {
          return NextResponse.json(
            { error: '缂哄皯閰嶇疆鏇存柊鏁版嵁' },
            { status: 400 }
          );
        }

        autoFixCoordinator.updateConfig(configUpdates);

        return NextResponse.json({
          message: '閰嶇疆鏇存柊鎴愬姛',
          updates: configUpdates,
          timestamp: new Date().toISOString(),
        });

      case 'register-pattern':
        // 娉ㄥ唽鏂扮殑闂妯″紡
        const { pattern } = params;
        if (!pattern) {
          return NextResponse.json({ error: '缂哄皯妯″紡鏁版嵁' }, { status: 400 });
        }

        // 娉ㄦ剰锛氶渶瑕佷慨鏀筰ssueIdentificationEngineユ敮鎸佹鏂规硶
        return NextResponse.json({
          message: '鍔熻兘鏆傛湭瀹炵幇',
          timestamp: new Date().toISOString(),
        });

      case 'evaluate-effectiveness':
        // 璇勪及鐗瑰畾淇鐨勬晥        const { suggestion: evalSuggestion, executionResult } = params;
        if (!evalSuggestion || !executionResult) {
          return NextResponse.json(
            { error: '缂哄皯璇勪及鎵€闇€鐨勬暟 },
            { status: 400 }
          );
        }

        const evaluationResult =
          fixEffectivenessEvaluator.evaluateEffectiveness(
            evalSuggestion,
            executionResult
          );

        return NextResponse.json({
          evaluation: evaluationResult,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鑷姩淇API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

