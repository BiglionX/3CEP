/**
 * 支付服务实现
 * 处理FCX购买、支付验证等功能
 */

import { 
  PurchaseFcxDTO,
  FcxTransactionType
} from '../models/fcx-account.model';
import { IPaymentService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';
import { usdToFcx } from '../utils/helpers';
import { FCX_CONSTANTS } from '../index';

export class PaymentService implements IPaymentService {
  
  /**
   * 处理FCX购买支付
   */
  async processFcxPurchase(dto: PurchaseFcxDTO): Promise<{
    success: boolean;
    transactionId?: string;
    fcxAmount: number;
    errorMessage?: string;
  }> {
    try {
      // 1. 验证输入参数
      if (dto.amountUSD <= 0) {
        return {
          success: false,
          fcxAmount: 0,
          errorMessage: '购买金额必须大于0'
        };
      }

      // 2. 计算对应的FCX数量
      const fcxAmount = usdToFcx(dto.amountUSD);

      // 3. 查找或创建用户的FCX账户
      let accountId: string;
      const { data: existingAccount, error: accountError } = await supabase
        .from('fcx_accounts')
        .select('id')
        .eq('user_id', dto.userId)
        .single();

      if (accountError) {
        // 如果账户不存在，则创建新账户
        const newAccountId = generateUUID();
        const { error: createError } = await supabase
          .from('fcx_accounts')
          .insert({
            id: newAccountId,
            user_id: dto.userId,
            balance: 0,
            frozen_balance: 0,
            account_type: 'user',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date()
          });

        if (createError) {
          return {
            success: false,
            fcxAmount: 0,
            errorMessage: `创建账户失败: ${createError.message}`
          };
        }
        accountId = newAccountId;
      } else {
        accountId = existingAccount.id;
      }

      // 4. 模拟支付处理（实际项目中需要集成真实支付网关）
      const paymentSuccess = await this.simulatePaymentProcessing(dto);
      
      if (!paymentSuccess) {
        return {
          success: false,
          fcxAmount: 0,
          errorMessage: '支付处理失败'
        };
      }

      // 5. 创建交易记录
      const transactionId = generateUUID();
      const { error: transactionError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: transactionId,
          from_account_id: null, // 系统发行
          to_account_id: accountId,
          amount: fcxAmount,
          transaction_type: FcxTransactionType.PURCHASE,
          reference_id: null,
          memo: `购买${fcxAmount} FCX`,
          status: 'completed',
          created_at: new Date()
        });

      if (transactionError) {
        return {
          success: false,
          fcxAmount: 0,
          errorMessage: `创建交易记录失败: ${transactionError.message}`
        };
      }

      // 6. 更新账户余额
      const { error: updateError } = await supabase.rpc('add_fcx_balance', {
        p_account_id: accountId,
        p_amount: fcxAmount
      });

      if (updateError) {
        return {
          success: false,
          fcxAmount: 0,
          errorMessage: `更新账户余额失败: ${updateError.message}`
        };
      }

      return {
        success: true,
        transactionId,
        fcxAmount
      };

    } catch (error) {
      console.error('处理FCX购买错误:', error);
      return {
        success: false,
        fcxAmount: 0,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // 在实际项目中，这里需要调用支付网关的验证接口
      // 目前模拟验证逻辑
      
      const { data, error } = await supabase
        .from('payment_records')
        .select('status')
        .eq('id', paymentId)
        .single();

      if (error) {
        return false;
      }

      return data.status === 'completed';
    } catch (error) {
      console.error('验证支付结果错误:', error);
      return false;
    }
  }

  /**
   * 退款处理
   */
  async processRefund(transactionId: string, amount: number): Promise<boolean> {
    try {
      // 1. 验证交易记录
      const { data: transaction, error: transactionError } = await supabase
        .from('fcx_transactions')
        .select('to_account_id, amount, transaction_type')
        .eq('id', transactionId)
        .single();

      if (transactionError) {
        return false;
      }

      // 2. 验证退款金额
      if (amount <= 0 || amount > transaction.amount) {
        return false;
      }

      // 3. 验证交易类型是否支持退款
      if (transaction.transaction_type !== 'purchase') {
        return false;
      }

      // 4. 创建退款交易记录
      const refundTransactionId = generateUUID();
      const { error: refundError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: refundTransactionId,
          from_account_id: transaction.to_account_id,
          to_account_id: null, // 退还给系统
          amount: amount,
          transaction_type: 'refund',
          reference_id: transactionId,
          memo: `退款 ${amount} FCX`,
          status: 'completed',
          created_at: new Date()
        });

      if (refundError) {
        return false;
      }

      // 5. 更新账户余额
      const { error: updateError } = await supabase.rpc('subtract_fcx_balance', {
        p_account_id: transaction.to_account_id,
        p_amount: amount
      });

      if (updateError) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('处理退款错误:', error);
      return false;
    }
  }

  /**
   * 模拟支付处理（实际项目中需要替换为真实的支付网关集成）
   */
  private async simulatePaymentProcessing(dto: PurchaseFcxDTO): Promise<boolean> {
    try {
      // 模拟支付处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟95%的成功率
      return Math.random() > 0.05;
    } catch (error) {
      return false;
    }
  }
}