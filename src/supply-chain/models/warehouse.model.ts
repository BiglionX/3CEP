/**
 * 多仓管理系统数据模型
 * 支持国内外仓库、库存同步、智能分仓等功能
 */

// 仓库类型枚举
export enum WarehouseType {
  DOMESTIC = 'domestic',      // 国内仓
  OVERSEAS = 'overseas',      // 海外仓
  VIRTUAL = 'virtual',        // 虚拟仓
  TRANSIT = 'transit'         // 中转仓
}

// 仓库状态枚举
export enum WarehouseStatus {
  ACTIVE = 'active',          // 激活
  INACTIVE = 'inactive',      // 停用
  MAINTENANCE = 'maintenance' // 维护中
}

// 库存同步状态枚举
export enum SyncStatus {
  SYNCED = 'synced',          // 已同步
  PENDING = 'pending',        // 待同步
  SYNCING = 'syncing',        // 同步中
  FAILED = 'failed'           // 同步失败
}

// 物流服务商枚举
export enum LogisticsProvider {
  DHL = 'dhl',
  FEDEX = 'fedex',
  UPS = 'ups',
  SF_EXPRESS = 'sf_express',
  EMS = 'ems',
  YTO = 'yto',
  ZTO = 'zto',
  OTHER = 'other'
}

