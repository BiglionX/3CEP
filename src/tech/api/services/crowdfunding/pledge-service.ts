import { supabase, supabaseAdmin } from '@/lib/supabase';

// 支持记录接口定义
export interface CrowdfundingPledge {
  id: string;
  project_id: string;
  user_id: string;
  amount: number;
  pledge_type: 'reservation' | 'support';
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'paid';
  reward_level: string | null;
  shipping_address: any;
  contact_info: any;
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  // FCX支付相关字段
  fcx_payment_amount: number | null; // 使用FCX支付的金?  fcx_deduction_amount: number | null; // FCX抵扣金额
  fiat_payment_amount: number | null; // 法币支付金额
  fcx_transaction_id: string | null; // FCX交易ID
  payment_status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface PledgeCreateData {
  project_id: string;
  amount: number;
  pledge_type: 'reservation' | 'support';
  reward_level?: string;
  shipping_address?: any;
  contact_info?: any;
  payment_method?: string;
  notes?: string;
  // FCX支付相关字段
  fcx_payment_amount?: number; // 用户希望使用的FCX支付金额
  use_fcx_payment?: boolean; // 是否使用FCX支付
  fcx_account_id?: string; // FCX账户ID
}

export interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  postal_code?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  wechat?: string;
  qq?: string;
}

export class CrowdfundingPledgeService {
  // 创建支持记录
  static async createPledge(pledgeData: PledgeCreateData, userId: string) {
    try {
      // 验证项目状?      const projectResponse = await supabase
        .from('crowdfunding_projects')
        .select('id, status, end_date, min_pledge_amount, max_pledge_amount')
        .eq('id', pledgeData.project_id)
        .single();

      if (projectResponse.error) throw projectResponse.error;

      const project = projectResponse.data;

      // 检查项目状?      if (project.status !== 'active') {
        throw new Error('项目不在进行中状?);
      }

      // 检查项目是否已结束
      if (new Date(project.end_date) < new Date()) {
        throw new Error('项目已结?);
      }

      // 验证金额范围
      if (pledgeData.amount < project.min_pledge_amount) {
        throw new Error(`支持金额不能低于 ${project.min_pledge_amount} 元`);
      }

      if (
        project.max_pledge_amount &&
        pledgeData.amount > project.max_pledge_amount
      ) {
        throw new Error(`支持金额不能超过 ${project.max_pledge_amount} 元`);
      }

      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .insert({
          ...pledgeData,
          user_id: userId,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;

      // 更新项目当前金额（临时方案，实际应该在支付成功后更新?      await this.updateProjectAmount(pledgeData.project_id, pledgeData.amount);

      return data;
    } catch (error) {
      console.error('创建支持记录失败:', error);
      throw error;
    }
  }

  // 更新项目筹集金额
  private static async updateProjectAmount(projectId: string, amount: number) {
    try {
      const { error } = (await supabase.rpc('update_project_amount', {
        project_id: projectId,
        amount_change: amount,
      })) as any;

      if (error) throw error;
    } catch (error) {
      console.error('更新项目金额失败:', error);
      // 不抛出错误，因为这不是关键操?    }
  }

  // 确认支持（模拟支付成功）
  static async confirmPledge(pledgeId: string, transactionId?: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('crowdfunding_pledges')
        .update({
          status: 'confirmed',
          transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('确认支持失败:', error);
      throw error;
    }
  }

  // 取消支持
  static async cancelPledge(pledgeId: string, userId: string) {
    try {
      // 验证用户权限
      const pledge = await this.getPledgeById(pledgeId);
      if (pledge.user_id !== userId) {
        throw new Error('无权取消此支?);
      }

      // 只有待确认状态的支持可以取消
      if (pledge.status !== 'pending') {
        throw new Error('只有待确认状态的支持可以取消');
      }

      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;

      // 减少项目当前金额
      await this.updateProjectAmount(pledge.project_id, -pledge.amount);

      return data;
    } catch (error) {
      console.error('取消支持失败:', error);
      throw error;
    }
  }

  // 获取支持记录详情
  static async getPledgeById(id: string) {
    try {
      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .select(
          `
          *,
          project:crowdfunding_projects(title, cover_image_url, end_date)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取支持记录详情失败:', error);
      throw error;
    }
  }

  // 获取用户的所有支持记?  static async getUserPledges(
    userId: string,
    page: number = 1,
    limit: number = 12
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('crowdfunding_pledges')
        .select(
          `
          *,
          project:crowdfunding_projects(title, cover_image_url, status, end_date)
        `,
          { count: 'exact' }
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        pledges: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('获取用户支持记录失败:', error);
      throw error;
    }
  }

  // 获取项目的所有支持记?  static async getProjectPledges(
    projectId: string,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('crowdfunding_pledges')
        .select('*', { count: 'exact' })
        .eq('project_id', projectId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        pledges: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error('获取项目支持记录失败:', error);
      throw error;
    }
  }

  // 获取用户对特定项目的支持记录
  static async getUserProjectPledges(userId: string, projectId: string) {
    try {
      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('获取用户项目支持记录失败:', error);
      throw error;
    }
  }

  // 检查用户是否已经支持过项目
  static async checkUserSupported(userId: string, projectId: string) {
    try {
      const { data, error } = await supabase
        .from('crowdfunding_pledges')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .neq('status', 'cancelled')
        .limit(1);

      if (error) throw error;
      return data && (data as any)?.data.length > 0;
    } catch (error) {
      console.error('检查用户支持状态失?', error);
      return false;
    }
  }

  // 获取支持统计信息
  static async getPledgeStats(projectId: string) {
    try {
      const { data, error } = await supabase.rpc('get_pledge_stats', {
        project_id: projectId,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('获取支持统计失败:', error);
      throw error;
    }
  }
}
