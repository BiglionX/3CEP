/**
 * 众筹FCX支付服务
 * 处理众筹项目中的FCX支付逻辑
 */

import { FcxAccountService } from '@/fcx-system';
import {
  FcxTransactionType,
  FcxTransferDTO,
} from '@/fcx-system/models/fcx-account.model';
import { DeviceEventType } from '@/lib/constants/lifecycle';
import { supabase } from '@/lib/supabase';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { CrowdfundingPledge } from './pledge-service';

// FCX支付配置常量
const FCX_PAYMENT_CONFIG = {
  USD_TO_FCX_RATE: 10, // 1美元 = 10 FCX
  MIN_FCX_PAYMENT: 10, // 最小FCX支付金额
  MAX_FCX_RATIO: 0.8, // 最大FCX支付比例 80%
};

// FCX支付请求接口
export interface FcxPaymentRequest {
  pledgeId: string;
  userId: string;
  fcxAccountId: string;
  fcxAmount: number; // 用户希望使用的FCX数量
  fiatAmount?: number; // 可选的法币补充金额
}

// FCX支付结果接口
export interface FcxPaymentResult {
  success: boolean;
  pledgeId: string;
  fcxDeducted: number; // 实际扣除的FCX数量
  fiatNeeded: number; // 需要法币支付的金额
  fcxTransactionId: string | null;
  message: string;
  error?: string;
}

// 混合支付结果接口
export interface HybridPaymentResult {
  success: boolean;
  pledgeId: string;
  fcxDeducted: number;
  fiatCharged: number;
  fcxTransactionId: string | null;
  fiatTransactionId: string | null;
  totalPaid: number;
  message: string;
  error?: string;
}

export class CrowdfundingFcxPaymentService {
  /**
   * 处理纯FCX支付
   */
  static async processFcxPayment(
    request: FcxPaymentRequest
  ): Promise<FcxPaymentResult> {
    try {
      // 1. 验证支持记录
      const pledge = await this.getValidatedPledge(
        request.pledgeId,
        request.userId
      );

      // 2. 验证FCX账户
      const accountService = new FcxAccountService();
      const account = await accountService.getAccount(request.fcxAccountId);

      if (!account) {
        return {
          success: false,
          pledgeId: request.pledgeId,
          fcxDeducted: 0,
          fiatNeeded: 0,
          fcxTransactionId: null,
          message: 'FCX账户不存?,
          error: 'ACCOUNT_NOT_FOUND',
        };
      }

      // 3. 验证账户归属
      if (account.userId !== request.userId) {
        return {
          success: false,
          pledgeId: request.pledgeId,
          fcxDeducted: 0,
          fiatNeeded: 0,
          fcxTransactionId: null,
          message: '无权使用此FCX账户',
          error: 'UNAUTHORIZED_ACCOUNT',
        };
      }

      // 4. 计算FCX价值和需要的法币金额
      const fcxValueInUSD =
        request.fcxAmount / FCX_PAYMENT_CONFIG.USD_TO_FCX_RATE;
      const remainingAmount = pledge.amount - fcxValueInUSD;

      // 5. 验证账户余额
      if (account.balance < request.fcxAmount) {
        return {
          success: false,
          pledgeId: request.pledgeId,
          fcxDeducted: 0,
          fiatNeeded: 0,
          fcxTransactionId: null,
          message: `FCX余额不足，当前余? ${account.balance}`,
          error: 'INSUFFICIENT_BALANCE',
        };
      }

      // 6. 验证支付限制
      const maxFcxAllowed =
        pledge.amount *
        FCX_PAYMENT_CONFIG.MAX_FCX_RATIO *
        FCX_PAYMENT_CONFIG.USD_TO_FCX_RATE;
      if (request.fcxAmount > maxFcxAllowed) {
        return {
          success: false,
          pledgeId: request.pledgeId,
          fcxDeducted: 0,
          fiatNeeded: 0,
          fcxTransactionId: null,
          message: `FCX支付超出限额，最大允? ${maxFcxAllowed.toFixed(2)} FCX`,
          error: 'EXCEEDS_LIMIT',
        };
      }

      // 7. 执行FCX转账
      const transferDto: FcxTransferDTO = {
        fromAccountId: request.fcxAccountId,
        toAccountId: '', // 系统账户（空字符串表示系统账户）
        amount: request.fcxAmount,
        transactionType: FcxTransactionType.SETTLEMENT,
        referenceId: request.pledgeId,
        memo: `众筹项目支付: ${pledge.project_id}`,
      };

      const transaction = await accountService.transfer(transferDto);

      // 8. 更新支持记录
      await this.updatePledgeWithFcxPayment(
        request.pledgeId,
        request.fcxAmount,
        fcxValueInUSD,
        remainingAmount > 0 ? remainingAmount : 0,
        transaction.id
      );

      return {
        success: true,
        pledgeId: request.pledgeId,
        fcxDeducted: request.fcxAmount,
        fiatNeeded: Math.max(0, remainingAmount),
        fcxTransactionId: transaction.id,
        message: 'FCX支付成功',
      };
    } catch (error) {
      console.error('FCX支付处理错误:', error);
      return {
        success: false,
        pledgeId: request.pledgeId,
        fcxDeducted: 0,
        fiatNeeded: 0,
        fcxTransactionId: null,
        message: '支付处理失败',
        error: (error as Error).message,
      };
    }
  }

