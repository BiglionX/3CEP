import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
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
      case 'assess_supplier_risk':
        if (!params.supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }

        // 鏌ヨ渚涘簲鍟嗗熀鏈俊        const { data: supplierData, error: supplierError } = await supabase
          .from('supplier_intelligence_profiles')
          .select('*')
          .eq('supplier_id', params.supplierId)
          .single();

        if (supplierError) {
          return NextResponse.json(
            {
              success: false,
              error: `鏌ヨ渚涘簲鍟嗕俊鎭け ${supplierError.message}`,
            },
            { status: 500 }
          );
        }

        if (!supplierData) {
          return NextResponse.json(
            { success: false, error: '渚涘簲鍟嗕笉瀛樺湪' },
            { status: 404 }
          );
        }

        // 璁＄畻椋庨櫓璇勫垎锛堝熀浜庣幇鏈夋暟鎹級
        const riskAssessment = calculateSupplierRisk(supplierData);

        // 瀛樺偍椋庨櫓璇勪及缁撴灉
        const { error: storeError } = await supabase
          .from('supplier_risk_assessments')
          .insert([
            {
              supplier_id: params.supplierId,
              supplier_name: supplierData.company_name,
              overall_risk_score: riskAssessment.overallRiskScore,
              risk_level: riskAssessment.riskLevel,
              dimensions: riskAssessment.riskCategories,
              assessment_date: new Date().toISOString(),
              next_review_date: calculateNextReviewDate(
                riskAssessment.riskLevel
              ),
              confidence_level: riskAssessment.confidence,
              risk_drivers: riskAssessment.riskDrivers,
              mitigation_recommendations:
                riskAssessment.mitigationRecommendations,
            },
          ]);

        if (storeError) {
          console.warn('瀛樺偍椋庨櫓璇勪及缁撴灉澶辫触:', storeError.message);
        }

        return NextResponse.json({
          success: true,
          assessment: riskAssessment,
        });

      case 'get_risk_history':
        if (!params.supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }

        const { data: historyData, error: historyError } = await supabase
          .from('supplier_risk_assessments')
          .select('*')
          .eq('supplier_id', params.supplierId)
          .order('assessment_date', { ascending: false })
          .limit(10);

        if (historyError) {
          return NextResponse.json(
            {
              success: false,
              error: `鏌ヨ椋庨櫓鍘嗗彶澶辫触: ${historyError.message}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          history: historyData || [],
        });

      case 'batch_risk_assessment':
        const { supplierIds } = params;
        if (!Array.isArray(supplierIds) || supplierIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'supplierIds蹇呴』鏄潪绌烘暟 },
            { status: 400 }
          );
        }

        const batchResults = [];
        for (const supplierId of supplierIds) {
          try {
            const { data: supplierData } = await supabase
              .from('supplier_intelligence_profiles')
              .select('*')
              .eq('supplier_id', supplierId)
              .single();

            if (supplierData) {
              const riskAssessment = calculateSupplierRisk(supplierData);
              batchResults.push({
                supplierId,
                supplierName: supplierData.company_name,
                assessment: riskAssessment,
              });
            }
          } catch (error) {
            batchResults.push({
              supplierId,
              error: (error as Error).message,
            });
          }
        }

        return NextResponse.json({
          success: true,
          results: batchResults,
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('椋庨櫓鍒嗘瀽API閿欒:', error);
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
    const supplierId = searchParams.get('supplierId');

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'latest_assessment':
        if (!supplierId) {
          return NextResponse.json(
            { success: false, error: '缂哄皯supplierId鍙傛暟' },
            { status: 400 }
          );
        }

        const { data: latestAssessment, error } = await supabase
          .from('supplier_risk_assessments')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('assessment_date', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          return NextResponse.json(
            { success: false, error: `鏌ヨ鏈€鏂拌瘎板け ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          assessment: latestAssessment || null,
        });

      case 'risk_summary':
        // 鑾峰彇椋庨櫓姹囨€荤粺        const { data: summaryData, error: summaryError } = await supabase
          .from('supplier_risk_assessments')
          .select('risk_level, count')
          .neq('risk_level', null)
          .group('risk_level');

        if (summaryError) {
          return NextResponse.json(
            {
              success: false,
              error: `鏌ヨ椋庨櫓姹囨€诲け ${summaryError.message}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          summary: summaryData || [],
        });

      case 'health_check':
        return NextResponse.json({
          success: true,
          message: '椋庨櫓鍒嗘瀽鏈嶅姟杩愯姝ｅ父',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('椋庨櫓鍒嗘瀽GET API閿欒:', error);
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

// 杈呭姪鍑芥暟
function calculateSupplierRisk(supplierData: any) {
  const riskCategories = {
    financial: 0,
    operational: 0,
    compliance: 0,
    geopolitical: 0,
    supplyChain: 0,
  };

  // 璐㈠姟椋庨櫓璁＄畻
  if (supplierData.business_scale === 'small') {
    riskCategories.financial = 70;
  } else if (supplierData.business_scale === 'medium') {
    riskCategories.financial = 40;
  } else {
    riskCategories.financial = 20;
  }

  // 杩愯惀椋庨櫓璁＄畻锛堝熀浜庝氦樿瘎鍒嗭級
  riskCategories.operational = Math.max(
    0,
    100 - (supplierData.delivery_score || 50)
  );

  // 鍚堣椋庨櫓璁＄畻锛堝熀浜庤璇佹儏鍐碉級
  const certificationCount = supplierData.length || 0;
  riskCategories.compliance = Math.max(0, 80 - certificationCount * 15);

  // 鍦扮紭鏀挎不椋庨櫓璁＄畻
  const highRiskCountries = ['North Korea', 'Iran', 'Syria', 'Russia'];
  riskCategories.geopolitical = highRiskCountries.includes(
    supplierData.registration_country
  )
     80
    : 20;

  // 渚涘簲鹃闄╄  riskCategories.supplyChain =
    supplierData.business_scale === 'enterprise'  15 : 45;

  // 璁＄畻缁煎悎椋庨櫓寰楀垎
  const weights = {
    financial: 0.25,
    operational: 0.2,
    compliance: 0.2,
    geopolitical: 0.2,
    supplyChain: 0.15,
  };
  const overallRiskScore =
    riskCategories.financial * weights.financial +
    riskCategories.operational * weights.operational +
    riskCategories.compliance * weights.compliance +
    riskCategories.geopolitical * weights.geopolitical +
    riskCategories.supplyChain * weights.supplyChain;

  // 纭畾椋庨櫓绛夌骇
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (overallRiskScore >= 80) riskLevel = 'critical';
  else if (overallRiskScore >= 60) riskLevel = 'high';
  else if (overallRiskScore >= 40) riskLevel = 'medium';

  // 鐢熸垚椋庨櫓椹卞姩鍥犵礌
  const riskDrivers = [];
  if (riskCategories.financial > 60) riskDrivers.push('璐㈠姟绋冲畾鎬т笉);
  if (riskCategories.operational > 60) riskDrivers.push('浜や粯鑳藉姏杈冨急');
  if (riskCategories.compliance > 60) riskDrivers.push('鍚堣璁よ瘉涓嶅厖);
  if (riskCategories.geopolitical > 60) riskDrivers.push('鍦扮紭鏀挎不椋庨櫓杈冮珮');
  if (riskCategories.supplyChain > 60) riskDrivers.push('渚涘簲捐剢寮辨€ч珮');

  // 鐢熸垚缂撹В寤鸿
  const mitigationRecommendations = [];
  if (riskCategories.financial > 50) {
    mitigationRecommendations.push('瑕佹眰鎻愪緵璐㈠姟鎶ヨ〃杩涜娣卞叆鍒嗘瀽');
    mitigationRecommendations.push('璁剧疆鍒嗘湡樻鏉′欢');
  }
  if (riskCategories.operational > 50) {
    mitigationRecommendations.push('寤虹珛澶囩敤渚涘簲鍟嗗悕);
    mitigationRecommendations.push('缂╃煭浜や粯鍛ㄦ湡瑕佹眰');
  }
  if (riskCategories.compliance > 50) {
    mitigationRecommendations.push('瑕佹眰鎻愪緵鐩稿叧璁よ瘉璇佷功');
    mitigationRecommendations.push('瀹夋帓绗笁鏂瑰);
  }

  return {
    overallRiskScore: Math.round(overallRiskScore),
    riskLevel,
    riskCategories,
    riskDrivers: riskDrivers.slice(0, 3),
    mitigationRecommendations: mitigationRecommendations.slice(0, 5),
    confidence: 0.85, // 鍩轰簬鏁版嵁瀹屾暣鎬х殑缃俊    assessmentDate: new Date().toISOString(),
  };
}

function calculateNextReviewDate(riskLevel: string): string {
  const now = new Date();
  let daysToAdd = 30; // 榛樿姣忔湀瀹℃煡

  switch (riskLevel) {
    case 'critical':
      daysToAdd = 7; // 姣忓懆瀹℃煡
      break;
    case 'high':
      daysToAdd = 14; // 姣忎袱鍛ㄥ      break;
    case 'medium':
      daysToAdd = 30; // 姣忔湀瀹℃煡
      break;
    case 'low':
      daysToAdd = 90; // 姣忓搴﹀      break;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + daysToAdd);

  return nextReview.toISOString();
}

