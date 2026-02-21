/**
 * 比价报告生成服务
 * 负责生成供应商报价对比分析报告
 */

import { createClient } from "@supabase/supabase-js";
import { Supplier } from "../../supply-chain/models/supplier.model";
import {
  ComparisonReport,
  DeliveryAnalysis,
  PriceAnalysis,
  Recommendation,
  ReportSummary,
  RiskAssessment,
} from "../models/quotation.model";

export class ComparisonReportService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
  }

  /**
   * 生成比价报告
   */
  async generateComparisonReport(
    quotationRequestId: string,
    userId: string
  ): Promise<ComparisonReport> {
    try {
      // 获取询价请求信息
      const quotationRequest = await this.getQuotationRequest(
        quotationRequestId
      );
      if (!quotationRequest) {
        throw new Error("询价请求不存在");
      }

      // 获取供应商报价
      const supplierQuotes = await this.getSupplierQuotes(quotationRequestId);
      if (supplierQuotes.length === 0) {
        throw new Error("没有收到任何供应商报价");
      }

      // 获取供应商信息
      const suppliers = await this.getSuppliers(
        supplierQuotes.map((q) => q.supplierId)
      );

      // 生成报告各部分内容
      const summary = this.generateSummary(supplierQuotes);
      const priceAnalysis = this.generatePriceAnalysis(
        supplierQuotes,
        suppliers
      );
      const deliveryAnalysis = this.generateDeliveryAnalysis(
        supplierQuotes,
        suppliers
      );
      const riskAssessment = this.generateRiskAssessment(
        supplierQuotes,
        suppliers
      );
      const recommendations = this.generateRecommendations(
        priceAnalysis,
        deliveryAnalysis,
        riskAssessment
      );

      // 组装完整报告数据
      const reportData = {
        quotationRequest,
        supplierQuotes,
        suppliers,
        summary,
        priceAnalysis,
        deliveryAnalysis,
        riskAssessment,
        recommendations,
      };

      // 保存报告到数据库
      const report = await this.saveComparisonReport(
        quotationRequestId,
        "询价比价分析报告",
        summary,
        priceAnalysis,
        deliveryAnalysis,
        riskAssessment,
        recommendations,
        reportData,
        userId
      );

      return report;
    } catch (error) {
      console.error("生成比价报告错误:", error);
      throw error;
    }
  }

  /**
   * 获取询价请求信息
   */
  private async getQuotationRequest(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("quotation_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(`获取询价请求失败: ${error.message}`);
    return data;
  }

  /**
   * 获取供应商报价
   */
  private async getSupplierQuotes(quotationRequestId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("supplier_quotes")
      .select("*")
      .eq("quotation_request_id", quotationRequestId)
      .in("status", ["received", "accepted"]);

    if (error) throw new Error(`获取供应商报价失败: ${error.message}`);
    return data || [];
  }

  /**
   * 获取供应商信息
   */
  private async getSuppliers(supplierIds: string[]): Promise<Supplier[]> {
    const { data, error } = await this.supabase
      .from("suppliers")
      .select("*")
      .in("id", supplierIds);

    if (error) throw new Error(`获取供应商信息失败: ${error.message}`);
    return data || [];
  }

  /**
   * 生成报告摘要
   */
  private generateSummary(supplierQuotes: any[]): ReportSummary {
    const totalSuppliers = supplierQuotes.length;
    const respondedSuppliers = supplierQuotes.length;
    const prices = supplierQuotes.map((q) => q.total_amount);

    return {
      totalSuppliers,
      respondedSuppliers,
      averagePrice:
        prices.reduce((sum, price) => sum + price, 0) / prices.length,
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
      currency: supplierQuotes[0]?.currency || "CNY",
    };
  }

  /**
   * 生成价格分析
   */
  private generatePriceAnalysis(
    supplierQuotes: any[],
    suppliers: Supplier[]
  ): PriceAnalysis {
    const averagePrice =
      supplierQuotes.reduce((sum, q) => sum + q.total_amount, 0) /
      supplierQuotes.length;

    const priceComparison = supplierQuotes.map((quote) => {
      const supplier = suppliers.find((s) => s.id === quote.supplier_id);
      const priceDeviation =
        averagePrice > 0
          ? ((quote.total_amount - averagePrice) / averagePrice) * 100
          : 0;

      let competitiveness: "high" | "medium" | "low" = "medium";
      if (priceDeviation < -10) competitiveness = "high";
      else if (priceDeviation > 10) competitiveness = "low";

      return {
        supplierId: quote.supplier_id,
        supplierName: supplier?.name || "未知供应商",
        totalPrice: quote.total_amount,
        priceDeviation,
        competitiveness,
      };
    });

    // 按价格排序
    priceComparison.sort((a, b) => a.totalPrice - b.totalPrice);

    // 生成商品价格趋势分析
    const priceTrends: any[] = [];
    // 这里可以根据实际需求添加更详细的商品级别价格分析

    return {
      priceComparison,
      priceTrends,
    };
  }

  /**
   * 生成交期分析
   */
  private generateDeliveryAnalysis(
    supplierQuotes: any[],
    suppliers: Supplier[]
  ): DeliveryAnalysis {
    const deliveryTimeComparison = supplierQuotes.map((quote) => {
      const supplier = suppliers.find((s) => s.id === quote.supplier_id);
      const deliveryTime = quote.delivery_time || 30; // 默认30天

      let riskLevel: "low" | "medium" | "high" = "low";
      if (deliveryTime > 60) riskLevel = "high";
      else if (deliveryTime > 30) riskLevel = "medium";

      return {
        supplierId: quote.supplier_id,
        supplierName: supplier?.name || "未知供应商",
        deliveryTime,
        deliveryTerms: quote.delivery_terms || "标准交期",
        riskLevel,
      };
    });

    // 计算准时交货率（模拟数据）
    const onTimeDeliveryRate = 0.85; // 85%的模拟准时率

    return {
      deliveryTimeComparison,
      onTimeDeliveryRate,
    };
  }

  /**
   * 生成风险评估
   */
  private generateRiskAssessment(
    supplierQuotes: any[],
    suppliers: Supplier[]
  ): RiskAssessment {
    const supplierRisks = supplierQuotes.map((quote) => {
      const supplier = suppliers.find((s) => s.id === quote.supplier_id);

      // 综合风险评分（0-100）
      let riskScore = 50; // 基础分数

      // 价格风险：价格过高或过低都有风险
      const avgPrice =
        supplierQuotes.reduce((sum, q) => sum + q.total_amount, 0) /
        supplierQuotes.length;
      const priceDeviation = Math.abs(
        (quote.total_amount - avgPrice) / avgPrice
      );
      if (priceDeviation > 0.3) riskScore += 20; // 价格偏离30%以上增加风险

      // 交期风险
      const deliveryTime = quote.delivery_time || 30;
      if (deliveryTime > 60) riskScore += 25;
      else if (deliveryTime > 30) riskScore += 10;

      // 供应商历史表现（如果有数据的话）
      if (supplier) {
        // 信用评分影响（假设信用评分1-5分）
        const creditImpact = (5 - (supplier.creditScore || 3)) * 10;
        riskScore += creditImpact;

        // 合作年限影响
        const cooperationYears = supplier.cooperationYears || 0;
        if (cooperationYears < 1) riskScore += 15;
        else if (cooperationYears < 3) riskScore += 5;
      }

      let riskLevel: "low" | "medium" | "high" = "medium";
      if (riskScore < 40) riskLevel = "low";
      else if (riskScore > 70) riskLevel = "high";

      return {
        supplierId: quote.supplier_id,
        supplierName: supplier?.name || "未知供应商",
        riskScore,
        riskLevel,
        riskFactors: this.identifyRiskFactors(quote, supplier),
      };
    });

    // 计算整体风险
    const avgRiskScore =
      supplierRisks.reduce((sum, r) => sum + r.riskScore, 0) /
      supplierRisks.length;

    let overallRiskLevel: "low" | "medium" | "high" = "medium";
    if (avgRiskScore < 40) overallRiskLevel = "low";
    else if (avgRiskScore > 70) overallRiskLevel = "high";

    return {
      supplierRisks,
      overallRisk: {
        score: Math.round(avgRiskScore),
        level: overallRiskLevel,
        summary: this.generateRiskSummary(overallRiskLevel),
      },
    };
  }

  /**
   * 识别风险因素
   */
  private identifyRiskFactors(
    quote: any,
    supplier: Supplier | undefined
  ): string[] {
    const factors: string[] = [];

    // 价格风险
    if (quote.total_amount > 0) {
      factors.push("价格波动风险");
    }

    // 交期风险
    const deliveryTime = quote.delivery_time || 30;
    if (deliveryTime > 45) {
      factors.push("较长交货周期");
    }

    // 供应商风险
    if (supplier) {
      if ((supplier.creditScore || 0) < 3) {
        factors.push("供应商信用评级较低");
      }

      if ((supplier.cooperationYears || 0) < 1) {
        factors.push("合作时间较短");
      }

      if (supplier.status !== "approved") {
        factors.push("供应商资质状态异常");
      }
    }

    return factors.length > 0 ? factors : ["常规商业风险"];
  }

  /**
   * 生成风险总结
   */
  private generateRiskSummary(riskLevel: "low" | "medium" | "high"): string {
    switch (riskLevel) {
      case "low":
        return "整体风险较低，供应商报价合理，交期可控";
      case "high":
        return "存在较高风险，建议谨慎选择或进一步谈判";
      default:
        return "风险适中，建议综合考虑各方面因素做出决策";
    }
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendations(
    priceAnalysis: PriceAnalysis,
    deliveryAnalysis: DeliveryAnalysis,
    riskAssessment: RiskAssessment
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 价格最优推荐
    const bestPriceSupplier = priceAnalysis.priceComparison[0];
    if (bestPriceSupplier && bestPriceSupplier.competitiveness === "high") {
      recommendations.push({
        type: "price",
        priority: "high",
        content: `推荐选择 ${bestPriceSupplier.supplierName}，其报价最具竞争力`,
        rationale: `该供应商报价比平均水平低 ${Math.abs(
          bestPriceSupplier.priceDeviation
        ).toFixed(1)}%`,
      });
    }

    // 交期最优推荐
    const fastestDelivery = deliveryAnalysis.deliveryTimeComparison.sort(
      (a, b) => a.deliveryTime - b.deliveryTime
    )[0];
    if (fastestDelivery && fastestDelivery.riskLevel === "low") {
      recommendations.push({
        type: "delivery",
        priority: "medium",
        content: `如需快速交货，可考虑 ${fastestDelivery.supplierName}`,
        rationale: `该供应商承诺 ${fastestDelivery.deliveryTime} 天交货`,
      });
    }

    // 风险最低推荐
    const lowestRisk = riskAssessment.supplierRisks.sort(
      (a, b) => a.riskScore - b.riskScore
    )[0];
    if (lowestRisk && lowestRisk.riskLevel === "low") {
      recommendations.push({
        type: "risk",
        priority: "high",
        content: `从风险角度考虑，推荐 ${lowestRisk.supplierName}`,
        rationale: `该供应商综合风险评分为 ${lowestRisk.riskScore}，属于低风险`,
      });
    }

    // 综合推荐
    if (recommendations.length === 0) {
      recommendations.push({
        type: "supplier",
        priority: "high",
        content: "建议综合考虑价格、交期和风险因素进行最终决策",
        rationale: "各供应商各有优劣，需要根据具体需求权衡选择",
      });
    }

    return recommendations;
  }

  /**
   * 保存比价报告
   */
  private async saveComparisonReport(
    quotationRequestId: string,
    reportTitle: string,
    summary: ReportSummary,
    priceAnalysis: PriceAnalysis,
    deliveryAnalysis: DeliveryAnalysis,
    riskAssessment: RiskAssessment,
    recommendations: Recommendation[],
    reportData: any,
    userId: string
  ): Promise<ComparisonReport> {
    try {
      const { data, error } = await this.supabase
        .from("comparison_reports")
        .insert([
          {
            quotation_request_id: quotationRequestId,
            report_title: reportTitle,
            summary,
            price_analysis: priceAnalysis,
            delivery_analysis: deliveryAnalysis,
            risk_assessment: riskAssessment,
            recommendations,
            report_data: reportData,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(`保存比价报告失败: ${error.message}`);

      return this.mapToComparisonReport(data);
    } catch (error) {
      console.error("保存比价报告错误:", error);
      throw error;
    }
  }

  /**
   * 获取比价报告
   */
  async getComparisonReport(id: string): Promise<ComparisonReport | null> {
    try {
      const { data, error } = await this.supabase
        .from("comparison_reports")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(`获取比价报告失败: ${error.message}`);
      }

      return this.mapToComparisonReport(data);
    } catch (error) {
      console.error("获取比价报告错误:", error);
      throw error;
    }
  }

  /**
   * 获取询价请求的比价报告列表
   */
  async getReportsByQuotationRequest(
    quotationRequestId: string
  ): Promise<ComparisonReport[]> {
    try {
      const { data, error } = await this.supabase
        .from("comparison_reports")
        .select("*")
        .eq("quotation_request_id", quotationRequestId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(`获取比价报告列表失败: ${error.message}`);

      return data.map((item: any) => this.mapToComparisonReport(item));
    } catch (error) {
      console.error("获取比价报告列表错误:", error);
      throw error;
    }
  }

  /**
   * 将数据库记录映射为ComparisonReport对象
   */
  private mapToComparisonReport(data: any): ComparisonReport {
    return {
      id: data.id,
      quotationRequestId: data.quotation_request_id,
      reportTitle: data.report_title,
      summary: data.summary,
      priceAnalysis: data.price_analysis,
      deliveryAnalysis: data.delivery_analysis,
      riskAssessment: data.risk_assessment,
      recommendations: data.recommendations,
      reportData: data.report_data,
      generatedAt: new Date(data.generated_at),
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
    };
  }
}

// 导出默认实例
export const comparisonReportService = new ComparisonReportService();
