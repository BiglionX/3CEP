/**
 * WMS管理器
 * 负责管理多个WMS客户端实例和统一接口
 */

import { GoodcangWMSClient } from "./goodcang-wms-client";
import {
  WMSClient,
  WMSConfig,
  WMSInventoryItem,
  WMSResponse,
} from "./wms-client.interface";

export interface WMSConnection {
  id: string;
  name: string;
  provider: "goodcang" | "4px" | "winit" | "custom";
  warehouseId: string;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: "success" | "failed" | "syncing" | "pending";
  errorMessage?: string;
}

export class WMSManager {
  private clients: Map<string, WMSClient> = new Map();
  private connections: Map<string, WMSConnection> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 绑定方法上下文
    this.startPeriodicSync = this.startPeriodicSync.bind(this);
    this.stopPeriodicSync = this.stopPeriodicSync.bind(this);
  }

  /**
   * 添加WMS连接
   */
  async addConnection(
    connection: Omit<WMSConnection, "id" | "syncStatus">,
    config: WMSConfig
  ): Promise<WMSResponse<string>> {
    try {
      // 生成唯一ID
      const id = this.generateConnectionId();

      // 创建客户端实例
      let client: WMSClient;
      switch (config.provider) {
        case "goodcang":
          client = new GoodcangWMSClient(config);
          break;
        case "4px":
        case "winit":
        case "custom":
          // TODO: 实现其他提供商的客户端
          return {
            success: false,
            error: {
              code: "PROVIDER_NOT_IMPLEMENTED",
              message: `提供商 ${config.provider} 尚未实现`,
              details: null,
            },
            requestId: this.generateRequestId(),
            timestamp: new Date(),
          };
        default:
          return {
            success: false,
            error: {
              code: "INVALID_PROVIDER",
              message: `不支持的提供商: ${config.provider}`,
              details: null,
            },
            requestId: this.generateRequestId(),
            timestamp: new Date(),
          };
      }

      // 测试连接
      const authResult = await client.authenticate();
      if (!authResult.success) {
        return {
          success: false,
          error: {
            code: "CONNECTION_TEST_FAILED",
            message: "连接测试失败",
            details: authResult.error,
          },
          requestId: this.generateRequestId(),
          timestamp: new Date(),
        };
      }

      // 保存连接信息
      const connectionInfo: WMSConnection = {
        ...connection,
        id,
        syncStatus: "pending",
      };

      this.clients.set(id, client);
      this.connections.set(id, connectionInfo);

      return {
        success: true,
        data: id,
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CONNECTION_SETUP_ERROR",
          message: "连接设置失败",
          details: (error as Error).message,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 移除WMS连接
   */
  removeConnection(connectionId: string): WMSResponse<void> {
    try {
      const client = this.clients.get(connectionId);
      if (client) {
        // 清理客户端资源
        if ("destroy" in client && typeof client.destroy === "function") {
          client.destroy();
        }
        this.clients.delete(connectionId);
      }

      this.connections.delete(connectionId);

      return {
        success: true,
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "CONNECTION_REMOVAL_ERROR",
          message: "移除连接失败",
          details: (error as Error).message,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 获取所有连接
   */
  getConnections(): WMSConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * 获取单个连接
   */
  getConnection(connectionId: string): WMSConnection | null {
    return this.connections.get(connectionId) || null;
  }

  /**
   * 启用/禁用连接
   */
  toggleConnection(connectionId: string, isActive: boolean): WMSResponse<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: {
          code: "CONNECTION_NOT_FOUND",
          message: "连接不存在",
          details: null,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }

    connection.isActive = isActive;
    this.connections.set(connectionId, connection);

    return {
      success: true,
      requestId: this.generateRequestId(),
      timestamp: new Date(),
    };
  }

  /**
   * 同步单个仓库库存
   */
  async syncWarehouseInventory(
    connectionId: string
  ): Promise<WMSResponse<WMSInventoryItem[]>> {
    const connection = this.connections.get(connectionId);
    const client = this.clients.get(connectionId);

    if (!connection || !client) {
      return {
        success: false,
        error: {
          code: "CONNECTION_NOT_FOUND",
          message: "连接不存在",
          details: null,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }

    if (!connection.isActive) {
      return {
        success: false,
        error: {
          code: "CONNECTION_INACTIVE",
          message: "连接已被禁用",
          details: null,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }

    try {
      // 更新连接状态
      connection.syncStatus = "syncing";
      connection.errorMessage = undefined;
      this.connections.set(connectionId, connection);

      // 执行同步
      const result = await client.syncInventory();

      // 更新连接状态
      if (result.success) {
        connection.syncStatus = "success";
        connection.lastSync = new Date();
      } else {
        connection.syncStatus = "failed";
        connection.errorMessage = result.error?.message;
      }
      this.connections.set(connectionId, connection);

      return result;
    } catch (error) {
      // 更新连接状态
      connection.syncStatus = "failed";
      connection.errorMessage = (error as Error).message;
      this.connections.set(connectionId, connection);

      return {
        success: false,
        error: {
          code: "SYNC_EXECUTION_ERROR",
          message: "同步执行失败",
          details: (error as Error).message,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量同步所有活跃仓库
   */
  async syncAllActiveWarehouses(): Promise<
    WMSResponse<{ [key: string]: WMSInventoryItem[] }>
  > {
    const activeConnections = Array.from(this.connections.values()).filter(
      (conn) => conn.isActive
    );

    if (activeConnections.length === 0) {
      return {
        success: true,
        data: {},
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }

    try {
      // 并发执行所有同步
      const syncPromises = activeConnections.map(async (connection) => {
        const result = await this.syncWarehouseInventory(connection.id);
        return {
          connectionId: connection.id,
          result,
        };
      });

      const results = await Promise.allSettled(syncPromises);

      // 处理结果
      const syncData: { [key: string]: WMSInventoryItem[] } = {};
      const errors: Array<{ connectionId: string; error: string }> = [];

      results.forEach((result, index) => {
        const connectionId = activeConnections[index].id;

        if (result.status === "fulfilled") {
          if (result.value.result.success && result.value.result.data) {
            syncData[connectionId] = result.value.result.data;
          } else {
            errors.push({
              connectionId,
              error: result.value.result.error?.message || "同步失败",
            });
          }
        } else {
          errors.push({
            connectionId,
            error: result.reason?.message || "同步异常",
          });
        }
      });

      if (errors.length > 0) {
        return {
          success: false,
          data: syncData,
          error: {
            code: "PARTIAL_SYNC_FAILURE",
            message: `部分仓库同步失败 (${errors.length}/${activeConnections.length})`,
            details: errors,
          },
          requestId: this.generateRequestId(),
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: syncData,
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "BATCH_SYNC_ERROR",
          message: "批量同步执行失败",
          details: (error as Error).message,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }
  }

  /**
   * 启动周期性同步
   */
  startPeriodicSync(intervalMinutes: number = 5): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncAllActiveWarehouses();
      } catch (error) {
        console.error("周期性同步失败:", error);
        // 可以在这里添加告警通知
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ 已启动周期性同步，间隔: ${intervalMinutes}分钟`);
  }

  /**
   * 停止周期性同步
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log("✅ 已停止周期性同步");
    }
  }

  /**
   * 获取同步统计信息
   */
  getSyncStatistics(): {
    totalConnections: number;
    activeConnections: number;
    successfulSyncs: number;
    failedSyncs: number;
    lastSyncTime?: Date;
  } {
    const connections = Array.from(this.connections.values());
    const now = new Date();
    let lastSyncTime: Date | undefined;

    connections.forEach((conn) => {
      if (conn.lastSync && (!lastSyncTime || conn.lastSync > lastSyncTime)) {
        lastSyncTime = conn.lastSync;
      }
    });

    return {
      totalConnections: connections.length,
      activeConnections: connections.filter((conn) => conn.isActive).length,
      successfulSyncs: connections.filter(
        (conn) => conn.syncStatus === "success"
      ).length,
      failedSyncs: connections.filter((conn) => conn.syncStatus === "failed")
        .length,
      lastSyncTime,
    };
  }

  /**
   * 获取连接健康状态
   */
  getConnectionHealth(connectionId: string): WMSResponse<{
    status: "healthy" | "degraded" | "unhealthy";
    lastSync?: Date;
    errorMessage?: string;
    uptimePercentage: number;
  }> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        error: {
          code: "CONNECTION_NOT_FOUND",
          message: "连接不存在",
          details: null,
        },
        requestId: this.generateRequestId(),
        timestamp: new Date(),
      };
    }

    // 简化的健康检查逻辑
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    let uptimePercentage = 100;

    if (connection.syncStatus === "failed") {
      status = "unhealthy";
      uptimePercentage = 0;
    } else if (connection.syncStatus === "syncing") {
      status = "degraded";
      uptimePercentage = 80;
    }

    return {
      success: true,
      data: {
        status,
        lastSync: connection.lastSync,
        errorMessage: connection.errorMessage,
        uptimePercentage,
      },
      requestId: this.generateRequestId(),
      timestamp: new Date(),
    };
  }

  /**
   * 生成连接ID
   */
  private generateConnectionId(): string {
    return `wms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理所有资源
   */
  destroy(): void {
    this.stopPeriodicSync();

    // 清理所有客户端
    this.clients.forEach((client) => {
      if ("destroy" in client && typeof client.destroy === "function") {
        client.destroy();
      }
    });

    this.clients.clear();
    this.connections.clear();
  }
}
