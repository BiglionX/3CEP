'use server';

import { supabase } from '@/lib/supabase';
import { calculateExchangeResult, validateExchange } from '@/config/fxc-exchange.config';

/**
 * FXC 兑换交易记录
 */
export interface ExchangeTransaction {
  id: string;
  user_id: string;
  fxc_account_id: string;
  token_account_id: string;
  fxc_amount: number;
  token_amount: number;
  fee_amount: number;
  exchange_rate: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * 兑换请求 DTO
 */
export interface ExchangeRequestDTO {
  userId: string;
  fxcAmount: number;
  useDynamicRate?: boolean;
}

/**
 * 兑换结果
 */
export interface ExchangeResult {
  success: boolean;
  transactionId?: string;
  tokenAmount?: number;
  feeAmount?: number;
  finalAmount?: number;
  exchangeRate?: number;
  error?: string;
}

/**
 * FXC 兑换服务类
 */
export class FXCExchangeService {
  /**
   * 执行 FXC 兑换 Token
   */
  async exchangeFXCToTokens(dto: ExchangeRequestDTO): Promise<ExchangeResult> {
    const client = await supabase;

    try {
      // 1. 验证用户和金额
      const validation = validateExchange(dto.userId, dto.fxcAmount, 0);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // 2. 计算兑换结果
      const exchangeData = calculateExchangeResult(
        dto.fxcAmount,
        dto.useDynamicRate !== false
      );

      // 3. 获取用户 FXC 账户
      const { data: fxcAccount, error: fxcAccountError } = await client
        .from('fcx_accounts')
        .select('*')
        .eq('user_id', dto.userId)
        .single();

      if (fxcAccountError || !fxcAccount) {
        return {
          success: false,
          error: '未找到 FXC 账户，请先创建 FXC 账户',
        };
      }

      // 4. 验证 FXC 余额是否充足
      if (fxcAccount.balance < dto.fxcAmount) {
        return {
          success: false,
          error: `FXC 余额不足，当前余额：${fxcAccount.balance} FXC`,
        };
      }

      // 5. 获取或创建用户 Token 账户
      let tokenAccount = await this.getOrCreateTokenAccount(dto.userId);
      if (!tokenAccount) {
        return {
          success: false,
          error: '无法创建 Token 账户',
        };
      }

      // 6. 开始事务处理
      const { data: transaction, error: txError } = await client.rpc(
        'execute_fcx_exchange',
        {
          p_user_id: dto.userId,
          p_fxc_account_id: fxcAccount.id,
          p_token_account_id: tokenAccount.id,
          p_fxc_amount: dto.fxcAmount,
          p_token_amount: exchangeData.tokenAmount,
          p_fee_amount: exchangeData.feeAmount,
          p_final_amount: exchangeData.finalAmount,
          p_exchange_rate: exchangeData.exchangeRate,
        }
      );

      if (txError) {
        console.error('兑换事务执行失败:', txError);
        
        // 尝试手动执行事务（降级方案）
        return await this.manualExchange(
          client,
          dto.userId,
          fxcAccount,
          tokenAccount,
          exchangeData
        );
      }

      return {
        success: true,
        transactionId: transaction?.id || transaction?.transaction_id,
        tokenAmount: exchangeData.tokenAmount,
        feeAmount: exchangeData.feeAmount,
        finalAmount: exchangeData.finalAmount,
        exchangeRate: exchangeData.exchangeRate,
      };
    } catch (error) {
      console.error('FXC 兑换失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '兑换失败',
      };
    }
  }

