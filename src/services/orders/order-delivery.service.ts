/**
 * 订单交付自动化服务
 *
 * 处理支付成功后的自动交付流程：
 * 1. 验证订单支付状态
 * 2. 开通用户权限
 * 3. 发送通知邮件
 * 4. 记录交付日志
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface OrderDeliveryResult {
  success: boolean;
  orderId: string;
  userId: string;
  agentId: string;
  permissionsGranted: string[];
  notificationsSent: string[];
  errors?: string[];
}

/**
 * 订单交付服务类
 */
export class OrderDeliveryService {
  /**
   * 处理订单交付
   */
  static async processOrder(orderId: string): Promise<OrderDeliveryResult> {
    const errors: string[] = [];
    const permissionsGranted: string[] = [];
    const notificationsSent: string[] = [];

    try {
      // 1. 获取订单信息
      const order = await this.getOrderDetails(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 2. 验证支付状态
      if (order.status !== 'completed' && order.payment_status !== 'paid') {
        throw new Error('订单未支付或支付未完成');
      }

      // 3. 检查是否已交付
      if (order.is_delivered) {
        console.log(`订单 ${orderId} 已经交付，跳过`);
        return {
          success: true,
          orderId,
          userId: order.user_id,
          agentId: order.agent_id,
          permissionsGranted: [],
          notificationsSent: [],
          errors: ['订单已交付'],
        };
      }

      // 4. 开通用户权限
      const grantedPermissions = await this.grantUserPermissions(
        order.user_id,
        order.agent_id,
        order.license_type
      );
      permissionsGranted.push(...grantedPermissions);

      // 5. 更新订单交付状态
      await this.markOrderAsDelivered(orderId);

      // 6. 发送通知
      const notificationResults = await this.sendNotifications(order);
      notificationsSent.push(...notificationResults);

      // 7. 记录交付日志
      await this.logDelivery(orderId, order.user_id, order.agent_id);

      console.log(`订单 ${orderId} 交付完成`);

      return {
        success: true,
        orderId,
        userId: order.user_id,
        agentId: order.agent_id,
        permissionsGranted,
        notificationsSent,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      errors.push(errorMessage);
      console.error(`订单 ${orderId} 交付失败:`, errorMessage);

      // 记录失败日志
      await this.logDeliveryFailure(orderId, errorMessage);

      return {
        success: false,
        orderId,
        userId: '',
        agentId: '',
        permissionsGranted: [],
        notificationsSent: [],
        errors,
      };
    }
  }

  /**
   * 获取订单详情
   */
  private static async getOrderDetails(orderId: string) {
    const { data, error } = await supabase
      .from('agent_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 开通用户权限
   */
  private static async grantUserPermissions(
    userId: string,
    agentId: string,
    licenseType: string
  ): Promise<string[]> {
    const permissions: string[] = [];

    // 根据许可证类型分配权限
    const permissionMap: Record<string, string[]> = {
      basic: ['use_agent', 'view_docs'],
      premium: [
        'use_agent',
        'view_docs',
        'priority_support',
        'advanced_features',
      ],
      enterprise: [
        'use_agent',
        'view_docs',
        'priority_support',
        'advanced_features',
        'custom_integration',
        'dedicated_support',
      ],
    };

    const grantedPermissions =
      permissionMap[licenseType] || permissionMap.basic;

    // 创建或更新用户 - 智能体关联
    const { error } = await supabase
      .from('user_agent_permissions')
      .upsert({
        user_id: userId,
        agent_id: agentId,
        permissions: grantedPermissions,
        granted_at: new Date().toISOString(),
        expires_at: this.calculateExpiryDate(licenseType),
      })
      .onConflict('user_id,agent_id')
      .update({
        permissions: grantedPermissions,
        granted_at: new Date().toISOString(),
        expires_at: this.calculateExpiryDate(licenseType),
      });

    if (error) throw error;

    permissions.push(...grantedPermissions);
    console.log(`为用户 ${userId} 开通权限：`, permissions);

    return permissions;
  }

  /**
   * 计算过期时间
   */
  private static calculateExpiryDate(licenseType: string): string {
    const now = new Date();

    switch (licenseType) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case 'lifetime':
        // 终身版设置为 99 年后
        now.setFullYear(now.getFullYear() + 99);
        break;
      default:
        now.setFullYear(now.getFullYear() + 1); // 默认 1 年
    }

    return now.toISOString();
  }

  /**
   * 标记订单为已交付
   */
  private static async markOrderAsDelivered(orderId: string) {
    const { error } = await supabase
      .from('agent_orders')
      .update({
        is_delivered: true,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  /**
   * 发送通知
   */
  private static async sendNotifications(order: any): Promise<string[]> {
    const notifications: string[] = [];

    try {
      // 1. 获取用户邮箱
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single();

      if (userProfile?.email) {
        // 2. 发送交付确认邮件
        await this.sendDeliveryEmail(userProfile.email, order);
        notifications.push('delivery_email');

        // 3. 发送站内通知
        await this.sendInAppNotification(order.user_id, order);
        notifications.push('in_app_notification');
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      // 通知失败不影响主流程
    }

    return notifications;
  }

  /**
   * 发送交付确认邮件
   */
  private static async sendDeliveryEmail(email: string, order: any) {
    // TODO: 集成邮件发送服务
    console.log(`发送交付确认邮件到：${email}`);
    console.log('订单详情:', order);

    // 示例：使用 SendGrid 或其他邮件服务
    // await sendgrid.send({
    //   to: email,
    //   subject: '订单交付确认',
    //   html: `
    //     <h1>感谢您的购买！</h1>
    //     <p>您的订单已交付，现在可以开始使用智能体服务。</p>
    //     <p>订单号：${order.id}</p>
    //     <p>智能体：${order.agent_name}</p>
    //     <p>许可证类型：${order.license_type}</p>
    //   `,
    // });
  }

  /**
   * 发送站内通知
   */
  private static async sendInAppNotification(userId: string, order: any) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'order_delivered',
      title: '订单交付成功',
      content: `您购买的智能体 "${order.agent_name}" 已交付，许可证类型：${order.license_type}`,
      metadata: {
        order_id: order.id,
        agent_id: order.agent_id,
      },
      is_read: false,
    });

    if (error) throw error;
  }

  /**
   * 记录交付日志
   */
  private static async logDelivery(
    orderId: string,
    userId: string,
    agentId: string
  ) {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action_type: 'DELIVER',
      resource_type: 'order',
      resource_id: orderId,
      changes: {
        order_id: orderId,
        user_id: userId,
        agent_id: agentId,
        action: 'order_delivered',
      },
      ip_address: '',
      user_agent: '',
    });

    if (error) throw error;
  }

  /**
   * 记录交付失败日志
   */
  private static async logDeliveryFailure(orderId: string, reason: string) {
    const { error } = await supabase.from('audit_logs').insert({
      action_type: 'DELIVERY_FAILED',
      resource_type: 'order',
      resource_id: orderId,
      changes: {
        order_id,
        failure_reason: reason,
      },
      ip_address: '',
      user_agent: '',
    });

    if (error) throw error;
  }

  /**
   * 批量处理待交付订单
   */
  static async processPendingOrders(): Promise<{
    total: number;
    success: number;
    failed: number;
  }> {
    try {
      // 获取所有已支付但未交付的订单
      const { data: pendingOrders, error } = await supabase
        .from('agent_orders')
        .select('id')
        .eq('status', 'completed')
        .eq('payment_status', 'paid')
        .eq('is_delivered', false);

      if (error) throw error;

      const total = pendingOrders?.length || 0;
      let successCount = 0;
      let failedCount = 0;

      // 并行处理所有订单
      const results = await Promise.allSettled(
        pendingOrders?.map(order => this.processOrder(order.id)) || []
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failedCount++;
        }
      });

      return {
        total,
        success: successCount,
        failed: failedCount,
      };
    } catch (error) {
      console.error('批量处理订单失败:', error);
      return {
        total: 0,
        success: 0,
        failed: 0,
      };
    }
  }
}
