/**
 * 自动结算服务
 */
import { 
  ExtendedRepairOrder, 
  AutoSettlementConfig,
  Engineer
} from '../models/ticket.model';
import { FcxAccountService } from './fcx-account.service';

export class AutoSettlementService {
  private config: AutoSettlementConfig;
  private accountService: FcxAccountService;

  constructor(accountService: FcxAccountService) {
    this.accountService = accountService;
    this.config = this.getDefaultConfig();
  }

  /**
   * 处理工单结算
   */
  async processTicketSettlement(ticket: ExtendedRepairOrder, engineer: Engineer): Promise<{
    isSuccess: boolean;
    amountPaid: number;
    adjustments: Array<{
      type: 'bonus' | 'penalty' | 'quality_discount';
      amount: number;
      reason: string;
    }>;
    message: string;
  }> {
    try {
      // 1. 验证工单状态
      if (ticket.status !== 'completed') {
        throw new Error('只有已完成的工单才能结算');
      }

      if (!ticket.rating) {
        throw new Error('工单必须有评分才能结算');
      }

      // 2. 计算基础金额
      const baseAmount = ticket.fcxAmountLocked || 0;
      
      // 3. 计算各种调整项
      const adjustments = await this.calculateAdjustments(ticket, engineer);
      
      // 4. 计算最终支付金额
      let finalAmount = baseAmount;
      for (const adjustment of adjustments) {
        finalAmount += adjustment.amount;
      }
      
      // 确保金额不为负数
      finalAmount = Math.max(0, finalAmount);

      // 5. 执行资金转移
      if (finalAmount > 0) {
        await this.executePayment(ticket, engineer, finalAmount);
      }

      // 6. 记录结算日志
      await this.recordSettlementLog(ticket, engineer, baseAmount, finalAmount, adjustments);

      return {
        isSuccess: true,
        amountPaid: finalAmount,
        adjustments,
        message: `结算成功，支付金额: ${finalAmount.toFixed(2)} FCX`
      };

    } catch (error) {
      console.error('工单结算失败:', error);
      return {
        isSuccess: false,
        amountPaid: 0,
        adjustments: [],
        message: `结算失败: ${(error as Error).message}`
      };
    }
  }

  /**
   * 批量处理结算
   */
  async batchProcessSettlement(tickets: ExtendedRepairOrder[]): Promise<Array<{
    ticketId: string;
    result: any;
  }>> {
    const results: Array<{ ticketId: string; result: any }> = [];
    
    for (const ticket of tickets) {
      try {
        // 获取关联的工程师信息
        const engineer = await this.getEngineerById(ticket.assignedEngineerId || '');
        if (!engineer) {
          results.push({
            ticketId: ticket.id,
            result: { isSuccess: false, message: '未找到关联工程师' }
          });
          continue;
        }

        const result = await this.processTicketSettlement(ticket, engineer);
        results.push({
          ticketId: ticket.id,
          result
        });
      } catch (error) {
        results.push({
          ticketId: ticket.id,
          result: { 
            isSuccess: false, 
            message: `处理失败: ${(error as Error).message}` 
          }
        });
      }
    }
    
    return results;
  }

  /**
   * 更新结算配置
   */
  async updateConfiguration(newConfig: Partial<AutoSettlementConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    console.log('结算配置已更新:', this.config);
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): AutoSettlementConfig {
    return {
      id: 'default-settlement-config',
      isEnabled: true,
      minRatingForFullPayment: 4.0, // 4星及以上获得全额付款
      partialPaymentThreshold: 3.0, // 3星以下部分付款
      penaltyRate: 0.2, // 20%罚金比例
      qualityBonusRate: 0.1, // 10%质量奖金比例
      settlementDelayMinutes: 30, // 30分钟后自动结算
      autoEscrowRelease: true, // 自动释放托管资金
      requireAdminApproval: false // 不需要管理员审批
    };
  }

  /**
   * 计算调整项
   */
  private async calculateAdjustments(
    ticket: ExtendedRepairOrder, 
    engineer: Engineer
  ): Promise<Array<{
    type: 'bonus' | 'penalty' | 'quality_discount';
    amount: number;
    reason: string;
  }>> {
    const adjustments: Array<{
      type: 'bonus' | 'penalty' | 'quality_discount';
      amount: number;
      reason: string;
    }> = [];
    
    const baseAmount = ticket.fcxAmountLocked || 0;

    // 1. 质量奖金
    if (ticket.rating && ticket.rating >= 4.5) {
      const bonusAmount = baseAmount * this.config.qualityBonusRate;
      adjustments.push({
        type: 'bonus',
        amount: bonusAmount,
        reason: `高质量服务奖励 (${ticket.rating}星)`
      });
    }

    // 2. 超时罚金
    if (ticket.isOverdue && ticket.overdueDuration) {
      const penaltyAmount = -(baseAmount * this.config.penaltyRate);
      adjustments.push({
        type: 'penalty',
        amount: penaltyAmount,
        reason: `超时处罚 (${ticket.overdueDuration}分钟)`
      });
    }

    // 3. 低评分折扣
    if (ticket.rating && ticket.rating < this.config.partialPaymentThreshold) {
      const discountRate = (this.config.partialPaymentThreshold - ticket.rating) / this.config.partialPaymentThreshold;
      const discountAmount = -(baseAmount * discountRate * 0.5); // 最多50%折扣
      adjustments.push({
        type: 'quality_discount',
        amount: discountAmount,
        reason: `服务质量折扣 (${ticket.rating}星)`
      });
    }

    // 4. 复杂度补贴
    if (ticket.complexity && ticket.complexity > 7) {
      const complexityBonus = baseAmount * 0.15; // 15%复杂度补贴
      adjustments.push({
        type: 'bonus',
        amount: complexityBonus,
        reason: `高复杂度任务补贴`
      });
    }

    // 5. 紧急任务补贴
    if (ticket.customerUrgency && ticket.customerUrgency >= 4) {
      const urgencyBonus = baseAmount * 0.1; // 10%紧急任务补贴
      adjustments.push({
        type: 'bonus',
        amount: urgencyBonus,
        reason: `紧急任务补贴`
      });
    }

    return adjustments;
  }

