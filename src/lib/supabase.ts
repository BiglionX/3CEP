// Supabase客户端配置
import { createClient } from '@supabase/supabase-js';

// 环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 服务端客户端（使用服务角色密钥）
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 检查 Supabase 是否已配置
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// TODO: 移除此警告日志，配置好 Supabase 后删除
if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [Supabase] 未配置 Supabase 环境变量！\n请在 .env.local 中设置：\n  - NEXT_PUBLIC_SUPABASE_URL\n  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n  - SUPABASE_SERVICE_ROLE_KEY (可选)\n当前使用模拟数据模式。'
  );
}

// 单例模式防止多实例问题 - 使用全局变量确保跨模块共享
declare global {
  var __supabaseInstance: any | undefined;
  var __supabaseAdminInstance: any | undefined;
}

// 公共客户端（浏览器使用）- 单例模式
export const supabase = (() => {
  if (typeof window !== 'undefined') {
    // 浏览器端：使用全局单例
    if (!globalThis.__supabaseInstance) {
      globalThis.__supabaseInstance = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            detectSessionInUrl: true,
            autoRefreshToken: true,
            storageKey: 'sb-procyc-auth-token-singleton',
          },
        }
      );
    }
    return globalThis.__supabaseInstance;
  } else {
    // 服务端：直接创建新实例
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
})();

// 服务端客户端（Node.js环境使用）- 单例模式
export const supabaseAdmin = (() => {
  if (!globalThis.__supabaseAdminInstance) {
    globalThis.__supabaseAdminInstance = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return globalThis.__supabaseAdminInstance;
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

// 数据库操作辅助函数
export class DatabaseService {
  // 配件相关操作
  static async getParts() {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      console.warn('[DatabaseService] Supabase 未配置，返回模拟数据');
      return mockData.parts;
    }

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Part[];
  }

  static async getPartById(id: string) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      const part = mockData.parts.find(p => p.id === id);
      if (!part) throw new Error('配件不存在');
      return part;
    }

    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as unknown as Part;
  }

  static async getPartsWithPrices() {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      return mockData.parts;
    }

    const { data, error } = await supabase
      .from('parts_with_prices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 价格相关操作
  static async getPricesByPartId(partId: string) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase
      .from('part_prices')
      .select('*')
      .eq('part_id', partId)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as PartPrice[];
  }

  // 上传内容相关操作
  static async getUploadedContent() {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase
      .from('uploaded_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as UploadedContent[];
  }

  static async uploadContent(
    content: Omit<UploadedContent, 'id' | 'created_at' | 'updated_at'>
  ) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      const newContent: UploadedContent = {
        ...content,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newContent;
    }

    const { data, error } = await supabase
      .from('uploaded_content')
      .insert([content])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as UploadedContent;
  }

  // 预约相关操作
  static async getAppointments(userId?: string) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      if (userId) {
        return mockData.appointments.filter(a => a.user_id === userId);
      }
      return mockData.appointments;
    }

    let query = supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as unknown as Appointment[];
  }

  static async createAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      const newAppointment: Appointment = {
        ...appointment,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newAppointment;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Appointment;
  }

  // 系统配置相关操作
  static async getConfig(key: string) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      return null;
    }

    const { data, error } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data?.value;
  }

  static async setConfig(key: string, value: any) {
    // TODO: 移除此检查，配置好 Supabase 后删除
    if (!isSupabaseConfigured) {
      console.warn('[DatabaseService] Supabase 未配置，无法保存配置');
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from('system_config')
      .upsert({ key, value })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as SystemConfig;
  }
}

// 导出配置状态，供其他模块检查
export const isConfigured = isSupabaseConfigured;

// 导出 createClient 函数，供服务端直接使用
export { createClient };

// 模拟数据生成器（当 Supabase 未配置时使用）
export const mockData = {
  // 配件模拟数据
  parts: [
    {
      id: '1',
      name: 'iPhone 14 Pro 屏幕',
      category: '屏幕',
      brand: 'Apple',
      description: '原装屏幕总成',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'iPhone 14 电池',
      category: '电池',
      brand: 'Apple',
      description: '原装电池',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Samsung Galaxy S23 屏幕',
      category: '屏幕',
      brand: 'Samsung',
      description: '原装屏幕总成',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Part[],

  // 预约模拟数据
  appointments: [
    {
      id: '1',
      user_id: 'user1',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      status: 'pending',
      notes: 'iPhone 14 Pro 屏幕维修',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'user2',
      start_time: new Date(Date.now() + 86400000).toISOString(),
      end_time: new Date(Date.now() + 90000000).toISOString(),
      status: 'confirmed',
      notes: 'MacBook Air 电池更换',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Appointment[],
};

export default supabase;
