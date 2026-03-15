/**
 * 设备生命周期常量定义
 * 包含设备生命周期管理相关的枚举类型和接口定义
 */

// 事件类型枚举
export enum DeviceEventType {
  MANUFACTURED = 'manufactured', // 出厂
  ACTIVATED = 'activated', // 激活
  REPAIRED = 'repaired', // 维修
  PART_REPLACED = 'part_replaced', // 更换配件
  TRANSFERRED = 'transferred', // 转移
  RECYCLED = 'recycled', // 回收
  INSPECTED = 'inspected', // 检查
  MAINTAINED = 'maintained', // 保养
  UPGRADED = 'upgraded', // 升级
}

// 设备状态枚举
export enum DeviceStatus {
  MANUFACTURED = 'manufactured', // 已制造
  ACTIVATED = 'activated', // 已激活
  IN_REPAIR = 'in_repair', // 维修中
  ACTIVE = 'active', // 正常使用
  TRANSFERRED = 'transferred', // 已转移
  RECYCLED = 'recycled', // 已回收
  ARCHIVED = 'archived', // 已归档
}

// 维修类型枚举
export enum RepairType {
  SCREEN_REPLACEMENT = 'screen_replacement', // 屏幕更换
  BATTERY_REPLACEMENT = 'battery_replacement', // 电池更换
  WATER_DAMAGE = 'water_damage', // 进水维修
  HARDWARE_FAULT = 'hardware_fault', // 硬件故障
  SOFTWARE_ISSUE = 'software_issue', // 软件问题
  OTHER = 'other', // 其他
}

// 配件类型枚举
export enum PartType {
  SCREEN = 'screen', // 屏幕
  BATTERY = 'battery', // 电池
  CAMERA = 'camera', // 摄像头
  CHARGER = 'charger', // 充电器
  CASE = 'case', // 外壳
  OTHER = 'other', // 其他
}

// 转移类型枚举
export enum TransferType {
  SALE = 'sale', // 销售
  LEASE = 'lease', // 租赁
  LOAN = 'loan', // 借用
  INTERNAL = 'internal', // 内部转移
  WARRANTY = 'warranty', // 保修转移
}

// 回收类型枚举
export enum RecycleType {
  REFURBISHED = 'refurbished', // 翻新
  PARTS = 'parts', // 拆解取件
  DISPOSAL = 'disposal', // 废弃处理
  TRADE_IN = 'trade_in', // 以旧换新
}

