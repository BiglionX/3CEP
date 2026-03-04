/**
 * 谷仓科技WMS客户端实? * 实现与Goodcang WMS系统的API对接
 */

import {
  WMSClient,
  WMSConfig,
  WMSInboundNotice,
  WMSInventoryItem,
  WMSOrder,
  WMSResponse,
  WMSToken,
  WMS_CALLBACK_RESULT,
} from './wms-client.interface';

export class GoodcangWMSClient implements WMSClient {
  private config: WMSConfig;
  private token: WMSToken | null = null;
  private tokenExpiryTimer: NodeJS.Timeout | null = null;

  constructor(config: WMSConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * 认证获取访问令牌
   */
  async authenticate(): Promise<WMSResponse<WMSToken>> {
    const requestId = this.generateRequestId();

    try {
      const response = await this.makeRequest('/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `AUTH_ERROR_${response.status}`,
            message: errorData.message || '认证失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const data = await response.json();
      const token: WMSToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: Date.now() + data.expires_in * 1000,
        tokenType: data.token_type,
      };

      this.token = token;
      this.setupTokenRefresh(token.expiresIn);

      return {
        success: true,
        data: token,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(refreshToken: string): Promise<WMSResponse<WMSToken>> {
    const requestId = this.generateRequestId();

    try {
      const response = await this.makeRequest('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `REFRESH_ERROR_${response.status}`,
            message: errorData.message || '令牌刷新失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const data = await response.json();
      const token: WMSToken = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: Date.now() + data.expires_in * 1000,
        tokenType: data.token_type,
      };

      this.token = token;
      this.setupTokenRefresh(token.expiresIn);

      return {
        success: true,
        data: token,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 同步库存信息
   */
  async syncInventory(): Promise<WMSResponse<WMSInventoryItem[]>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<WMSInventoryItem[]>;
    }

    const requestId = this.generateRequestId();

    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/v1/inventory/list?warehouse_code=${this.config.warehouseId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `SYNC_ERROR_${response.status}`,
            message: errorData.message || '库存同步失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const data = await response.json();
      const inventoryItems: WMSInventoryItem[] = data.items.map(
        (item: any) => ({
          sku: item.sku,
          productName: item.product_name,
          quantity: item.total_quantity,
          availableQuantity: item.available_quantity,
          reservedQuantity: item.reserved_quantity,
          location: item.location,
          batchNumber: item.batch_number,
          expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
          lastUpdated: new Date(item.last_updated),
        })
      );

      return {
        success: true,
        data: inventoryItems,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 查询指定SKU库存
   */
  async getInventoryBySku(sku: string): Promise<WMSResponse<WMSInventoryItem>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<WMSInventoryItem>;
    }

    const requestId = this.generateRequestId();

    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/v1/inventory/detail?warehouse_code=${
          this.config.warehouseId
        }&sku=${encodeURIComponent(sku)}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `QUERY_ERROR_${response.status}`,
            message: errorData.message || '查询库存失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const item = await response.json();
      const inventoryItem: WMSInventoryItem = {
        sku: item.sku,
        productName: item.product_name,
        quantity: item.total_quantity,
        availableQuantity: item.available_quantity,
        reservedQuantity: item.reserved_quantity,
        location: item.location,
        batchNumber: item.batch_number,
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        lastUpdated: new Date(item.last_updated),
      };

      return {
        success: true,
        data: inventoryItem,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 创建入库预报
   */
  async createInboundNotice(
    notice: WMSInboundNotice
  ): Promise<WMSResponse<string>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<string>;
    }

    const requestId = this.generateRequestId();

    try {
      const requestBody = {
        warehouse_code: this.config.warehouseId,
        notice_number: notice.noticeNumber,
        expected_arrival: notice.expectedArrival.toISOString(),
        items: notice.items.map(item => ({
          sku: item.sku,
          quantity: item.quantity,
          unit_weight: item.unitWeight,
          dimensions: item.dimensions,
        })),
        supplier_info: {
          name: notice.supplierInfo.name,
          contact: notice.supplierInfo.contact,
          address: notice.supplierInfo.address,
        },
        // 添加回调配置
        callback_url:
          this.config.callbackUrl ||
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/wms/callback/inbound`,
        callback_token:
          this.config.callbackToken || this.generateCallbackToken(),
        callback_events: ['status_changed', 'received'],
      };

      const response = await this.makeAuthenticatedRequest(
        '/api/v1/inbound/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `CREATE_NOTICE_ERROR_${response.status}`,
            message: errorData.message || '创建入库预报失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result.notice_id,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新订单发货状?   */
  async updateShipmentStatus(
    orderId: string,
    trackingNumber: string,
    status: 'shipped' | 'delivered'
  ): Promise<WMSResponse<void>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<void>;
    }

    const requestId = this.generateRequestId();

    try {
      const requestBody = {
        order_id: orderId,
        tracking_number: trackingNumber,
        status: status,
        timestamp: new Date().toISOString(),
      };

      const response = await this.makeAuthenticatedRequest(
        '/api/v1/orders/update-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `UPDATE_STATUS_ERROR_${response.status}`,
            message: errorData.message || '更新订单状态失?,
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 获取订单信息
   */
  async getOrder(orderId: string): Promise<WMSResponse<WMSOrder>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<WMSOrder>;
    }

    const requestId = this.generateRequestId();

    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/v1/orders/${orderId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `ORDER_QUERY_ERROR_${response.status}`,
            message: errorData.message || '查询订单失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const orderData = await response.json();
      const order: WMSOrder = {
        orderId: orderData.order_id,
        orderNumber: orderData.order_number,
        status: orderData.status,
        items: orderData.items.map((item: any) => ({
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
        })),
        shippingAddress: {
          name: orderData.shipping_address.name,
          address: orderData.shipping_address.address,
          city: orderData.shipping_address.city,
          state: orderData.shipping_address.state,
          zipCode: orderData.shipping_address.zip_code,
          country: orderData.shipping_address.country,
          phone: orderData.shipping_address.phone,
        },
        trackingNumber: orderData.tracking_number,
        shippedAt: orderData.shipped_at
          ? new Date(orderData.shipped_at)
          : undefined,
        deliveredAt: orderData.delivered_at
          ? new Date(orderData.delivered_at)
          : undefined,
      };

      return {
        success: true,
        data: order,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 获取仓库位置信息
   */
  async getWarehouseLocations(): Promise<
    WMSResponse<Array<{ code: string; name: string; address: string }>>
  > {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<
        Array<{ code: string; name: string; address: string }>
      >;
    }

    const requestId = this.generateRequestId();

    try {
      const response = await this.makeAuthenticatedRequest(
        '/api/v1/warehouses/list',
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `WAREHOUSE_LIST_ERROR_${response.status}`,
            message: errorData.message || '获取仓库列表失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.warehouses,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 获取同步统计信息
   */
  async getSyncStats(): Promise<
    WMSResponse<{
      lastSync: Date;
      itemCount: number;
      successCount: number;
      errorCount: number;
    }>
  > {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<{
        lastSync: Date;
        itemCount: number;
        successCount: number;
        errorCount: number;
      }>;
    }

    const requestId = this.generateRequestId();

    try {
      const response = await this.makeAuthenticatedRequest(
        `/api/v1/stats/sync?warehouse_code=${this.config.warehouseId}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `STATS_ERROR_${response.status}`,
            message: errorData.message || '获取同步统计失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          lastSync: new Date(data.last_sync),
          itemCount: data.item_count,
          successCount: data.success_count,
          errorCount: data.error_count,
        },
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 确保认证有效
   */
  private async ensureAuthenticated(): Promise<WMSResponse<void>> {
    if (!this.token || Date.now() >= this.token.expiresIn - 300000) {
      // 提前5分钟刷新
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return authResult as WMSResponse<void>;
      }
    }
    return {
      success: true,
      requestId: this.generateRequestId(),
      timestamp: new Date(),
    };
  }

  /**
   * 发起认证请求
   */
  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this?.accessToken}`,
      'X-Warehouse-ID': this.config.warehouseId,
      'X-Request-ID': this.generateRequestId(),
    };

    return this.makeRequest(endpoint, {
      ...options,
      headers,
    });
  }

  /**
   * 发起基础请求（带重试机制?   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = this.config.timeout || 30000;

    for (
      let attempt = 0;
      attempt <= (this.config.retryAttempts || 3);
      attempt++
    ) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 如果不是5xx错误，不重试
        if (response.status < 500 || response.status >= 600) {
          return response;
        }

        // 5xx错误，准备重?        if (attempt < (this.config.retryAttempts || 3)) {
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt);
          await this.delay(delay);
        }
      } catch (error) {
        // 网络错误，准备重?        if (attempt < (this.config.retryAttempts || 3)) {
          const delay = (this.config.retryDelay || 1000) * Math.pow(2, attempt);
          await this.delay(delay);
        } else {
          throw error;
        }
      }
    }

    throw new Error('请求重试次数已达上限');
  }

  /**
   * 设置令牌刷新定时?   */
  private setupTokenRefresh(expiresIn: number): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }

    const refreshTime = expiresIn - Date.now() - 300000; // 提前5分钟刷新
    if (refreshTime > 0) {
      this.tokenExpiryTimer = setTimeout(async () => {
        if (this?.refreshToken) {
          await this.refreshToken(this.token.refreshToken);
        } else {
          await this.authenticate();
        }
      }, refreshTime);
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成回调令牌
   */
  private generateCallbackToken(): string {
    // 生成安全的回调令?    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * 设置回调配置
   */
  async setCallbackConfig(
    callbackUrl: string,
    callbackToken: string
  ): Promise<WMSResponse<void>> {
    const authResult = await this.ensureAuthenticated();
    if (!authResult.success) {
      return authResult as WMSResponse<void>;
    }

    const requestId = this.generateRequestId();

    try {
      const requestBody = {
        warehouse_code: this.config.warehouseId,
        callback_url: callbackUrl,
        callback_token: callbackToken,
        events: ['inbound_status', 'inventory_change'],
      };

      const response = await this.makeAuthenticatedRequest(
        '/api/v1/callback/config',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: {
            code: `CALLBACK_CONFIG_ERROR_${response.status}`,
            message: errorData.message || '配置回调失败',
            details: errorData,
          },
          requestId,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        requestId,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '网络请求失败',
          details: (error as Error).message,
        },
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 验证回调签名
   */
  async verifyCallbackSignature(
    data: any,
    signature: string
  ): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const secret = this.config.clientSecret;

      // 生成期望的签?      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(data))
        .digest('hex');

      // 比较签名（使用定时安全比较）
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('验证回调签名失败:', error);
      return false;
    }
  }

  /**
   * 处理入库预报回调
   */
  async handleInboundCallback(callbackData: any): Promise<WMS_CALLBACK_RESULT> {
    try {
      // 验证签名
      if (callbackData.signature) {
        const isValid = await this.verifyCallbackSignature(
          callbackData,
          callbackData.signature
        );

        if (!isValid) {
          return {
            success: false,
            processed: false,
            error: '签名验证失败',
            timestamp: new Date(),
          };
        }
      }

      // 验证时间?      const callbackTime = new Date(callbackData.timestamp);
      const currentTime = new Date();
      const timeDiff = Math.abs(currentTime.getTime() - callbackTime.getTime());

      if (timeDiff > 5 * 60 * 1000) {
        // 5分钟时间窗口
        return {
          success: false,
          processed: false,
          error: '时间戳过?,
          timestamp: new Date(),
        };
      }

      // 处理回调数据
      // 这里应该调用实际的服务层来处理业务逻辑
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('处理入库预报回调:', callbackData)return {
        success: true,
        processed: true,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('处理入库预报回调失败:', error);
      return {
        success: false,
        processed: false,
        error: (error as Error).message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    this.token = null;
  }
}
