// 统一数据模型定义
// 基于lionfix和fixcycle系统的数据结构整合

// 设备统一模型
export interface UnifiedDevice {
  // 核心标识
  id: string;                    // lionfix设备ID（主键）
  lionfix_id: string;           // lionfix系统中的原始ID
  local_id?: string;            // 本地系统ID（如果有）
  
  // 基本信息
  brand: string;                // 品牌名称
  model: string;                // 设备型号
  category: string;             // 设备分类（手机、平板、笔记本等）
  series?: string;              // 系列名称
  release_year?: number;        // 发布年份
  
  // 技术规格
  specifications?: DeviceSpecifications; // 规格参数
  screen_size?: string;         // 屏幕尺寸
  storage_options?: string[];   // 存储容量选项
  color_options?: string[];     // 颜色选项
  
  // 状态信息
  status: 'active' | 'inactive' | 'discontinued'; // 设备状态
  availability: 'available' | 'limited' | 'unavailable'; // 可获得性
  
  // 时间戳
  created_at: string;           // 创建时间
  updated_at: string;           // 更新时间
  release_date?: string;        // 发布日期
}

// 设备规格接口
export interface DeviceSpecifications {
  cpu?: string;                 // 处理器
  gpu?: string;                 // 图形处理器
  ram?: string;                 // 内存
  storage?: string;             // 存储
  battery?: string;             // 电池容量
  camera?: string;              // 摄像头规格
  os?: string;                  // 操作系统
  dimensions?: string;          // 尺寸规格
  weight?: string;              // 重量
  [key: string]: any;           // 其他规格字段
}

// 配件统一模型
export interface UnifiedPart {
  // 核心标识
  id: string;                   // lionfix配件ID（主键）
  lionfix_id: string;          // lionfix系统中的原始ID
  local_id?: string;           // 本地系统ID
  
  // 基本信息
  name: string;                // 配件名称
  category: string;            // 配件分类（屏幕、电池、摄像头等）
  brand?: string;              // 品牌
  model?: string;              // 适用型号
  part_number?: string;        // 配件编号
  unit?: string;               // 计量单位
  
  // 描述信息
  description?: string;        // 配件描述
  specifications?: PartSpecifications; // 技术规格
  compatible_devices?: string[]; // 兼容设备列表
  image_url?: string;          // 配件图片
  
  // 业务信息
  status: 'active' | 'inactive' | 'discontinued';
  stock_quantity?: number;     // 库存数量
  min_stock?: number;          // 最小库存预警
  max_stock?: number;          // 最大库存
  
  // 时间戳
  created_at: string;
  updated_at: string;
}

// 配件规格接口
export interface PartSpecifications {
  material?: string;           // 材质
  warranty?: string;           // 保修期
  origin?: string;             // 产地
  quality_grade?: string;      // 质量等级
  compatibility_level?: string; // 兼容性等级
  installation_difficulty?: 'easy' | 'medium' | 'hard'; // 安装难度
  [key: string]: any;          // 其他规格字段
}

// 价格信息模型
export interface PriceInfo {
  id: string;
  part_id: string;
  platform: string;            // 平台名称（淘宝、京东、亚马逊等）
  price: number;               // 价格
  currency: string;            // 货币单位
  url?: string;                // 商品链接
  seller?: string;             // 商家名称
  rating?: number;             // 评分
  sales_volume?: number;       // 销量
  last_updated: string;        // 最后更新时间
  created_at: string;
}

