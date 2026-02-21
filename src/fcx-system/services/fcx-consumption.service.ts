/**
 * FCX积分消耗记录服务
 * 管理用户的FCX积分消费历史和统计
 */

import { supabase } from '@/lib/supabase';

interface FcxTransaction {
  id: string;
  userId: string;
  amount: number;           // 正数为获得，负数为消耗
  type: 'earn' | 'spend' | 'exchange' | 'refund';
  category: string;         // 消费类别
  description: string;
  referenceId?: string;     // 关联ID（如订单号）
  balanceAfter: number;     // 交易后余额
  createdAt: Date;
}

interface FcxConsumptionStats {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  monthlyConsumption: number;
  favoriteCategories: Array<{ category: string; amount: number }>;
  consumptionTrend: Array<{ date: string; amount: number }>;
}

interface ConsumptionQueryParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  type?: 'earn' | 'spend' | 'exchange';
  category?: string;
  limit?: number;
  offset?: number;
}

export class FcxConsumptionService {
  
  /**
   * 记录FCX交易
   */
  async recordTransaction(transaction: Omit<FcxTransaction, 'id' | 'createdAt' | 'balanceAfter'>): Promise<FcxTransaction> {
    try {
      // 获取用户当前余额
      const currentBalance = await this.getUserCurrentBalance(transaction.userId);
      
      // 计算交易后余额
      const balanceAfter = currentBalance + transaction.amount;
      
      // 插入交易记录
      const { data, error } = await supabase
        .from('fcx_transactions')
        .insert({
          id: this.generateUUID(),
          user_id: transaction.userId,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          reference_id: transaction.referenceId,
          balance_after: balanceAfter,
          created_at: new Date()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`记录FCX交易失败: ${error.message}`);
      }

      // 更新用户余额
      await this.updateUserBalance(transaction.userId, balanceAfter);

      return this.mapToTransaction(data);

    } catch (error) {
      console.error('记录FCX交易错误:', error);
      throw error;
    }
  }

  /**
   * 查询用户交易历史
   */
  async getTransactionHistory(params: ConsumptionQueryParams): Promise<FcxTransaction[]> {
    try {
      let query = supabase
        .from('fcx_transactions')
        .select('*')
        .eq('user_id', params.userId);

      // 添加查询条件
      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString());
      }

      if (params.type) {
        query = query.eq('type', params.type);
      }

      if (params.category) {
        query = query.eq('category', params.category);
      }

      // 排序
      query = query.order('created_at', { ascending: false });

