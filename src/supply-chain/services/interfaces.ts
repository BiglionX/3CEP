/**
 * 供应链系统服务接口定? */

import {
  Warehouse,
  Product,
  InventoryRecord,
  InventoryMovement,
  Supplier,
  PurchaseOrder,
  CreateWarehouseDTO,
  CreateProductDTO,
  AdjustInventoryDTO,
  SupplierApplicationDTO,
  InventoryQueryParams,
  WarehouseRecommendation,
} from '../models/inventory.model';

// 仓库管理服务接口
export interface IWarehouseService {
  /**
   * 创建仓库
   */
  createWarehouse(dto: CreateWarehouseDTO): Promise<Warehouse>;

  /**
   * 获取仓库信息
   */
  getWarehouse(warehouseId: string): Promise<Warehouse | null>;

  /**
   * 获取所有仓库列?   */
  listWarehouses(filters?: {
    type?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<Warehouse[]>;

  /**
   * 更新仓库信息
   */
  updateWarehouse(
    warehouseId: string,
    updates: Partial<CreateWarehouseDTO>
  ): Promise<Warehouse>;

  /**
   * 删除仓库
   */
  deleteWarehouse(warehouseId: string): Promise<void>;

  /**
   * 检查仓库容?   */
  checkCapacity(warehouseId: string, requiredSpace: number): Promise<boolean>;
}

// 商品管理服务接口
export interface IProductService {
  /**
   * 创建商品
   */
  createProduct(dto: CreateProductDTO): Promise<Product>;

  /**
   * 获取商品信息
   */
  getProduct(productId: string): Promise<Product | null>;

  /**
   * 根据SKU获取商品
   */
  getProductBySku(sku: string): Promise<Product | null>;

  /**
   * 搜索商品
   */
  searchProducts(query: {
    keyword?: string;
    category?: string;
    brand?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;

  /**
   * 更新商品信息
   */
  updateProduct(
    productId: string,
    updates: Partial<CreateProductDTO>
  ): Promise<Product>;

  /**
   * 删除商品
   */
  deleteProduct(productId: string): Promise<void>;
}

// 库存管理服务接口
export interface IInventoryService {
  /**
   * 获取库存记录
   */
  getInventory(
    productId: string,
    warehouseId: string
  ): Promise<InventoryRecord | null>;

  /**
   * 查询库存列表
   */
  listInventory(params: InventoryQueryParams): Promise<InventoryRecord[]>;

  /**
   * 调整库存
   */
  adjustInventory(dto: AdjustInventoryDTO): Promise<InventoryMovement>;

  /**
   * 检查库存是否充?   */
  checkAvailability(
    productId: string,
    warehouseId: string,
    requiredQuantity: number
  ): Promise<boolean>;

  /**
   * 获取商品总库?   */
  getTotalInventory(productId: string): Promise<number>;

  /**
   * 生成库存预警
   */
  generateLowStockAlerts(): Promise<
    Array<{
      productId: string;
      productName: string;
      warehouseId: string;
      currentQuantity: number;
      safetyStock: number;
    }>
  >;

  /**
   * 智能补货建议
   */
  getReplenishmentSuggestions(): Promise<
    Array<{
      productId: string;
      productName: string;
      suggestedQuantity: number;
      reason: string;
    }>
  >;
}

// 供应商管理服务接?export interface ISupplierService {
  /**
   * 供应商入驻申?   */
  applyForPartnership(dto: SupplierApplicationDTO): Promise<{
    applicationId: string;
    status: 'pending_review' | 'approved' | 'rejected';
  }>;

  /**
   * 审核供应商申?   */
  reviewApplication(
    applicationId: string,
    decision: 'approve' | 'reject',
    remarks?: string
  ): Promise<void>;

  /**
   * 获取供应商信?   */
  getSupplier(supplierId: string): Promise<Supplier | null>;

  /**
   * 获取供应商列?   */
  listSuppliers(filters?: {
    country?: string;
    isActive?: boolean;
    minRating?: number;
  }): Promise<Supplier[]>;

  /**
   * 更新供应商评?   */
  updateSupplierRating(supplierId: string, newRating: number): Promise<void>;

  /**
   * 供应商信用评?   */
  assessSupplierCredit(supplierId: string): Promise<'A' | 'B' | 'C' | 'D'>;
}

// 采购订单服务接口
export interface IPurchaseOrderService {
  /**
   * 创建采购订单
   */
  createPurchaseOrder(
    items: Array<{
      productId: string;
      quantity: number;
      supplierId: string;
      unitPrice: number;
    }>,
    warehouseId: string
  ): Promise<PurchaseOrder>;

  /**
   * 获取采购订单
   */
  getPurchaseOrder(orderId: string): Promise<PurchaseOrder | null>;

  /**
   * 查询采购订单列表
   */
  listPurchaseOrders(filters?: {
    supplierId?: string;
    warehouseId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PurchaseOrder[]>;

  /**
   * 确认采购订单
   */
  confirmOrder(orderId: string): Promise<PurchaseOrder>;

  /**
   * 更新订单状?   */
  updateOrderStatus(
    orderId: string,
    status: string,
    remarks?: string
  ): Promise<PurchaseOrder>;

  /**
   * 取消采购订单
   */
  cancelOrder(orderId: string, reason: string): Promise<PurchaseOrder>;
}

// 智能推荐服务接口
export interface IRecommendationService {
  /**
   * 智能分仓推荐
   */
  recommendWarehouses(
    userLocation: { lat: number; lng: number },
    productIds: string[]
  ): Promise<WarehouseRecommendation[]>;

  /**
   * 基于销量的补货建议
   */
  getSalesBasedReplenishment(
    productId: string,
    periodDays?: number
  ): Promise<number>;

  /**
   * 供应商智能匹?   */
  matchSuppliers(
    productRequirements: Array<{
      productId: string;
      quantity: number;
      qualityRequirements: string;
    }>
  ): Promise<
    Array<{
      supplierId: string;
      supplierName: string;
      price: number;
      deliveryTime: number;
      score: number;
    }>
  >;

  /**
   * 库存优化建议
   */
  getInventoryOptimizationSuggestions(warehouseId: string): Promise<
    Array<{
      productId: string;
      currentStock: number;
      suggestedStock: number;
      reason: string;
    }>
  >;
}
