/**
 * WMS定时同步任务
 * 实现每5分钟的库存同步任务
 */

import { InventoryMapper } from "@/lib/warehouse/inventory-mapper";
import { WMSManager } from "@/lib/warehouse/wms-manager";
import { createClient } from "@supabase/supabase-js";

// 初始化服务
const wmsManager = new WMSManager();
const inventoryMapper = new InventoryMapper();

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SyncTaskConfig {
  enabled: boolean;
  intervalMinutes: number;
  batchSize: number;
  retryAttempts: number;
  alertThreshold: number; // 库存预警阈值
}

export class WMSSyncScheduler {
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private config: SyncTaskConfig;

  constructor(config?: Partial<SyncTaskConfig>) {
    this.config = {
      enabled: true,
      intervalMinutes: 5, // 每5分钟同步一次
      batchSize: 50,
      retryAttempts: 3,
      alertThreshold: 10,
      ...config,
    };
  }

  /**
   * 启动定时同步任务
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("🔄 WMS同步任务已在运行中");
      return;
    }

    if (!this.config.enabled) {
      console.log("⏭️ WMS同步任务已禁用");
      return;
    }

    this.isRunning = true;
    console.log(
      `🚀 启动WMS定时同步任务，间隔: ${this.config.intervalMinutes}分钟`
    );

    // 立即执行一次同步
    await this.executeSync();

    // 设置定时任务
    this.syncInterval = setInterval(async () => {
      try {
        await this.executeSync();
      } catch (error) {
        console.error("⏰ 定时同步任务执行失败:", error);
        await this.sendAlert(
          `定时同步任务执行失败: ${(error as Error).message}`
        );
      }
    }, this.config.intervalMinutes * 60 * 1000);
  }

  /**
   * 停止定时同步任务
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log("🛑 WMS定时同步任务已停止");
  }

  /**
   * 执行同步任务
   */
  private async executeSync(): Promise<void> {
    console.log("🔄 开始执行WMS库存同步任务...");

    const startTime = new Date();

    try {
      // 1. 获取所有活跃的WMS连接
      const connections = wmsManager
        .getConnections()
        .filter((conn) => conn.isActive);

      if (connections.length === 0) {
        console.log("ℹ️ 没有活跃的WMS连接，跳过同步");
        return;
      }

      console.log(`📊 发现 ${connections.length} 个活跃连接`);

      // 2. 为每个连接创建同步记录
      const syncRecords = new Map<string, string>();

      for (const connection of connections) {
        const recordId = await inventoryMapper.createSyncRecord({
          connectionId: connection.id,
          syncType: "incremental",
          status: "started",
          itemsCount: 0,
          successCount: 0,
          errorCount: 0,
        });

        if (recordId) {
          syncRecords.set(connection.id, recordId);
          console.log(`📝 为连接 ${connection.name} 创建同步记录: ${recordId}`);
        }
      }

      // 3. 执行批量同步
      const syncResult = await wmsManager.syncAllActiveWarehouses();

      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;

      console.log(`⏱️ 同步任务完成，耗时: ${duration.toFixed(2)}秒`);

      // 4. 更新同步记录
      for (const [connectionId, recordId] of syncRecords) {
        const connectionResult = syncResult.data?.[connectionId];
        const itemsCount = connectionResult?.length || 0;
        const success = syncResult.success && connectionResult !== undefined;

        await inventoryMapper.updateSyncRecord(recordId, {
          status: success ? "completed" : "failed",
          itemsCount,
          successCount: success ? itemsCount : 0,
          errorCount: success ? 0 : itemsCount,
          endTime,
          errorDetails: success ? undefined : syncResult.error,
        });

        // 更新连接的最后同步时间
        await this.updateConnectionSyncTime(
          connectionId,
          success ? endTime : undefined
        );
      }

      // 5. 检查库存预警
      await this.checkInventoryAlerts();

      // 6. 发送执行报告
      await this.sendExecutionReport(syncResult, duration);
    } catch (error) {
      console.error("❌ 同步任务执行异常:", error);
      throw error;
    }
  }

