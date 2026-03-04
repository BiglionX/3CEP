/**
 * 供应商能力评分算法简化测试
 * 验证核心评分逻辑
 */

// 模拟核心类和枚举
const CapabilityDimension = {
  QUALITY: 'quality',
  DELIVERY: 'delivery',
  PRICE: 'price',
  SERVICE: 'service',
  INNOVATION: 'innovation',
};

const DEFAULT_WEIGHTS = {
  quality: 0.3,
  delivery: 0.2,
  price: 0.25,
  service: 0.15,
  innovation: 0.1,
};

// 简化的评分引擎实现
class SimpleScoringEngine {
  constructor(weights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  assessDimension(dimension, factors) {
    // 计算加权平均得分
    let weightedSum = 0;
    let totalWeight = 0;
    let confidenceSum = 0;

    factors.forEach(factor => {
      weightedSum += factor.currentValue * factor.weight;
      totalWeight += factor.weight;
      confidenceSum += factor.confidence * factor.weight;
    });

    const dimensionScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const dimensionConfidence =
      totalWeight > 0 ? confidenceSum / totalWeight : 0;

    return {
      dimension,
      score: Math.min(100, Math.max(0, dimensionScore)),
      weight: this.weights[dimension],
      factors,
      confidence: Math.min(1, Math.max(0, dimensionConfidence)),
      lastAssessmentDate: new Date().toISOString(),
    };
  }

  generateCapabilityProfile(supplierId, supplierName, dimensionAssessments) {
    // 计算综合得分
    let overallScore = 0;
    let totalWeight = 0;
    let confidenceSum = 0;

    dimensionAssessments.forEach(assessment => {
      overallScore += assessment.score * assessment.weight;
      totalWeight += assessment.weight;
      confidenceSum += assessment.confidence * assessment.weight;
    });

    const finalScore = totalWeight > 0 ? overallScore / totalWeight : 0;
    const finalConfidence = totalWeight > 0 ? confidenceSum / totalWeight : 0;

    // 确定供应商等级
    const tier = this.determineSupplierTier(finalScore);

    // 生成分析和建议
    const { strengths, weaknesses, recommendations } =
      this.generateAnalysis(dimensionAssessments);

    return {
      supplierId,
      supplierName,
      overallScore: Math.min(100, Math.max(0, finalScore)),
      dimensions: dimensionAssessments,
      tier,
      tierConfidence: Math.min(1, Math.max(0, finalConfidence)),
      lastUpdated: new Date().toISOString(),
      strengths,
      weaknesses,
      recommendations,
    };
  }

  determineSupplierTier(score) {
    if (score >= 90) return 'premium';
    if (score >= 70) return 'standard';
    if (score >= 50) return 'basic';
    return 'risky';
  }

  generateAnalysis(dimensionAssessments) {
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];

    dimensionAssessments.forEach(assessment => {
      const dimensionName = this.getDimensionDisplayName(assessment.dimension);

      if (assessment.score >= 85) {
        strengths.push(
          `${dimensionName}表现优秀 (${assessment.score.toFixed(1)}分)`
        );
      } else if (assessment.score >= 70) {
        if (assessment.score < 75) {
          recommendations.push(`适度提升${dimensionName}能力`);
        }
      } else if (assessment.score >= 50) {
        weaknesses.push(
          `${dimensionName}有待改善 (${assessment.score.toFixed(1)}分)`
        );
        recommendations.push(`重点关注${dimensionName}能力提升`);
      } else {
        weaknesses.push(
          `${dimensionName}表现较差 (${assessment.score.toFixed(1)}分)`
        );
        recommendations.push(`紧急改善${dimensionName}相关问题`);
      }
    });

    return { strengths, weaknesses, recommendations };
  }