  /**
   * 获取或创建 Token 账户
   */
  private async getOrCreateTokenAccount(userId: string) {
    const client = await supabase;

    // 尝试获取现有账户
    const { data: existingAccount } = await client
      .from('token_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingAccount) {
      return existingAccount;
    }

    // 创建新账户
    const { data: newAccount, error } = await client
      .from('token_accounts')
      .insert({
        user_id: userId,
        balance: 0,
        total_consumed: 0,
        total_purchased: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('创建 Token 账户失败:', error);
      return null;
    }

    return newAccount;
  }

  /**
   * 手动执行兑换事务（降级方案）
   */
  private async manualExchange(
    client: any,
    userId: string,
    fxcAccount: any,
    tokenAccount: any,
    exchangeData: {
      tokenAmount: number;
      feeAmount: number;
      finalAmount: number;
      exchangeRate: number;
    }
  ): Promise<ExchangeResult> {
    // 使用 Supabase 的事务支持
    const { data: fxcTx, error: fxcDeductError } = await client
      .from('fcx_transactions')
      .insert({
        from_account_id: fxcAccount.id,
        to_account_id: null, // 系统回收
        amount: -exchangeData.tokenAmount,
        transaction_type: 'exchange_to_token',
        memo: `FXC 兑换 Token: ${exchangeData.fxcAmount} FXC -> ${exchangeData.finalAmount} Tokens`,
        status: 'completed',
      })
      .select()
      .single();

    if (fxcDeductError) {
      return {
        success: false,
        error: 'FXC 扣减失败',
      };
    }

    // 增加 Token 余额
    const { error: tokenAddError } = await client
      .from('token_accounts')
      .update({
        balance: tokenAccount.balance + exchangeData.finalAmount,
        total_purchased: tokenAccount.total_purchased + exchangeData.finalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenAccount.id);

    if (tokenAddError) {
      // 回滚 FXC 交易
      await client
        .from('fcx_transactions')
        .update({ status: 'cancelled' })
        .eq('id', fxcTx.id);

      return {
        success: false,
        error: 'Token 增加失败',
      };
    }

    // 更新 FXC 账户余额
    const { error: fxcUpdateError } = await client
      .from('fcx_accounts')
      .update({
        balance: fxcAccount.balance - exchangeData.tokenAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fxcAccount.id);

    if (fxcUpdateError) {
      return {
        success: false,
        error: 'FXC 账户更新失败',
      };
    }

    return {
      success: true,
      transactionId: fxcTx.id,
      tokenAmount: exchangeData.tokenAmount,
      feeAmount: exchangeData.feeAmount,
      finalAmount: exchangeData.finalAmount,
      exchangeRate: exchangeData.exchangeRate,
    };
  }

  /**
   * 获取用户每日兑换统计
   */
  async getUserDailyExchangeStats(userId: string): Promise<{
    todayExchanged: number;
    remainingLimit: number;
    transactionCount: number;
  }> {
    const client = await supabase;

    // 获取今日 0 点时间戳
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { data: transactions, error } = await client
      .from('fcx_transactions')
      .select('amount')
      .eq('transaction_type', 'exchange_to_token')
      .gte('created_at', startOfDay.toISOString())
      .not('from_account_id', 'is', null);

    if (error) {
      console.error('查询每日兑换统计失败:', error);
      return {
        todayExchanged: 0,
        remainingLimit: 10000,
        transactionCount: 0,
      };
    }

    const todayExchanged = Math.abs(
      transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    );
    const remainingLimit = 10000 - todayExchanged;

    return {
      todayExchanged,
      remainingLimit,
      transactionCount: transactions.length,
    };
  }

  /**
   * 获取用户兑换历史记录
   */
  async getUserExchangeHistory(
    userId: string,
    limit: number = 20
  ): Promise<ExchangeTransaction[]> {
    const client = await supabase;

    const { data, error } = await client
      .from('fcx_transactions')
      .select(`
        *,
        from_account:fcx_accounts!from_account_id (
          user_id,
          balance
        ),
        to_account:fcx_accounts!to_account_id (
          user_id,
          balance
        )
      `)
      .eq('transaction_type', 'exchange_to_token')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('查询兑换历史失败:', error);
      return [];
    }

    return data || [];
  }
}

// 导出单例
export const fxcExchangeService = new FXCExchangeService();

/**
 * API 层调用的便捷函数
 */
export async function exchangeFXCToTokens(
  userId: string,
  fxcAmount: number,
  useDynamicRate: boolean = true
): Promise<ExchangeResult> {
  return fxcExchangeService.exchangeFXCToTokens({
    userId,
    fxcAmount,
    useDynamicRate,
  });
}
