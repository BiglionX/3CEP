/**
 * SLA监控和提醒服务
 */
import { 
  ExtendedRepairOrder, 
  SLAMonitorRule, 
  SLALevel,
  TicketPriority
} from '../models/ticket.model';

export class SLAMonitorService {
  private monitorRules: Map<string, SLAMonitorRule> = new Map();
  private notificationCallbacks: Array<(rule: SLAMonitorRule, eventType: string) => void> = [];

  constructor() {}

  /**
   * 为工单创建SLA监控规则
   */
  async createSLAMonitorRule(ticket: ExtendedRepairOrder): Promise<SLAMonitorRule> {
    try {
      const rule: SLAMonitorRule = {
        id: this.generateRuleId(),
        ticketId: ticket.id,
        slaLevel: ticket.slaLevel,
        deadline: this.calculateSLADeadline(ticket),
        warningThreshold: this.getWarningThreshold(ticket.slaLevel),
        escalationRules: this.generateEscalationRules(ticket.slaLevel),
        notificationsSent: [],
        isActive: true
      };

      this.monitorRules.set(rule.id, rule);
      
      // 启动定时检查
      this.scheduleSLAChecks(rule);
      
      return rule;
    } catch (error) {
      console.error('创建SLA监控规则失败:', error);
      throw error;
    }
  }

  /**
   * 检查SLA状态
   */
  async checkSLAStatus(ticketId: string): Promise<{
    isOverdue: boolean;
    remainingTime: number; // 分钟
    warningTriggered: boolean;
    escalationNeeded: boolean;
  }> {
    const rule = Array.from(this.monitorRules.values()).find(r => r.ticketId === ticketId);
    
    if (!rule || !rule.isActive) {
      return {
        isOverdue: false,
        remainingTime: 0,
        warningTriggered: false,
        escalationNeeded: false
      };
    }

    const now = new Date();
    const timeDiff = rule.deadline.getTime() - now.getTime();
    const remainingMinutes = Math.floor(timeDiff / (1000 * 60));
    const isOverdue = remainingMinutes <= 0;
    
    // 检查是否需要发送警告
    const warningTriggered = this.shouldSendWarning(rule, remainingMinutes);
    
    // 检查是否需要升级
    const escalationNeeded = this.shouldEscalate(rule, remainingMinutes);

    return {
      isOverdue,
      remainingTime: Math.max(0, remainingMinutes),
      warningTriggered,
      escalationNeeded
    };
  }

  /**
   * 处理SLA违规
   */
  async handleSLAViolation(ticketId: string): Promise<void> {
    const rule = Array.from(this.monitorRules.values()).find(r => r.ticketId === ticketId);
    
    if (!rule) {
      console.warn(`未找到工单 ${ticketId} 的SLA规则`);
      return;
    }

    // 记录违规
    console.log(`🚨 SLA违规: 工单 ${ticketId} 超时`);

    // 执行升级规则
    await this.executeEscalation(rule);

    // 发送通知
    await this.sendSLANotifications(rule, 'overdue');
  }

  /**
   * 注册通知回调
   */
  registerNotificationCallback(callback: (rule: SLAMonitorRule, eventType: string) => void): void {
    this.notificationCallbacks.push(callback);
  }

  /**
   * 取消SLA监控
   */
  async cancelSLAMonitor(ticketId: string): Promise<void> {
    const rule = Array.from(this.monitorRules.values()).find(r => r.ticketId === ticketId);
    if (rule) {
      rule.isActive = false;
      this.monitorRules.delete(rule.id);
      console.log(`取消工单 ${ticketId} 的SLA监控`);
    }
  }

  /**
   * 批量检查所有活动的SLA规则
   */
  async batchCheckSLA(): Promise<void> {
    const activeRules = Array.from(this.monitorRules.values()).filter(rule => rule.isActive);
    
    for (const rule of activeRules) {
      try {
        const status = await this.checkSLAStatus(rule.ticketId);
        
        if (status.warningTriggered) {
          await this.sendSLANotifications(rule, 'warning');
        }
        
        if (status.isOverdue) {
          await this.handleSLAViolation(rule.ticketId);
        }
      } catch (error) {
        console.error(`检查工单 ${rule.ticketId} SLA状态失败:`, error);
      }
    }
  }

