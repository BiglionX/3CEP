// Supabase类型增强声明

// SVG 模块类型声明
declare module '*.svg' {
  const content: string;
  export default content;
}

// Supabase PostgREST 类型修复
interface SupabaseInsertOptions {
  returning?: 'minimal' | 'representation';
  count?: 'exact' | 'planned' | 'estimated';
}

// 市场价格数据接口
interface MarketPrice {
  id?: string;
  device_model: string;
  avg_price?: number;
  min_price?: number;
  max_price?: number;
  median_price?: number;
  sample_count: number;
  source: 'xianyu' | '闲鱼' | 'aggregate';
  freshness_score: number;
  created_at?: string;
}

// 手册版本接口
interface ManualVersion {
  id?: string;
  manual_id: string;
  version: number;
  title: Record<string, string>;
  content: Record<string, string>;
  changes: string;
  created_at?: string;
}

// 导出空对象以满足模块系统要求
export {};