// 用户行为模型
export interface UserBehavior {
  id: string;
  user_id: string;
  device_id?: string;
  part_id?: string;
  action_type: 'view' | 'search' | 'compare' | 'purchase' | 'bookmark';
  action_data?: Record<string, any>; // 行为详细数据
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

// 维修记录模型
export interface RepairRecord {
  id: string;
  user_id: string;
  device_id: string;
  part_ids: string[];          // 使用的配件IDs
  shop_id?: string;            // 维修店铺ID
  technician_id?: string;      // 技师ID
  fault_description: string;   // 故障描述
  repair_notes?: string;       // 维修备注
  cost: number;                // 维修费用
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_time?: string;     // 预约时间
  actual_start_time?: string;  // 实际开始时间
  actual_end_time?: string;    // 实际结束时间
  created_at: string;
  updated_at: string;
}

// 统一查询结果模型
export interface UnifiedQueryResult<T> {
  data: T[];
  metadata: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    query_time_ms: number;
    cache_hit?: boolean;
    source_catalogs: string[];   // 数据来源目录
  };
  columns: string[];             // 返回的列名
}

// 数据血缘关系模型
export interface DataLineage {
  entity_id: string;            // 实体ID
  entity_type: 'device' | 'part' | 'price' | 'user'; // 实体类型
  source_system: string;        // 来源系统
  source_id: string;            // 源系统ID
  target_system: string;        // 目标系统
  target_id: string;            // 目标系统ID
  relationship_type: 'origin' | 'copy' | 'aggregation' | 'derivation';
  last_synced: string;
  sync_status: 'success' | 'failed' | 'pending';
}

// 元数据管理模型
export interface EntityMetadata {
  entity_id: string;
  entity_type: string;
  schema_version: string;
  created_by: string;
  updated_by: string;
  data_quality_score: number;   // 数据质量评分 (0-100)
  last_validated: string;
  validation_rules: string[];   // 验证规则
  tags: string[];               // 标签
  description?: string;         // 描述
}

// 跨数据源映射关系
export interface DataSourceMapping {
  entity_id: string;            // 实体ID
  entity_type: string;          // 实体类型
  local_entity_id: string;      // 本地实体ID
  lionfix_entity_id: string;    // lionfix实体ID
  mapping_type: 'one_to_one' | 'one_to_many' | 'many_to_one';
  confidence_score: number;     // 映射置信度 (0-1)
  created_at: string;
  validated: boolean;
}

// 导出所有模型的联合类型
export type UnifiedEntity = 
  | UnifiedDevice 
  | UnifiedPart 
  | PriceInfo 
  | UserBehavior 
  | RepairRecord;

// 数据模型工厂函数
export class DataModelFactory {
  static createDevice(data: any): UnifiedDevice {
    return {
      id: data.id || data.lionfix_id,
      lionfix_id: data.lionfix_id || data.id,
      local_id: data.local_id,
      brand: data.brand,
      model: data.model,
      category: data.category,
      series: data.series,
      release_year: data.release_year,
      specifications: data.specifications,
      screen_size: data.screen_size,
      storage_options: data.storage_options,
      color_options: data.color_options,
      status: data.status || 'active',
      availability: data.availability || 'available',
      created_at: data.created_at,
      updated_at: data.updated_at,
      release_date: data.release_date
    };
  }

  static createPart(data: any): UnifiedPart {
    return {
      id: data.id || data.lionfix_id,
      lionfix_id: data.lionfix_id || data.id,
      local_id: data.local_id,
      name: data.name,
      category: data.category,
      brand: data.brand,
      model: data.model,
      part_number: data.part_number,
      unit: data.unit || '个',
      description: data.description,
      specifications: data.specifications,
      compatible_devices: data.compatible_devices,
      image_url: data.image_url,
      status: data.status || 'active',
      stock_quantity: data.stock_quantity,
      min_stock: data.min_stock,
      max_stock: data.max_stock,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  static createPriceInfo(data: any): PriceInfo {
    return {
      id: data.id,
      part_id: data.part_id,
      platform: data.platform,
      price: data.price,
      currency: data.currency || 'CNY',
      url: data.url,
      seller: data.seller,
      rating: data.rating,
      sales_volume: data.sales_volume,
      last_updated: data.last_updated,
      created_at: data.created_at
    };
  }
}