  /**
   * 获取SLA统计信息
   */
  async getSLAStatistics(): Promise<{
    totalMonitored: number;
    overdueCount: number;
    warningCount: number;
    complianceRate: number;
  }> {
    const activeRules = Array.from(this.monitorRules.values()).filter(rule => rule.isActive);
    let overdueCount = 0;
    let warningCount = 0;

    for (const rule of activeRules) {
      const status = await this.checkSLAStatus(rule.ticketId);
      if (status.isOverdue) overdueCount++;
      if (status.warningTriggered) warningCount++;
    }

    const complianceRate = activeRules.length > 0 
      ? ((activeRules.length - overdueCount) / activeRules.length) * 100 
      : 100;

    return {
      totalMonitored: activeRules.length,
      overdueCount,
      warningCount,
      complianceRate
    };
  }

  /**
   * 计算SLA截止时间
   */
  private calculateSLADeadline(ticket: ExtendedRepairOrder): Date {
    const baseTime = new Date(ticket.createdAt);
    
    // 根据SLA级别设置不同的响应时间
    const slaHours = this.getSLAHours(ticket.slaLevel);
    
    // 根据紧急程度调整时间
    const priorityMultiplier = this.getPriorityMultiplier(ticket.priority);
    
    const adjustedHours = slaHours * priorityMultiplier;
    const deadline = new Date(baseTime.getTime() + (adjustedHours * 60 * 60 * 1000));
    
    return deadline;
  }

  /**
   * 获取SLA级别的小时数
   */
  private getSLAHours(slaLevel: SLALevel): number {
    switch (slaLevel) {
      case SLALevel.VIP: return 1;        // 1小时
      case SLALevel.PREMIUM: return 4;    // 4小时
      case SLALevel.PRIORITY: return 12;  // 12小时
      case SLALevel.STANDARD: return 24;  // 24小时
      default: return 24;
    }
  }

  /**
   * 获取紧急程度倍数
   */
  private getPriorityMultiplier(priority: TicketPriority): number {
    switch (priority) {
      case TicketPriority.CRITICAL: return 0.5;  // 50%时间
      case TicketPriority.URGENT: return 0.7;    // 70%时间
      case TicketPriority.HIGH: return 0.9;      // 90%时间
      case TicketPriority.NORMAL: return 1.0;    // 正常时间
      case TicketPriority.LOW: return 1.5;       // 150%时间
      default: return 1.0;
    }
  }

  /**
   * 获取警告阈值(分钟)
   */
  private getWarningThreshold(slaLevel: SLALevel): number {
    switch (slaLevel) {
      case SLALevel.VIP: return 30;       // 30分钟前提醒
      case SLALevel.PREMIUM: return 60;   // 1小时前提醒
      case SLALevel.PRIORITY: return 120; // 2小时前提醒
      case SLALevel.STANDARD: return 240; // 4小时前提醒
      default: return 240;
    }
  }

  /**
   * 生成升级规则
   */
  private generateEscalationRules(slaLevel: SLALevel): SLAMonitorRule['escalationRules'] {
    const rules = [];
    
    switch (slaLevel) {
      case SLALevel.VIP:
        rules.push(
          { delayMinutes: 15, action: 'remind' as const, targetRole: 'engineer' as const, messageTemplate: 'VIP工单即将超时，请立即处理' },
          { delayMinutes: 30, action: 'escalate' as const, targetRole: 'supervisor' as const, messageTemplate: 'VIP工单已超时15分钟，请立即介入' },
          { delayMinutes: 60, action: 'notify_admin' as const, targetRole: 'admin' as const, messageTemplate: 'VIP工单严重超时，需要管理员处理' }
        );
        break;
        
      case SLALevel.PREMIUM:
        rules.push(
          { delayMinutes: 60, action: 'remind' as const, targetRole: 'engineer' as const, messageTemplate: '高级工单即将超时，请尽快处理' },
          { delayMinutes: 120, action: 'escalate' as const, targetRole: 'supervisor' as const, messageTemplate: '高级工单已超时，请主管协助' }
        );
        break;
        
      case SLALevel.PRIORITY:
        rules.push(
          { delayMinutes: 120, action: 'remind' as const, targetRole: 'engineer' as const, messageTemplate: '优先工单即将超时，请注意处理' }
        );
        break;
        
      default:
        // 标准SLA不自动升级
        break;
    }
    
    return rules;
  }

  /**
   * 判断是否应该发送警告
   */
  private shouldSendWarning(rule: SLAMonitorRule, remainingMinutes: number): boolean {
    // 检查是否已经发送过警告
    const warningSent = rule.notificationsSent.some(n => n.type === 'warning');
    if (warningSent) return false;

    // 检查是否到达警告阈值
    return remainingMinutes <= rule.warningThreshold && remainingMinutes > 0;
  }

