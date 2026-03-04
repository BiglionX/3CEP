/**
 * 工单管理系统主服? */
import {
  ExtendedRepairOrder,
  AssignmentAlgorithmParams,
  AssignmentStrategy,
  TicketPriority,
  SLALevel,
} from '../models/ticket.model';
import { TicketAssignmentService } from './ticket-assignment.service';
import { SLAMonitorService } from './sla-monitor.service';
import { AutoSettlementService } from './auto-settlement.service';
import { FcxAccountService } from './fcx-account.service';
import { RepairOrderService } from './repair-order.service';

export class TicketManagementService {
  private assignmentService: TicketAssignmentService;
  private slaMonitorService: SLAMonitorService;
  private settlementService: AutoSettlementService;
  private orderService: RepairOrderService;
  private accountService: FcxAccountService;

  constructor() {
    this.accountService = new FcxAccountService();
    this.assignmentService = new TicketAssignmentService();
    this.slaMonitorService = new SLAMonitorService();
    this.settlementService = new AutoSettlementService(this.accountService);
    this.orderService = new RepairOrderService();

    // 注册SLA通知回调
    this.slaMonitorService.registerNotificationCallback(
      this.handleSLANotification.bind(this)
    );
  }

  /**
   * 创建并初始化工单
   */
  async createAndInitializeTicket(
    orderData: any
  ): Promise<ExtendedRepairOrder> {
    try {
      // 1. 创建基础工单
      const basicOrder = await this.orderService.createOrder(orderData);

      // 2. 转换为扩展工?      const extendedTicket: ExtendedRepairOrder = {
        ...basicOrder,
        priority: this.determinePriority(orderData),
        slaLevel: this.determineSLALevel(orderData),
        assignedEngineerId: null,
        assignedAt: null,
        acceptedAt: null,
        startedAt: null,
        estimatedCompletionAt: null,
        actualCompletionAt: null,
        slaDeadline: null,
        isOverdue: false,
        overdueDuration: null,
        location: orderData.location || {
          latitude: 0,
          longitude: 0,
          address: '',
          city: '',
        },
        requiredSkills: this.extractRequiredSkills(
          orderData.deviceInfo,
          orderData.faultDescription
        ),
        complexity: this.assessComplexity(orderData),
        customerUrgency: orderData.customerUrgency || 3,
        escalationLevel: 0,
        escalationHistory: [],
      };

      // 3. 启动SLA监控
      await this.slaMonitorService.createSLAMonitorRule(extendedTicket);

      // 4. 尝试自动分配
      await this.attemptAutoAssignment(extendedTicket);

      return extendedTicket;
    } catch (error) {
      console.error('创建工单失败:', error);
      throw error;
    }
  }

  /**
   * 自动分配工单
   */
  async autoAssignTicket(ticketId: string): Promise<boolean> {
    try {
      const ticket = await this.getTicketById(ticketId);
      if (!ticket) {
        throw new Error('工单不存?);
      }

      if (ticket.assignedEngineerId) {
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `工单 ${ticketId} 已经分配给工程师 ${ticket.assignedEngineerId}`
        )return true;
      }

      return await this.attemptAutoAssignment(ticket);
    } catch (error) {
      console.error('自动分配工单失败:', error);
      return false;
    }
  }

  /**
   * 手动分配工单
   */
  async manualAssignTicket(
    ticketId: string,
    engineerId: string
  ): Promise<boolean> {
    try {
      const ticket = await this.getTicketById(ticketId);
      if (!ticket) {
        throw new Error('工单不存?);
      }

      // 更新工单分配信息
      await this.updateTicketAssignment(ticketId, engineerId);

      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`工单 ${ticketId} 已手动分配给工程?${engineerId}`)return true;
    } catch (error) {
      console.error('手动分配工单失败:', error);
      return false;
    }
  }

  /**
   * 处理工单状态变?   */
  async handleTicketStatusChange(
    ticketId: string,
    newStatus: string,
    metadata?: any
  ): Promise<void> {
    try {
      const ticket = await this.getTicketById(ticketId);
      if (!ticket) {
        throw new Error('工单不存?);
      }

      // 根据新状态执行相应操?      switch (newStatus) {
        case 'accepted':
          await this.handleTicketAccepted(ticketId);
          break;
        case 'in_progress':
          await this.handleTicketInProgress(ticketId);
          break;
        case 'completed':
          await this.handleTicketCompleted(ticketId, metadata);
          break;
        case 'cancelled':
          await this.handleTicketCancelled(ticketId);
          break;
      }

      // 更新SLA监控
      await this.updateSLAMonitoring(ticketId, newStatus);
    } catch (error) {
      console.error('处理工单状态变更失?', error);
      throw error;
    }
  }

  /**
   * 检查并处理超时工单
   */
  async checkOverdueTickets(): Promise<void> {
    try {
      await this.slaMonitorService.batchCheckSLA();
    } catch (error) {
      console.error('检查超时工单失?', error);
    }
  }

  /**
   * 处理自动结算
   */
  async processAutoSettlement(): Promise<void> {
    try {
      // 获取已完成但未结算的工单
      const completedTickets = await this.getCompletedUnsettledTickets();

      for (const ticket of completedTickets) {
        const canSettle = await this.settlementService.canAutoSettle(ticket);
        if (canSettle) {
          // 获取工程师信息并执行结算
          const engineer = await this.getEngineerById(
            ticket.assignedEngineerId || ''
          );
          if (engineer) {
            await this.settlementService.processTicketSettlement(
              ticket,
              engineer
            );
          }
        }
      }
    } catch (error) {
      console.error('处理自动结算失败:', error);
    }
  }

  /**
   * 获取系统统计信息
   */
  async getSystemStatistics(): Promise<{
    totalTickets: number;
    assignedTickets: number;
    completedTickets: number;
    overdueTickets: number;
    slaComplianceRate: number;
    avgResponseTime: number;
    settlementStats: any;
  }> {
    try {
      // 获取各类工单数量
      const allTickets = await this.getAllTickets();
      const assignedTickets = allTickets.filter(t => t.assignedEngineerId);
      const completedTickets = allTickets.filter(t => t.status === 'completed');

      // 检查超时工?      let overdueCount = 0;
      for (const ticket of allTickets) {
        const slaStatus = await this.slaMonitorService.checkSLAStatus(
          ticket.id
        );
        if (slaStatus.isOverdue) {
          overdueCount++;
        }
      }

      // 获取SLA合规?      const slaStats = await this.slaMonitorService.getSLAStatistics();

      // 获取结算统计
      const settlementStats =
        await this.settlementService.getSettlementStatistics();

      return {
        totalTickets: allTickets.length,
        assignedTickets: assignedTickets.length,
        completedTickets: completedTickets.length,
        overdueTickets: overdueCount,
        slaComplianceRate: slaStats.complianceRate,
        avgResponseTime: this.calculateAverageResponseTime(allTickets),
        settlementStats,
      };
    } catch (error) {
      console.error('获取系统统计失败:', error);
      return {
        totalTickets: 0,
        assignedTickets: 0,
        completedTickets: 0,
        overdueTickets: 0,
        slaComplianceRate: 0,
        avgResponseTime: 0,
        settlementStats: {},
      };
    }
  }

  /**
   * 获取工单详情
   */
  private async getTicketById(
    ticketId: string
  ): Promise<ExtendedRepairOrder | null> {
    // 模拟从数据库获取工单
    return null;
  }

  /**
   * 获取所有工?   */
  private async getAllTickets(): Promise<ExtendedRepairOrder[]> {
    // 模拟获取所有工?    return [];
  }

  /**
   * 获取已完成但未结算的工单
   */
  private async getCompletedUnsettledTickets(): Promise<ExtendedRepairOrder[]> {
    // 模拟获取未结算工?    return [];
  }

  /**
   * 尝试自动分配工单
   */
  private async attemptAutoAssignment(
    ticket: ExtendedRepairOrder
  ): Promise<boolean> {
    try {
      await this.assignmentService.loadEngineers();

      const assignmentParams: AssignmentAlgorithmParams = {
        strategy: AssignmentStrategy.SKILL_MATCH,
        maxDistanceKm: 50,
        maxLoadFactor: 0.8,
        skillWeight: 0.4,
        locationWeight: 0.3,
        experienceWeight: 0.2,
        ratingWeight: 0.1,
        excludeOffline: true,
        excludeOverloaded: true,
      };

      const assignmentResult = await this.assignmentService.assignTicket(
        ticket,
        assignmentParams
      );

      if (assignmentResult) {
        await this.updateTicketAssignment(
          ticket.id,
          assignmentResult.assignedEngineerId
        );
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `工单 ${ticket.id} 自动分配给工程师 ${assignmentResult.assignedEngineerId}`
        )return true;
      }

      return false;
    } catch (error) {
      console.error('自动分配失败:', error);
      return false;
    }
  }

  /**
   * 更新工单分配信息
   */
  private async updateTicketAssignment(
    ticketId: string,
    engineerId: string
  ): Promise<void> {
    // 模拟更新数据?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`更新工单 ${ticketId} 分配给工程师 ${engineerId}`)}

  /**
   * 处理工单接受
   */
  private async handleTicketAccepted(ticketId: string): Promise<void> {
    // 更新工单接受时间
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`工单 ${ticketId} 已被接受`)}

  /**
   * 处理工单进行?   */
  private async handleTicketInProgress(ticketId: string): Promise<void> {
    // 更新工单开始时?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`工单 ${ticketId} 开始处理`)}

  /**
   * 处理工单完成
   */
  private async handleTicketCompleted(
    ticketId: string,
    metadata?: any
  ): Promise<void> {
    // 更新工单完成时间和评?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`工单 ${ticketId} 已完成`)}

  /**
   * 处理工单取消
   */
  private async handleTicketCancelled(ticketId: string): Promise<void> {
    // 取消SLA监控
    await this.slaMonitorService.cancelSLAMonitor(ticketId);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`工单 ${ticketId} 已取消`)}

  /**
   * 更新SLA监控
   */
  private async updateSLAMonitoring(
    ticketId: string,
    status: string
  ): Promise<void> {
    // 根据状态更新SLA监控
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`更新工单 ${ticketId} 的SLA监控，状? ${status}`)}

  /**
   * 处理SLA通知
   */
  private async handleSLANotification(
    rule: any,
    eventType: string
  ): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`收到SLA通知 - 工单: ${rule.ticketId}, 事件: ${eventType}`)// 这里可以集成消息推送、邮件通知?  }

  /**
   * 确定工单优先?   */
  private determinePriority(orderData: any): TicketPriority {
    // 根据客户紧急程度、设备重要性等因素确定优先?    const urgency = orderData.customerUrgency || 3;

    if (urgency >= 5) return TicketPriority.CRITICAL;
    if (urgency >= 4) return TicketPriority.URGENT;
    if (urgency >= 3) return TicketPriority.HIGH;
    if (urgency >= 2) return TicketPriority.NORMAL;
    return TicketPriority.LOW;
  }

  /**
   * 确定SLA级别
   */
  private determineSLALevel(orderData: any): SLALevel {
    // 根据客户付费情况、设备价值等确定SLA级别
    const isVip = orderData.isVipCustomer || false;
    const deviceValue = orderData.deviceValue || 0;

    if (isVip) return SLALevel.VIP;
    if (deviceValue > 10000) return SLALevel.PREMIUM;
    if (deviceValue > 5000) return SLALevel.PRIORITY;
    return SLALevel.STANDARD;
  }

  /**
   * 提取所需技?   */
  private extractRequiredSkills(
    deviceInfo: any,
    faultDescription: string
  ): any[] {
    const skills: any[] = [];

    // 根据设备类型和故障描述推断所需技?    if (deviceInfo?.deviceType === 'mobile') {
      skills.push('MOBILE_REPAIR');
    }

    if (faultDescription?.includes('屏幕')) {
      skills.push('SCREEN_REPLACEMENT');
    }

    if (faultDescription?.includes('进水')) {
      skills.push('WATER_DAMAGE');
    }

    return skills;
  }

  /**
   * 评估复杂?   */
  private assessComplexity(orderData: any): number {
    let complexity = 5; // 基础复杂?
    // 根据设备类型调整
    if (orderData?.brand === 'Apple') {
      complexity += 1;
    }

    // 根据故障描述调整
    if (orderData?.includes('主板')) {
      complexity += 2;
    }

    return Math.min(10, Math.max(1, complexity));
  }

  /**
   * 计算平均响应时间
   */
  private calculateAverageResponseTime(tickets: ExtendedRepairOrder[]): number {
    const responseTimes = tickets
      .filter(t => t.assignedAt && t.createdAt)
      .map(t => {
        const assignTime = new Date(t.assignedAt!).getTime();
        const createTime = new Date(t.createdAt).getTime();
        return (assignTime - createTime) / (1000 * 60); // 转换为分?      });

    if (responseTimes.length === 0) return 0;

    const sum = responseTimes.reduce((a, b) => a + b, 0);
    return sum / responseTimes.length;
  }

  /**
   * 获取工程师信?   */
  private async getEngineerById(engineerId: string): Promise<any> {
    // 模拟获取工程师信?    return null;
  }
}
