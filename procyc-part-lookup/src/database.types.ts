/**
 * Supabase 数据库类型定义
 * 基于实际数据库结构
 */

export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          brand: string | null;
          model: string | null;
          category: string | null;
          series: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          brand?: string | null;
          model?: string | null;
          category?: string | null;
          series?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          brand?: string | null;
          model?: string | null;
          category?: string | null;
          series?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      parts: {
        Row: {
          id: string;
          name: string;
          category: string;
          brand: string | null;
          model: string | null;
          part_number: string | null;
          unit: string | null;
          description: string | null;
          image_url: string | null;
          stock_quantity: number | null;
          min_stock: number | null;
          max_stock: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          brand?: string | null;
          model?: string | null;
          part_number?: string | null;
          unit?: string | null;
          description?: string | null;
          image_url?: string | null;
          stock_quantity?: number | null;
          min_stock?: number | null;
          max_stock?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          brand?: string | null;
          model?: string | null;
          part_number?: string | null;
          unit?: string | null;
          description?: string | null;
          image_url?: string | null;
          stock_quantity?: number | null;
          min_stock?: number | null;
          max_stock?: number | null;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      part_devices: {
        Row: {
          id: string;
          part_id: string;
          device_id: string;
          compatibility_notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          part_id: string;
          device_id: string;
          compatibility_notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          part_id?: string;
          device_id?: string;
          compatibility_notes?: string | null;
          created_at?: string | null;
        };
      };
      part_inventory: {
        Row: {
          id: string;
          part_id: string;
          quantity: number;
          warehouse_location: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      current_part_fcx_prices: {
        Row: {
          part_id: string;
          fcx_price: number;
          updated_at: string | null;
        };
      };
    };
    Views: {
      parts_complete_view: {
        Row: {
          id: string;
          name: string;
          category: string;
          brand: string | null;
          model: string | null;
          part_number: string | null;
          unit: string | null;
          description: string | null;
          image_url: string | null;
          primary_image_url: string | null;
          stock_quantity: number | null;
          min_stock: number | null;
          max_stock: number | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          compatible_devices: any | null;
          related_faults: any | null;
        };
      };
    };
  };
}