  /**
   * 判断是否需要升级
   */
  private shouldEscalate(rule: SLAMonitorRule, remainingMinutes: number): boolean {
    const now = new Date();
    
    for (const escalationRule of rule.escalationRules) {
      const delayMinutes = escalationRule.delayMinutes;
      const breachTime = new Date(rule.deadline.getTime() + (delayMinutes * 60 * 1000));
      
      // 检查是否已经超过升级时间
      if (now >= breachTime) {
        // 检查是否已经执行过此升级
        const alreadyExecuted = rule.notificationsSent.some(n => 
          n.type === 'escalation' && n.message.includes(escalationRule.messageTemplate)
        );
        
        if (!alreadyExecuted) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * 执行升级操作
   */
  private async executeEscalation(rule: SLAMonitorRule): Promise<void> {
    const now = new Date();
    
    for (const escalationRule of rule.escalationRules) {
      const delayMinutes = escalationRule.delayMinutes;
      const breachTime = new Date(rule.deadline.getTime() + (delayMinutes * 60 * 1000));
      
      if (now >= breachTime) {
        // 执行相应的升级动作
        switch (escalationRule.action) {
          case 'remind':
            await this.sendReminder(rule, escalationRule);
            break;
          case 'escalate':
            await this.escalateToSupervisor(rule, escalationRule);
            break;
          case 'reassign':
            await this.reassignTicket(rule, escalationRule);
            break;
          case 'notify_admin':
            await this.notifyAdministrator(rule, escalationRule);
            break;
        }
      }
    }
  }

  /**
   * 发送提醒
   */
  private async sendReminder(rule: SLAMonitorRule, escalationRule: any): Promise<void> {
    console.log(`发送提醒给工程师: ${escalationRule.messageTemplate}`);
    await this.recordNotification(rule, 'warning', 'engineer', escalationRule.messageTemplate);
  }

  /**
   * 升级到主管
   */
  private async escalateToSupervisor(rule: SLAMonitorRule, escalationRule: any): Promise<void> {
    console.log(`升级到主管: ${escalationRule.messageTemplate}`);
    await this.recordNotification(rule, 'escalation', 'supervisor', escalationRule.messageTemplate);
  }

  /**
   * 重新分配工单
   */
  private async reassignTicket(rule: SLAMonitorRule, escalationRule: any): Promise<void> {
    console.log(`重新分配工单: ${rule.ticketId}`);
    await this.recordNotification(rule, 'escalation', 'system', '工单已重新分配给其他工程师');
  }

  /**
   * 通知管理员
   */
  private async notifyAdministrator(rule: SLAMonitorRule, escalationRule: any): Promise<void> {
    console.log(`通知管理员: ${escalationRule.messageTemplate}`);
    await this.recordNotification(rule, 'escalation', 'admin', escalationRule.messageTemplate);
  }

  /**
   * 发送SLA通知
   */
  private async sendSLANotifications(rule: SLAMonitorRule, eventType: string): Promise<void> {
    // 调用所有注册的通知回调
    for (const callback of this.notificationCallbacks) {
      try {
        callback(rule, eventType);
      } catch (error) {
        console.error('通知回调执行失败:', error);
      }
    }
  }

  /**
   * 记录通知发送
   */
  private async recordNotification(
    rule: SLAMonitorRule, 
    type: string, 
    recipient: string, 
    message: string
  ): Promise<void> {
    rule.notificationsSent.push({
      type: type as any,
      sentAt: new Date(),
      recipient,
      message
    });
  }

  /**
   * 安排SLA检查
   */
  private scheduleSLAChecks(rule: SLAMonitorRule): void {
    // 设置警告检查定时器
    const warningTime = new Date(rule.deadline.getTime() - (rule.warningThreshold * 60 * 1000));
    const now = new Date();
    
    if (warningTime > now) {
      setTimeout(() => {
        this.checkSLAStatus(rule.ticketId);
      }, warningTime.getTime() - now.getTime());
    }

    // 设置超时检查定时器
    if (rule.deadline > now) {
      setTimeout(() => {
        this.handleSLAViolation(rule.ticketId);
      }, rule.deadline.getTime() - now.getTime());
    }
  }

  /**
   * 生成规则ID
   */
  private generateRuleId(): string {
    return `sla-rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}