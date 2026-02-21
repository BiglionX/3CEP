/**
 * 库存准确性监控系统
 * 实现库存准确性监控、差异检测和告警机制
 */

import { InventoryMapper } from "@/lib/warehouse/inventory-mapper";
import { createClient } from "@supabase/supabase-js";

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const inventoryMapper = new InventoryMapper();

export interface AccuracyConfig {
  targetAccuracy: number; // 目标准确率百分比 (例如 99.0)
  checkFrequency: "daily" | "weekly" | "monthly"; // 检查频率
  alertThreshold: number; // 差异阈值
  autoAdjustThreshold: number; // 自动调整阈值
  notificationChannels: string[]; // 通知渠道
}

export interface AccuracyReport {
  reportId: string;
  periodStart: Date;
  periodEnd: Date;
  accuracyRate: number;
  totalItems: number;
  accurateItems: number;
  discrepancyItems: number;
  averageDiscrepancy: number;
  discrepancies: Array<{
    sku: string;
    expected: number;
    actual: number;
    difference: number;
    percentage: number;
  }>;
  recommendations: string[];
  createdAt: Date;
}

export class InventoryAccuracyMonitor {
  private config: AccuracyConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AccuracyConfig>) {
    this.config = {
      targetAccuracy: 99.0,
      checkFrequency: "daily",
      alertThreshold: 5,
      autoAdjustThreshold: 10,
      notificationChannels: ["email", "system"],
      ...config,
    };
  }

  /**
   * 启动准确性监控
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log("🔄 库存准确性监控已在运行中");
      return;
    }

    const intervalMs = this.getCheckIntervalMs();
    console.log(
      `🚀 启动库存准确性监控，检查频率: ${this.config.checkFrequency}`
    );

    // 立即执行一次检查
    this.performAccuracyCheck().catch((error) => {
      console.error("首次准确性检查失败:", error);
    });

    // 设置定期检查
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performAccuracyCheck();
      } catch (error) {
        console.error("定期准确性检查失败:", error);
        await this.sendAlert(`准确性检查失败: ${(error as Error).message}`);
      }
    }, intervalMs);
  }

  /**
   * 停止准确性监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("🛑 库存准确性监控已停止");
    }
  }

  /**
   * 执行准确性检查
   */
  private async performAccuracyCheck(): Promise<void> {
    console.log("🔍 开始执行库存准确性检查...");

    const startTime = new Date();
    const periodEnd = new Date();
    const periodStart = this.getPeriodStartDate();

    try {
      // 1. 获取当前库存数据
      const currentInventory = await this.getCurrentInventorySnapshot();

      // 2. 获取历史库存数据用于对比
      const historicalData = await this.getHistoricalInventoryData(
        periodStart,
        periodEnd
      );

      // 3. 计算准确性指标
      const accuracyMetrics = this.calculateAccuracyMetrics(
        currentInventory,
        historicalData
      );

      // 4. 识别差异项
      const discrepancies = this.identifyDiscrepancies(
        currentInventory,
        historicalData
      );

      // 5. 生成报告
      const report: AccuracyReport = {
        reportId: this.generateReportId(),
        periodStart,
        periodEnd,
        accuracyRate: accuracyMetrics.accuracyRate,
        totalItems: accuracyMetrics.totalItems,
        accurateItems: accuracyMetrics.accurateItems,
        discrepancyItems: accuracyMetrics.discrepancyItems,
        averageDiscrepancy: accuracyMetrics.averageDiscrepancy,
        discrepancies,
        recommendations: this.generateRecommendations(
          discrepancies,
          accuracyMetrics
        ),
        createdAt: new Date(),
      };

      // 6. 保存报告到数据库
      await this.saveAccuracyReport(report);

      // 7. 检查是否需要告警
      await this.evaluateAndAlert(report);

      // 8. 发送报告通知
      await this.sendReportNotification(report);

      console.log(
        `✅ 库存准确性检查完成，准确率: ${report.accuracyRate.toFixed(2)}%`
      );
    } catch (error) {
      console.error("❌ 准确性检查执行失败:", error);
      throw error;
    }
  }

  /**
   * 获取当前库存快照
   */
  private async getCurrentInventorySnapshot(): Promise<Map<string, number>> {
    try {
      const { data, error } = await supabase
        .from("wms_current_inventory")
        .select("wms_sku, quantity");

      if (error) {
        throw new Error(`获取当前库存失败: ${error.message}`);
      }

      const snapshot = new Map<string, number>();
      data?.forEach((item) => {
        snapshot.set(item.wms_sku, item.quantity);
      });

      return snapshot;
    } catch (error) {
      console.error("获取库存快照异常:", error);
      throw error;
    }
  }

  /**
   * 获取历史库存数据
   */
  private async getHistoricalInventoryData(
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, number[]>> {
    try {
      const { data, error } = await supabase
        .from("wms_inventory_history")
        .select("mapping_id, quantity_after, changed_at")
        .gte("changed_at", startDate.toISOString())
        .lte("changed_at", endDate.toISOString());

      if (error) {
        throw new Error(`获取历史库存数据失败: ${error.message}`);
      }

      // 获取SKU映射
      const mappingIds = [
        ...new Set(data?.map((item) => item.mapping_id) || []),
      ];
      if (mappingIds.length === 0) return new Map();

      const { data: mappings, error: mappingError } = await supabase
        .from("wms_inventory_mapping")
        .select("id, wms_sku")
        .in("id", mappingIds);

      if (mappingError) {
        throw new Error(`获取SKU映射失败: ${mappingError.message}`);
      }

      const skuMap = new Map<string, string>();
      mappings?.forEach((mapping) => {
        skuMap.set(mapping.id, mapping.wms_sku);
      });

      // 按SKU组织历史数据
      const historicalData = new Map<string, number[]>();

      data?.forEach((item) => {
        const sku = skuMap.get(item.mapping_id);
        if (sku) {
          if (!historicalData.has(sku)) {
            historicalData.set(sku, []);
          }
          historicalData.get(sku)?.push(item.quantity_after);
        }
      });

      return historicalData;
    } catch (error) {
      console.error("获取历史库存数据异常:", error);
      throw error;
    }
  }

  /**
   * 计算准确性指标
   */
  private calculateAccuracyMetrics(
    currentInventory: Map<string, number>,
    historicalData: Map<string, number[]>
  ): {
    accuracyRate: number;
    totalItems: number;
    accurateItems: number;
    discrepancyItems: number;
    averageDiscrepancy: number;
  } {
    let totalItems = 0;
    let accurateItems = 0;
    let discrepancyItems = 0;
    let totalDiscrepancy = 0;

    // 遍历所有SKU进行比较
    const allSkus = new Set([
      ...currentInventory.keys(),
      ...historicalData.keys(),
    ]);

    allSkus.forEach((sku) => {
      totalItems++;

      const currentQty = currentInventory.get(sku) || 0;
      const historicalQtys = historicalData.get(sku) || [];

      if (historicalQtys.length > 0) {
        // 使用历史数据的平均值作为期望值
        const expectedQty =
          historicalQtys.reduce((sum, qty) => sum + qty, 0) /
          historicalQtys.length;
        const difference = Math.abs(currentQty - expectedQty);
        const percentageDiff =
          expectedQty > 0 ? (difference / expectedQty) * 100 : 0;

        totalDiscrepancy += percentageDiff;

        if (percentageDiff <= this.config.alertThreshold) {
          accurateItems++;
        } else {
          discrepancyItems++;
        }
      } else {
        // 新商品，视为准确
        accurateItems++;
      }
    });

    const accuracyRate =
      totalItems > 0 ? (accurateItems / totalItems) * 100 : 100;
    const averageDiscrepancy =
      totalItems > 0 ? totalDiscrepancy / totalItems : 0;

    return {
      accuracyRate,
      totalItems,
      accurateItems,
      discrepancyItems,
      averageDiscrepancy,
    };
  }

  /**
   * 识别差异项
   */
  private identifyDiscrepancies(
    currentInventory: Map<string, number>,
    historicalData: Map<string, number[]>
  ): Array<{
    sku: string;
    expected: number;
    actual: number;
    difference: number;
    percentage: number;
  }> {
    const discrepancies: Array<any> = [];

    const allSkus = new Set([
      ...currentInventory.keys(),
      ...historicalData.keys(),
    ]);

    allSkus.forEach((sku) => {
      const actual = currentInventory.get(sku) || 0;
      const historicalQtys = historicalData.get(sku) || [];

      if (historicalQtys.length > 0) {
        const expected =
          historicalQtys.reduce((sum, qty) => sum + qty, 0) /
          historicalQtys.length;
        const difference = Math.abs(actual - expected);
        const percentage = expected > 0 ? (difference / expected) * 100 : 0;

        if (percentage > this.config.alertThreshold) {
          discrepancies.push({
            sku,
            expected: Math.round(expected * 100) / 100,
            actual,
            difference: Math.round(difference * 100) / 100,
            percentage: Math.round(percentage * 100) / 100,
          });
        }
      }
    });

    // 按差异百分比降序排列
    return discrepancies.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    discrepancies: any[],
    metrics: any
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.accuracyRate < this.config.targetAccuracy) {
      recommendations.push(
        `当前准确率 ${metrics.accuracyRate.toFixed(2)}% 低于目标 ${
          this.config.targetAccuracy
        }%`
      );
    }

    if (discrepancies.length > 0) {
      const highDiscrepancyItems = discrepancies.filter(
        (d) => d.percentage > this.config.autoAdjustThreshold
      );
      if (highDiscrepancyItems.length > 0) {
        recommendations.push(
          `发现 ${highDiscrepancyItems.length} 个高差异商品，建议立即核查`
        );
      }

      recommendations.push(`建议加强库存盘点频率，特别是差异较大的商品`);
    }

    if (metrics.averageDiscrepancy > this.config.alertThreshold) {
      recommendations.push(`平均差异率偏高，建议检查库存管理流程`);
    }

    recommendations.push("建议定期进行物理盘点以验证系统准确性");

    return recommendations;
  }

  /**
   * 评估并发送告警
   */
  private async evaluateAndAlert(report: AccuracyReport): Promise<void> {
    const alerts: string[] = [];

    // 准确率告警
    if (report.accuracyRate < this.config.targetAccuracy) {
      alerts.push(
        `库存准确率下降至 ${report.accuracyRate.toFixed(2)}%，低于目标 ${
          this.config.targetAccuracy
        }%`
      );
    }

    // 高差异商品告警
    const highDiscrepancyItems = report.discrepancies.filter(
      (d) => d.percentage > this.config.autoAdjustThreshold
    );
    if (highDiscrepancyItems.length > 0) {
      alerts.push(
        `发现 ${highDiscrepancyItems.length} 个严重差异商品，最大差异达 ${highDiscrepancyItems[0].percentage}%`
      );
    }

    // 发送告警
    if (alerts.length > 0) {
      const alertMessage = `
🚨 库存准确性告警

${alerts.join("\n")}

详细报告ID: ${report.reportId}
检查时间: ${report.createdAt.toISOString()}

请相关人员及时处理。
      `.trim();

      await this.sendAlert(alertMessage, {
        type: "accuracy_warning",
        severity: highDiscrepancyItems.length > 0 ? "high" : "medium",
        reportId: report.reportId,
      });
    }
  }

  /**
   * 保存准确性报告
   */
  private async saveAccuracyReport(report: AccuracyReport): Promise<void> {
    try {
      const { error } = await supabase
        .from("inventory_accuracy_reports")
        .insert({
          report_id: report.reportId,
          period_start: report.periodStart.toISOString(),
          period_end: report.periodEnd.toISOString(),
          accuracy_rate: report.accuracyRate,
          total_items: report.totalItems,
          accurate_items: report.accurateItems,
          discrepancy_items: report.discrepancyItems,
          average_discrepancy: report.averageDiscrepancy,
          discrepancies: report.discrepancies,
          recommendations: report.recommendations,
          created_at: report.createdAt.toISOString(),
        });

      if (error) {
        console.error("保存准确性报告失败:", error);
      }
    } catch (error) {
      console.error("保存准确性报告异常:", error);
    }
  }

  /**
   * 发送报告通知
   */
  private async sendReportNotification(report: AccuracyReport): Promise<void> {
    const message = `
📊 库存准确性检查报告

检查期间: ${report.periodStart.toLocaleDateString()} - ${report.periodEnd.toLocaleDateString()}
准确率: ${report.accuracyRate.toFixed(2)}%
总商品数: ${report.totalItems}
准确商品数: ${report.accurateItems}
差异商品数: ${report.discrepancyItems}
平均差异率: ${report.averageDiscrepancy.toFixed(2)}%

${
  report.recommendations.length > 0
    ? `建议措施:\n${report.recommendations.map((r) => `- ${r}`).join("\n")}`
    : "库存管理水平良好"
}

报告ID: ${report.reportId}
生成时间: ${report.createdAt.toLocaleString()}
    `.trim();

    await this.sendNotification("accuracy_report", message, {
      type: "info",
      reportId: report.reportId,
      accuracyRate: report.accuracyRate,
    });
  }

  /**
   * 辅助方法
   */
  private getCheckIntervalMs(): number {
    switch (this.config.checkFrequency) {
      case "daily":
        return 24 * 60 * 60 * 1000;
      case "weekly":
        return 7 * 24 * 60 * 60 * 1000;
      case "monthly":
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  private getPeriodStartDate(): Date {
    const now = new Date();
    switch (this.config.checkFrequency) {
      case "daily":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      case "weekly":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    }
  }

  private generateReportId(): string {
    return `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendAlert(message: string, data?: any): Promise<void> {
    await this.sendNotification("accuracy_alert", message, data);
  }

  private async sendNotification(
    type: string,
    message: string,
    data?: any
  ): Promise<void> {
    console.log(`[${type.toUpperCase()}] ${message}`);

    try {
      await supabase.from("notifications").insert({
        type,
        message,
        data,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("记录通知失败:", error);
    }
  }

  /**
   * 获取监控状态
   */
  getStatus(): {
    isRunning: boolean;
    config: AccuracyConfig;
    lastCheck?: Date;
  } {
    return {
      isRunning: !!this.monitoringInterval,
      config: this.config,
      lastCheck: undefined, // 可以从数据库获取最后检查时间
    };
  }

  /**
   * 手动触发准确性检查
   */
  async triggerManualCheck(): Promise<AccuracyReport> {
    console.log("🎯 手动触发库存准确性检查");

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000); // 24小时前

    const currentInventory = await this.getCurrentInventorySnapshot();
    const historicalData = await this.getHistoricalInventoryData(
      periodStart,
      periodEnd
    );
    const accuracyMetrics = this.calculateAccuracyMetrics(
      currentInventory,
      historicalData
    );
    const discrepancies = this.identifyDiscrepancies(
      currentInventory,
      historicalData
    );

    const report: AccuracyReport = {
      reportId: this.generateReportId(),
      periodStart,
      periodEnd,
      accuracyRate: accuracyMetrics.accuracyRate,
      totalItems: accuracyMetrics.totalItems,
      accurateItems: accuracyMetrics.accurateItems,
      discrepancyItems: accuracyMetrics.discrepancyItems,
      averageDiscrepancy: accuracyMetrics.averageDiscrepancy,
      discrepancies,
      recommendations: this.generateRecommendations(
        discrepancies,
        accuracyMetrics
      ),
      createdAt: new Date(),
    };

    await this.saveAccuracyReport(report);
    await this.sendReportNotification(report);

    return report;
  }
}

// 导出单例实例
export const accuracyMonitor = new InventoryAccuracyMonitor();
