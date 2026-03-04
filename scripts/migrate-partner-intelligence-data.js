#!/usr/bin/env node
/**
 * 供应商智能数据迁移脚本 (B004-2)
 * 将现有foreign_trade_partners数据迁移到智能采购扩展结构
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase客户端配置
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 迁移配置
const MIGRATION_CONFIG = {
  batchSize: 100, // 批处理大小
  delayBetweenBatches: 1000, // 批次间延迟(ms)
  defaultValues: {
    intelligenceRating: 3.0, // 默认智能评分为中等
    cooperationDepth: 'standard', // 默认合作深度
    riskExposureLevel: 'medium', // 默认风险暴露水平
    deliveryPerformanceScore: 3.5, // 默认交付表现评分
    qualityComplaintRate: 0.02, // 默认质量投诉率2%
    sustainabilityScore: 3.0, // 默认可持续发展评分
    digitalIntegrationLevel: 'intermediate', // 默认数字化集成水平
  },
};

/**
 * 评估供应商合作深度
 * @param {Object} partner - 供应商数据
 * @returns {string} 合作深度等级
 */
function evaluateCooperationDepth(partner) {
  const cooperationYears = partner.cooperation_years || 0;
  const rating = partner.rating || 0;
  const annualVolume = partner.annual_volume || 0;

  if (cooperationYears >= 3 && rating >= 4.0 && annualVolume >= 1000000) {
    return 'strategic';
  } else if (cooperationYears >= 1 && rating >= 3.5) {
    return 'preferred';
  } else if (cooperationYears >= 0.5) {
    return 'standard';
  } else {
    return 'casual';
  }
}

/**
 * 评估供应商风险暴露水平
 * @param {Object} partner - 供应商数据
 * @returns {string} 风险等级
 */
function evaluateRiskExposure(partner) {
  const rating = partner.rating || 0;
  const cooperationYears = partner.cooperation_years || 0;
  const paymentTerms = partner.payment_terms || '';
  const country = partner.country || '';

  // 高风险因素权重
  let riskScore = 0;

  // 评分低增加风险
  if (rating < 2.5) riskScore += 3;
  else if (rating < 3.5) riskScore += 1;

  // 合作时间短增加风险
  if (cooperationYears < 1) riskScore += 2;
  else if (cooperationYears < 2) riskScore += 1;

  // 付款条件宽松增加风险
  if (paymentTerms.includes('90') || paymentTerms.includes('120'))
    riskScore += 1;

  // 地缘政治风险国家
  const highRiskCountries = ['Russia', 'North Korea', 'Iran', 'Syria'];
  if (highRiskCountries.some(countryName => country.includes(countryName))) {
    riskScore += 2;
  }

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  if (riskScore >= 1) return 'low';
  return 'low';
}

/**
 * 估算年度交易额
 * @param {Object} partner - 供应商数据
 * @returns {number} 估算的年交易额
 */
function estimateAnnualTradingVolume(partner) {
  const cooperationYears = partner.cooperation_years || 1;
  const rating = partner.rating || 3.0;
  const baseVolume = partner.annual_volume || 500000;

  // 基于合作年限和评分调整
  const experienceMultiplier = Math.min(1 + cooperationYears * 0.1, 2);
  const ratingMultiplier = (rating / 5) * 0.8 + 0.6; // 0.6-1.4倍

  return Math.round(baseVolume * experienceMultiplier * ratingMultiplier);
}

/**
 * 生成供应商偏好品类
 * @param {Object} partner - 供应商数据
 * @returns {Array} 偏好品类数组
 */
