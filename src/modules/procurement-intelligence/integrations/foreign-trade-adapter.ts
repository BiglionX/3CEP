// 外贸数据适配?// 用于将现有外贸模块数据转换为采购智能体所需格式

import { createClient } from '@supabase/supabase-js';
import {
  SupplierCapabilityScores,
  SupplierRiskProfile,
  MarketIntelligence,
  RiskLevel,
  SupplierBusinessScale,
} from '../models';

// 定义供应商画像接?interface SupplierProfile {
  supplier_id: string;
  company_name: string;
  registration_country: string;
  business_scale: 'startup' | 'sme' | 'large' | 'enterprise';
  established_year: number;
  employee_count: number;
  annual_revenue: number;
  industries_served: string[];
  certifications: string[];
  compliance_status: string;
  capabilities: {
    product_categories: string[];
    technical_expertise: string[];
    manufacturing_capacity: string;
    quality_certifications: string[];
    delivery_capabilities: string[];
  };
  performance_metrics: {
    quality_score: number;
    delivery_score: number;
    price_score: number;
    service_score: number;
    reliability_score: number;
  };
  financial_health: {
    credit_score: number;
    financial_stability: number;
    payment_terms: string;
  };
  geographic_info: {
    country: string;
    region: string;
    logistics_capabilities: string[];
  };
  risk_profile: SupplierRiskProfile;
  market_intelligence: MarketIntelligence;
  collaboration_history: {
    total_orders: number;
    successful_deliveries: number;
    average_response_time: number;
    dispute_rate: number;
  };
  last_updated: string;
}

export interface ForeignTradePartner {
  id: string;
  company_name: string;
  registration_country: string;
  business_type: string;
  annual_turnover: number;
  employee_count: number;
  established_year: number;
  product_categories: string[];
  certifications: string[];
  compliance_status: string;
  quality_score?: number;
  delivery_score?: number;
  price_score?: number;
  service_score?: number;
  risk_score?: number;
  created_at: string;
  updated_at: string;
}

export class ForeignTradeDataAdapter {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * 将外贸合作伙伴数据转换为供应商画像格?   */
  async convertPartnersToProfiles(): Promise<SupplierProfile[]> {
    try {
      // 查询外贸合作伙伴数据
      const { data: partners, error } = await this.supabase
        .from('foreign_trade_partners')
        .select('*')
        .eq('status', 'active');

      if (error) {
        throw new Error(`查询外贸合作伙伴失败: ${error.message}`);
      }

      if (!partners || partners.length === 0) {
        return [];
      }

      // 转换数据格式
      const profiles: SupplierProfile[] = partners.map(
        (partner: ForeignTradePartner) =>
          this.transformPartnerToProfile(partner)
      );

      return profiles;
    } catch (error) {
      console.error('数据转换失败:', error);
      throw error;
    }
  }

  /**
   * 单个合作伙伴数据转换
   */
  private transformPartnerToProfile(
    partner: ForeignTradePartner
  ): SupplierProfile {
    // 计算能力评分
    const capabilityScores: SupplierCapabilityScores = {
      quality: partner.quality_score || 80,
      delivery: partner.delivery_score || 85,
      price: partner.price_score || 75,
      service: partner.service_score || 80,
      innovation: 70, // 默认创新分数
    };

    // 评估风险等级
    const riskLevel = this.assessRiskLevel(partner.risk_score || 25);
    const riskProfile: SupplierRiskProfile = {
      financialRisk: riskLevel,
      operationalRisk: riskLevel,
      complianceRisk:
        partner.compliance_status === 'compliant' ? 'low' : 'medium',
      geopoliticalRisk: this.assessGeopoliticalRisk(
        partner.registration_country
      ),
      supplyChainRisk: 'medium',
    };

    // 构建供应商画?    const profile: SupplierProfile = {
      supplier_id: partner.id,
      company_name: partner.company_name,
      registration_country: partner.registration_country,
      business_scale: this.determineBusinessScale(partner),
      established_year: partner.established_year,
      employee_count: partner.employee_count,
      annual_revenue: partner.annual_turnover,
      industries_served: partner.product_categories,
      certifications: partner.certifications,
      compliance_status: partner.compliance_status,
      capabilities: {
        product_categories: partner.product_categories,
        technical_expertise: [], // 需要进一步分?        manufacturing_capacity: 'unknown',
        quality_certifications: partner.certifications.filter(
          cert => cert.includes('ISO') || cert.includes('质量')
        ),
        delivery_capabilities: [],
      },
      performance_metrics: {
        quality_score: capabilityScores.quality,
        delivery_score: capabilityScores.delivery,
        price_score: capabilityScores.price,
        service_score: capabilityScores.service,
        reliability_score: 80,
      },
      financial_health: {
        credit_score: 80, // 默认信用?        financial_stability: this.calculateFinancialStability(partner),
        payment_terms: '30_days',
      },
      geographic_info: {
        country: partner.registration_country,
        region: this.getRegionFromCountry(partner.registration_country),
        logistics_capabilities: [],
      },
      risk_profile: riskProfile,
      market_intelligence: this.generateMarketIntelligence(partner),
      collaboration_history: {
        total_orders: 0, // 需要关联订单数?        successful_deliveries: 0,
        average_response_time: 24, // 默认24小时
        dispute_rate: 2.5, // 默认争议?      },
      last_updated: new Date().toISOString(),
    };

    return profile;
  }

