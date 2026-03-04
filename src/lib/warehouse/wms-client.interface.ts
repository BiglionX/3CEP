/**
 * WMS客户端接口定? * 定义与海外仓WMS系统对接的标准接? */

export interface WMSConfig {
  provider: 'goodcang' | '4px' | 'winit' | 'custom';
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  warehouseId: string;
  timeout?: number; // 请求超时时间(毫秒)
  retryAttempts?: number; // 重试次数
  retryDelay?: number; // 重试延迟(毫秒)
  callbackUrl?: string; // 回调URL
  callbackToken?: string; // 回调验证令牌
}

export interface WMSToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // 过期时间?  tokenType: string;
}

export interface WMSInventoryItem {
  sku: string;
  productName?: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  lastUpdated: Date;
}

export interface WMSOrder {
  orderId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface WMSInboundNotice {
  noticeNumber: string;
  expectedArrival: Date;
  items: Array<{
    sku: string;
    quantity: number;
    unitWeight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  supplierInfo: {
    name: string;
    contact: string;
    address: string;
  };
}

/**
 * WMS入库预报回调数据接口
 */
export interface WMSInboundNoticeCallback {
  noticeId: string;
  status: 'confirmed' | 'in_transit' | 'received' | 'cancelled';
  actualArrival?: Date;
  receivedItems: Array<{
    sku: string;
    expectedQuantity: number;
    receivedQuantity: number;
    discrepancy?: number;
  }>;
  timestamp: Date;
  signature?: string; // 回调签名验证
}

/**
 * WMS回调处理结果
 */
export interface WMS_CALLBACK_RESULT {
  success: boolean;
  processed: boolean;
  error?: string;
  timestamp: Date;
}

export interface WMSResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: Date;
}

export interface WMSClient {
  /**
   * 认证获取访问令牌
   */
  authenticate(): Promise<WMSResponse<WMSToken>>;

  /**
   * 设置回调URL配置
   */
  setCallbackConfig(
    callbackUrl: string,
    callbackToken: string
  ): Promise<WMSResponse<void>>;

  /**
   * 验证回调签名
   */
  verifyCallbackSignature(data: any, signature: string): Promise<boolean>;

  /**
   * 刷新访问令牌
   */
  refreshToken(refreshToken: string): Promise<WMSResponse<WMSToken>>;

  /**
   * 同步库存信息
   */
  syncInventory(): Promise<WMSResponse<WMSInventoryItem[]>>;

  /**
   * 查询指定SKU库存
   */
  getInventoryBySku(sku: string): Promise<WMSResponse<WMSInventoryItem>>;

  /**
   * 创建入库预报
   */
  createInboundNotice(notice: WMSInboundNotice): Promise<WMSResponse<string>>;

  /**
   * 更新订单发货状?   */
  updateShipmentStatus(
    orderId: string,
    trackingNumber: string,
    status: 'shipped' | 'delivered'
  ): Promise<WMSResponse<void>>;

  /**
   * 获取订单信息
   */
  getOrder(orderId: string): Promise<WMSResponse<WMSOrder>>;

  /**
   * 获取仓库位置信息
   */
  getWarehouseLocations(): Promise<
    WMSResponse<Array<{ code: string; name: string; address: string }>>
  >;

  /**
   * 获取同步统计信息
   */
  getSyncStats(): Promise<
    WMSResponse<{
      lastSync: Date;
      itemCount: number;
      successCount: number;
      errorCount: number;
    }>
  >;

  /**
   * 处理入库预报回调
   */
  handleInboundCallback(
    callbackData: WMSInboundNoticeCallback
  ): Promise<WMS_CALLBACK_RESULT>;
}
