/**
 * Supabase 数据库类型定义 (简化版)
 */

export interface Database {
  public: {
    Tables: {
      device_qrcodes: {
        Row: {
          id: string;
          device_id: string;
          qr_code_string: string;
          created_at: string | null;
        };
      };
      devices: {
        Row: {
          id: string;
          brand: string | null;
          model: string | null;
          category: string | null;
          series: string | null;
          created_at: string | null;
        };
      };
    };
  };
}
