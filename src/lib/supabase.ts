// Supabase客户端配?import { createClient } from '@supabase/supabase-js';

// 环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 服务端客户端（使用服务角色密钥）
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 单例模式防止多实例问?let supabaseInstance: ReturnType<typeof createClient> | null = null;
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null;

// 公共客户端（浏览器使用）- 单例模式
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'sb-hrjqzbhqueleszkvnsen-auth-token-singleton',
      },
    });
  }
  return supabaseInstance;
})();

// 服务端客户端（Node.js环境使用? 单例模式
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseAdminInstance;
})();

// 数据库表接口定义
export interface Part {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PartPrice {
  id: string;
  part_id: string;
  platform: string;
  price: number;
  url?: string;
  last_updated: string;
  created_at: string;
}

export interface UploadedContent {
  id: string;
  url: string;
  title?: string;
  description?: string;
  content_type?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 数据库操作辅助函?export class DatabaseService {
  // 配件相关操作
  static async getParts() {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Part[];
  }

  static async getPartById(id: string) {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Part;
  }

  static async getPartsWithPrices() {
    const { data, error } = await supabase
      .from('parts_with_prices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 价格相关操作
  static async getPricesByPartId(partId: string) {
    const { data, error } = await supabase
      .from('part_prices')
      .select('*')
      .eq('part_id', partId)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data as PartPrice[];
  }

  // 上传内容相关操作
  static async getUploadedContent() {
    const { data, error } = await supabase
      .from('uploaded_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UploadedContent[];
  }

  static async uploadContent(
    content: Omit<UploadedContent, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('uploaded_content')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data as UploadedContent;
  }

  // 预约相关操作
  static async getAppointments(userId?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Appointment[];
  }

  static async createAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  }

  // 系统配置相关操作
  static async getConfig(key: string) {
    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data?.value;
  }

  static async setConfig(key: string, value: any) {
    const { data, error } = await supabaseAdmin
      .from('system_config')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;
    return data as SystemConfig;
  }
}

export default supabase;