// 生命周期事件数据结构
export interface LifecycleEventData {
  eventType: DeviceEventType;
  subtype?: string;
  timestamp: Date;
  location?: string;
  technician?: string;
  cost?: number;
  notes?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

// 设备档案数据结构
export interface DeviceProfile {
  id: string;
  qrcodeId: string;
  productModel: string;
  productCategory?: string;
  brandName?: string;
  serialNumber?: string;
  manufacturingDate?: Date;
  firstActivatedAt?: Date;
  warrantyStartDate?: Date;
  warrantyExpiry?: Date;
  warrantyPeriod?: number;
  currentStatus: DeviceStatus;
  lastEventAt?: Date;
  lastEventType?: DeviceEventType;
  totalRepairCount: number;
  totalPartReplacementCount: number;
  totalTransferCount: number;
  currentLocation?: string;
  ownerInfo?: Record<string, any>;
  maintenanceHistory?: Record<string, any>;
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 设备保修信息
export interface WarrantyInfo {
  isUnderWarranty: boolean;
  startDate?: Date;
  expiryDate?: Date;
  remainingDays?: number;
  message: string;
  period?: number; // 保修期（月）
}

// 生命周期事件详情
export interface LifecycleEvent {
  id: string;
  deviceQrcodeId: string;
  eventType: DeviceEventType;
  eventSubtype?: string;
  eventData?: Record<string, any>;
  eventTimestamp: Date;
  createdBy?: string;
  location?: string;
  notes?: string;
  metadata?: Record<string, any>;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 设备统计信息
export interface DeviceStatistics {
  totalDevices: number;
  byStatus: Record<DeviceStatus, number>;
  byBrand: Record<string, number>;
  averageRepairCount: number;
  averagePartReplacementCount: number;
  totalTransfers: number;
}

// 生命周期查询参数
export interface LifecycleQueryParams {
  qrcodeId?: string;
  eventType?: DeviceEventType;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

// 设备档案创建参数
export interface CreateDeviceProfileParams {
  qrcodeId: string;
  productModel: string;
  productCategory?: string;
  brandName?: string;
  serialNumber?: string;
  manufacturingDate?: Date;
  warrantyPeriod?: number;
  currentStatus?: DeviceStatus;
  specifications?: Record<string, any>;
}

// 生命周期事件记录参数
export interface RecordLifecycleEventParams {
  qrcodeId: string;
  eventType: DeviceEventType;
  eventSubtype?: string;
  location?: string;
  technician?: string;
  cost?: number;
  notes?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

// 常量映射对象
export const DEVICE_EVENT_TYPE_LABELS: Record<DeviceEventType, string> = {
  [DeviceEventType.MANUFACTURED]: '出厂',
  [DeviceEventType.ACTIVATED]: '激活',
  [DeviceEventType.REPAIRED]: '维修',
  [DeviceEventType.PART_REPLACED]: '更换配件',
  [DeviceEventType.TRANSFERRED]: '转移',
  [DeviceEventType.RECYCLED]: '回收',
  [DeviceEventType.INSPECTED]: '检查',
  [DeviceEventType.MAINTAINED]: '保养',
  [DeviceEventType.UPGRADED]: '升级',
};

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  [DeviceStatus.MANUFACTURED]: '已制造',
  [DeviceStatus.ACTIVATED]: '已激活',
  [DeviceStatus.IN_REPAIR]: '维修中',
  [DeviceStatus.ACTIVE]: '正常使用',
  [DeviceStatus.TRANSFERRED]: '已转移',
  [DeviceStatus.RECYCLED]: '已回收',
  [DeviceStatus.ARCHIVED]: '已归档',
};

export const REPAIR_TYPE_LABELS: Record<RepairType, string> = {
  [RepairType.SCREEN_REPLACEMENT]: '屏幕更换',
  [RepairType.BATTERY_REPLACEMENT]: '电池更换',
  [RepairType.WATER_DAMAGE]: '进水维修',
  [RepairType.HARDWARE_FAULT]: '硬件故障',
  [RepairType.SOFTWARE_ISSUE]: '软件问题',
  [RepairType.OTHER]: '其他维修',
};

export const PART_TYPE_LABELS: Record<PartType, string> = {
  [PartType.SCREEN]: '屏幕',
  [PartType.BATTERY]: '电池',
  [PartType.CAMERA]: '摄像头',
  [PartType.CHARGER]: '充电器',
  [PartType.CASE]: '外壳',
  [PartType.OTHER]: '其他配件',
};

// 状态颜色映射
export const STATUS_COLORS: Record<DeviceStatus, string> = {
  [DeviceStatus.MANUFACTURED]: 'bg-blue-100 text-blue-800',
  [DeviceStatus.ACTIVATED]: 'bg-green-100 text-green-800',
  [DeviceStatus.IN_REPAIR]: 'bg-yellow-100 text-yellow-800',
  [DeviceStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [DeviceStatus.TRANSFERRED]: 'bg-purple-100 text-purple-800',
  [DeviceStatus.RECYCLED]: 'bg-gray-100 text-gray-800',
  [DeviceStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
};

// 事件图标映射
export const EVENT_ICONS: Record<DeviceEventType, string> = {
  [DeviceEventType.MANUFACTURED]: '🏭',
  [DeviceEventType.ACTIVATED]: '✅',
  [DeviceEventType.REPAIRED]: '🔧',
  [DeviceEventType.PART_REPLACED]: '⚙️',
  [DeviceEventType.TRANSFERRED]: '🚚',
  [DeviceEventType.RECYCLED]: '♻️',
  [DeviceEventType.INSPECTED]: '🔍',
  [DeviceEventType.MAINTAINED]: '🛠️',
  [DeviceEventType.UPGRADED]: '⬆️',
};

// 导出所有枚举的联合类型
export type DeviceEventTypeUnion = keyof typeof DeviceEventType;
export type DeviceStatusUnion = keyof typeof DeviceStatus;
export type RepairTypeUnion = keyof typeof RepairType;
export type PartTypeUnion = keyof typeof PartType;
