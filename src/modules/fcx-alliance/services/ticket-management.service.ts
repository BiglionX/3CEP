/**
 * 工单管理服务
 * 提供工单创建、分配、状态更新、超时检查和结算等功能
 */

export interface Ticket {
  id: string;
  qrcodeId: string;
  deviceId?: string;
  faultType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  engineerId?: string;
  createdAt: Date;
  updatedAt: Date;
  dueAt?: Date;
  completedAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface CreateTicketParams {
  qrcodeId: string;
  deviceId?: string;
  faultType: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TicketAssignmentParams {
  ticketId: string;
  engineerId: string;
}

export interface SystemStatistics {
  totalTickets: number;
  pendingTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  overdueTickets: number;
  avgResponseTime?: number;
  avgCompletionTime?: number;
}

export class TicketManagementService {
  private tickets: Map<string, Ticket> = new Map();
  private engineers: Set<string> = new Set();

  /**
   * 创建并初始化工单
   */
  async createAndInitializeTicket(params: CreateTicketParams): Promise<Ticket> {
    const ticketId = this.generateTicketId();
    const now = new Date();

    const ticket: Ticket = {
      id: ticketId,
      qrcodeId: params.qrcodeId,
      deviceId: params.deviceId,
      faultType: params.faultType,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      dueAt: this.calculateDueDate(now, params.priority),
      notes: params.notes,
    };

    this.tickets.set(ticketId, ticket);
    console.log(`📝 创建工单: ${ticketId} - ${params.faultType}`);

    return ticket;
  }

  /**
   * 自动分配工单给合适的工程师
   */
  async autoAssignTicket(ticketId: string): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`工单不存在: ${ticketId}`);
    }

    if (ticket.status !== 'pending') {
      throw new Error(`工单状态不允许分配: ${ticket.status}`);
    }

    // 查找可用的工程师
    const availableEngineer = this.findAvailableEngineer();
    if (!availableEngineer) {
      return false;
    }

