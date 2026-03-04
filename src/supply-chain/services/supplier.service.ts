/**
 * 供应商管理服务实? * 处理供应商入驻申请、资质审核、信用评级等核心功能
 */

import {
  Supplier,
  SupplierApplication,
  SupplierCertification,
  SupplierProduct,
  SupplierStatus,
  ReviewStatus,
  CreditLevel,
  CreateSupplierDTO,
  ReviewSupplierDTO,
  UpdateCreditRatingDTO,
  SupplierQueryParams,
} from '../models/supplier.model';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/fcx-system/utils/helpers';

export class SupplierService {
  /**
   * 供应商入驻申?   */
  async submitApplication(applicationData: any): Promise<{
    success: boolean;
    applicationId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 参数验证
      const validation = this.validateApplicationData(applicationData);
      if (!validation.isValid) {
        return {
          success: false,
          errorMessage: validation.errors.join('; '),
        };
      }

      // 2. 创建申请记录
      const applicationId = generateUUID();
      const application: SupplierApplication = {
        id: applicationId,
        applicantName: applicationData.applicantName,
        companyName: applicationData.companyName,
        contactInfo: applicationData.contactInfo,
        businessInfo: applicationData.businessInfo,
        products: applicationData.products,
        documents: applicationData.documents,
        status: ReviewStatus.PENDING,
        reviewerId: null,
        reviewComments: '',
        submittedAt: new Date(),
        reviewedAt: null,
        createdAt: new Date(),
      };

      const { error } = await supabase.from('supplier_applications').insert({
        id: applicationId,
        applicant_name: applicationData.applicantName,
        company_name: applicationData.companyName,
        contact_info: applicationData.contactInfo,
        business_info: applicationData.businessInfo,
        products: applicationData.products,
        documents: applicationData.documents,
        status: ReviewStatus.PENDING,
        reviewer_id: null,
        review_comments: '',
        submitted_at: new Date(),
        reviewed_at: null,
        created_at: new Date(),
      } as any);

      if (error) {
        return {
          success: false,
          errorMessage: `提交申请失败: ${error.message}`,
        };
      }

      return {
        success: true,
        applicationId,
      };
    } catch (error) {
      console.error('供应商申请错?', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 审核供应商申?   */
  async reviewApplication(dto: ReviewSupplierDTO): Promise<{
    success: boolean;
    supplierId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 获取申请信息
      const { data: application, error: appError } = await supabase
        .from('supplier_applications')
        .select('*')
        .eq('id', dto.supplierId)
        .single();

      if (appError) {
        return {
          success: false,
          errorMessage: '申请记录不存?,
        };
      }

      // 2. 更新申请状?      const { error: updateError } = await supabase
        .from('supplier_applications')
        .update({
          status: dto.reviewResult,
          reviewer_id: dto.reviewerId,
          review_comments: dto.comments,
          reviewed_at: new Date(),
        } as any)
        .eq('id', dto.supplierId);

      if (updateError) {
        return {
          success: false,
          errorMessage: `更新申请状态失? ${updateError.message}`,
        };
      }

      // 3. 如果审核通过，创建供应商记录
      if (dto.reviewResult === ReviewStatus.APPROVED) {
        const supplierId = generateUUID();
        const supplierData = {
          id: supplierId,
          code: this.generateSupplierCode(),
          name: application.company_name,
          type: 'manufacturer', // 默认类型
          legal_name:
            application.business_info.legalName || application.company_name,
          contact_person: application.applicant_name,
          phone: application.contact_info.phone,
          email: application.contact_info.email,
          website: '',
          address: application.contact_info.address,
          country: application.contact_info.country || '',
          city: application.contact_info.city || '',
          postal_code: application.contact_info.postalCode || '',
          business_scope: application.business_info.businessScope || '',
          established_year:
            application.business_info.establishedYear ||
            new Date().getFullYear(),
          employee_count: application.business_info.employeeCount || 0,
          annual_revenue: 0,
          bank_info: {},
          tax_id: application.business_info.taxId || '',
          status: SupplierStatus.APPROVED,
          credit_level: CreditLevel.C,
          credit_score: 70,
          rating: 0,
          review_count: 0,
          cooperation_years: 0,
          last_review_date: null,
          next_review_date: this.calculateNextReviewDate(),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        };

        const { error: supplierError } = await supabase
          .from('suppliers')
          .insert(supplierData);

        if (supplierError) {
          return {
            success: false,
            errorMessage: `创建供应商记录失? ${supplierError.message}`,
          };
        }

        return {
          success: true,
          supplierId,
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('审核供应商申请错?', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`,
      };
    }
  }

  /**
   * 获取供应商信?   */
  async getSupplier(supplierId: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(
          `
          *,
          certifications (*),
          products (*),
          contracts (*)
        `
        )
        .eq('id', supplierId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`查询供应商失? ${error.message}`);
      }

      return this.mapToSupplier(data);
    } catch (error) {
      console.error('获取供应商信息错?', error);
      throw error;
    }
  }

  /**
   * 查询供应商列?   */
  async listSuppliers(params: SupplierQueryParams): Promise<Supplier[]> {
    try {
      let query = supabase.from('suppliers').select(`
          *,
          certifications (*),
          products (*)
        `);

      // 添加查询条件
      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.country) {
        query = query.eq('country', params.country);
      }

      if (params.city) {
        query = query.eq('city', params.city);
      }

      if (params.minCreditScore !== undefined) {
        query = query.gte('credit_score', params.minCreditScore);
      }

      if (params.maxCreditScore !== undefined) {
        query = query.lte('credit_score', params.maxCreditScore);
      }

      if (params.keyword) {
        query = query.or(
          `name.ilike.%${params.keyword}%,contact_person.ilike.%${params.keyword}%`
        );
      }

      // 排序
      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' }) as any;

      // 分页
      query = query.range(
        params.offset || 0,
        (params.offset || 0) + (params.limit || 50) - 1
      );

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询供应商列表失? ${error.message}`);
      }

      return data.map(this.mapToSupplier);
    } catch (error) {
      console.error('查询供应商列表错?', error);
      throw error;
    }
  }

  /**
   * 更新供应商信用评?   */
  async updateCreditRating(dto: UpdateCreditRatingDTO): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          credit_score: dto.creditScore,
          credit_level: dto.creditLevel,
          updated_at: new Date(),
        } as any)
        .eq('id', dto.supplierId);

