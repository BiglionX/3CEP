/**
 * 订单服务 - 订单管理、履约跟踪、客户反? */

import { createClient } from '@supabase/supabase-js';
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderStatus,
  OrderTrackingRecord,
  ShippingAddress,
} from '../types';
import { contractService } from './contract.service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class OrderService {
  /**
   * 获取订单列表
   */
  async getOrders(params?: {
    customerId?: string;
    status?: OrderStatus;
    contractId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; total: number }> {
    try {
      let query = supabase.from('sales_orders').select('*', { count: 'exact' });

      if (params?.customerId) {
        query = query.eq('customer_id', params.customerId);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.contractId) {
        query = query.eq('contract_id', params.contractId);
      }

      if (params?.limit) {
        query = query.limit(params.limit);
      }

      if (params?.offset) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 0) - 1
        );
      }

      const { data, error, count } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;

      return {
        orders: data as Order[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * 创建订单
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    try {
      // 如果有关联合同，获取合同信息
      let customerId = input.customer_id;
      let totalAmount = 0;

      if (input.contract_id) {
        const contract = await contractService.getContract(input.contract_id);
        if (contract) {
          customerId = contract.customer_id;
          totalAmount = contract.amount;
        }
      }

      // 计算订单总额
      if (!totalAmount) {
        totalAmount = input.items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );
      }

      // 生成订单编号
      const orderNumber = await this.generateOrderNumber();

      // 插入数据?      const { data, error } = await supabase
        .from('sales_orders')
        .insert([
          {
            ...input,
            order_number: orderNumber,
            customer_id: customerId,
            total_amount: totalAmount,
            paid_amount: 0,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * 更新订单
   */
  async updateOrder(orderId: string, input: UpdateOrderInput): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .update({
          ...input,
          updated_at: new Date(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      return data as Order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * 处理订单
   */
  async processOrder(orderId: string): Promise<Order> {
    try {
      return await this.updateOrder(orderId, {
        status: 'processing',
      });
    } catch (error) {
      console.error('Error processing order:', error);
      throw error;
    }
  }

  /**
   * 发货订单
   */
  async shipOrder(orderId: string, trackingNumber: string): Promise<Order> {
    try {
      return await this.updateOrder(orderId, {
        status: 'shipped',
        tracking_number: trackingNumber,
      });
    } catch (error) {
      console.error('Error shipping order:', error);
      throw error;
    }
  }

  /**
   * 确认送达
   */
  async deliverOrder(orderId: string): Promise<Order> {
    try {
      return await this.updateOrder(orderId, {
        status: 'delivered',
        actual_delivery_date: new Date(),
      });
    } catch (error) {
      console.error('Error delivering order:', error);
      throw error;
    }
  }

  /**
   * 完成订单
   */
  async completeOrder(orderId: string): Promise<Order> {
    try {
      // 如果是合同订单，可能需要同步更新合同状?      const order = await this.getOrder(orderId);
      if (order?.contract_id) {
        await contractService.completeContract(order.contract_id);
      }

      return await this.updateOrder(orderId, {
        status: 'completed',
      });
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      return await this.updateOrder(orderId, {
        status: 'cancelled',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * 提交客户反馈
   */
  async submitFeedback(
    orderId: string,
    feedback: string,
    satisfactionScore: number
  ): Promise<Order> {
    try {
      return await this.updateOrder(orderId, {
        customer_feedback: feedback,
        satisfaction_score: satisfactionScore,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * 删除订单
   */
  async deleteOrder(orderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  /**
   * 获取订单统计
   */
  async getOrderStatistics(): Promise<{
    total: number;
    byStatus: Record<OrderStatus, number>;
    totalAmount: number;
    completedAmount: number;
    avgSatisfactionScore: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('sales_orders')
        .select('status, total_amount, satisfaction_score');

      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {} as Record<OrderStatus, number>,
        totalAmount: 0,
        completedAmount: 0,
        avgSatisfactionScore: 0,
      };

      let satisfactionSum = 0;
      let satisfactionCount = 0;

      data.forEach((order: any) => {
        const status = order.status as OrderStatus;
        if (stats.byStatus[status] !== undefined) {
          stats.byStatus[status] = stats.byStatus[status] + 1;
        } else {
          stats.byStatus[status] = 1;
        }
        stats.totalAmount += order.total_amount;

        if (order.status === 'completed') {
          stats.completedAmount += order.total_amount;
        }

        if (order.satisfaction_score) {
          satisfactionSum += order.satisfaction_score;
          satisfactionCount++;
        }
      });

      stats.avgSatisfactionScore =
        satisfactionCount > 0 ? satisfactionSum / satisfactionCount : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }

  /**
   * 获取订单跟踪记录
   */
  async getOrderTrackingRecords(
    orderId: string
  ): Promise<OrderTrackingRecord[]> {
    try {
      // 注：实际项目中需要创?sales_order_tracking 表来存储跟踪记录
      // 这里简化实现，从订单状态变化推?      const order = await this.getOrder(orderId);
      if (!order) {
        return [];
      }

      const records: OrderTrackingRecord[] = [
        {
          id: `track-1-${orderId}`,
          order_id: orderId,
          timestamp: new Date(order.created_at),
          status: order.status,
          description: '订单创建',
        },
      ];

      // 根据当前状态推断历史轨?      if (
        order.status === 'processing' ||
        ['shipped', 'delivered', 'completed'].includes(order.status)
      ) {
        records.push({
          id: `track-2-${orderId}`,
          order_id: orderId,
          timestamp: new Date(new Date(order.created_at).getTime() + 3600000),
          status: 'processing',
          description: '订单开始处?,
        });
      }

      if (
        order.status === 'shipped' ||
        ['delivered', 'completed'].includes(order.status)
      ) {
        records.push({
          id: `track-3-${orderId}`,
          order_id: orderId,
          timestamp: new Date(new Date(order.created_at).getTime() + 7200000),
          status: 'shipped',
          location: '发货中心',
          description: `订单已发货，运单号：${order.tracking_number || '待更?}`,
        });
      }

      if (order.status === 'delivered' || order.status === 'completed') {
        records.push({
          id: `track-4-${orderId}`,
          order_id: orderId,
          timestamp: order.actual_delivery_date
            ? new Date(order.actual_delivery_date)
            : new Date(),
          status: 'delivered',
          description: '订单已送达',
        });
      }

      if (order.status === 'completed') {
        records.push({
          id: `track-5-${orderId}`,
          order_id: orderId,
          timestamp: new Date(new Date(order.created_at).getTime() + 86400000),
          status: 'completed',
          description: '订单已完?,
        });
      }

      return records;
    } catch (error) {
      console.error('Error fetching order tracking records:', error);
      return [];
    }
  }

  /**
   * 即将逾期交付的订?   */
  async getOverdueRiskOrders(daysThreshold: number = 3): Promise<Order[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from('sales_orders')
        .select('*')
        .in('status', ['pending', 'processing', 'shipped'])
        .lte('expected_delivery_date', thresholdDate.toISOString())
        .order('expected_delivery_date', { ascending: true });

      if (error) throw error;

      return data as Order[];
    } catch (error) {
      console.error('Error fetching overdue risk orders:', error);
      throw error;
    }
  }

  /**
   * 私有方法：生成订单编?   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const { count } = await supabase
      .from('sales_orders')
      .select('*', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      );

    const sequence = String((count || 0) + 1).padStart(4, '0');

    return `SO-${year}${month}-${sequence}`;
  }
}

// 导出单例
export const orderService = new OrderService();