// 完整仓库信息接口
export interface Warehouse {
  id: string;
  code: string;               // 仓库编码
  name: string;               // 仓库名称
  type: WarehouseType;        // 仓库类型
  status: WarehouseStatus;    // 仓库状态
  location: {
    country: string;
    countryCode: string;
    city: string;
    province?: string;
    district?: string;
    address: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    manager: string;
    phone: string;
    email: string;
    emergencyContact?: string;
  };
  operationalInfo: {
    timezone: string;
    workingHours: string;      // 工作时间
    holidays: string[];        // 节假日
    capacity: number;          // 总容量(立方米)
    currentOccupancy: number;  // 当前占用量(立方米)
    temperatureControlled: boolean; // 是否温控
    humidityControlled: boolean;    // 是否湿度控制
  };
  logisticsInfo: {
    providers: LogisticsProvider[]; // 支持的物流商
    shippingZones: ShippingZone[];  // 配送区域
    deliveryTime: {
      domestic: number;        // 国内配送时间(小时)
      international: number;   // 国际配送时间(小时)
    };
  };
  integrationInfo: {
    wmsProvider: string;       // WMS提供商
    wmsApiEndpoint?: string;   // WMS API地址
    apiKey?: string;           // API密钥
    lastSyncedAt?: Date;       // 最后同步时间
    syncStatus: SyncStatus;    // 同步状态
    syncFrequency: number;     // 同步频率(分钟)
  };
  costStructure: {
    storageFee: number;        // 存储费用(元/天/立方米)
    handlingFee: number;       // 操作费用(元/件)
    insuranceRate: number;     // 保险费率(%)
  };
  performanceMetrics: {
    accuracyRate: number;      // 准确率(%)
    onTimeRate: number;        // 准时率(%)
    damageRate: number;        // 损坏率(%)
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 配送区域接口
export interface ShippingZone {
  id: string;
  warehouseId: string;
  zoneName: string;            // 区域名称
  countries: string[];         // 覆盖国家
  cities?: string[];           // 覆盖城市
  zipCodes?: string[];         // 邮编范围
  shippingCost: number;        // 运费(元)
  deliveryTime: number;        // 配送时间(小时)
  isActive: boolean;
  createdAt: Date;
}

// 库存同步记录接口
export interface InventorySyncRecord {
  id: string;
  warehouseId: string;
  productId: string;
  syncType: 'full' | 'incremental'; // 同步类型
  syncStatus: SyncStatus;
  quantityBefore: number;      // 同步前数量
  quantityAfter: number;       // 同步后数量
  discrepancy: number;         // 差异数量
  syncStartedAt: Date;
  syncCompletedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
}

// 跨仓调拨接口
export interface InterWarehouseTransfer {
  id: string;
  transferNumber: string;      // 调拨单号
  fromWarehouseId: string;     // 调出仓库
  toWarehouseId: string;       // 调入仓库
  items: TransferItem[];
  totalValue: number;          // 总价值
  status: 'pending' | 'approved' | 'in_transit' | 'received' | 'cancelled';
  priority: 'normal' | 'urgent'; // 优先级
  estimatedDeparture: Date;    // 预计发出时间
  estimatedArrival: Date;      // 预计到达时间
  actualDeparture?: Date;      // 实际发出时间
  actualArrival?: Date;        // 实际到达时间
  logisticsInfo: {
    provider: LogisticsProvider;
    trackingNumber?: string;
    shippingCost: number;
  };
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 调拨项接口
export interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  unitValue: number;           // 单价
  totalPrice: number;
}

// 仓库容量规划接口
export interface WarehouseCapacityPlan {
  id: string;
  warehouseId: string;
  planningPeriod: {
    startDate: Date;
    endDate: Date;
  };
  capacityAllocation: {
    totalCapacity: number;
    allocatedCapacity: number;
    reservedCapacity: number;
    availableCapacity: number;
  };
  productCategories: Array<{
    category: string;
    allocatedSpace: number;    // 分配空间(立方米)
    plannedInventory: number;  // 计划库存(件)
  }>;
  utilizationRate: number;     // 利用率(%)
  recommendations: string[];   // 优化建议
  createdAt: Date;
  updatedAt: Date;
}

// 仓库绩效报告接口
export interface WarehousePerformanceReport {
  warehouseId: string;
  warehouseName: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    inbound: {
      totalShipments: number;
      totalItems: number;
      accuracyRate: number;
      avgProcessingTime: number; // 平均处理时间(分钟)
    };
    outbound: {
      totalOrders: number;
      totalItems: number;
      onTimeRate: number;
      avgPickTime: number;       // 平均拣货时间(分钟)
      avgPackTime: number;       // 平均打包时间(分钟)
    };
    inventory: {
      accuracyRate: number;
      turnoverRate: number;      // 周转率
      obsolescenceRate: number;  // 呆滞率(%)
    };
    costs: {
      totalCost: number;
      storageCost: number;
      laborCost: number;
      equipmentCost: number;
    };
  };
  kpiScores: {
    operationalEfficiency: number; // 运营效率(0-100)
    serviceQuality: number;        // 服务质量(0-100)
    costControl: number;           // 成本控制(0-100)
    overallScore: number;          // 综合评分(0-100)
  };
  createdAt: Date;
}

// DTO定义

// 创建仓库DTO
export interface CreateWarehouseDTO {
  name: string;
  type: WarehouseType;
  location: {
    country: string;
    countryCode: string;
    city: string;
    province?: string;
    district?: string;
    address: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    manager: string;
    phone: string;
    email: string;
    emergencyContact?: string;
  };
  operationalInfo: {
    timezone: string;
    workingHours: string;
    holidays: string[];
    capacity: number;
    temperatureControlled: boolean;
    humidityControlled: boolean;
  };
  logisticsInfo: {
    providers: LogisticsProvider[];
    deliveryTime: {
      domestic: number;
      international: number;
    };
  };
  integrationInfo: {
    wmsProvider: string;
    wmsApiEndpoint?: string;
    apiKey?: string;
    syncFrequency: number;
  };
  costStructure: {
    storageFee: number;
    handlingFee: number;
    insuranceRate: number;
  };
}

// 仓库查询参数
export interface WarehouseQueryParams {
  type?: WarehouseType;
  status?: WarehouseStatus;
  country?: string;
  city?: string;
  hasTemperatureControl?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  logisticsProvider?: LogisticsProvider;
  keyword?: string;
  sortBy?: 'name' | 'capacity' | 'createdAt' | 'performance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 库存同步请求DTO
export interface SyncInventoryDTO {
  warehouseId: string;
  syncType: 'full' | 'incremental';
  productIds?: string[];        // 指定产品同步
}

// 跨仓调拨请求DTO
export interface CreateTransferDTO {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitValue: number;
  }>;
  priority: 'normal' | 'urgent';
  estimatedDeparture: Date;
  logisticsProvider: LogisticsProvider;
}