  /**
   * 评估风险等级
   */
  private assessRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 80) return RiskLevel.CRITICAL;
    if (riskScore >= 60) return RiskLevel.HIGH;
    if (riskScore >= 40) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * 评估地缘政治风险
   */
  private assessGeopoliticalRisk(country: string): RiskLevel {
    const highRiskCountries = ['North Korea', 'Iran', 'Russia', 'Syria'];
    const mediumRiskCountries = ['China', 'India', 'Brazil', 'Turkey'];

    if (highRiskCountries.includes(country)) return RiskLevel.HIGH;
    if (mediumRiskCountries.includes(country)) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  /**
   * 确定企业规模
   */
  private determineBusinessScale(
    partner: ForeignTradePartner
  ): 'startup' | 'sme' | 'large' | 'enterprise' {
    if (
      partner.employee_count >= 1000 ||
      partner.annual_turnover >= 100000000
    ) {
      return 'enterprise';
    } else if (
      partner.employee_count >= 100 ||
      partner.annual_turnover >= 10000000
    ) {
      return 'large';
    } else if (
      partner.employee_count >= 10 ||
      partner.annual_turnover >= 1000000
    ) {
      return 'sme';
    } else {
      return 'startup';
    }
  }

  /**
   * 计算财务稳定?   */
  private calculateFinancialStability(partner: ForeignTradePartner): number {
    let stability = 70; // 基础?
    // 根据营业额调?    if (partner.annual_turnover >= 50000000) stability += 15;
    else if (partner.annual_turnover >= 10000000) stability += 10;
    else if (partner.annual_turnover >= 1000000) stability += 5;

    // 根据成立年限调整
    const years = new Date().getFullYear() - partner.established_year;
    if (years >= 20) stability += 10;
    else if (years >= 10) stability += 5;
    else if (years >= 5) stability += 2;

    return Math.min(100, stability);
  }

  /**
   * 根据国家确定地区
   */
  private getRegionFromCountry(country: string): string {
    const regionMap: Record<string, string> = {
      China: 'asia_pacific',
      Japan: 'asia_pacific',
      'South Korea': 'asia_pacific',
      India: 'asia_pacific',
      Singapore: 'asia_pacific',
      'United States': 'north_america',
      Canada: 'north_america',
      Mexico: 'north_america',
      Germany: 'europe',
      France: 'europe',
      UK: 'europe',
      Italy: 'europe',
    };

    return regionMap[country] || 'other';
  }

  /**
   * 生成市场情报
   */
  private generateMarketIntelligence(
    partner: ForeignTradePartner
  ): MarketIntelligence {
    return {
      marketShare: 0.5, // 默认市场份额
      growthRate: 8.0, // 默认增长?      customerSatisfaction: 4.2, // 默认客户满意?      industryRanking: 50, // 默认行业排名
    };
  }

  /**
   * 同步数据到智能体系统
   */
  async syncToIntelligenceSystem(profiles: SupplierProfile[]): Promise<void> {
    try {
      // 批量插入到供应商智能画像?      const { error } = await this.supabase
        .from('supplier_intelligence_profiles')
        .upsert(
          profiles.map(profile => ({
            supplier_id: profile.supplier_id,
            company_name: profile.company_name,
            registration_country: profile.registration_country,
            business_scale: profile.business_scale,
            established_year: profile.established_year,
            employee_count: profile.employee_count,
            annual_revenue: profile.annual_revenue,
            industries_served: profile.industries_served,
            certifications: profile.certifications,
            compliance_status: profile.compliance_status,
            capability_scores: profile.capabilities,
            performance_metrics: profile.performance_metrics,
            financial_health: profile.financial_health,
            geographic_info: profile.geographic_info,
            risk_profile: profile.risk_profile,
            market_intelligence: profile.market_intelligence,
            collaboration_history: profile.collaboration_history,
            last_updated: profile.last_updated,
          }))
        );

      if (error) {
        throw new Error(`同步数据失败: ${error.message}`);
      }

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`成功同步 ${profiles.length} 条供应商数据到智能体系统`)} catch (error) {
      console.error('数据同步错误:', error);
      throw error;
    }
  }

  /**
   * 定期数据更新任务
   */
  async scheduleRegularSync(): Promise<void> {
    try {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('开始执行外贸数据同步任?..')// 转换数据
      const profiles = await this.convertPartnersToProfiles();

      // 同步到智能体系统
      await this.syncToIntelligenceSystem(profiles);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('外贸数据同步任务完成')} catch (error) {
      console.error('定期同步任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据同步统计
   */
  async getSyncStatistics(): Promise<any> {
    try {
      const { data: stats, error } = await this.supabase
        .from('data_sync_statistics')
        .select('*')
        .order('sync_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      return stats || [];
    } catch (error) {
      console.error('获取同步统计失败:', error);
      return [];
    }
  }
}

// 导出实例
export const foreignTradeAdapter = new ForeignTradeDataAdapter();