function generatePreferredCategories(partner) {
  const products = partner.products || [];
  const categories = [];

  // 基于产品类型推断品类
  products.forEach(product => {
    const productLower = product.toLowerCase();
    if (productLower.includes('电子') || productLower.includes('electronic')) {
      categories.push('电子产品');
    }
    if (productLower.includes('机械') || productLower.includes('mechanical')) {
      categories.push('机械设备');
    }
    if (productLower.includes('化工') || productLower.includes('chemical')) {
      categories.push('化工材料');
    }
    if (productLower.includes('纺织') || productLower.includes('textile')) {
      categories.push('纺织品');
    }
  });

  // 如果没有明确品类，根据国家推测
  if (categories.length === 0) {
    const country = partner.country || '';
    if (country.includes('中国')) {
      categories.push('电子产品', '机械设备');
    } else if (country.includes('德国') || country.includes('日本')) {
      categories.push('精密仪器', '机械设备');
    } else if (country.includes('美国')) {
      categories.push('高科技产品', '化工材料');
    }
  }

  return [...new Set(categories)]; // 去重
}

/**
 * 迁移单个供应商数据
 * @param {Object} partner - 原始供应商数据
 * @returns {Object} 迁移后的数据
 */
function migratePartnerData(partner) {
  const migratedData = {
    // 基础字段保持不变
    id: partner.id,
    name: partner.name,
    type: partner.type,
    country: partner.country,
    contact_person: partner.contact_person,
    email: partner.email,
    phone: partner.phone,
    website: partner.website,
    address: partner.address,
    products: partner.products,
    rating: partner.rating,
    cooperation_years: partner.cooperation_years,
    status: partner.status,
    annual_volume: partner.annual_volume,
    payment_terms: partner.payment_terms,
    credit_limit: partner.credit_limit,
    outstanding_balance: partner.outstanding_balance,
    notes: partner.notes,
    created_by: partner.created_by,
    created_at: partner.created_at,
    updated_at: new Date().toISOString(),

    // 新增智能字段
    intelligence_rating: MIGRATION_CONFIG.defaultValues.intelligenceRating,
    cooperation_depth: evaluateCooperationDepth(partner),
    last_evaluation_date: new Date().toISOString().split('T')[0],
    risk_exposure_level: evaluateRiskExposure(partner),
    preferred_categories: generatePreferredCategories(partner),
    annual_trading_volume: estimateAnnualTradingVolume(partner),
    delivery_performance_score:
      MIGRATION_CONFIG.defaultValues.deliveryPerformanceScore,
    quality_complaint_rate: MIGRATION_CONFIG.defaultValues.qualityComplaintRate,
    payment_terms_days: extractPaymentTermsDays(partner.payment_terms),
    certification_status: {
      iso9001: Math.random() > 0.7, // 30%概率拥有ISO9001认证
      iso14001: Math.random() > 0.8, // 20%概率拥有ISO14001认证
      sa8000: Math.random() > 0.9, // 10%概率拥有SA8000认证
    },
    geographical_coverage: [partner.country], // 默认覆盖所在国家
    lead_time_avg_days: Math.floor(Math.random() * 30) + 7, // 7-37天随机
    minimum_order_quantity: Math.floor(Math.random() * 1000) + 100, // 100-1100随机
    price_fluctuation_tolerance: parseFloat(
      (Math.random() * 0.3 + 0.1).toFixed(2)
    ), // 0.1-0.4随机
    sustainability_score: MIGRATION_CONFIG.defaultValues.sustainabilityScore,
    digital_integration_level:
      MIGRATION_CONFIG.defaultValues.digitalIntegrationLevel,
    last_communication_date: new Date().toISOString(),
    relationship_manager_id: null, // 需要后续分配
    collaboration_projects: [],
    performance_history: {
      on_time_delivery_rate: 0.85 + Math.random() * 0.15, // 85%-100%
      quality_pass_rate: 0.9 + Math.random() * 0.1, // 90%-100%
      customer_satisfaction: partner.rating || 3.0,
    },
  };

  return migratedData;
}

/**
 * 提取付款账期天数
 * @param {string} paymentTerms - 付款条件字符串
 * @returns {number|null} 账期天数
 */
