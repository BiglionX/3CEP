import { createClient } from '@supabase/supabase-js';
import { PROCUREMENT_CONSTANTS } from '../constants';

// 初始化Supabase客户?
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 供应商画像服务类
 */
export class SupplierProfilingService {
  /**
   * 创建或更新供应商画像
   */
  async createOrUpdateSupplierProfile(profileData: {
    supplierId: string;
    companyName: string;
    registrationCountry: string;
    businessScale: 'small' | 'medium' | 'large' | 'enterprise';
    industrySectors: string[];
    certifications: string[];
    financialData?: {
      annualRevenue?: number;
      employeeCount?: number;
      establishedYear?: number;
    };
  }): Promise<{
    success: boolean;
    profileId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 验证必要字段
      if (!profileData.supplierId || !profileData.companyName) {
        return {
          success: false,
          errorMessage: '缺少必要字段: supplierId �?companyName',
        };
      }

      // 2. 计算初始评分
      const initialScores = this.calculateInitialScores(profileData);

      // 3. 确定供应商等?
      const supplierTier = this.determineSupplierTier(
        initialScores.overallScore
      );

      // 4. 计算风险评分
      const riskScore = this.calculateRiskScore(profileData);

      // 5. 构造完整画像数?
      const profilePayload = {
        supplier_id: profileData.supplierId,
        company_name: profileData.companyName,
        registration_country: profileData.registrationCountry,
        business_scale: profileData.businessScale,
        industry_sectors: profileData.industrySectors,
        certifications: profileData.certifications,
        annual_revenue: profileData?.annualRevenue || null,
        employee_count: profileData?.employeeCount || null,
        established_year: profileData?.establishedYear || null,
        quality_score: initialScores.quality,
        price_score: initialScores.price,
        delivery_score: initialScores.delivery,
        service_score: initialScores.service,
        innovation_score: initialScores.innovation,
        overall_score: initialScores.overallScore,
        supplier_tier: supplierTier,
        risk_score: riskScore,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // 6. 插入或更新数据库
      const { data, error } = await supabase
        .from('supplier_intelligence_profiles')
        .upsert([profilePayload], {
          onConflict: 'supplier_id',
        });

      if (error) {
        throw new Error(`数据库操作失? ${error.message}`);
      }

      return {
        success: true,
        profileId: profileData.supplierId,
      };
    } catch (error) {
      console.error('创建供应商画像失?', error);
      return {
        success: false,
        errorMessage: `创建失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 获取供应商完整画?
   */
  async getSupplierProfile(supplierId: string): Promise<{
    success: boolean;
    profile?: any;
    errorMessage?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('supplier_intelligence_profiles')
        .select('*')
        .eq('supplier_id', supplierId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 未找到记?
          return {
            success: false,
            errorMessage: '供应商画像不存在',
          };
        }
        throw new Error(`查询失败: ${error.message}`);
      }

      return {
        success: true,
        profile: data,
      };
    } catch (error) {
      console.error('获取供应商画像失?', error);
      return {
        success: false,
        errorMessage: `获取失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 批量获取供应商画?
   */
  async getMultipleSupplierProfiles(supplierIds: string[]): Promise<{
    success: boolean;
    profiles?: any[];
    errorMessage?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('supplier_intelligence_profiles')
        .select('*')
        .in('supplier_id', supplierIds);

      if (error) {
        throw new Error(`批量查询失败: ${error.message}`);
      }

      return {
        success: true,
        profiles: data || [],
      };
    } catch (error) {
      console.error('批量获取供应商画像失?', error);
      return {
        success: false,
        errorMessage: `批量获取失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 更新供应商评?
   */
  async updateSupplierScores(
    supplierId: string,
    scores: {
      quality?: number;
      price?: number;
      delivery?: number;
      service?: number;
      innovation?: number;
    }
  ): Promise<{
    success: boolean;
    errorMessage?: string;
  }> {
    try {
      // 获取现有评分
      const existingProfile = await this.getSupplierProfile(supplierId);
      if (!existingProfile.success || !existingProfile.profile) {
        return {
          success: false,
          errorMessage: '供应商画像不存在',
        };
      }

      // 合并新评?
      const updatedScores = {
        quality_score: scores.quality ?? existingProfile.profile.quality_score,
        price_score: scores.price ?? existingProfile.profile.price_score,
        delivery_score:
          scores.delivery ?? existingProfile.profile.delivery_score,
        service_score: scores.service ?? existingProfile.profile.service_score,
        innovation_score:
          scores.innovation ?? existingProfile.profile.innovation_score,
      };

      // 重新计算总体评分
      const weights = PROCUREMENT_CONSTANTS.SCORING_WEIGHTS;
      const overallScore =
        updatedScores.quality_score * weights.QUALITY +
        updatedScores.price_score * weights.PRICE +
        updatedScores.delivery_score * weights.DELIVERY +
        updatedScores.service_score * weights.SERVICE +
        updatedScores.innovation_score * weights.INNOVATION;

      // 更新供应商等?
      const supplierTier = this.determineSupplierTier(overallScore);

      // 更新数据?
      const { error } = await supabase
        .from('supplier_intelligence_profiles')
        .update({
          ...updatedScores,
          overall_score: overallScore,
          supplier_tier: supplierTier,
          last_updated: new Date().toISOString(),
        }) as any
        .eq('supplier_id', supplierId);

      if (error) {
        throw new Error(`更新失败: ${error.message}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('更新供应商评分失?', error);
      return {
        success: false,
        errorMessage: `更新失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 搜索供应商（按条件筛选）
   */
  async searchSuppliers(filters: {
    minScore?: number;
    maxScore?: number;
    tier?: string;
    country?: string;
    industry?: string;
    minRiskScore?: number;
    maxRiskScore?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    suppliers?: any[];
    totalCount?: number;
    errorMessage?: string;
  }> {
    try {
      let query = supabase
        .from('supplier_intelligence_profiles')
        .select('*', { count: 'exact' });

      // 应用筛选条?
      if (filters.minScore !== undefined) {
        query = query.gte('overall_score', filters.minScore);
      }
      if (filters.maxScore !== undefined) {
        query = query.lte('overall_score', filters.maxScore);
      }
      if (filters.tier) {
        query = query.eq('supplier_tier', filters.tier);
      }
      if (filters.country) {
        query = query.eq('registration_country', filters.country);
      }
      if (filters.industry) {
        query = query.contains('industry_sectors', [filters.industry]);
      }
      if (filters.minRiskScore !== undefined) {
        query = query.gte('risk_score', filters.minRiskScore);
      }
      if (filters.maxRiskScore !== undefined) {
        query = query.lte('risk_score', filters.maxRiskScore);
      }

      // 设置限制
      const limit = filters.limit || 50;
      query = query.limit(limit);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`搜索失败: ${error.message}`);
      }

      return {
        success: true,
        suppliers: data || [],
        totalCount: count || 0,
      };
    } catch (error) {
      console.error('搜索供应商失?', error);
      return {
        success: false,
        errorMessage: `搜索失败: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 计算初始评分
   */
  private calculateInitialScores(profileData: any): {
    quality: number;
    price: number;
    delivery: number;
    service: number;
    innovation: number;
    overallScore: number;
  } {
    // 基于企业规模给基础?
    let baseScore = 60;
    switch (profileData.businessScale) {
      case 'enterprise':
        baseScore = 85;
        break;
      case 'large':
        baseScore = 75;
        break;
      case 'medium':
        baseScore = 65;
        break;
      case 'small':
        baseScore = 55;
        break;
    }

    // 认证加分
    const certificationBonus = Math.min(
      profileData.certifications.length * 5,
      20
    );

    // 行业经验加分
    const industryExperienceBonus = profileData?.establishedYear
      ? Math.min(
          (new Date().getFullYear() -
            profileData.financialData.establishedYear) *
            2,
          20
        )
      : 0;

    const qualityScore = Math.min(
      100,
      baseScore + certificationBonus + industryExperienceBonus
    );
    const priceScore = Math.min(100, baseScore + 10); // 价格竞争力相对固?
    const deliveryScore = Math.min(100, baseScore + 5); // 交付能力相对固定
    const serviceScore = Math.min(100, baseScore + 15); // 服务能力通常较好
    const innovationScore = Math.min(
      100,
      baseScore + (profileData.businessScale === 'enterprise' ? 20 : 5)
    );

    const weights = PROCUREMENT_CONSTANTS.SCORING_WEIGHTS;
    const overallScore =
      qualityScore * weights.QUALITY +
      priceScore * weights.PRICE +
      deliveryScore * weights.DELIVERY +
      serviceScore * weights.SERVICE +
      innovationScore * weights.INNOVATION;

    return {
      quality: qualityScore,
      price: priceScore,
      delivery: deliveryScore,
      service: serviceScore,
      innovation: innovationScore,
      overallScore,
    };
  }

  /**
   * 确定供应商等?
   */
  private determineSupplierTier(overallScore: number): string {
    const tiers = PROCUREMENT_CONSTANTS.SUPPLIER_TIERS;

    if (overallScore >= tiers.PREMIUM) return 'premium';
    if (overallScore >= tiers.STANDARD) return 'standard';
    if (overallScore >= tiers.BASIC) return 'basic';
    return 'risky';
  }

  /**
   * 计算风险评分
   */
  private calculateRiskScore(profileData: any): number {
    let riskScore = 50; // 基础风险?

    // 国家风险调整
    const highRiskCountries = ['North Korea', 'Iran', 'Syria'];
    if (highRiskCountries.includes(profileData.registrationCountry)) {
      riskScore += 30;
    }

    // 规模风险调整
    if (profileData.businessScale === 'small') {
      riskScore += 15;
    } else if (profileData.businessScale === 'enterprise') {
      riskScore -= 20;
    }

    // 认证减分
    const certificationCount = profileData?.length || 0;
    riskScore -= Math.min(certificationCount * 3, 15);

    return Math.max(0, Math.min(100, riskScore));
  }
}

// 导出单例实例
export const supplierProfilingService = new SupplierProfilingService();