      if (error) {
        console.error('更新信用评级错误:', error);
        return false;
      }

      // 记录评级变更历史
      const { error: historyError } = await supabase
        .from('supplier_credit_history')
        .insert({
          id: generateUUID(),
          supplier_id: dto.supplierId,
          previous_score: 0, // 需要先查询当前分数
          new_score: dto.creditScore,
          previous_level: 'C', // 需要先查询当前等级
          new_level: dto.creditLevel,
          reason: dto.assessmentReason,
          assessed_by: 'system', // 实际应为用户ID
          assessed_at: new Date(),
        } as any);

      return !historyError;
    } catch (error) {
      console.error('更新信用评级错误:', error);
      return false;
    }
  }

  /**
   * 供应商信用评?   */
  async assessSupplierCredit(supplierId: string): Promise<CreditLevel> {
    try {
      const supplier = await this.getSupplier(supplierId);
      if (!supplier) {
        throw new Error('供应商不存在');
      }

      // 基于多个维度计算信用分数
      let totalScore = 0;
      let totalWeight = 0;

      // 经营年限权重 (20%)
      const yearsWeight = 0.2;
      const yearsScore = Math.min(
        supplier.establishedYear
          ? (new Date().getFullYear() - supplier.establishedYear) * 5
          : 0,
        100
      );
      totalScore += yearsScore * yearsWeight;
      totalWeight += yearsWeight;

      // 员工规模权重 (15%)
      const employeeWeight = 0.15;
      const employeeScore = Math.min(
        supplier.employeeCount ? Math.log(supplier.employeeCount) * 20 : 0,
        100
      );
      totalScore += employeeScore * employeeWeight;
      totalWeight += employeeWeight;

      // 合作年限权重 (25%)
      const cooperationWeight = 0.25;
      const cooperationScore = Math.min(supplier.cooperationYears * 20, 100);
      totalScore += cooperationScore * cooperationWeight;
      totalWeight += cooperationWeight;

      // 综合评分权重 (20%)
      const ratingWeight = 0.2;
      const ratingScore = (supplier.rating || 0) * 20;
      totalScore += ratingScore * ratingWeight;
      totalWeight += ratingWeight;

      // 资质认证权重 (20%)
      const certificationWeight = 0.2;
      const certificationScore = Math.min((supplier?.length || 0) * 25, 100);
      totalScore += certificationScore * certificationWeight;
      totalWeight += certificationWeight;

      // 计算最终分?      const finalScore =
        totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

      // 根据分数确定信用等级
      let creditLevel: CreditLevel;
      if (finalScore >= 90) {
        creditLevel = CreditLevel.A;
      } else if (finalScore >= 80) {
        creditLevel = CreditLevel.B;
      } else if (finalScore >= 70) {
        creditLevel = CreditLevel.C;
      } else {
        creditLevel = CreditLevel.D;
      }

      // 更新供应商信用信?      (await this.updateCreditRating({
        supplierId,
        creditScore: finalScore,
        creditLevel,
        assessmentReason: `系统自动评估 - 基于经营年限、员工规模、合作年限、综合评分、资质认证等维度`,
      })) as any;

      return creditLevel;
    } catch (error) {
      console.error('供应商信用评估错?', error);
      throw error;
    }
  }

  /**
   * 获取待审核申请列?   */
  async getPendingApplications(
    limit: number = 20
  ): Promise<SupplierApplication[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_applications')
        .select('*')
        .eq('status', ReviewStatus.PENDING)
        .order('submitted_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`查询待审核申请失? ${error.message}`);
      }

      return data.map(app => ({
        id: app.id,
        applicantName: app.applicant_name,
        companyName: app.company_name,
        contactInfo: app.contact_info,
        businessInfo: app.business_info,
        products: app.products,
        documents: app.documents,
        status: app.status as ReviewStatus,
        reviewerId: app.reviewer_id,
        reviewComments: app.review_comments,
        submittedAt: new Date(app.submitted_at),
        reviewedAt: app.reviewed_at ? new Date(app.reviewed_at) : null,
        createdAt: new Date(app.created_at),
      }));
    } catch (error) {
      console.error('获取待审核申请错?', error);
      throw error;
    }
  }

  // 私有辅助方法

  private validateApplicationData(data: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.applicantName) {
      errors.push('申请人姓名不能为?);
    }

    if (!data.companyName) {
      errors.push('公司名称不能为空');
    }

    if (!data?.phone) {
      errors.push('联系电话不能为空');
    }

    if (!data?.email) {
      errors.push('邮箱不能为空');
    }

    if (!data?.businessLicense) {
      errors.push('营业执照号不能为?);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private generateSupplierCode(): string {
    const prefix = 'SUP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private calculateNextReviewDate(): Date {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear;
  }

  private mapToSupplier(data: any): Supplier {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      legalName: data.legal_name,
      contactPerson: data.contact_person,
      phone: data.phone,
      email: data.email,
      website: data.website,
      address: data.address,
      country: data.country,
      city: data.city,
      postalCode: data.postal_code,
      businessScope: data.business_scope,
      establishedYear: data.established_year,
      employeeCount: data.employee_count,
      annualRevenue: data.annual_revenue,
      bankInfo: data.bank_info,
      taxId: data.tax_id,
      status: data.status,
      creditLevel: data.credit_level,
      creditScore: data.credit_score,
      rating: data.rating,
      reviewCount: data.review_count,
      cooperationYears: data.cooperation_years,
      lastReviewDate: data.last_review_date
        ? new Date(data.last_review_date)
        : null,
      nextReviewDate: data.next_review_date
        ? new Date(data.next_review_date)
        : null,
      certifications: data.certifications || [],
      products: data.products || [],
      contracts: data.contracts || [],
      performanceMetrics: data.performance_metrics || {
        deliveryRate: 0,
        qualityRate: 0,
        responseTime: 0,
        serviceScore: 0,
        complaintCount: 0,
        returnRate: 0,
        lastUpdated: new Date(),
      },
      riskAssessment: data.risk_assessment || {
        financialRisk: 'medium',
        operationalRisk: 'medium',
        complianceRisk: 'medium',
        marketRisk: 'medium',
        overallRisk: 'medium',
        riskFactors: [],
        mitigationStrategies: [],
        lastAssessed: new Date(),
      },
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
