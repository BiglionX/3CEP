/**
 * 入库预报数据模型
 * WMS-203 入库预报管理功能
 */

export enum InboundForecastStatus {
  FORECAST = 'forecast', // 预报状态
  IN_TRANSIT = 'in_transit', // 在途状态
  RECEIVED = 'received', // 已收货状态
  CANCELLED = 'cancelled', // 已取消
}

export interface InboundForecastItem {
  id: string;
  sku: string;
  productName: string;
  forecastedQuantity: number;
  unitWeight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  receivedQuantity?: number;
  remarks?: string;
}

export interface InboundForecast {
  id: string;
  forecastNumber: string;
  warehouseId: string;
  warehouseName: string;
  supplierName: string;
  supplierContact: string;
  supplierAddress: string;
  expectedArrival: Date;
  actualArrival?: Date;
  status: InboundForecastStatus;
  items: InboundForecastItem[];
  createdBy: string;
  brandId?: string;
  remarks?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInboundForecastDTO {
  warehouseId: string;
  supplierName: string;
  supplierContact: string;
  supplierAddress: string;
  expectedArrival: Date;
  items: Array<{
    sku: string;
    forecastedQuantity: number;
    unitWeight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    remarks?: string;
  }>;
  brandId?: string;
  remarks?: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
  }>;
}

export interface UpdateInboundForecastStatusDTO {
  status: InboundForecastStatus;
  reason?: string;
}

export interface InboundForecastQueryParams {
  warehouseId?: string;
  status?: InboundForecastStatus;
  supplierName?: string;
  startDate?: Date;
  endDate?: Date;
  brandId?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
}

export interface InboundForecastListItem {
  id: string;
  forecastNumber: string;
  warehouseId: string;
  warehouseName: string;
  supplierName: string;
  expectedArrival: Date;
  status: InboundForecastStatus;
  itemCount: number;
  totalForecastedQuantity: number;
  totalReceivedQuantity: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InboundForecastStatusHistory {
  id: string;
  noticeId: string;
  fromStatus: InboundForecastStatus | null;
  toStatus: InboundForecastStatus;
  changedBy: string;
  changeReason?: string;
  createdAt: Date;
}

export interface InboundForecastNotification {
  id: string;
  noticeId: string;
  notificationType: 'created' | 'status_changed' | 'reminder';
  recipientEmail: string;
  subject: string;
  content: string;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}

// 状态显示映射
export const INBOUND_FORECAST_STATUS_DISPLAY: Record<
  InboundForecastStatus,
  string
> = {
  [InboundForecastStatus.FORECAST]: '预报中',
  [InboundForecastStatus.IN_TRANSIT]: '在途中',
  [InboundForecastStatus.RECEIVED]: '已收货',
  [InboundForecastStatus.CANCELLED]: '已取消',
};

// 状态颜色映射
export const INBOUND_FORECAST_STATUS_COLORS: Record<
  InboundForecastStatus,
  string
> = {
  [InboundForecastStatus.FORECAST]: 'blue',
  [InboundForecastStatus.IN_TRANSIT]: 'orange',
  [InboundForecastStatus.RECEIVED]: 'green',
  [InboundForecastStatus.CANCELLED]: 'red',
};

// 验证规则
export const INBOUND_FORECAST_VALIDATION_RULES = {
  supplierName: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  supplierContact: {
    required: true,
    minLength: 5,
    maxLength: 50,
  },
  supplierAddress: {
    required: true,
    minLength: 10,
    maxLength: 200,
  },
  expectedArrival: {
    required: true,
    minDate: new Date(), // 不能是过去的时间
  },
  items: {
    required: true,
    minItems: 1,
    maxItems: 100,
  },
};

// 商品项验证规则
export const INBOUND_ITEM_VALIDATION_RULES = {
  sku: {
    required: true,
    minLength: 1,
    maxLength: 50,
  },
  forecastedQuantity: {
    required: true,
    min: 1,
    max: 999999,
  },
  unitWeight: {
    required: false,
    min: 0,
    max: 9999.999,
  },
};

// 默认值
export const INBOUND_FORECAST_DEFAULTS: Partial<CreateInboundForecastDTO> = {
  remarks: '',
  items: [],
};

export const INBOUND_ITEM_DEFAULTS: Partial<
  CreateInboundForecastDTO['items'][0]
> = {
  forecastedQuantity: 1,
  remarks: '',
};