    return this.assignTicket(ticketId, availableEngineer);
  }

  /**
   * 手动分配工单
   */
  async manualAssignTicket(
    ticketId: string,
    engineerId: string
  ): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`工单不存在: ${ticketId}`);
    }

    if (ticket.status !== 'pending') {
      throw new Error(`工单状态不允许分配: ${ticket.status}`);
    }

    if (!this.engineers.has(engineerId)) {
      throw new Error(`工程师不存在: ${engineerId}`);
    }

    return this.assignTicket(ticketId, engineerId);
  }

  /**
   * 处理工单状态变更
   */
  async handleTicketStatusChange(
    ticketId: string,
    newStatus: Ticket['status'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`工单不存在: ${ticketId}`);
    }

    // 验证状态流转是否合法
    if (!this.isValidStatusTransition(ticket.status, newStatus)) {
      throw new Error(`无效的状态流转: ${ticket.status} -> ${newStatus}`);
    }

    ticket.status = newStatus;
    ticket.updatedAt = new Date();

    if (newStatus === 'completed') {
      ticket.completedAt = new Date();
    }

    if (metadata) {
      ticket.metadata = { ...ticket.metadata, ...metadata };
    }

    console.log(`🔄 工单状态变更: ${ticketId} -> ${newStatus}`);
  }

  /**
   * 检查超时工单
   */
  async checkOverdueTickets(): Promise<Ticket[]> {
    const now = new Date();
    const overdueTickets: Ticket[] = [];

    for (const ticket of this.tickets.values()) {
      if (
        ticket.dueAt &&
        ticket.dueAt < now &&
        ticket.status !== 'completed' &&
        ticket.status !== 'cancelled'
      ) {
        overdueTickets.push(ticket);
        console.warn(`⚠️ 工单超时: ${ticket.id} - 应完成时间: ${ticket.dueAt}`);
      }
    }

    return overdueTickets;
  }

  /**
   * 处理自动结算
   */
  async processAutoSettlement(): Promise<{
    settledCount: number;
    totalAmount: number;
  }> {
    const settledTickets: Ticket[] = [];

    for (const ticket of this.tickets.values()) {
      if (
        ticket.status === 'completed' &&
        ticket.completedAt &&
        !ticket.metadata?.settled
      ) {
        // 模拟结算逻辑
        const settlementAmount = this.calculateSettlementAmount(ticket);
        ticket.metadata = {
          ...ticket.metadata,
          settled: true,
          settlementAmount,
          settlementDate: new Date().toISOString(),
        };

        settledTickets.push(ticket);
      }
    }

    const totalAmount = settledTickets.reduce(
      (sum, ticket) => sum + (ticket.metadata?.settlementAmount || 0),
      0
    );

    console.log(
      `💰 结算完成: ${settledTickets.length} 个工单, 总金额: ¥${totalAmount}`
    );

    return {
      settledCount: settledTickets.length,
      totalAmount,
    };
  }

  /**
   * 获取系统统计信息
   */
  async getSystemStatistics(): Promise<SystemStatistics> {
    const tickets = Array.from(this.tickets.values());
    const now = new Date();

    const totalTickets = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;
    const assignedTickets = tickets.filter(t => t.status === 'assigned').length;
    const inProgressTickets = tickets.filter(
      t => t.status === 'in_progress'
    ).length;
    const completedTickets = tickets.filter(
      t => t.status === 'completed'
    ).length;
    const overdueTickets = tickets.filter(
      t =>
        t.dueAt &&
        t.dueAt < now &&
        t.status !== 'completed' &&
        t.status !== 'cancelled'
    ).length;

    // 计算平均响应时间 (从创建到分配)
    const assignedTicketsWithResponseTime = tickets.filter(
      t => t.status !== 'pending'
    );
    const avgResponseTime =
      assignedTicketsWithResponseTime.length > 0
        ? assignedTicketsWithResponseTime.reduce((sum, t) => {
            // 简化计算: 使用更新时间 - 创建时间
            return sum + (t.updatedAt.getTime() - t.createdAt.getTime());
          }, 0) / assignedTicketsWithResponseTime.length
        : undefined;

    // 计算平均完成时间
    const completedTicketsWithDuration = tickets.filter(t => t.completedAt);
    const avgCompletionTime =
      completedTicketsWithDuration.length > 0
        ? completedTicketsWithDuration.reduce((sum, t) => {
            return sum + (t.completedAt!.getTime() - t.createdAt.getTime());
          }, 0) / completedTicketsWithDuration.length
        : undefined;

    return {
      totalTickets,
      pendingTickets,
      assignedTickets,
      inProgressTickets,
      completedTickets,
      overdueTickets,
      avgResponseTime,
      avgCompletionTime,
    };
  }

  /**
   * 注册工程师
   */
  registerEngineer(engineerId: string): void {
    this.engineers.add(engineerId);
    console.log(`👨‍🔧 注册工程师: ${engineerId}`);
  }

  /**
   * 移除工程师
   */
  unregisterEngineer(engineerId: string): void {
    this.engineers.delete(engineerId);
    console.log(`👋 移除工程师: ${engineerId}`);
  }

  // ===== 私有辅助方法 =====

  private generateTicketId(): string {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDueDate(
    createdAt: Date,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Date {
    const dueDate = new Date(createdAt);

    switch (priority) {
      case 'high':
        dueDate.setHours(dueDate.getHours() + 4); // 4小时
        break;
      case 'medium':
        dueDate.setHours(dueDate.getHours() + 24); // 24小时
        break;
      case 'low':
        dueDate.setHours(dueDate.getHours() + 72); // 72小时
        break;
    }

    return dueDate;
  }

  private findAvailableEngineer(): string | undefined {
    if (this.engineers.size === 0) {
      return undefined;
    }

    // 简化逻辑: 随机选择一个可用工程师
    const engineers = Array.from(this.engineers);
    return engineers[Math.floor(Math.random() * engineers.length)];
  }

  private assignTicket(ticketId: string, engineerId: string): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      return false;
    }

    ticket.engineerId = engineerId;
    ticket.status = 'assigned';
    ticket.updatedAt = new Date();

    console.log(`👤 分配工单 ${ticketId} 给工程师 ${engineerId}`);
    return true;
  }

  private isValidStatusTransition(
    currentStatus: Ticket['status'],
    newStatus: Ticket['status']
  ): boolean {
    const validTransitions: Record<Ticket['status'], Ticket['status'][]> = {
      pending: ['assigned', 'cancelled'],
      assigned: ['in_progress', 'pending', 'cancelled'],
      in_progress: ['completed', 'assigned', 'cancelled'],
      completed: [], // 已完成的工单不能再变更状态
      cancelled: [], // 已取消的工单不能再变更状态
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private calculateSettlementAmount(ticket: Ticket): number {
    // 简化计算: 根据故障类型计算费用
    const baseAmounts: Record<string, number> = {
      硬件故障: 500,
      软件故障: 300,
      网络问题: 400,
      系统升级: 200,
      定期维护: 150,
    };

    const baseAmount = baseAmounts[ticket.faultType] || 350;

    // 根据耗时调整费用
    const duration = ticket.completedAt
      ? ticket.completedAt.getTime() - ticket.createdAt.getTime()
      : 3600000; // 默认1小时

    const hours = duration / 3600000;
    const timeMultiplier = Math.min(Math.max(hours / 2, 0.5), 3); // 0.5x - 3x

    return Math.round(baseAmount * timeMultiplier);
  }

  /**
   * 获取工单详情
   */
  async getTicket(ticketId: string): Promise<Ticket | undefined> {
    return this.tickets.get(ticketId);
  }

  /**
   * 获取所有工单
   */
  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  /**
   * 按状态查询工单
   */
  async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(t => t.status === status);
  }

  /**
   * 按工程师查询工单
   */
  async getTicketsByEngineer(engineerId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      t => t.engineerId === engineerId
    );
  }
}

// 导出单例实例
export const ticketManagementService = new TicketManagementService();