  getDimensionDisplayName(dimension) {
    const names = {
      [CapabilityDimension.QUALITY]: '质量能力',
      [CapabilityDimension.DELIVERY]: '交付能力',
      [CapabilityDimension.PRICE]: '价格竞争力',
      [CapabilityDimension.SERVICE]: '服务能力',
      [CapabilityDimension.INNOVATION]: '创新能力',
    };
    return names[dimension] || dimension;
  }
}

// 测试数据
const mockFactors = {
  [CapabilityDimension.QUALITY]: [
    {
      factorId: 'defect_rate',
      factorName: '不良率',
      weight: 0.4,
      currentValue: 95,
      confidence: 0.9,
    },
    {
      factorId: 'certification',
      factorName: '认证情况',
      weight: 0.6,
      currentValue: 85,
      confidence: 0.8,
    },
  ],
  [CapabilityDimension.DELIVERY]: [
    {
      factorId: 'on_time_rate',
      factorName: '准时交付率',
      weight: 0.7,
      currentValue: 92,
      confidence: 0.95,
    },
    {
      factorId: 'lead_time',
      factorName: '平均交货时间',
      weight: 0.3,
      currentValue: 75,
      confidence: 0.85,
    },
  ],
  [CapabilityDimension.PRICE]: [
    {
      factorId: 'competitiveness',
      factorName: '价格竞争力',
      weight: 0.6,
      currentValue: 80,
      confidence: 0.9,
    },
    {
      factorId: 'stability',
      factorName: '价格稳定性',
      weight: 0.4,
      currentValue: 88,
      confidence: 0.8,
    },
  ],
  [CapabilityDimension.SERVICE]: [
    {
      factorId: 'response_time',
      factorName: '响应时间',
      weight: 0.5,
      currentValue: 90,
      confidence: 0.85,
    },
    {
      factorId: 'support_quality',
      factorName: '支持质量',
      weight: 0.5,
      currentValue: 85,
      confidence: 0.9,
    },
  ],
  [CapabilityDimension.INNOVATION]: [
    {
      factorId: 'rd_investment',
      factorName: '研发投入',
      weight: 0.4,
      currentValue: 70,
      confidence: 0.7,
    },
    {
      factorId: 'new_products',
      factorName: '新产品推出',
      weight: 0.6,
      currentValue: 75,
      confidence: 0.75,
    },
  ],
};