      // 分页
      if (params.limit) {
        const offset = params.offset || 0;
        query = query.range(offset, offset + params.limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询交易历史失败: ${error.message}`);
      }

      return data.map(this.mapToTransaction);

    } catch (error) {
      console.error('查询交易历史错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户消费统计
   */
  async getUserConsumptionStats(userId: string, periodDays: number = 30): Promise<FcxConsumptionStats> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // 获取所有交易记录
      const transactions = await this.getTransactionHistory({
        userId,
        startDate
      });

      // 计算统计数据
      const stats: FcxConsumptionStats = {
        totalEarned: 0,
        totalSpent: 0,
        currentBalance: await this.getUserCurrentBalance(userId),
        monthlyConsumption: 0,
        favoriteCategories: [],
        consumptionTrend: []
      };

      // 分类统计
      const categoryTotals: Record<string, number> = {};
      const dailyTotals: Record<string, number> = {};

      transactions.forEach(transaction => {
        if (transaction.amount > 0) {
          stats.totalEarned += transaction.amount;
        } else {
          stats.totalSpent += Math.abs(transaction.amount);
          
          // 月度消费统计
          if (transaction.type === 'spend' || transaction.type === 'exchange') {
            stats.monthlyConsumption += Math.abs(transaction.amount);
            
            // 分类统计
            categoryTotals[transaction.category] = 
              (categoryTotals[transaction.category] || 0) + Math.abs(transaction.amount);
            
            // 日趋势统计
            const dateStr = transaction.createdAt.toISOString().split('T')[0];
            dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + Math.abs(transaction.amount);
          }
        }
      });

      // 生成热门分类
      stats.favoriteCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // 生成消费趋势
      stats.consumptionTrend = Object.entries(dailyTotals)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return stats;

    } catch (error) {
      console.error('获取消费统计错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户当前FCX余额
   */
  async getUserCurrentBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('fcx_balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('获取用户余额失败:', error);
        return 0;
      }

      return data?.fcx_balance || 0;

    } catch (error) {
      console.error('获取用户余额错误:', error);
      return 0;
    }
  }

  /**
   * 更新用户FCX余额
   */
  private async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ fcx_balance: newBalance })
        .eq('id', userId);

      if (error) {
        console.error('更新用户余额失败:', error);
        throw new Error(`更新余额失败: ${error.message}`);
      }

    } catch (error) {
      console.error('更新用户余额错误:', error);
      throw error;
    }
  }

  /**
   * 批量获取多个用户的消费统计
   */
  async getMultipleUsersStats(userIds: string[], periodDays: number = 30): Promise<Record<string, FcxConsumptionStats>> {
    try {
      const results: Record<string, FcxConsumptionStats> = {};

      // 并行获取每个用户的统计
      const promises = userIds.map(async (userId) => {
        results[userId] = await this.getUserConsumptionStats(userId, periodDays);
      });

      await Promise.all(promises);

      return results;

    } catch (error) {
      console.error('批量获取用户统计错误:', error);
      throw error;
    }
  }

  /**
   * 导出消费报告
   */
  async exportConsumptionReport(userId: string, startDate: Date, endDate: Date): Promise<string> {
    try {
      const transactions = await this.getTransactionHistory({
        userId,
        startDate,
        endDate
      });

      // 生成CSV格式报告
      const csvRows = [
        ['交易时间', '类型', '类别', '金额', '余额变化', '描述', '关联ID'],
        ...transactions.map(t => [
          t.createdAt.toLocaleString('zh-CN'),
          t.type,
          t.category,
          t.amount.toString(),
          (t.balanceAfter - (t.amount > 0 ? 0 : Math.abs(t.amount))).toString(),
          t.description,
          t.referenceId || ''
        ])
      ];

      return csvRows.map(row => row.join(',')).join('\n');

    } catch (error) {
      console.error('导出消费报告错误:', error);
      throw error;
    }
  }

  /**
   * 获取消费提醒设置
   */
  async getConsumptionAlerts(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('fcx_consumption_alerts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`获取消费提醒设置失败: ${error.message}`);
      }

      return data || {
        user_id: userId,
        daily_limit: 1000,
        weekly_limit: 5000,
        monthly_limit: 20000,
        low_balance_threshold: 100,
        notifications_enabled: true,
        email_notifications: false,
        created_at: new Date(),
        updated_at: new Date()
      };

    } catch (error) {
      console.error('获取消费提醒设置错误:', error);
      throw error;
    }
  }

  /**
   * 更新消费提醒设置
   */
  async updateConsumptionAlerts(userId: string, settings: Partial<any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('fcx_consumption_alerts')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date()
        });

      if (error) {
        throw new Error(`更新消费提醒设置失败: ${error.message}`);
      }

    } catch (error) {
      console.error('更新消费提醒设置错误:', error);
      throw error;
    }
  }

  /**
   * 检查是否触发消费提醒
   */
  async checkConsumptionAlerts(userId: string): Promise<string[]> {
    try {
      const alerts = await this.getConsumptionAlerts(userId);
      const stats = await this.getUserConsumptionStats(userId, 30);
      const warnings: string[] = [];

      // 检查日限额
      const todayTransactions = await this.getTransactionHistory({
        userId,
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(),
        type: 'spend'
      });

      const dailySpent = todayTransactions
        .filter(t => t.type === 'spend')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      if (dailySpent > alerts.daily_limit) {
        warnings.push(`今日消费已超过日限额 ${alerts.daily_limit} FCX`);
      }

      // 检查余额提醒
      if (stats.currentBalance < alerts.low_balance_threshold) {
        warnings.push(`FCX余额低于提醒阈值 ${alerts.low_balance_threshold}`);
      }

      return warnings;

    } catch (error) {
      console.error('检查消费提醒错误:', error);
      return [];
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 映射数据库记录到Transaction对象
   */
  private mapToTransaction(data: any): FcxTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      referenceId: data.reference_id,
      balanceAfter: data.balance_after,
      createdAt: new Date(data.created_at)
    };
  }
}