  /**
   * 执行支付
   */
  private async executePayment(
    ticket: ExtendedRepairOrder, 
    engineer: Engineer, 
    amount: number
  ): Promise<void> {
    if (amount <= 0) return;

    // 1. 获取消费者账户
    const consumerAccount = await this.accountService.getAccountByUserId(ticket.consumerId);
    if (!consumerAccount) {
      throw new Error('消费者账户不存在');
    }

    // 2. 获取工程师账户
    const engineerAccount = await this.accountService.getAccountByUserId(engineer.userId);
    if (!engineerAccount) {
      // 如果工程师账户不存在，创建一个
      await this.accountService.createAccount({
        userId: engineer.userId,
        accountType: 'engineer' as any,
        initialBalance: 0
      });
    }

    // 3. 执行资金转移
    await this.accountService.transfer({
      fromAccountId: consumerAccount.id,
      toAccountId: engineerAccount!.id,
      amount: amount,
      transactionType: 'SETTLEMENT' as any,
      referenceId: ticket.id,
      memo: `工单结算: ${ticket.orderNumber}`
    });

    console.log(`支付完成: ${amount.toFixed(2)} FCX 转移到工程师 ${engineer.name}`);
  }

  /**
   * 记录结算日志
   */
  private async recordSettlementLog(
    ticket: ExtendedRepairOrder,
    engineer: Engineer,
    baseAmount: number,
    finalAmount: number,
    adjustments: any[]
  ): Promise<void> {
    const logEntry = {
      id: this.generateLogId(),
      ticketId: ticket.id,
      ticketNumber: ticket.orderNumber,
      engineerId: engineer.id,
      engineerName: engineer.name,
      baseAmount,
      finalAmount,
      adjustments: JSON.stringify(adjustments),
      settledAt: new Date(),
      configVersion: this.config.id
    };

    // 这里应该保存到数据库
    console.log('结算日志:', logEntry);
  }

  /**
   * 获取工程师信息
   */
  private async getEngineerById(engineerId: string): Promise<Engineer | null> {
    // 模拟从数据库获取工程师信息
    if (engineerId === 'eng-001') {
      return {
        id: 'eng-001',
        userId: 'user-001',
        name: '张师傅',
        phone: '13800138001',
        email: 'zhang@example.com',
        skills: [],
        specialization: ['手机维修'],
        experienceYears: 8,
        rating: 4.8,
        completedTickets: 342,
        successRate: 96.5,
        currentLoad: 2,
        maxCapacity: 5,
        location: {
          latitude: 39.9042,
          longitude: 116.4074,
          address: '北京市朝阳区',
          city: '北京',
          region: '华北'
        },
        availability: {
          status: 'available',
          lastOnline: new Date(),
          workingHours: '09:00-18:00',
          holidays: []
        },
        certifications: ['手机维修技师'],
        hourlyRate: 150,
        slaLevels: [],
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }
    return null;
  }

  /**
   * 生成日志ID
   */
  private generateLogId(): string {
    return `settlement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查是否可以自动结算
   */
  async canAutoSettle(ticket: ExtendedRepairOrder): Promise<boolean> {
    // 检查配置是否启用
    if (!this.config.isEnabled) {
      return false;
    }

    // 检查工单状态
    if (ticket.status !== 'completed') {
      return false;
    }

    // 检查是否有评分
    if (!ticket.rating) {
      return false;
    }

    // 检查是否超过延迟时间
    const completionTime = ticket.actualCompletionAt || new Date();
    const timeSinceCompletion = (new Date().getTime() - completionTime.getTime()) / (1000 * 60);
    
    return timeSinceCompletion >= this.config.settlementDelayMinutes;
  }

  /**
   * 获取结算统计信息
   */
  async getSettlementStatistics(periodDays: number = 30): Promise<{
    totalSettled: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
    pendingSettlements: number;
  }> {
    // 模拟统计数据
    return {
      totalSettled: 127,
      totalAmount: 25400,
      averageAmount: 200,
      successRate: 98.4,
      pendingSettlements: 3
    };
  }
}