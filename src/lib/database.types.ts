export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'content_reviewer' | 'shop_reviewer' | 'finance' | 'viewer'
export type UserStatus = 'active' | 'banned' | 'suspended'
export type AccountType = 'factory' | 'supplier' | 'repair_shop'
export type TransactionType = 'purchase' | 'reward' | 'settlement' | 'freeze' | 'unfreeze' | 'stake' | 'unstake'
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
export type AllianceLevel = 'bronze' | 'silver' | 'gold' | 'diamond'

export interface Database {
  public: {
    Tables: {
      parts: {
        Row: {
          id: string
          name: string
          category: string
          brand: string | null
          model: string | null
          part_number: string | null
          unit: string | null
          description: string | null
          image_url: string | null
          stock_quantity: number | null
          min_stock: number | null
          max_stock: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          brand?: string | null
          model?: string | null
          part_number?: string | null
          unit?: string | null
          description?: string | null
          image_url?: string | null
          stock_quantity?: number | null
          min_stock?: number | null
          max_stock?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          brand?: string | null
          model?: string | null
          part_number?: string | null
          unit?: string | null
          description?: string | null
          image_url?: string | null
          stock_quantity?: number | null
          min_stock?: number | null
          max_stock?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      part_devices: {
        Row: {
          id: string
          part_id: string
          device_id: string
          compatibility_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          part_id: string
          device_id: string
          compatibility_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          part_id?: string
          device_id?: string
          compatibility_notes?: string | null
          created_at?: string | null
        }
      }
      part_faults: {
        Row: {
          id: string
          part_id: string
          fault_id: string
          usage_notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          part_id: string
          fault_id: string
          usage_notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          part_id?: string
          fault_id?: string
          usage_notes?: string | null
          created_at?: string | null
        }
      }
      part_images: {
        Row: {
          id: string
          part_id: string
          image_url: string
          image_key: string | null
          alt_text: string | null
          is_primary: boolean | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          part_id: string
          image_url: string
          image_key?: string | null
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          part_id?: string
          image_url?: string
          image_key?: string | null
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
      }
      part_inventory: {
        Row: {
          id: string
          part_id: string
          quantity_change: number
          transaction_type: string
          reason: string | null
          reference_number: string | null
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          part_id: string
          quantity_change: number
          transaction_type: string
          reason?: string | null
          reference_number?: string | null
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          part_id?: string
          quantity_change?: number
          transaction_type?: string
          reason?: string | null
          reference_number?: string | null
          created_by?: string | null
          created_at?: string | null
        }
      }
      devices: {
        Row: {
          id: string
          brand: string
          model: string
          series: string | null
          release_year: number | null
          image_url: string | null
          thumbnail_url: string | null
          specifications: Json | null
          category: string | null
          os_type: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          brand: string
          model: string
          series?: string | null
          release_year?: number | null
          image_url?: string | null
          thumbnail_url?: string | null
          specifications?: Json | null
          category?: string | null
          os_type?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          series?: string | null
          release_year?: number | null
          image_url?: string | null
          thumbnail_url?: string | null
          specifications?: Json | null
          category?: string | null
          os_type?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fault_types: {
        Row: {
          id: string
          name: string
          category: string
          sub_category: string | null
          description: string | null
          difficulty_level: number | null
          estimated_time: number | null
          image_url: string | null
          repair_guide_url: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          sub_category?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_time?: number | null
          image_url?: string | null
          repair_guide_url?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          sub_category?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_time?: number | null
          image_url?: string | null
          repair_guide_url?: string | null
          status?: string | null
          created_at?: string | null
        }
      }
      user_profiles_ext: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          role: UserRole | null
          sub_roles: string[] | null
          is_active: boolean | null
          status: UserStatus | null
          banned_reason: string | null
          banned_at: string | null
          unbanned_at: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          role?: UserRole | null
          sub_roles?: string[] | null
          is_active?: boolean | null
          status?: UserStatus | null
          banned_reason?: string | null
          banned_at?: string | null
          unbanned_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          role?: UserRole | null
          sub_roles?: string[] | null
          is_active?: boolean | null
          status?: UserStatus | null
          banned_reason?: string | null
          banned_at?: string | null
          unbanned_at?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      fcx_accounts: {
        Row: {
          id: string
          user_id: string | null
          balance: number
          frozen_balance: number
          account_type: AccountType
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          balance?: number
          frozen_balance?: number
          account_type?: AccountType
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          balance?: number
          frozen_balance?: number
          account_type?: AccountType
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      fcx_transactions: {
        Row: {
          id: string
          from_account_id: string | null
          to_account_id: string | null
          amount: number
          transaction_type: TransactionType
          reference_id: string | null
          memo: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          from_account_id?: string | null
          to_account_id?: string | null
          amount: number
          transaction_type: TransactionType
          reference_id?: string | null
          memo?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          from_account_id?: string | null
          to_account_id?: string | null
          amount?: number
          transaction_type?: TransactionType
          reference_id?: string | null
          memo?: string | null
          status?: string
          created_at?: string
        }
      }
      fcx2_options: {
        Row: {
          id: string
          repair_shop_id: string
          amount: number
          earned_from_order_id: string | null
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          repair_shop_id: string
          amount: number
          earned_from_order_id?: string | null
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          repair_shop_id?: string
          amount?: number
          earned_from_order_id?: string | null
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
      repair_orders: {
        Row: {
          id: string
          order_number: string
          consumer_id: string | null
          repair_shop_id: string | null
          device_info: Json | null
          fault_description: string | null
          fcx_amount_locked: number | null
          status: OrderStatus
          rating: number | null
          factory_id: string | null
          created_at: string
          confirmed_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          consumer_id?: string | null
          repair_shop_id?: string | null
          device_info?: Json | null
          fault_description?: string | null
          fcx_amount_locked?: number | null
          status?: OrderStatus
          rating?: number | null
          factory_id?: string | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          consumer_id?: string | null
          repair_shop_id?: string | null
          device_info?: Json | null
          fault_description?: string | null
          fcx_amount_locked?: number | null
          status?: OrderStatus
          rating?: number | null
          factory_id?: string | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
      }
      // 扩展repair_shops表定义
      repair_shops: {
        Row: {
          id: string
          name: string
          slug: string
          contact_person: string
          phone: string
          address: string
          city: string
          province: string
          postal_code: string | null
          latitude: number | null
          longitude: number | null
          logo_url: string | null
          cover_image_url: string | null
          business_license: string | null
          services: Json | null
          specialties: Json | null
          rating: number | null
          review_count: number | null
          service_count: number | null
          certification_level: number | null
          is_verified: boolean | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          // 新增字段
          fcx_staked: number | null
          fcx2_balance: number | null
          alliance_level: AllianceLevel | null
          join_date: string | null
          is_alliance_member: boolean | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          contact_person: string
          phone: string
          address: string
          city: string
          province: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          logo_url?: string | null
          cover_image_url?: string | null
          business_license?: string | null
          services?: Json | null
          specialties?: Json | null
          rating?: number | null
          review_count?: number | null
          service_count?: number | null
          certification_level?: number | null
          is_verified?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          fcx_staked?: number | null
          fcx2_balance?: number | null
          alliance_level?: AllianceLevel | null
          join_date?: string | null
          is_alliance_member?: boolean | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          contact_person?: string
          phone?: string
          address?: string
          city?: string
          province?: string
          postal_code?: string | null
          latitude?: number | null
          longitude?: number | null
          logo_url?: string | null
          cover_image_url?: string | null
          business_license?: string | null
          services?: Json | null
          specialties?: Json | null
          rating?: number | null
          review_count?: number | null
          service_count?: number | null
          certification_level?: number | null
          is_verified?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          fcx_staked?: number | null
          fcx2_balance?: number | null
          alliance_level?: AllianceLevel | null
          join_date?: string | null
          is_alliance_member?: boolean | null
          user_id?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_tenants: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          role: string
          is_primary: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tenant_id: string
          role?: string
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tenant_id?: string
          role?: string
          is_primary?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_management_view: {
        Row: {
          id: string | null
          user_id: string | null
          email: string | null
          role: UserRole | null
          sub_roles: string[] | null
          status: UserStatus | null
          is_active: boolean | null
          banned_reason: string | null
          banned_at: string | null
          unbanned_at: string | null
          created_at: string | null
          updated_at: string | null
          admin_role: UserRole | null
          admin_is_active: boolean | null
        }
      }
      parts_complete_view: {
        Row: {
          id: string | null
          name: string | null
          category: string | null
          brand: string | null
          model: string | null
          part_number: string | null
          unit: string | null
          description: string | null
          image_url: string | null
          stock_quantity: number | null
          min_stock: number | null
          max_stock: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          compatible_devices: Json | null
          related_faults: Json | null
          primary_image_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}