// 测试函数
function runCapabilityScoringTest() {
  console.log('🧪 开始供应商能力评分测试\n');
  console.log('='.repeat(50));

  const engine = new SimpleScoringEngine(DEFAULT_WEIGHTS);

  // 测试数据
  const supplierData = {
    supplierId: 'test-supplier-001',
    supplierName: '测试供应商有限公司',
  };

  console.log('📥 输入数据:');
  console.log(`供应商: ${supplierData.supplierName}`);
  console.log(`评估维度数: ${Object.keys(mockFactors).length}`);
  console.log('');

  // 评估各个维度
  console.log('📊 维度评估过程:');
  const dimensionAssessments = Object.entries(mockFactors).map(
    ([dimension, factors]) => {
      const assessment = engine.assessDimension(dimension, factors);
      console.log(`  ${dimension.toUpperCase()}:`);
      console.log(`    得分: ${assessment.score.toFixed(2)}/100`);
      console.log(`    权重: ${(assessment.weight * 100).toFixed(1)}%`);
      console.log(`    置信度: ${(assessment.confidence * 100).toFixed(1)}%`);
      console.log(`    因子数: ${assessment.factors.length}`);
      return assessment;
    }
  );

  console.log('');

  // 生成能力画像
  const profile = engine.generateCapabilityProfile(
    supplierData.supplierId,
    supplierData.supplierName,
    dimensionAssessments
  );

  // 输出结果
  console.log('🏆 最终评估结果:');
  console.log('='.repeat(30));
  console.log(`供应商名称: ${profile.supplierName}`);
  console.log(`综合得分: ${profile.overallScore.toFixed(2)}/100`);
  console.log(`供应商等级: ${profile.tier}`);
  console.log(`等级置信度: ${(profile.tierConfidence * 100).toFixed(1)}%`);
  console.log(`最后更新: ${profile.lastUpdated}`);

  console.log('\n📈 各维度详细评分:');
  profile.dimensions.forEach(dimension => {
    console.log(
      `  ${engine.getDimensionDisplayName(dimension.dimension)}: ${dimension.score.toFixed(1)}/100`
    );
    console.log(`    权重: ${(dimension.weight * 100).toFixed(0)}%`);
    console.log(`    置信度: ${(dimension.confidence * 100).toFixed(1)}%`);
  });

  console.log('\n💪 优势领域:');
  if (profile.strengths.length > 0) {
    profile.strengths.forEach(strength => console.log(`  ✓ ${strength}`));
  } else {
    console.log('  无明显优势');
  }

  console.log('\n🔧 待改进领域:');
  if (profile.weaknesses.length > 0) {
    profile.weaknesses.forEach(weakness => console.log(`  ⚠ ${weakness}`));
  } else {
    console.log('  无明显短板');
  }

  console.log('\n💡 改进建议:');
  if (profile.recommendations.length > 0) {
    profile.recommendations.forEach(rec => console.log(`  • ${rec}`));
  } else {
    console.log('  无需特别改进建议');
  }

  // 验证计算正确性
  console.log('\n🔍 计算验证:');
  const calculatedScore = profile.dimensions.reduce(
    (sum, dim) => sum + dim.score * dim.weight,
    0
  );
  console.log(`手动计算综合得分: ${calculatedScore.toFixed(2)}`);
  console.log(`系统计算综合得分: ${profile.overallScore.toFixed(2)}`);
  console.log(
    `差异: ${Math.abs(calculatedScore - profile.overallScore).toFixed(6)}`
  );

  const weightSum = profile.dimensions.reduce(
    (sum, dim) => sum + dim.weight,
    0
  );
  console.log(`权重总和: ${weightSum.toFixed(6)} (应该等于1.0)`);

  // 测试边界情况
  console.log('\n🚧 边界情况测试:');
  testEdgeCases(engine);

  console.log(`\n${'='.repeat(50)}`);
  console.log('✅ 测试完成！');

  return profile;
}

function testEdgeCases(engine) {
  console.log('1. 测试零权重情况:');
  const zeroFactors = [
    {
      factorId: 'test',
      factorName: '测试因子',
      weight: 0,
      currentValue: 100,
      confidence: 1.0,
    },
  ];
  const zeroAssessment = engine.assessDimension(
    CapabilityDimension.QUALITY,
    zeroFactors
  );
  console.log(
    `   结果: 得分=${zeroAssessment.score}, 置信度=${zeroAssessment.confidence}`
  );

  console.log('2. 测试超范围分数:');
  const extremeFactors = [
    {
      factorId: 'extreme',
      factorName: '极端因子',
      weight: 1.0,
      currentValue: 150, // 超出100分
      confidence: 1.0,
    },
  ];
  const extremeAssessment = engine.assessDimension(
    CapabilityDimension.QUALITY,
    extremeFactors
  );
  console.log(`   结果: 得分=${extremeAssessment.score} (应该被限制在100以内)`);

  console.log('3. 测试负分数:');
  const negativeFactors = [
    {
      factorId: 'negative',
      factorName: '负分因子',
      weight: 1.0,
      currentValue: -50, // 负分
      confidence: 1.0,
    },
  ];
  const negativeAssessment = engine.assessDimension(
    CapabilityDimension.QUALITY,
    negativeFactors
  );
  console.log(`   结果: 得分=${negativeAssessment.score} (应该被限制在0以上)`);
}

// 执行测试
if (require.main === module) {
  try {
    const result = runCapabilityScoringTest();
    console.log('\n✨ 测试执行成功！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }
}

module.exports = { runCapabilityScoringTest, SimpleScoringEngine };
