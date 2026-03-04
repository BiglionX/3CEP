/**
 * 供应链库存管理数据模? * 定义库存、仓库、商品等相关数据结构
 */

// 仓库类型枚举
export enum WarehouseType {
  DOMESTIC = 'domestic', // 国内?  OVERSEAS = 'overseas', // 海外?  VIRTUAL = 'virtual', // 虚拟?}

// 库存状态枚?export enum InventoryStatus {
  IN_STOCK = 'in_stock', // 有库?  LOW_STOCK = 'low_stock', // 库存不足
  OUT_OF_STOCK = 'out_of_stock', // 缺货
}

// 商品类别枚举
export enum ProductCategory {
  PHONE_ACCESSORIES = 'phone_accessories', // 手机配件
  LAPTOP_PARTS = 'laptop_parts', // 笔记本配?  TABLET_PARTS = 'tablet_parts', // 平板配件
  WEARABLE_DEVICES = 'wearable_devices', // 可穿戴设?  AUDIO_EQUIPMENT = 'audio_equipment', // 音频设备
  OTHER = 'other', // 其他
}

// 仓库信息接口
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: WarehouseType;
  country: string;
  city: string;
  address: string;
  contactInfo: {
    phone: string;
    email: string;
    manager: string;
  };
  capacity: number; // 容量（件?  currentOccupancy: number; // 当前占用?  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 商品信息接口
export interface Product {
  id: string;
  sku: string; // SKU编码
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  description: string;
  specifications: Record<string, any>; // 规格参数
  unitWeight: number; // 单位重量(kg)
  unitVolume: number; // 单位体积(m³)
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 库存记录接口
export interface InventoryRecord {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number; // 当前库存数量
  reservedQuantity: number; // 已预订数?  availableQuantity: number; // 可用数量
  safetyStock: number; // 安全库存
  reorderPoint: number; // 重新订购?  lastRestockedAt: Date; // 最后补货时?  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 库存变动记录接口
export interface InventoryMovement {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  referenceNumber: string; // 关联单号
  createdBy: string; // 操作?  createdAt: Date;
}

// 供应商信息接?export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  rating: number; // 评分 0-5
  creditLevel: 'A' | 'B' | 'C' | 'D'; // 信用等级
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 采购订单接口
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  warehouseId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'received' | 'cancelled';
  expectedDeliveryDate: Date;
  actualDeliveryDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 采购订单项接?export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// 创建仓库请求DTO
export interface CreateWarehouseDTO {
  name: string;
  code: string;
  type: WarehouseType;
  country: string;
  city: string;
  address: string;
  contactInfo: {
    phone: string;
    email: string;
    manager: string;
  };
  capacity: number;
}

// 创建商品请求DTO
export interface CreateProductDTO {
  sku: string;
  name: string;
  category: ProductCategory;
  brand: string;
  model: string;
  description: string;
  specifications: Record<string, any>;
  unitWeight: number;
  unitVolume: number;
  imageUrl: string;
}

// 库存调整请求DTO
export interface AdjustInventoryDTO {
  productId: string;
  warehouseId: string;
  quantityChange: number; // 正数为增加，负数为减?  reason: string;
  referenceNumber: string;
}

// 供应商入驻申请DTO
export interface SupplierApplicationDTO {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  businessLicense: string; // 营业执照
  companyProfile: string; // 公司简?}

// 库存查询参数
export interface InventoryQueryParams {
  productId?: string;
  warehouseId?: string;
  category?: ProductCategory;
  status?: InventoryStatus;
  minQuantity?: number;
  maxQuantity?: number;
  limit?: number;
  offset?: number;
}

// 仓库推荐结果
export interface WarehouseRecommendation {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  distance: number; // 距离(km)
  deliveryTime: number; // 预计配送时?小时)
  shippingCost: number; // 运费
  inventoryStatus: InventoryStatus;
  availableQuantity: number;
  score: number; // 推荐得分
}
