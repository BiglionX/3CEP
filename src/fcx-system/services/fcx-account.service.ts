/**
 * FCX账户服务实现
 * 提供账户创建、余额查询、转账等核心功能
 */

import { 
  FcxAccount, 
  FcxTransaction, 
  CreateFcxAccountDTO, 
  FcxTransferDTO, 
  AccountBalance,
  TransactionQueryParams,
  FcxAccountStatus,
  FcxTransactionType,
  FcxTransactionStatus
} from '../models/fcx-account.model';
import { IFcxAccountService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';

export class FcxAccountService implements IFcxAccountService {
  
  /**
   * 创建FCX账户
   */
  async createAccount(dto: CreateFcxAccountDTO): Promise<FcxAccount> {
    try {
      const accountId = generateUUID();
      const now = new Date();

      const { data, error } = await supabase
        .from('fcx_accounts')
        .insert({
          id: accountId,
          user_id: dto.userId,
          balance: dto.initialBalance || 0,
          frozen_balance: 0,
          account_type: dto.accountType,
          status: FcxAccountStatus.ACTIVE,
          created_at: now,
          updated_at: now
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(`创建账户失败: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        balance: data.balance,
        frozenBalance: data.frozen_balance,
        accountType: data.account_type,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('FCX账户创建错误:', error);
      throw error;
    }
  }

  /**
   * 获取账户信息
   */
  async getAccount(accountId: string): Promise<FcxAccount | null> {
    try {
      const { data, error } = await supabase
        .from('fcx_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 账户不存在
        }
        throw new Error(`查询账户失败: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        balance: data.balance,
        frozenBalance: data.frozen_balance,
        accountType: data.account_type,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('获取账户信息错误:', error);
      throw error;
    }
  }

  /**
   * 根据用户ID获取账户
   */
  async getAccountByUserId(userId: string): Promise<FcxAccount | null> {
    try {
      const { data, error } = await supabase
        .from('fcx_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 账户不存在
        }
        throw new Error(`查询用户账户失败: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        balance: data.balance,
        frozenBalance: data.frozen_balance,
        accountType: data.account_type,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('根据用户ID获取账户错误:', error);
      throw error;
    }
  }

  /**
   * 查询账户余额
   */
  async getBalance(accountId: string): Promise<AccountBalance> {
    try {
      const account = await this.getAccount(accountId);
      
      if (!account) {
        throw new Error('账户不存在');
      }

      const totalBalance = account.balance + account.frozenBalance;

      return {
        accountId: account.id,
        availableBalance: account.balance,
        frozenBalance: account.frozenBalance,
        totalBalance,
        accountType: account.accountType
      };
    } catch (error) {
      console.error('查询余额错误:', error);
      throw error;
    }
  }

  /**
   * FCX转账
   */
  async transfer(dto: FcxTransferDTO): Promise<FcxTransaction> {
    try {
      // 验证转账金额
      if (dto.amount <= 0) {
        throw new Error('转账金额必须大于0');
      }

      // 开始数据库事务
      const { data: transactionData, error: transactionError } = await supabase.rpc('transfer_fcx', {
        p_from_account_id: dto.fromAccountId,
        p_to_account_id: dto.toAccountId,
        p_amount: dto.amount,
        p_transaction_type: dto.transactionType,
        p_reference_id: dto.referenceId || null,
        p_memo: dto.memo || null
      });

      if (transactionError) {
        throw new Error(`转账失败: ${transactionError.message}`);
      }

      // 返回交易记录
      const transactionId = transactionData as string;
      return await this.getTransactionById(transactionId);
    } catch (error) {
      console.error('FCX转账错误:', error);
      throw error;
    }
  }

  /**
   * 冻结资金
   */
  async freeze(accountId: string, amount: number): Promise<void> {
    try {
      if (amount <= 0) {
        throw new Error('冻结金额必须大于0');
      }

      const { error } = await supabase.rpc('freeze_fcx_funds', {
        p_account_id: accountId,
        p_amount: amount
      });

      if (error) {
        throw new Error(`冻结资金失败: ${error.message}`);
      }
    } catch (error) {
      console.error('冻结资金错误:', error);
      throw error;
    }
  }

  /**
   * 解冻资金
   */
  async unfreeze(accountId: string, amount: number): Promise<void> {
    try {
      if (amount <= 0) {
        throw new Error('解冻金额必须大于0');
      }

      const { error } = await supabase.rpc('unfreeze_fcx_funds', {
        p_account_id: accountId,
        p_amount: amount
      });

      if (error) {
        throw new Error(`解冻资金失败: ${error.message}`);
      }
    } catch (error) {
      console.error('解冻资金错误:', error);
      throw error;
    }
  }

  /**
   * 更新账户状态
   */
  async updateAccountStatus(accountId: string, status: FcxAccountStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('fcx_accounts')
        .update({ 
          status,
          updated_at: new Date()
        } as any)
        .eq('id', accountId);

      if (error) {
        throw new Error(`更新账户状态失败: ${error.message}`);
      }
    } catch (error) {
      console.error('更新账户状态错误:', error);
      throw error;
    }
  }

  /**
   * 获取账户交易历史
   */
  async getTransactionHistory(params: TransactionQueryParams): Promise<FcxTransaction[]> {
    try {
      let query = supabase
        .from('fcx_transactions')
        .select('*');

      // 添加查询条件
      if (params.accountId) {
        query = query.or(`from_account_id.eq.${params.accountId},to_account_id.eq.${params.accountId}`);
      }

      if (params.transactionType) {
        query = query.eq('transaction_type', params.transactionType);
      }

      if (params.startDate) {
        query = query.gte('created_at', params.startDate.toISOString());
      }

      if (params.endDate) {
        query = query.lte('created_at', params.endDate.toISOString());
      }

      // 排序和分页
      query = query
        .order('created_at', { ascending: false })
        .range(
          params.offset || 0, 
          (params.offset || 0) + (params.limit || 50) - 1
        );

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询交易历史失败: ${error.message}`);
      }

      return data.map(item => ({
        id: item.id,
        fromAccountId: item.from_account_id,
        toAccountId: item.to_account_id,
        amount: item.amount,
        transactionType: item.transaction_type,
        referenceId: item.reference_id,
        memo: item.memo,
        status: item.status,
        createdAt: new Date(item.created_at)
      }));
    } catch (error) {
      console.error('获取交易历史错误:', error);
      throw error;
    }
  }

  /**
   * 内部方法：根据ID获取交易记录
   */
  private async getTransactionById(transactionId: string): Promise<FcxTransaction> {
    const { data, error } = await supabase
      .from('fcx_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      throw new Error(`获取交易记录失败: ${error.message}`);
    }

    return {
      id: data.id,
      fromAccountId: data.from_account_id,
      toAccountId: data.to_account_id,
      amount: data.amount,
      transactionType: data.transaction_type,
      referenceId: data.reference_id,
      memo: data.memo,
      status: data.status,
      createdAt: new Date(data.created_at)
    };
  }
}