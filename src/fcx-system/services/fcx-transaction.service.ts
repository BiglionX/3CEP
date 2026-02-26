/**
 * FCX交易服务实现
 * 处理FCX转账、交易记录等核心交易功能
 */

import { 
  FcxTransaction, 
  FcxTransferDTO, 
  TransactionQueryParams,
  FcxTransactionType,
  FcxTransactionStatus
} from '../models/fcx-account.model';
import { IFcxTransactionService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';

export class FcxTransactionService implements IFcxTransactionService {
  
  /**
   * 创建交易记录
   */
  async createTransaction(dto: FcxTransferDTO): Promise<FcxTransaction> {
    try {
      const transactionId = generateUUID();
      const now = new Date();

      const { data, error } = await supabase
        .from('fcx_transactions')
        .insert({
          id: transactionId,
          from_account_id: dto.fromAccountId,
          to_account_id: dto.toAccountId,
          amount: dto.amount,
          transaction_type: dto.transactionType,
          reference_id: dto.referenceId || null,
          memo: dto.memo || null,
          status: FcxTransactionStatus.COMPLETED,
          created_at: now
        } as any)
        .select()
        .single();

      if (error) {
        throw new Error(`创建交易记录失败: ${error.message}`);
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
    } catch (error) {
      console.error('创建交易记录错误:', error);
      throw error;
    }
  }

  /**
   * 获取交易详情
   */
  async getTransaction(transactionId: string): Promise<FcxTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('fcx_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 交易记录不存在
        }
        throw new Error(`查询交易记录失败: ${error.message}`);
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
    } catch (error) {
      console.error('获取交易详情错误:', error);
      throw error;
    }
  }

  /**
   * 查询交易列表
   */
  async listTransactions(params: TransactionQueryParams): Promise<FcxTransaction[]> {
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
        throw new Error(`查询交易列表失败: ${error.message}`);
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
      console.error('查询交易列表错误:', error);
      throw error;
    }
  }

  /**
   * 验证交易合法性
   */
  async validateTransaction(dto: FcxTransferDTO): Promise<boolean> {
    try {
      // 1. 验证转账金额
      if (dto.amount <= 0) {
        return false;
      }

      // 2. 验证发送方账户是否存在且状态正常
      if (dto.fromAccountId) {
        const { data: fromAccount, error: fromError } = await supabase
          .from('fcx_accounts')
          .select('balance, frozen_balance, status')
          .eq('id', dto.fromAccountId)
          .single();

        if (fromError || !fromAccount) {
          return false;
        }

        // 检查账户状态
        if (fromAccount.status !== 'active') {
          return false;
        }

        // 检查可用余额是否足够
        const availableBalance = fromAccount.balance;
        if (availableBalance < dto.amount) {
          return false;
        }
      }

      // 3. 验证接收方账户是否存在
      if (dto.toAccountId) {
        const { data: toAccount, error: toError } = await supabase
          .from('fcx_accounts')
          .select('id, status')
          .eq('id', dto.toAccountId)
          .single();

        if (toError || !toAccount) {
          return false;
        }

        // 检查账户状态
        if (toAccount.status !== 'active') {
          return false;
        }
      }

      // 4. 验证不能自己转账给自己（除非是特殊类型）
      if (dto.fromAccountId === dto.toAccountId && 
          ![FcxTransactionType.REWARD, FcxTransactionType.SETTLEMENT].includes(dto.transactionType)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('验证交易合法性错误:', error);
      return false;
    }
  }
}