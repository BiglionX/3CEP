/**
 * FCX购买服务增强版
 * 支持多种支付方式和完善的账户状态管理
 */

import { 
  PurchaseFcxDTO,
  FcxTransactionType,
  AccountBalance
} from '../models/fcx-account.model';
import { IPaymentService } from './interfaces';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '../utils/helpers';
import { usdToFcx } from '../utils/helpers';
import { FCX_CONSTANTS } from '../index';
import { FcxAccountService } from './fcx-account.service';

// 支付方式枚举
export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay',
  BANK_TRANSFER = 'bank_transfer'
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// 支付记录接口
export interface PaymentRecord {
  id: string;
  userId: string;
  amountUSD: number;
  fcxAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  paymentGatewayId: string | null; // 第三方支付网关ID
  metadata: Record<string, any>; // 支付相关元数据
  createdAt: Date;
  updatedAt: Date;
}

export class EnhancedPaymentService {
  // 注意：这个类不直接实现IPaymentService，因为返回类型不同
  // 但提供了兼容的方法
  
  private accountService: FcxAccountService;

  constructor() {
    this.accountService = new FcxAccountService();
  }

  /**
   * 处理FCX购买支付（增强版）
   */
  async processFcxPurchase(dto: PurchaseFcxDTO): Promise<{
    success: boolean;
    transactionId?: string;
    paymentId?: string;
    fcxAmount: number;
    paymentStatus: PaymentStatus;
    errorMessage?: string;
  }> {
    try {
      // 1. 参数验证
      const validation = this.validatePurchaseRequest(dto);
      if (!validation.isValid) {
        return {
          success: false,
          fcxAmount: 0,
          paymentStatus: PaymentStatus.FAILED,
          errorMessage: validation.errors.join('; ')
        };
      }

      // 2. 计算FCX数量
      const fcxAmount = usdToFcx(dto.amountUSD);

      // 3. 创建支付记录
      const paymentId = generateUUID();
      const paymentRecord: PaymentRecord = {
        id: paymentId,
        userId: dto.userId,
        amountUSD: dto.amountUSD,
        fcxAmount,
        paymentMethod: dto.paymentMethod as PaymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        transactionId: null,
        paymentGatewayId: null,
        metadata: {
          userAgent: 'enhanced-payment-service',
          timestamp: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 4. 保存支付记录
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          id: paymentId,
          user_id: dto.userId,
          amount_usd: dto.amountUSD,
          fcx_amount: fcxAmount,
          payment_method: dto.paymentMethod,
          payment_status: PaymentStatus.PENDING,
          transaction_id: null,
          payment_gateway_id: null,
          metadata: paymentRecord.metadata,
          created_at: new Date(),
          updated_at: new Date()
        });

      if (paymentError) {
        return {
          success: false,
          fcxAmount: 0,
          paymentStatus: PaymentStatus.FAILED,
          errorMessage: `创建支付记录失败: ${paymentError.message}`
        };
      }

      // 5. 处理具体支付方式
      const paymentResult = await this.handlePaymentMethod(dto, paymentId, fcxAmount);
      
      if (!paymentResult.success) {
        // 更新支付状态为失败
        await this.updatePaymentStatus(paymentId, PaymentStatus.FAILED);
        return {
          success: false,
          paymentId,
          fcxAmount: 0,
          paymentStatus: PaymentStatus.FAILED,
          errorMessage: paymentResult.errorMessage
        };
      }

      // 6. 更新支付状态为处理中
      await this.updatePaymentStatus(paymentId, PaymentStatus.PROCESSING);

      // 7. 查找或创建用户账户
      let accountId = await this.getOrCreateUserAccount(dto.userId);

      // 8. 创建交易记录
      const transactionId = generateUUID();
      const { error: transactionError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: transactionId,
          from_account_id: null, // 系统发行
          to_account_id: accountId,
          amount: fcxAmount,
          transaction_type: FcxTransactionType.PURCHASE,
          reference_id: paymentId,
          memo: `购买${fcxAmount} FCX via ${dto.paymentMethod}`,
          status: 'completed',
          created_at: new Date()
        });

      if (transactionError) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.FAILED);
        return {
          success: false,
          paymentId,
          fcxAmount: 0,
          paymentStatus: PaymentStatus.FAILED,
          errorMessage: `创建交易记录失败: ${transactionError.message}`
        };
      }

      // 9. 更新账户余额
      const { error: updateError } = await supabase.rpc('add_fcx_balance', {
        p_account_id: accountId,
        p_amount: fcxAmount
      });

      if (updateError) {
        await this.updatePaymentStatus(paymentId, PaymentStatus.FAILED);
        return {
          success: false,
          paymentId,
          fcxAmount: 0,
          paymentStatus: PaymentStatus.FAILED,
          errorMessage: `更新账户余额失败: ${updateError.message}`
        };
      }

      // 10. 更新支付状态为完成
      await this.updatePaymentStatus(paymentId, PaymentStatus.COMPLETED, {
        transactionId,
        paymentGatewayId: paymentResult.gatewayId
      });

      return {
        success: true,
        transactionId,
        paymentId,
        fcxAmount,
        paymentStatus: PaymentStatus.COMPLETED
      };

    } catch (error) {
      console.error('处理FCX购买错误:', error);
      return {
        success: false,
        fcxAmount: 0,
        paymentStatus: PaymentStatus.FAILED,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 验证支付结果
   */
  async verifyPayment(paymentId: string): Promise<{
    isValid: boolean;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    fcxAmount?: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        return {
          isValid: false,
          paymentStatus: PaymentStatus.FAILED
        };
      }

      return {
        isValid: data.payment_status === PaymentStatus.COMPLETED,
        paymentStatus: data.payment_status as PaymentStatus,
        transactionId: data.transaction_id,
        fcxAmount: data.fcx_amount
      };

    } catch (error) {
      console.error('验证支付结果错误:', error);
      return {
        isValid: false,
        paymentStatus: PaymentStatus.FAILED
      };
    }
  }

  /**
   * 退款处理
   */
  async processRefund(transactionId: string, amount: number): Promise<{
    success: boolean;
    refundId?: string;
    errorMessage?: string;
  }> {
    try {
      // 1. 验证交易记录
      const { data: transaction, error: transactionError } = await supabase
        .from('fcx_transactions')
        .select('to_account_id, amount, transaction_type, reference_id')
        .eq('id', transactionId)
        .single();

      if (transactionError) {
        return {
          success: false,
          errorMessage: '交易记录不存在'
        };
      }

      // 2. 验证退款金额
      if (amount <= 0 || amount > transaction.amount) {
        return {
          success: false,
          errorMessage: '退款金额无效'
        };
      }

      // 3. 验证交易类型是否支持退款
      if (transaction.transaction_type !== FcxTransactionType.PURCHASE) {
        return {
          success: false,
          errorMessage: '该交易不支持退款'
        };
      }

      // 4. 验证原支付是否已完成
      const paymentVerification = await this.verifyPayment(transaction.reference_id);
      if (!paymentVerification.isValid) {
        return {
          success: false,
          errorMessage: '原支付未完成，无法退款'
        };
      }

      // 5. 创建退款记录
      const refundId = generateUUID();
      const { error: refundError } = await supabase
        .from('fcx_transactions')
        .insert({
          id: refundId,
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
        return {
          success: false,
          errorMessage: `创建退款记录失败: ${refundError.message}`
        };
      }

      // 6. 更新账户余额
      const { error: updateError } = await supabase.rpc('subtract_fcx_balance', {
        p_account_id: transaction.to_account_id,
        p_amount: amount
      });

      if (updateError) {
        return {
          success: false,
          errorMessage: `更新账户余额失败: ${updateError.message}`
        };
      }

      // 7. 更新原支付记录状态
      await this.updatePaymentStatus(transaction.reference_id, PaymentStatus.REFUNDED);

      return {
        success: true,
        refundId
      };

    } catch (error) {
      console.error('处理退款错误:', error);
      return {
        success: false,
        errorMessage: `系统错误: ${(error as Error).message}`
      };
    }
  }

  /**
   * 获取用户支付历史
   */
  async getUserPaymentHistory(userId: string, limit: number = 20): Promise<PaymentRecord[]> {
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`查询支付历史失败: ${error.message}`);
      }

      return data.map(record => ({
        id: record.id,
        userId: record.user_id,
        amountUSD: record.amount_usd,
        fcxAmount: record.fcx_amount,
        paymentMethod: record.payment_method as PaymentMethod,
        paymentStatus: record.payment_status as PaymentStatus,
        transactionId: record.transaction_id,
        paymentGatewayId: record.payment_gateway_id,
        metadata: record.metadata,
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at)
      }));

    } catch (error) {
      console.error('获取支付历史错误:', error);
      throw error;
    }
  }

  /**
   * 获取账户余额详情
   */
  async getAccountBalanceDetails(userId: string): Promise<AccountBalance & {
    totalTransactions: number;
    recentTransactions: any[];
  }> {
    try {
      const account = await this.accountService.getAccountByUserId(userId);
      if (!account) {
        throw new Error('账户不存在');
      }

      const balance = await this.accountService.getBalance(account.id);
      
      // 获取最近交易记录
      const { data: transactions } = await supabase
        .from('fcx_transactions')
        .select('*')
        .or(`from_account_id.eq.${account.id},to_account_id.eq.${account.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      // 获取总交易数
      const { count: totalTransactions } = await supabase
        .from('fcx_transactions')
        .select('*', { count: 'exact', head: true })
        .or(`from_account_id.eq.${account.id},to_account_id.eq.${account.id}`);

      return {
        ...balance,
        totalTransactions: totalTransactions || 0,
        recentTransactions: transactions || []
      };

    } catch (error) {
      console.error('获取账户余额详情错误:', error);
      throw error;
    }
  }

  // 私有辅助方法

  private validatePurchaseRequest(dto: PurchaseFcxDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.userId) {
      errors.push('用户ID不能为空');
    }

    if (!dto.amountUSD || dto.amountUSD <= 0) {
      errors.push('购买金额必须大于0');
    }

    if (!dto.paymentMethod) {
      errors.push('支付方式不能为空');
    }

    // 验证支付方式是否支持
    const supportedMethods = Object.values(PaymentMethod);
    if (!supportedMethods.includes(dto.paymentMethod as PaymentMethod)) {
      errors.push(`不支持的支付方式: ${dto.paymentMethod}`);
    }

    // 金额限制检查
    if (dto.amountUSD > 10000) {
      errors.push('单笔购买金额不能超过10000美元');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async handlePaymentMethod(dto: PurchaseFcxDTO, paymentId: string, fcxAmount: number): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    // 根据不同支付方式处理
    switch (dto.paymentMethod) {
      case PaymentMethod.STRIPE:
        return await this.processStripePayment(dto, paymentId);
      case PaymentMethod.PAYPAL:
        return await this.processPayPalPayment(dto, paymentId);
      case PaymentMethod.ALIPAY:
        return await this.processAlipayPayment(dto, paymentId);
      case PaymentMethod.WECHAT_PAY:
        return await this.processWeChatPayPayment(dto, paymentId);
      case PaymentMethod.BANK_TRANSFER:
        return await this.processBankTransfer(dto, paymentId);
      default:
        return {
          success: false,
          errorMessage: '不支持的支付方式'
        };
    }
  }

  private async processStripePayment(dto: PurchaseFcxDTO, paymentId: string): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    try {
      // 模拟Stripe支付处理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90%成功率模拟
      if (Math.random() > 0.1) {
        const gatewayId = `stripe_${generateUUID()}`;
        return {
          success: true,
          gatewayId
        };
      } else {
        return {
          success: false,
          errorMessage: 'Stripe支付处理失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        errorMessage: 'Stripe支付系统错误'
      };
    }
  }

  private async processPayPalPayment(dto: PurchaseFcxDTO, paymentId: string): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    // PayPal支付逻辑（模拟）
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (Math.random() > 0.08) {
      return { success: true, gatewayId: `paypal_${generateUUID()}` };
    }
    return { success: false, errorMessage: 'PayPal支付失败' };
  }

  private async processAlipayPayment(dto: PurchaseFcxDTO, paymentId: string): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    // 支付宝支付逻辑（模拟）
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (Math.random() > 0.05) {
      return { success: true, gatewayId: `alipay_${generateUUID()}` };
    }
    return { success: false, errorMessage: '支付宝支付失败' };
  }

  private async processWeChatPayPayment(dto: PurchaseFcxDTO, paymentId: string): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    // 微信支付逻辑（模拟）
    await new Promise(resolve => setTimeout(resolve, 1100));
    if (Math.random() > 0.07) {
      return { success: true, gatewayId: `wechat_${generateUUID()}` };
    }
    return { success: false, errorMessage: '微信支付失败' };
  }

  private async processBankTransfer(dto: PurchaseFcxDTO, paymentId: string): Promise<{
    success: boolean;
    gatewayId?: string;
    errorMessage?: string;
  }> {
    // 银行转账逻辑（模拟）
    // 银行转账通常需要人工确认，所以返回特殊状态
    return { 
      success: true, 
      gatewayId: `bank_${generateUUID()}`,
      errorMessage: '银行转账需要人工确认，请联系客服' 
    };
  }

  private async getOrCreateUserAccount(userId: string): Promise<string> {
    const account = await this.accountService.getAccountByUserId(userId);
    if (account) {
      return account.id;
    }

    const newAccount = await this.accountService.createAccount({
      userId,
      accountType: 'user' as any,
      initialBalance: 0
    });
    return newAccount.id;
  }

  // 兼容IPaymentService接口的方法
  async processFcxPurchaseCompatible(dto: PurchaseFcxDTO): Promise<{
    success: boolean;
    transactionId?: string;
    fcxAmount: number;
    errorMessage?: string;
  }> {
    const result = await this.processFcxPurchase(dto);
    return {
      success: result.success,
      transactionId: result.transactionId,
      fcxAmount: result.fcxAmount,
      errorMessage: result.errorMessage
    };
  }

  async verifyPaymentCompatible(paymentId: string): Promise<boolean> {
    const result = await this.verifyPayment(paymentId);
    return result.isValid;
  }

  async processRefundCompatible(transactionId: string, amount: number): Promise<boolean> {
    const result = await this.processRefund(transactionId, amount);
    return result.success;
  }

  private async updatePaymentStatus(
    paymentId: string, 
    status: PaymentStatus, 
    additionalData?: { transactionId?: string; paymentGatewayId?: string }
  ): Promise<void> {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date()
      };

      if (additionalData?.transactionId) {
        updateData.transaction_id = additionalData.transactionId;
      }

      if (additionalData?.paymentGatewayId) {
        updateData.payment_gateway_id = additionalData.paymentGatewayId;
      }

      await supabase
        .from('payment_records')
        .update(updateData)
        .eq('id', paymentId);

    } catch (error) {
      console.error('更新支付状态错误:', error);
    }
  }
}