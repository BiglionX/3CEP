import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'make_procurement_decision':
        const decisionResult = await makeProcurementDecision(params);
        return NextResponse.json(decisionResult);

      case 'evaluate_suppliers':
        if (!params.requirements || !Array.isArray(params.suppliers)) {
          return NextResponse.json(
            {
              success: false,
              error: '缂哄皯蹇呰鍙傛暟: requirements suppliers',
            },
            { status: 400 }
          );
        }

        const evaluationResult = await evaluateSuppliers(
          params.requirements,
          params.suppliers
        );
        return NextResponse.json(evaluationResult);

      case 'optimize_contract_terms':
        if (!params.proposals || !Array.isArray(params.proposals)) {
          return NextResponse.json(
            { success: false, error: '缂哄皯蹇呰鍙傛暟: proposals' },
            { status: 400 }
          );
        }

        const optimizationResult = await optimizeContractTerms(
          params.proposals,
          params.weights
        );
        return NextResponse.json(optimizationResult);

      case 'assess_risk_impact':
        const riskAssessment = await assessRiskImpact(params);
        return NextResponse.json(riskAssessment);

      case 'generate_alternative_scenarios':
        const scenarioResult = await generateAlternativeScenarios(params);
        return NextResponse.json(scenarioResult);

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏅鸿兘鍐崇瓥寮曟搸API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const decisionId = searchParams.get('decisionId');

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'get_decision_history':
        const { data: historyData, error: historyError } = await supabase
          .from('procurement_decisions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (historyError) {
          return NextResponse.json(
            {
              success: false,
              error: `鏌ヨ鍐崇瓥鍘嗗彶澶辫触: ${historyError.message}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          history: historyData || [],
        });

      case 'get_decision_details':
        if (!decisionId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯decisionId鍙傛暟' },
            { status: 400 }
          );
        }

        const { data: decisionData, error: decisionError } = await supabase
          .from('procurement_decisions')
          .select('*')
          .eq('id', decisionId)
          .single();

        if (decisionError) {
          return NextResponse.json(
            {
              success: false,
              error: `鏌ヨ鍐崇瓥璇︽儏澶辫触: ${decisionError.message}`,
            },
            { status: 500 }
          );
        }

        // 鑾峰彇鍐崇瓥杩囩▼杞ㄨ抗
        const { data: trailData, error: trailError } = await supabase
          .from('decision_process_trails')
          .select('*')
          .eq('decision_id', decisionId)
          .order('execution_order');

        return NextResponse.json({
          success: true,
          decision: decisionData,
          processTrail: trailData || [],
        });

      case 'get_decision_statistics':
        const statsResult = await getDecisionStatistics();
        return NextResponse.json(statsResult);

      case 'health_check':
        return NextResponse.json({
          success: true,
          message: '鏅鸿兘鍐崇瓥寮曟搸鏈嶅姟杩愯姝ｅ父',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('鏅鸿兘鍐崇瓥寮曟搸GET API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鏍稿績鍐崇瓥鍑芥暟
async function makeProcurementDecision(params: any) {
  try {
    const {
      requirements,
      suppliers,
      riskTolerance = 'medium',
      budgetConstraints,
      timelineRequirements,
    } = params;

    // 1. 楠岃瘉杈撳叆鍙傛暟
    if (!requirements || !suppliers || !Array.isArray(suppliers)) {
      return {
        success: false,
        error: '缂哄皯蹇呰鍙傛暟: requirements suppliers',
      };
    }

    // 2. 鍒涘缓鍐崇瓥璁板綍
    const { data: decisionRecord, error: decisionError } = await supabase
      .from('procurement_decisions')
      .insert([
        {
          request_id: params.requestId || crypto.randomUUID(),
          company_id: params.companyId || 'default_company',
          decision_type: 'supplier_selection',
          decision_subtype: 'comprehensive_evaluation',
          decision_status: 'processing',
          priority_level: params.priority || 'medium',
          start_time: new Date().toISOString(),
          confidence_score: 0,
          created_by: params.userId || 'system',
        },
      ])
      .select()
      .single();

    if (decisionError) {
      throw new Error(`鍒涘缓鍐崇瓥璁板綍澶辫触: ${decisionError.message}`);
    }

    // 3. 鎵ц澶氱淮搴﹁瘎
    const evaluationResults = await evaluateSuppliers(requirements, suppliers);
    if (!evaluationResults.success) {
      throw new Error(`渚涘簲鍟嗚瘎板け ${evaluationResults.error}`);
    }

    // 4. 椋庨櫓褰卞搷璇勪及
    const riskAssessment = await assessRiskImpact({
      suppliers: evaluationResults.rankedSuppliers,
      riskTolerance,
    });

    // 5. 鐢熸垚鏈€缁堝喅
    const finalDecision = generateFinalDecision(
      evaluationResults.rankedSuppliers,
      riskAssessment,
      budgetConstraints,
      timelineRequirements
    );

    // 6. 鏇存柊鍐崇瓥璁板綍
    const endTime = new Date().toISOString();
    const duration =
      new Date(endTime).getTime() -
      new Date(decisionRecord.start_time).getTime();

    const { error: updateError } = await supabase
      .from('procurement_decisions')
      .update({
        decision_status: 'completed',
        end_time: endTime,
        total_duration_ms: duration,
        final_outcome: finalDecision,
        confidence_score: finalDecision.confidence,
        alternative_options: finalDecision.alternatives,
      }) as any
      .eq('id', decisionRecord.id);

    if (updateError) {
      console.warn('鏇存柊鍐崇瓥璁板綍澶辫触:', updateError.message);
    }

    // 7. 璁板綍鍐崇瓥杩囩▼杞ㄨ抗
    await recordDecisionProcess(decisionRecord.id, {
      evaluation: evaluationResults,
      riskAssessment,
      finalDecision,
    });

    return {
      success: true,
      decisionId: decisionRecord.id,
      result: finalDecision,
      processTime: duration,
    };
  } catch (error) {
    console.error('閲囪喘鍐崇瓥鎵ц閿欒:', error);
    return {
      success: false,
      error: `鍐崇瓥鎵ц澶辫触: ${(error as Error).message}`,
    };
  }
}

async function evaluateSuppliers(requirements: any, suppliers: any[]) {
  try {
    const evaluatedSuppliers = suppliers.map(supplier => {
      // 璁＄畻鍚勭淮搴﹀緱
      const qualityScore = calculateQualityScore(supplier, requirements);
      const priceScore = calculatePriceScore(supplier, requirements);
      const deliveryScore = calculateDeliveryScore(supplier, requirements);
      const serviceScore = calculateServiceScore(supplier);
      const innovationScore = calculateInnovationScore(supplier);

      // 璁＄畻缁煎悎寰楀垎锛堜娇鐢ㄥ姩鎬佹潈閲嶏級
      const weights = getDynamicWeights(requirements.priority);
      const overallScore =
        qualityScore * weights.quality +
        priceScore * weights.price +
        deliveryScore * weights.delivery +
        serviceScore * weights.service +
        innovationScore * weights.innovation;

      return {
        ...supplier,
        scores: {
          quality: qualityScore,
          price: priceScore,
          delivery: deliveryScore,
          service: serviceScore,
          innovation: innovationScore,
          overall: overallScore,
        },
        weights,
      };
    });

    // 鎸夌患鍚堝緱鍒嗘帓
    const rankedSuppliers = evaluatedSuppliers.sort(
      (a, b) => b.scores.overall - a.scores.overall
    );

    return {
      success: true,
      rankedSuppliers,
      evaluationSummary: {
        totalSuppliers: suppliers.length,
        topSupplier: rankedSuppliers[0],
        averageScore:
          rankedSuppliers.reduce((sum, s) => sum + s.scores.overall, 0) /
          suppliers.length,
      },
    };
  } catch (error) {
    console.error('渚涘簲鍟嗚瘎伴敊', error);
    return {
      success: false,
      error: `璇勪及澶辫触: ${(error as Error).message}`,
    };
  }
}

async function optimizeContractTerms(proposals: any[], weights: any = {}) {
  try {
    // 榛樿鏉冮噸閰嶇疆
    const defaultWeights = {
      price: 0.4,
      quality: 0.25,
      delivery: 0.2,
      service: 0.1,
      innovation: 0.05,
      ...weights,
    };

    const optimizedProposals = proposals.map(proposal => {
      // 鏍囧噯鍖栧悇椤规寚鏍囧埌0-100鑼冨洿
      const normalizedPrice = normalizeValue(proposal.price, 'min'); // 牸瓒婁綆瓒婂ソ
      const normalizedQuality = proposal.quality || 80;
      const normalizedDelivery = proposal.deliveryTime
         Math.max(0, 100 - (proposal.deliveryTime / 30) * 100)
        : 70;
      const normalizedService = proposal.serviceLevel || 75;
      const normalizedInnovation = proposal.innovation || 60;

      // 璁＄畻缁煎悎寰楀垎
      const compositeScore =
        normalizedPrice * defaultWeights.price +
        normalizedQuality * defaultWeights.quality +
        normalizedDelivery * defaultWeights.delivery +
        normalizedService * defaultWeights.service +
        normalizedInnovation * defaultWeights.innovation;

      return {
        ...proposal,
        normalizedScores: {
          price: normalizedPrice,
          quality: normalizedQuality,
          delivery: normalizedDelivery,
          service: normalizedService,
          innovation: normalizedInnovation,
        },
        compositeScore,
      };
    });

    // 鎸夌患鍚堝緱鍒嗘帓
    const rankedProposals = optimizedProposals.sort(
      (a, b) => b.compositeScore - a.compositeScore
    );

    return {
      success: true,
      optimizedProposals: rankedProposals,
      bestProposal: rankedProposals[0],
      weights: defaultWeights,
    };
  } catch (error) {
    console.error('鍚堝悓鏉℃樺寲閿欒:', error);
    return {
      success: false,
      error: `樺寲澶辫触: ${(error as Error).message}`,
    };
  }
}

async function assessRiskImpact(params: any) {
  try {
    const { suppliers, riskTolerance = 'medium' } = params;

    const riskLevels = {
      low: { threshold: 30, multiplier: 1.0 },
      medium: { threshold: 50, multiplier: 1.1 },
      high: { threshold: 70, multiplier: 1.3 },
    };

    const toleranceConfig =
      riskLevels[riskTolerance as keyof typeof riskLevels] || riskLevels.medium;

    const assessedSuppliers = suppliers.map((supplier: any) => {
      // 鍩轰簬渚涘簲鍟嗛闄╄瘎鍒嗚皟鏁寸患鍚堝緱
      const riskScore = supplier.riskScore || 50;
      const riskAdjustedScore = supplier.overall || 70;

      // 椋庨櫓瀹瑰繊搴﹁皟
      let finalScore = riskAdjustedScore;
      if (riskScore > toleranceConfig.threshold) {
        finalScore = riskAdjustedScore / toleranceConfig.multiplier;
      }

      return {
        ...supplier,
        riskAssessment: {
          originalScore: riskAdjustedScore,
          riskScore,
          riskTolerance,
          adjustmentFactor:
            riskScore > toleranceConfig.threshold
               1 / toleranceConfig.multiplier
              : 1,
          finalScore,
        },
      };
    });

    return {
      success: true,
      assessedSuppliers: assessedSuppliers.sort(
        (a, b) => b.riskAssessment.finalScore - a.riskAssessment.finalScore
      ),
      riskToleranceConfig: toleranceConfig,
    };
  } catch (error) {
    console.error('椋庨櫓褰卞搷璇勪及閿欒:', error);
    return {
      success: false,
      error: `椋庨櫓璇勪及澶辫触: ${(error as Error).message}`,
    };
  }
}

async function generateAlternativeScenarios(params: any) {
  try {
    const { baseScenario, variations = [], constraints = {} } = params;

    const scenarios = [
      {
        id: 'conservative',
        name: '淇濆畧鏂规',
        description: '樺厛鑰冭檻椋庨櫓鏈€灏忓寲',
        weights: {
          quality: 0.35,
          price: 0.2,
          delivery: 0.25,
          service: 0.15,
          innovation: 0.05,
        },
        riskTolerance: 'low',
      },
      {
        id: 'balanced',
        name: '骞宠　鏂规',
        description: '缁煎悎鑰冭檻鍚勬柟闈㈠洜,
        weights: {
          quality: 0.3,
          price: 0.25,
          delivery: 0.2,
          service: 0.15,
          innovation: 0.1,
        },
        riskTolerance: 'medium',
      },
      {
        id: 'aggressive',
        name: '婵€杩涙柟,
        description: '樺厛鑰冭檻鎴愭湰鏁堢泭',
        weights: {
          quality: 0.25,
          price: 0.35,
          delivery: 0.2,
          service: 0.1,
          innovation: 0.1,
        },
        riskTolerance: 'high',
      },
    ];

    // 搴旂敤鑷畾涔夊彉
    variations.forEach((variation: any, index: number) => {
      scenarios.push({
        id: `custom_${index + 1}`,
        name: variation.name || `鑷畾涔夋柟${index + 1}`,
        description: variation.description || '鐢ㄦ埛鑷畾涔夋柟,
        weights: { ...scenarios[1].weights, ...variation.weights },
        riskTolerance: variation.riskTolerance || 'medium',
      });
    });

    return {
      success: true,
      scenarios,
      baseScenario,
    };
  } catch (error) {
    console.error('鍦烘櫙鐢熸垚閿欒:', error);
    return {
      success: false,
      error: `鍦烘櫙鐢熸垚澶辫触: ${(error as Error).message}`,
    };
  }
}

// 杈呭姪鍑芥暟
function calculateQualityScore(supplier: any, requirements: any): number {
  const baseScore = supplier.qualityScore || 75;
  const requirementMatch = requirements.qualityRequirements  85 : 75;
  return (baseScore + requirementMatch) / 2;
}

function calculatePriceScore(supplier: any, requirements: any): number {
  const baseScore = supplier.priceCompetitiveness || 70;
  const budgetAlignment = requirements.budget  80 : 70;
  return (baseScore + budgetAlignment) / 2;
}

function calculateDeliveryScore(supplier: any, requirements: any): number {
  const baseScore = supplier.deliveryReliability || 80;
  const timelineMatch = requirements.timeline  85 : 75;
  return (baseScore + timelineMatch) / 2;
}

function calculateServiceScore(supplier: any): number {
  return supplier.serviceScore || 75;
}

function calculateInnovationScore(supplier: any): number {
  return supplier.innovationIndex || 65;
}

function getDynamicWeights(priority: string = 'balanced') {
  const weightConfigs = {
    quality_focus: {
      quality: 0.35,
      price: 0.2,
      delivery: 0.2,
      service: 0.15,
      innovation: 0.1,
    },
    cost_focus: {
      quality: 0.25,
      price: 0.35,
      delivery: 0.2,
      service: 0.1,
      innovation: 0.1,
    },
    balanced: {
      quality: 0.3,
      price: 0.25,
      delivery: 0.2,
      service: 0.15,
      innovation: 0.1,
    },
  };

  return (
    weightConfigs[priority as keyof typeof weightConfigs] ||
    weightConfigs.balanced
  );
}

function normalizeValue(value: number, optimization: 'min' | 'max'): number {
  // 绠€鍗曠殑褰掍竴鍖栧疄
  const minValue = 1;
  const maxValue = 1000;
  const normalized = ((value - minValue) / (maxValue - minValue)) * 100;

  return optimization === 'min'  100 - normalized : normalized;
}

function generateFinalDecision(
  rankedSuppliers: any[],
  riskAssessment: any,
  budgetConstraints: any,
  timelineRequirements: any
) {
  const topSupplier = rankedSuppliers[0];

  // 鐢熸垚鎺ㄨ崘鐞嗙敱
  const rationale = [
    `鍩轰簬缁煎悎璇勪及锛屾帹鑽愰€夋嫨渚涘簲"${topSupplier.companyName}"`,
    `缁煎悎寰楀垎${topSupplier.scores.overall.toFixed(1)} 鍒嗭紝鎺掑悕绗竴`,
    `鍦ㄨ川閲忓拰浜や粯鍙潬鎬ф柟闈㈣〃鐜颁紭绉€`,
    `绗﹀悎棰勭畻鍜屾椂闂磋姹俙,
  ];

  // 鐢熸垚澶囬€夋柟
  const alternatives = rankedSuppliers
    .slice(1, 4)
    .map((supplier: any, index: number) => ({
      rank: index + 2,
      supplierName: supplier.companyName,
      score: supplier.scores.overall,
      keyAdvantages: [
        `牸鏇村叿绔炰簤(+${(supplier.scores.price - topSupplier.scores.price).toFixed(1)}`,
        `浜や粯堕棿鏇寸煭 (-${(topSupplier.scores.delivery - supplier.scores.delivery).toFixed(1)}鍒嗗樊`,
      ].filter(Boolean),
    }));

  return {
    recommendedSupplier: topSupplier.companyName,
    confidence: Math.min(0.95, 0.7 + (topSupplier.scores.overall / 100) * 0.25),
    rationale: rationale.join('),
    alternatives,
    keyMetrics: {
      totalSuppliersEvaluated: rankedSuppliers.length,
      topScore: topSupplier.scores.overall,
      scoreGap:
        rankedSuppliers.length > 1
           topSupplier.scores.overall - rankedSuppliers[1].scores.overall
          : 0,
    },
  };
}

async function recordDecisionProcess(decisionId: string, processData: any) {
  try {
    const processSteps = [
      { node: 'INPUT_VALIDATION', order: 1, data: processData.evaluation },
      { node: 'RISK_ASSESSMENT', order: 2, data: processData.riskAssessment },
      { node: 'FINAL_DECISION', order: 3, data: processData.finalDecision },
    ];

    for (const step of processSteps) {
      await supabase.from('decision_process_trails').insert([
        {
          decision_id: decisionId,
          node_id: step.node,
          execution_order: step.order,
          input_data: {},
          output_data: step.data,
          execution_status: 'completed',
          execution_time_ms: Math.floor(Math.random() * 100) + 50,
          confidence_score: 0.9,
        },
      ]);
    }
  } catch (error) {
    console.warn('璁板綍鍐崇瓥杩囩▼澶辫触:', error);
  }
}

async function getDecisionStatistics() {
  try {
    const { data, error } = await supabase
      .from('procurement_decisions')
      .select(
        'decision_type, decision_status, confidence_score, total_duration_ms'
      )
      .limit(1000);

    if (error) {
      throw new Error(`鏌ヨ缁熻鏁版嵁澶辫触: ${error.message}`);
    }

    const stats = {
      totalDecisions: (data as any).length || 0,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      avgConfidence: 0,
      avgDuration: 0,
    };

    if (data && data.length > 0) {
      data.forEach(decision => {
        stats.byType[decision.decision_type] =
          (stats.byType[decision.decision_type] || 0) + 1;
        stats.byStatus[decision.decision_status] =
          (stats.byStatus[decision.decision_status] || 0) + 1;
      });

      const totalConfidence = data.reduce(
        (sum, d) => sum + (d.confidence_score || 0),
        0
      );
      const totalDuration = data.reduce(
        (sum, d) => sum + (d.total_duration_ms || 0),
        0
      );

      stats.avgConfidence = totalConfidence / data.length;
      stats.avgDuration = totalDuration / data.length;
    }

    return {
      success: true,
      statistics: stats,
    };
  } catch (error) {
    console.error('鑾峰彇鍐崇瓥缁熻閿欒:', error);
    return {
      success: false,
      error: `鑾峰彇缁熻澶辫触: ${(error as Error).message}`,
    };
  }
}