  /**
   * 处理混合支付（FCX + 法币?   */
  static async processHybridPayment(
    request: FcxPaymentRequest
  ): Promise<HybridPaymentResult> {
    try {
      // 1. 先处理FCX部分
      const fcxResult = await this.processFcxPayment(request);

      if (!fcxResult.success) {
        return {
          success: false,
          pledgeId: request.pledgeId,
          fcxDeducted: 0,
          fiatCharged: 0,
          fcxTransactionId: null,
          fiatTransactionId: null,
          totalPaid: 0,
          message: fcxResult.message,
          error: fcxResult.error,
        };
      }

      // 2. 处理法币部分（模拟）
      const fiatAmount = fcxResult.fiatNeeded;
      let fiatTransactionId = null;

      if (fiatAmount > 0) {
        // 这里应该是调用实际的法币支付网关
        fiatTransactionId = `fiat_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 模拟法币支付成功
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 3. 更新支持记录为已支付状?      await this.markPledgeAsPaid(request.pledgeId, fiatTransactionId);

      return {
        success: true,
        pledgeId: request.pledgeId,
        fcxDeducted: fcxResult.fcxDeducted,
        fiatCharged: fiatAmount,
        fcxTransactionId: fcxResult.fcxTransactionId,
        fiatTransactionId,
        totalPaid:
          request.fcxAmount / FCX_PAYMENT_CONFIG.USD_TO_FCX_RATE + fiatAmount,
        message: '混合支付成功完成',
      };
    } catch (error) {
      console.error('混合支付处理错误:', error);
      return {
        success: false,
        pledgeId: request.pledgeId,
        fcxDeducted: 0,
        fiatCharged: 0,
        fcxTransactionId: null,
        fiatTransactionId: null,
        totalPaid: 0,
        message: '混合支付失败',
        error: (error as Error).message,
      };
    }
  }

  /**
   * 获取用户FCX账户余额
   */
  static async getUserFcxBalance(userId: string): Promise<number> {
    try {
      const accountService = new FcxAccountService();
      const account = await accountService.getAccountByUserId(userId);

      if (!account) {
        return 0;
      }

      return account.balance;
    } catch (error) {
      console.error('获取FCX余额错误:', error);
      return 0;
    }
  }

  /**
   * 计算FCX支付建议
   */
  static calculateFcxPaymentAdvice(
    totalAmount: number,
    userFcxBalance: number
  ): {
    maxFcxUsable: number;
    suggestedFcx: number;
    remainingFiat: number;
    fcxRate: number;
  } {
    const fcxRate = FCX_PAYMENT_CONFIG.USD_TO_FCX_RATE;
    const maxFcxRatio = FCX_PAYMENT_CONFIG.MAX_FCX_RATIO;

    // 计算最大可使用的FCX价?    const maxFcxUsable = Math.min(
      userFcxBalance / fcxRate, // 用户FCX余额对应的价?      totalAmount * maxFcxRatio // 最大支付比例限?    );

    // 建议使用80%的可使用额度
    const suggestedFcx = maxFcxUsable * 0.8;
    const remainingFiat = totalAmount - suggestedFcx;

    return {
      maxFcxUsable,
      suggestedFcx,
      remainingFiat: Math.max(0, remainingFiat),
      fcxRate,
    };
  }

  /**
   * 验证支持记录
   */
  private static async getValidatedPledge(
    pledgeId: string,
    userId: string
  ): Promise<CrowdfundingPledge> {
    const { data: pledge, error } = await supabase
      .from('crowdfunding_pledges')
      .select('*')
      .eq('id', pledgeId)
      .eq('user_id', userId)
      .single();

    if (error || !pledge) {
      throw new Error('支持记录不存在或无权访问');
    }

    // 检查状?    if (pledge.status !== 'pending') {
      throw new Error('只允许对待处理状态的支持进行支付');
    }

    return pledge as CrowdfundingPledge;
  }

  /**
   * 更新支持记录的FCX支付信息
   */
  private static async updatePledgeWithFcxPayment(
    pledgeId: string,
    fcxAmount: number,
    fcxValueUSD: number,
    fiatAmount: number,
    fcxTransactionId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('crowdfunding_pledges')
      .update({
        fcx_payment_amount: fcxAmount,
        fcx_deduction_amount: fcxValueUSD,
        fiat_payment_amount: fiatAmount,
        fcx_transaction_id: fcxTransactionId,
        payment_status: fiatAmount > 0 ? 'processing' : 'completed',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', pledgeId);

    if (error) {
      throw new Error(`更新支持记录失败: ${error.message}`);
    }
  }

  /**
   * 标记支持记录为已支付
   */
  private static async markPledgeAsPaid(
    pledgeId: string,
    fiatTransactionId: string | null
  ): Promise<void> {
    try {
      // 1. 获取支持记录详情
      const { data: pledge, error: pledgeError } = await supabase
        .from('crowdfunding_pledges')
        .select('*, crowdfunding_projects(old_models, product_model)')
        .eq('id', pledgeId)
        .single();

      if (pledgeError || !pledge) {
        throw new Error(`获取支持记录失败: ${pledgeError?.message}`);
      }

      // 2. 更新支付状?      const { error: updateError } = await supabase
        .from('crowdfunding_pledges')
        .update({
          status: 'paid',
          payment_status: 'completed',
          transaction_id: fiatTransactionId,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', pledgeId);

      if (updateError) {
        throw new Error(`更新支付状态失? ${updateError.message}`);
      }

      // 3. 检查是否有旧机型关联并记录生命周期事件
      if (pledge.old_device_qrcode) {
        await this.recordDeviceLifecycleEvent(pledge);
      }
    } catch (error) {
      console.error('标记支付状态失?', error);
      throw error;
    }
  }

  /**
   * 记录设备生命周期事件
   * @param pledge 支持记录
   */
  private static async recordDeviceLifecycleEvent(pledge: any): Promise<void> {
    try {
      const lifecycleService = new DeviceLifecycleService();

      // 确定事件类型：如果有旧机型关联则为转移，否则可能为回?      const eventType = pledge.old_device_qrcode
        ? DeviceEventType.TRANSFERRED
        : DeviceEventType.RECYCLED;

      // 记录生命周期事件
      await lifecycleService.recordEvent({
        qrcodeId: pledge.old_device_qrcode,
        eventType: eventType,
        eventSubtype: 'crowdfunding_exchange',
        location: '众筹平台',
        technician: '系统自动',
        notes: `通过众筹项目 ${
          pledge?.product_model || '新设?
        } 进行${eventType === DeviceEventType.TRANSFERRED ? '转移' : '回收'}`,
        metadata: {
          pledgeId: pledge.id,
          projectId: pledge.project_id,
          newDeviceModel: pledge?.product_model,
          oldModels: pledge?.old_models || [],
          amount: pledge.amount,
          paymentMethod: pledge.fcx_payment_amount ? 'fcx' : 'fiat',
          fcxAmount: pledge.fcx_payment_amount || 0,
          eventSource: 'crowdfunding_payment_success',
        },
      });

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `已为设备 ${pledge.old_device_qrcode} 记录${
          eventType === DeviceEventType.TRANSFERRED ? '转移' : '回收'
        }事件`
      )} catch (error) {
      console.error('记录设备生命周期事件失败:', error);
      // 不抛出异常，避免影响主流?    }
  }
}
