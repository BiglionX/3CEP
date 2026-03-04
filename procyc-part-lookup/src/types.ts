/**
 * ProCyc Part Lookup Skill - 配件查询技能
 * 根据设备型号查询兼容配件
 */

export interface PartLookupInput {
  deviceModel: string;
  deviceBrand?: string;
  deviceCategory?:
    | 'mobile'
    | 'tablet'
    | 'laptop'
    | 'desktop'
    | 'smartwatch'
    | 'other';
  partCategory?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  includeOutOfStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'stock_desc' | 'relevance';
}

export interface CompatiblePart {
  id: string;
  name: string;
  category: string;
  partNumber: string | null;
  brand: string | null;
  price: number;
  stockQuantity: number | null;
  compatibilityNotes: string | null;
  imageUrl: string | null;
  matchScore: number;
}

export interface PartLookupOutput {
  success: boolean;
  data: {
    queryInfo: {
      deviceModel: string;
      matchedDevices: Array<{
        id: string;
        brand: string;
        model: string;
      }>;
      totalPartsFound: number;
    };
    compatibleParts: CompatiblePart[];
    statistics: {
      totalCompatibleParts: number;
      avgPrice: number;
      inStockCount: number;
      outOfStockCount: number;
      categoriesBreakdown: Array<{
        category: string;
        count: number;
      }>;
    };
  } | null;
  error: {
    code: string;
    message: string;
  } | null;
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
    dataSource: string;
  };
}

export interface SkillHandler {
  execute(input: PartLookupInput): Promise<PartLookupOutput>;
}