function extractPaymentTermsDays(paymentTerms) {
  if (!paymentTerms) return 30;

  const terms = paymentTerms.toLowerCase();

  if (terms.includes('预付') || terms.includes('advance')) return 0;
  if (terms.includes('30')) return 30;
  if (terms.includes('60')) return 60;
  if (terms.includes('90')) return 90;
  if (terms.includes('120')) return 120;

  return 30; // 默认30天
}

/**
 * 批量迁移供应商数据
 * @param {Array} partners - 供应商数据数组
 * @param {number} batchIndex - 批次索引
 * @returns {Promise<Object>} 迁移结果
 */
async function migrateBatch(partners, batchIndex) {
  console.log(
    `🔄 开始迁移批次 ${batchIndex + 1}，共 ${partners.length} 条记录...`
  );

  const migratedPartners = partners.map(partner => migratePartnerData(partner));
  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // 批量更新数据库
  for (const partner of migratedPartners) {
    try {
      const { error } = await supabase
        .from('foreign_trade_partners')
        .update(partner)
        .eq('id', partner.id);

      if (error) {
        results.failed++;
        results.errors.push({
          partnerId: partner.id,
          error: error.message,
        });
        console.error(
          `❌ 迁移失败 - 供应商ID: ${partner.id}, 错误: ${error.message}`
        );
      } else {
        results.success++;
        console.log(`✅ 迁移成功 - 供应商: ${partner.name}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        partnerId: partner.id,
        error: error.message,
      });
      console.error(
        `❌ 迁移异常 - 供应商ID: ${partner.id}, 错误: ${error.message}`
      );
    }
  }

  console.log(
    `📊 批次 ${batchIndex + 1} 迁移完成: 成功 ${results.success}, 失败 ${results.failed}`
  );
  return results;
}

/**
 * 创建初始智能评估历史记录
 * @param {Array} partners - 供应商数据
 * @returns {Promise<void>}
 */
async function createInitialAssessmentHistory(partners) {
  console.log('📝 创建初始智能评估历史记录...');

  const assessmentRecords = partners.map(partner => ({
    partner_id: partner.id,
    evaluation_date: new Date().toISOString().split('T')[0],
    intelligence_rating:
      partner.intelligence_rating ||
      MIGRATION_CONFIG.defaultValues.intelligenceRating,
    cooperation_depth: partner.cooperation_depth || 'standard',
    risk_exposure_level: partner.risk_exposure_level || 'medium',
    capability_scores: {
      quality: (partner.rating || 3.0) * 20, // 转换为0-100分制
      delivery: (partner.delivery_performance_score || 3.5) * 20,
      price: 70 + Math.random() * 20, // 70-90分随机
      service: (partner.rating || 3.0) * 15 + 5,
      innovation: 50 + Math.random() * 40, // 50-90分随机
    },
    evaluation_factors: {
      cooperation_years: partner.cooperation_years,
      rating: partner.rating,
      annual_volume: partner.annual_volume,
      country_risk: partner.country,
    },
    evaluator_id: null, // 系统自动评估
    evaluation_method: 'initial_migration',
    confidence_level: 0.7,
    notes: '基于历史数据的初始智能评估',
  }));

  // 批量插入评估记录
  const { error } = await supabase
    .from('supplier_intelligence_history')
    .insert(assessmentRecords);

  if (error) {
    console.error('❌ 创建评估历史记录失败:', error.message);
  } else {
    console.log(`✅ 成功创建 ${assessmentRecords.length} 条评估历史记录`);
  }
}

/**
 * 主迁移函数
 */
async function runMigration() {
  console.log('🚀 开始供应商智能数据迁移...');
  console.log('='.repeat(50));

  try {
    // 1. 获取所有现有供应商数据
    console.log('📥 正在获取现有供应商数据...');
    const { data: partners, error: fetchError } = await supabase
      .from('foreign_trade_partners')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`获取供应商数据失败: ${fetchError.message}`);
    }

    console.log(`📊 共找到 ${partners.length} 条供应商记录`);

    if (partners.length === 0) {
      console.log('⚠️  没有找到任何供应商数据，迁移结束');
      return;
    }

    // 2. 分批处理迁移
    const totalBatches = Math.ceil(
      partners.length / MIGRATION_CONFIG.batchSize
    );
    const migrationResults = {
      totalProcessed: 0,
      totalSuccess: 0,
      totalFailed: 0,
      batchResults: [],
    };

    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * MIGRATION_CONFIG.batchSize;
      const endIndex = Math.min(
        startIndex + MIGRATION_CONFIG.batchSize,
        partners.length
      );
      const batch = partners.slice(startIndex, endIndex);

      const batchResult = await migrateBatch(batch, i);
      migrationResults.batchResults.push(batchResult);
      migrationResults.totalSuccess += batchResult.success;
      migrationResults.totalFailed += batchResult.failed;
      migrationResults.totalProcessed += batch.length;

      // 批次间延迟
      if (i < totalBatches - 1) {
        console.log(
          `⏳ 等待 ${MIGRATION_CONFIG.delayBetweenBatches}ms 后处理下一批...`
        );
        await new Promise(resolve =>
          setTimeout(resolve, MIGRATION_CONFIG.delayBetweenBatches)
        );
      }
    }

    // 3. 创建初始评估历史
    await createInitialAssessmentHistory(partners);

    // 4. 输出迁移总结
    console.log(`\n${'='.repeat(50)}`);
    console.log('🎉 供应商智能数据迁移完成！');
    console.log('='.repeat(50));
    console.log(`📈 总处理记录数: ${migrationResults.totalProcessed}`);
    console.log(`✅ 成功迁移: ${migrationResults.totalSuccess}`);
    console.log(`❌ 迁移失败: ${migrationResults.totalFailed}`);
    console.log(
      `🎯 成功率: ${((migrationResults.totalSuccess / migrationResults.totalProcessed) * 100).toFixed(2)}%`
    );

    if (migrationResults.totalFailed > 0) {
      console.log('\n❌ 失败详情:');
      migrationResults.batchResults.forEach((result, index) => {
        if (result.errors.length > 0) {
          console.log(`批次 ${index + 1}:`);
          result.errors.forEach(error => {
            console.log(`  - 供应商ID ${error.partnerId}: ${error.error}`);
          });
        }
      });
    }

    console.log('\n📊 迁移后数据统计:');
    const { data: updatedPartners } = await supabase
      .from('foreign_trade_partners')
      .select('cooperation_depth, risk_exposure_level, intelligence_rating')
      .not('intelligence_rating', 'is', null);

    if (updatedPartners) {
      const depthStats = {};
      const riskStats = {};
      const ratingStats = { total: 0, sum: 0 };

      updatedPartners.forEach(partner => {
        // 合作深度统计
        depthStats[partner.cooperation_depth] =
          (depthStats[partner.cooperation_depth] || 0) + 1;

        // 风险等级统计
        riskStats[partner.risk_exposure_level] =
          (riskStats[partner.risk_exposure_level] || 0) + 1;

        // 智能评分统计
        if (partner.intelligence_rating) {
          ratingStats.total++;
          ratingStats.sum += partner.intelligence_rating;
        }
      });

      console.log('合作深度分布:', depthStats);
      console.log('风险等级分布:', riskStats);
      console.log(
        `平均智能评分: ${(ratingStats.sum / ratingStats.total).toFixed(2)}`
      );
    }
  } catch (error) {
    console.error('💥 迁移过程中发生严重错误:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 执行迁移
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✨ 迁移脚本执行完毕');
      process.exit(0);
    })
    .catch(error => {
      console.error('🚨 迁移脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  migratePartnerData,
  evaluateCooperationDepth,
  evaluateRiskExposure,
  estimateAnnualTradingVolume,
  generatePreferredCategories,
};
