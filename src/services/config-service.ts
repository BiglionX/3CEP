import { AuthService } from '@/lib/auth-service';
import { supabase } from '@/lib/supabase';

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  is_encrypted: boolean;
  is_system: boolean;
  updated_by: string;
  updated_at: string;
}

export class ConfigService {
  /**
   * 获取指定配置?   * @param key 配置键名
   * @returns 配置项对象或null
   */
  static async getConfig(key: string): Promise<SystemConfig | null> {
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', key)
        .single();

      if (error) return null;
      return data as SystemConfig;
    } catch (error) {
      console.error('获取配置失败:', error);
      return null;
    }
  }

  /**
   * 获取配置值（带类型转换）
   * @param key 配置键名
   * @param defaultValue 默认?   * @returns 配置?   */
  static async getConfigValue(
    key: string,
    defaultValue: any = null
  ): Promise<any> {
    const config = await this.getConfig(key);
    if (!config) return defaultValue;

    switch (config.type) {
      case 'boolean':
        return config.value === 'true';
      case 'number':
        return Number(config.value);
      case 'json':
        try {
          return JSON.parse(config.value);
        } catch {
          return defaultValue;
        }
      default:
        return config.value;
    }
  }

  /**
   * 更新配置?   * @param key 配置键名
   * @param value 配置?   * @param description 配置描述（可选）
   * @returns 是否更新成功
   */
  static async updateConfig(
    key: string,
    value: any,
    description?: string
  ): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) return false;

      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      const { error } = await supabase
        .from('system_configs')
        .update({
          value: stringValue,
          description: description || null,
          updated_by: currentUser.id,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('key', key);

      return !error;
    } catch (error) {
      console.error('更新配置失败:', error);
      return false;
    }
  }

  /**
   * 创建新配置项
   * @param config 配置项数?   * @returns 是否创建成功
   */
  static async createConfig(config: {
    key: string;
    value: any;
    description: string;
    category: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    is_encrypted?: boolean;
  }): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) return false;

      const stringValue =
        typeof config.value === 'object'
          ? JSON.stringify(config.value)
          : String(config.value);

      const { error } = await supabase.from('system_configs').insert({
        key: config.key,
        value: stringValue,
        description: config.description,
        category: config.category,
        type: config.type,
        is_encrypted: config.is_encrypted || false,
        is_system: false,
        updated_by: currentUser.id,
        updated_at: new Date().toISOString(),
      } as any);

      return !error;
    } catch (error) {
      console.error('创建配置失败:', error);
      return false;
    }
  }

  /**
   * 获取所有配置项
   * @param category 分类筛选（可选）
   * @returns 配置项列?   */
  static async getAllConfigs(category?: string): Promise<SystemConfig[]> {
    try {
      let query = supabase
        .from('system_configs')
        .select('*')
        .order('category')
        .order('key');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('获取配置列表失败:', error);
        return [];
      }

      return (data || []) as SystemConfig[];
    } catch (error) {
      console.error('获取配置列表异常:', error);
      return [];
    }
  }

  /**
   * 按分类获取配置项
   * @returns 分类配置对象
   */
  static async getConfigsByCategory(): Promise<Record<string, SystemConfig[]>> {
    try {
      const configs = await this.getAllConfigs();
      const grouped: Record<string, SystemConfig[]> = {};

      configs.forEach(config => {
        if (!grouped[config.category]) {
          grouped[config.category] = [];
        }
        grouped[config.category].push(config);
      }) as any;

      return grouped;
    } catch (error) {
      console.error('按分类获取配置失?', error);
      return {};
    }
  }

  /**
   * 删除配置项（仅限非系统配置）
   * @param key 配置键名
   * @returns 是否删除成功
   */
  static async deleteConfig(key: string): Promise<boolean> {
    try {
      const config = await this.getConfig(key);
      if (!config || config.is_system) {
        return false; // 不能删除系统配置
      }

      const { error } = await supabase
        .from('system_configs')
        .delete()
        .eq('key', key);

      return !error;
    } catch (error) {
      console.error('删除配置失败:', error);
      return false;
    }
  }

  /**
   * 批量更新配置
   * @param configs 配置键值对对象
   * @returns 成功更新的数?   */
  static async batchUpdateConfigs(
    configs: Record<string, any>
  ): Promise<number> {
    let successCount = 0;

    for (const [key, value] of Object.entries(configs)) {
      const success = await this.updateConfig(key, value);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  }

  /**
   * 获取系统状态配?   * @returns 系统状态相关配?   */
  static async getSystemStatus(): Promise<{
    maintenance_mode: boolean;
    site_name: string;
    default_timezone: string;
    enable_registration: boolean;
  }> {
    return {
      maintenance_mode: await this.getConfigValue('maintenance_mode', false),
      site_name: await this.getConfigValue('site_name', 'FixCycle管理系统'),
      default_timezone: await this.getConfigValue(
        'default_timezone',
        'Asia/Shanghai'
      ),
      enable_registration: await this.getConfigValue(
        'enable_registration',
        true
      ),
    };
  }
}
