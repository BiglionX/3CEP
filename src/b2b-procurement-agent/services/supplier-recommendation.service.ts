import { generateUUID } from '@/fcx-system/utils/helpers';
import { createClient } from '@supabase/supabase-js';
import {
  SupplierRating,
  SupplierRecommendation,
  SupplierWithRating,
} from '../models/negotiation.model';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupplierRecommendationService {
  /**
   * 获取带评分的供应商信?   */
  async getSupplierWithRating(
    supplierId: string
  ): Promise<SupplierWithRating | null> {
    try {
      // 获取供应商基本信?      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

      if (supplierError) {
        if (supplierError.code === 'PGRST116') return null;
        throw new Error(`获取供应商信息失? ${supplierError.message}`);
      }

      // 获取供应商评分信?      const { data: ratingData, error: ratingError } = await supabase
        .from('supplier_ratings')
        .select('*')
        .eq('supplier_id', supplierId)
        .single();

      const rating = ratingError ? undefined : this.mapToRating(ratingData);

      return {
        id: supplierData.id,
        name: supplierData.name,
        contactPerson: supplierData.contact_person,
        phone: supplierData.phone,
        email: supplierData.email,
        rating,
      };
    } catch (error) {
      console.error('获取供应商评分信息错?', error);
      throw error;
    }
  }

  /**
   * 根据采购需求推荐供应商
   */
  async recommendSuppliers(
    procurementItems: any[],
    targetPrice: number,
    maxRecommendations: number = 5
  ): Promise<SupplierRecommendation[]> {
    try {
      // 获取所有活跃供应商及其评分
      const suppliers = await this.getAllSuppliersWithRatings();

      // 计算每个供应商的推荐得分
      const recommendations: SupplierRecommendation[] = suppliers.map(
        supplier => {
          const score = this.calculateRecommendationScore(
            supplier,
            procurementItems,
            targetPrice
          );
          const reasons = this.generateRecommendationReasons(supplier, score);

          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            score,
            transactionCount: supplier?.transactionCount || 0,
            averageDiscountRate: supplier?.averageDiscountRate || 0,
            afterSalesRate: supplier?.afterSalesRate || 0,
            priceCompetitiveness: supplier?.priceCompetitiveness || 0,
            reasons,
          };
        }
      );

      // 按得分降序排列并返回前N�?      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations);
    } catch (error) {
      console.error('推荐供应商错?', error);
      throw error;
    }
  }

  /**
   * 更新供应商评?   */
  async updateSupplierRating(
    supplierId: string,
    transactionData: {
      isSuccess: boolean;
      discountRate: number;
      deliveryTime: number;
      qualityScore: number;
      afterSalesScore: number;
    }
  ): Promise<boolean> {
    try {
      // 获取当前评分
      let currentRating = await this.getCurrentRating(supplierId);

      if (!currentRating) {
        // 如果没有评分记录，创建新?        currentRating = {
          id: generateUUID(),
          supplierId,
          transactionCount: 0,
          successfulNegotiations: 0,
          averageDiscountRate: 0,
          afterSalesRate: 0,
          priceCompetitiveness: 0,
          deliveryReliability: 0,
          qualityScore: 0,
          overallRating: 0,
          lastUpdated: new Date(),
        };
      }

      // 更新统计数据
      const newTransactionCount = currentRating.transactionCount + 1;
      const newSuccessfulNegotiations =
        currentRating.successfulNegotiations +
        (transactionData.isSuccess ? 1 : 0);

      // 计算新的平均值（移动平均?      const newAvgDiscountRate = this.calculateMovingAverage(
        currentRating.averageDiscountRate,
        currentRating.transactionCount,
        transactionData.discountRate
      );

      const newAfterSalesRate = this.calculateMovingAverage(
        currentRating.afterSalesRate,
        currentRating.transactionCount,
        transactionData.afterSalesScore
      );

      const newQualityScore = this.calculateMovingAverage(
        currentRating.qualityScore,
        currentRating.transactionCount,
        transactionData.qualityScore
      );

      // 计算交付可靠?(假设标准交付时间?0�?
      const deliveryReliability = Math.max(
        0,
        100 - Math.abs(transactionData.deliveryTime - 30)
      );
      const newDeliveryReliability = this.calculateMovingAverage(
        currentRating.deliveryReliability,
        currentRating.transactionCount,
        deliveryReliability
      );

      // 价格竞争力评?(基于折扣?
      const priceCompetitiveness = Math.min(
        100,
        transactionData.discountRate * 10
      );
      const newPriceCompetitiveness = this.calculateMovingAverage(
        currentRating.priceCompetitiveness,
        currentRating.transactionCount,
        priceCompetitiveness
      );

      // 计算综合评分
      const newOverallRating = this.calculateOverallRating({
        transactionCount: newTransactionCount,
        successfulNegotiations: newSuccessfulNegotiations,
        averageDiscountRate: newAvgDiscountRate,
        afterSalesRate: newAfterSalesRate,
        priceCompetitiveness: newPriceCompetitiveness,
        deliveryReliability: newDeliveryReliability,
        qualityScore: newQualityScore,
      });

      // 更新数据?      const { error } = await supabase.from('supplier_ratings').upsert(
        {
          id: currentRating.id,
          supplier_id: supplierId,
          transaction_count: newTransactionCount,
          successful_negotiations: newSuccessfulNegotiations,
          average_discount_rate: parseFloat(newAvgDiscountRate.toFixed(2)),
          after_sales_rate: parseFloat(newAfterSalesRate.toFixed(2)),
          price_competitiveness: parseFloat(newPriceCompetitiveness.toFixed(2)),
          delivery_reliability: parseFloat(newDeliveryReliability.toFixed(2)),
          quality_score: parseFloat(newQualityScore.toFixed(2)),
          overall_rating: parseFloat(newOverallRating.toFixed(2)),
          last_transaction_date: new Date(),
          last_updated: new Date(),
        },
        {
          onConflict: 'supplier_id',
        }
      );

      if (error) throw new Error(`更新供应商评分失? ${error.message}`);

      return true;
    } catch (error) {
      console.error('更新供应商评分错?', error);
      return false;
    }
  }

  /**
   * 获取供应商排?   */
  async getSupplierRankings(limit: number = 10): Promise<
    Array<{
      supplier: SupplierWithRating;
      rank: number;
      score: number;
    }>
  > {
    try {
      const suppliers = await this.getAllSuppliersWithRatings();

      // 按综合评分排?      const rankedSuppliers = suppliers
        .filter(s => s.rating && s.rating.transactionCount >= 5) // 至少5笔交易才有意?        .sort((a, b) => (b?.overallRating || 0) - (a?.overallRating || 0))
        .slice(0, limit)
        .map((supplier, index) => ({
          supplier,
          rank: index + 1,
          score: supplier?.overallRating || 0,
        }));

      return rankedSuppliers;
    } catch (error) {
      console.error('获取供应商排名错?', error);
      throw error;
    }
  }

  /**
   * 获取供应商性能统计
   */
  async getSupplierPerformanceStats(supplierId: string): Promise<any> {
    try {
      const supplier = await this.getSupplierWithRating(supplierId);
      if (!supplier?.rating) {
        throw new Error('供应商评分信息不存在');
      }

      // 获取议价历史统计
      const { data: historyData, error: historyError } = await supabase
        .from('negotiation_history')
        .select('*')
        .eq('supplier_id', supplierId);

      if (historyError)
        throw new Error(`获取议价历史失败: ${historyError.message}`);

      const totalNegotiations = historyData?.length || 0;
      const successfulNegotiations =
        historyData?.filter(h => h.negotiation_status === 'success').length ||
        0;
      const avgDiscount =
        historyData?.reduce((sum, h) => sum + (h.discount_rate || 0), 0) /
          Math.max(totalNegotiations, 1) || 0;

      return {
        basicInfo: {
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
        },
        ratings: supplier.rating,
        performance: {
          totalNegotiations,
          successfulNegotiations,
          successRate:
            totalNegotiations > 0
              ? (successfulNegotiations / totalNegotiations) * 100
              : 0,
          averageDiscountRate: avgDiscount,
          reliabilityScore: supplier.rating.deliveryReliability,
        },
        recentActivity: {
          lastTransaction: supplier.rating.lastTransactionDate,
          daysSinceLastTransaction: supplier.rating.lastTransactionDate
            ? Math.floor(
                (Date.now() -
                  new Date(supplier.rating.lastTransactionDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        },
      };
    } catch (error) {
      console.error('获取供应商性能统计错误:', error);
      throw error;
    }
  }

  // 私有辅助方法

  /**
   * 获取所有供应商及其评分
   */
  private async getAllSuppliersWithRatings(): Promise<SupplierWithRating[]> {
    try {
      // 获取所有供应商
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('status', 'approved');

      if (suppliersError)
        throw new Error(`获取供应商列表失? ${suppliersError.message}`);

      // 获取所有评?      const { data: ratings, error: ratingsError } = await supabase
        .from('supplier_ratings')
        .select('*');

      if (ratingsError)
        throw new Error(`获取供应商评分失? ${ratingsError.message}`);

      // 合并数据
      return (
        suppliers?.map(supplier => {
          const rating = ratings?.find(r => r.supplier_id === supplier.id);
          return {
            id: supplier.id,
            name: supplier.name,
            contactPerson: supplier.contact_person,
            phone: supplier.phone,
            email: supplier.email,
            rating: rating ? this.mapToRating(rating) : undefined,
          };
        }) || []
      );
    } catch (error) {
      console.error('获取所有供应商评分错误:', error);
      throw error;
    }
  }

  /**
   * 计算推荐得分
   */
  private calculateRecommendationScore(
    supplier: SupplierWithRating,
    procurementItems: any[],
    targetPrice: number
  ): number {
    if (!supplier.rating) return 0;

    let score = 0;

    // 交易次数权重 (30%)
    const transactionScore = Math.min(
      100,
      (supplier.rating.transactionCount / 50) * 100
    );
    score += transactionScore * 0.3;

    // 成功议价率权?(25%)
    const successRate =
      supplier.rating.transactionCount > 0
        ? (supplier.rating.successfulNegotiations /
            supplier.rating.transactionCount) *
          100
        : 0;
    score += successRate * 0.25;

    // 平均折扣率权?(20%)
    score += supplier.rating.averageDiscountRate * 0.2;

    // 售后服务评分权重 (15%)
    score += supplier.rating.afterSalesRate * 3 * 0.15; // 转换?00分制

    // 价格竞争力权?(10%)
    score += supplier.rating.priceCompetitiveness * 0.1;

    return Math.round(score);
  }

  /**
   * 生成推荐理由
   */
  private generateRecommendationReasons(
    supplier: SupplierWithRating,
    score: number
  ): string[] {
    const reasons: string[] = [];

    if (!supplier.rating) {
      reasons.push('新供应商，缺乏历史数?);
      return reasons;
    }

    if (supplier.rating.transactionCount >= 50) {
      reasons.push('经验丰富?0+笔交易）');
    }

    if (
      supplier.rating.successfulNegotiations /
        Math.max(supplier.rating.transactionCount, 1) >=
      0.8
    ) {
      reasons.push('议价成功率高');
    }

    if (supplier.rating.averageDiscountRate >= 10) {
      reasons.push(
        `平均折扣率高?{supplier.rating.averageDiscountRate.toFixed(1)}%`
      );
    }

    if (supplier.rating.afterSalesRate >= 4.0) {
      reasons.push('售后服务评价优秀');
    }

    if (supplier.rating.priceCompetitiveness >= 4.0) {
      reasons.push('价格具有竞争?);
    }

    if (reasons.length === 0) {
      reasons.push(`综合评分?{score}分`);
    }

    return reasons;
  }

  /**
   * 获取当前评分
   */
  private async getCurrentRating(
    supplierId: string
  ): Promise<SupplierRating | null> {
    const { data, error } = await supabase
      .from('supplier_ratings')
      .select('*')
      .eq('supplier_id', supplierId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`获取当前评分失败: ${error.message}`);
    }

    return this.mapToRating(data);
  }

  /**
   * 计算移动平均?   */
  private calculateMovingAverage(
    currentAvg: number,
    count: number,
    newValue: number
  ): number {
    return (currentAvg * count + newValue) / (count + 1);
  }

  /**
   * 计算综合评分
   */
  private calculateOverallRating(metrics: any): number {
    // 加权计算综合评分
    const weights = {
      transactionCount: 0.15,
      successRate: 0.25,
      avgDiscount: 0.2,
      afterSales: 0.15,
      priceCompetitive: 0.15,
      deliveryReliable: 0.1,
    };

    const successRate =
      metrics.transactionCount > 0
        ? (metrics.successfulNegotiations / metrics.transactionCount) * 100
        : 0;

    let score = 0;
    score +=
      Math.min(100, (metrics.transactionCount / 50) * 100) *
      weights.transactionCount;
    score += successRate * weights.successRate;
    score += metrics.averageDiscountRate * weights.avgDiscount;
    score += metrics.afterSalesRate * 20 * weights.afterSales; // 转换?00分制
    score += metrics.priceCompetitiveness * 20 * weights.priceCompetitive; // 转换?00分制
    score += metrics.deliveryReliability * weights.deliveryReliable;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 映射数据库记录到评分对象
   */
  private mapToRating(data: any): SupplierRating {
    return {
      id: data.id,
      supplierId: data.supplier_id,
      transactionCount: data.transaction_count,
      successfulNegotiations: data.successful_negotiations,
      averageDiscountRate: data.average_discount_rate,
      afterSalesRate: data.after_sales_rate,
      priceCompetitiveness: data.price_competitiveness,
      deliveryReliability: data.delivery_reliability,
      qualityScore: data.quality_score,
      overallRating: data.overall_rating,
      lastTransactionDate: data.last_transaction_date
        ? new Date(data.last_transaction_date)
        : undefined,
      lastUpdated: new Date(data.last_updated),
    };
  }
}