  /**
   * 更新连接的同步时间
   */
  private async updateConnectionSyncTime(
    connectionId: string,
    syncTime?: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("wms_connections")
        .update({
          last_synced_at: syncTime?.toISOString(),
          sync_status: syncTime ? "success" : "failed",
        } as any)
        .eq("id", connectionId);

      if (error) {
        console.error(`更新连接 ${connectionId} 同步时间失败:`, error);
      }
    } catch (error) {
      console.error(`更新连接同步时间异常:`, error);
    }
  }

  /**
   * 检查库存预警
   */
  private async checkInventoryAlerts(): Promise<void> {
    try {
      const lowInventoryItems = await inventoryMapper.getLowInventoryAlerts(
        this.config.alertThreshold
      );

      if (lowInventoryItems.length > 0) {
        console.log(`⚠️ 发现 ${lowInventoryItems.length} 个低库存项目`);

        // 发送预警通知
        await this.sendInventoryAlert(lowInventoryItems);

        // 可以在这里触发其他业务逻辑，比如自动生成补货申请
      } else {
        console.log("✅ 库存水平正常");
      }
    } catch (error) {
      console.error("检查库存预警失败:", error);
    }
  }

  /**
   * 发送库存预警通知
   */
  private async sendInventoryAlert(lowInventoryItems: any[]): Promise<void> {
    try {
      // 构建预警消息
      const alertMessage = `
🔔 WMS库存预警通知

发现 ${lowInventoryItems.length} 个商品库存低于预警阈值 (${
        this.config.alertThreshold
      })：

${lowInventoryItems
  .map(
    (item) =>
      `- ${item.warehouseName}: ${item.sku} (${item.productName}) - 可用量: ${item.availableQuantity}`
  )
  .join("\n")}

请及时处理补货事宜。
      `.trim();

      // 发送到通知系统（这里可以根据实际需求实现）
      await this.sendNotification("inventory_alert", alertMessage, {
        type: "warning",
        items: lowInventoryItems,
      });
    } catch (error) {
      console.error("发送库存预警通知失败:", error);
    }
  }

  /**
   * 发送执行报告
   */
  private async sendExecutionReport(
    syncResult: any,
    duration: number
  ): Promise<void> {
    try {
      const stats = wmsManager.getSyncStatistics();

      const reportMessage = `
📊 WMS同步任务执行报告

执行时间: ${new Date().toISOString()}
执行耗时: ${duration.toFixed(2)}秒
连接总数: ${stats.totalConnections}
活跃连接: ${stats.activeConnections}
成功同步: ${stats.successfulSyncs}
失败同步: ${stats.failedSyncs}
最后同步: ${stats.lastSyncTime?.toISOString() || "N/A"}

同步结果: ${syncResult.success ? "✅ 成功" : "❌ 失败"}
${syncResult.error ? `错误信息: ${syncResult.error.message}` : ""}
      `.trim();

      await this.sendNotification("sync_report", reportMessage, {
        type: syncResult.success ? "info" : "error",
        stats,
        duration,
      });
    } catch (error) {
      console.error("发送执行报告失败:", error);
    }
  }

  /**
   * 发送告警通知
   */
  private async sendAlert(message: string): Promise<void> {
    try {
      await this.sendNotification("system_alert", message, {
        type: "error",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("发送告警通知失败:", error);
    }
  }

  /**
   * 发送通知（通用方法）
   */
  private async sendNotification(
    type: string,
    message: string,
    data?: any
  ): Promise<void> {
    // 这里可以集成各种通知渠道：
    // - 邮件通知
    // - Slack/钉钉机器人
    // - 短信通知
    // - 系统内部消息

    console.log(`[${type.toUpperCase()}] ${message}`);

    // 示例：记录到数据库
    try {
      await supabase.from("notifications").insert({
        type,
        message,
        data,
        created_at: new Date().toISOString(),
      } as any);
    } catch (error) {
      // 通知记录失败不影响主流程
      console.warn("记录通知失败:", error);
    }
  }

  /**
   * 手动触发同步
   */
  async triggerManualSync(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🎯 手动触发WMS同步任务");
      await this.executeSync();
      return {
        success: true,
        message: "手动同步任务执行成功",
      };
    } catch (error) {
      const errorMessage = `手动同步任务执行失败: ${(error as Error).message}`;
      console.error(errorMessage);
      await this.sendAlert(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 获取任务状态
   */
  getStatus(): {
    isRunning: boolean;
    config: SyncTaskConfig;
    statistics: ReturnType<typeof wmsManager.getSyncStatistics>;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      statistics: wmsManager.getSyncStatistics(),
    };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<SyncTaskConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("🔧 WMS同步任务配置已更新:", this.config);

    // 如果正在运行且间隔改变，重启定时任务
    if (this.isRunning && newConfig.intervalMinutes !== undefined) {
      this.stop();
      this.start();
    }
  }
}

// 导出单例实例
export const wmsSyncScheduler = new WMSSyncScheduler();

// 如果作为独立脚本运行
if (require.main === module) {
  // 读取环境变量配置
  const config: Partial<SyncTaskConfig> = {};

  if (process.env.WMS_SYNC_ENABLED !== undefined) {
    config.enabled = process.env.WMS_SYNC_ENABLED === "true";
  }

  if (process.env.WMS_SYNC_INTERVAL) {
    config.intervalMinutes = parseInt(process.env.WMS_SYNC_INTERVAL, 10);
  }

  if (process.env.WMS_ALERT_THRESHOLD) {
    config.alertThreshold = parseInt(process.env.WMS_ALERT_THRESHOLD, 10);
  }

  const scheduler = new WMSSyncScheduler(config);

  // 启动任务
  scheduler.start().catch((error) => {
    console.error("启动WMS同步任务失败:", error);
    process.exit(1);
  });

  // 优雅关闭
  process.on("SIGTERM", () => {
    console.log("收到SIGTERM信号，正在关闭...");
    scheduler.stop();
    process.exit(0);
  });

  process.on("SIGINT", () => {
    console.log("收到SIGINT信号，正在关闭...");
    scheduler.stop();
    process.exit(0);
  });
}
