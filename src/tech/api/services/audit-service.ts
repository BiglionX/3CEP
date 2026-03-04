import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string;
  old_value: any;
  new_value: any;
  ip_address: string;
  user_agent: string;
  session_id: string;
  created_at: string;
}

export class AuditService {
  /**
   * 记录操作日志
   * @param entry 审计日志条目
   * @returns 是否记录成功
   */
  static async logAction(entry: AuditLogEntry): Promise<boolean> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        ...entry,
        created_at: new Date().toISOString(),
      } as any);

      if (error) {
        console.error('审计日志记录失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('审计日志服务异常:', error);
      return false;
    }
  }

  /**
   * 获取审计日志列表
   * @param page 页码
   * @param limit 每页数量
   * @param filters 筛选条?
   * @returns 日志列表和总数
   */
  static async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      user_id?: string;
      resource?: string;
      action?: string;
      date_from?: string;
      date_to?: string;
    }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' }) as any
        .order('created_at', { ascending: false });

      // 应用筛选条?
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // 分页查询
      const { data, count, error } = await query.range(
        (page - 1) * limit,
        page * limit - 1
      );

      if (error) {
        console.error('获取审计日志失败:', error);
        return { logs: [], total: 0 };
      }

      return {
        logs: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('审计日志查询异常:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * 获取用户的最近活?
   * @param userId 用户ID
   * @param limit 限制数量
   * @returns 最近活动列?
   */
  static async getRecentActivity(
    userId: string,
    limit: number = 10
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取用户活动失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取用户活动异常:', error);
      return [];
    }
  }

  /**
   * 根据资源获取相关日志
   * @param resource 资源类型
   * @param resourceId 资源ID
   * @param limit 限制数量
   * @returns 相关日志列表
   */
  static async getResourceLogs(
    resource: string,
    resourceId: string,
    limit: number = 20
  ): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource', resource)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取资源日志失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取资源日志异常:', error);
      return [];
    }
  }

  /**
   * 批量删除过期日志
   * @param days 保留天数
   * @returns 删除的记录数
   */
  static async cleanupOldLogs(days: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select();

      if (error) {
        console.error('清理过期日志失败:', error);
        return 0;
      }

      return (data as any)?.(data as any)?.length || 0;
    } catch (error) {
      console.error('清理过期日志异常:', error);
      return 0;
    }
  }

  /**
   * 导出审计日志为CSV格式
   * @param filters 筛选条?
   * @returns CSV字符?
   */
  static async exportLogsAsCSV(filters?: any): Promise<string> {
    const result = await this.getAuditLogs(1, 10000, filters);

    if (result.logs.length === 0) {
      return '';
    }

    // CSV头部
    const headers = [
      '时间',
      '用户邮箱',
      '操作类型',
      '资源类型',
      '资源ID',
      'IP地址',
      '用户代理',
    ];

    // CSV数据?
    const rows = result.logs.map(log => [
      log.created_at,
      log.user_email,
      log.action,
      log.resource,
      log.resource_id || '',
      log.ip_address || '',
      log.user_agent || '',
    ]);

    // 组合成CSV格式
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}
