/**
 * 客户服务 - 客户信息管理、分级评? */

import { createClient } from '@supabase/supabase-js';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerGrade,
  CustomerMetrics,
  CustomerGradeResult,
} from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class CustomerService {
  /**
   * 获取客户列表
   */
  async getCustomers(params?: {
    grade?: CustomerGrade;
    status?: string;
    industry?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    try {
      let query = supabase
        .from('sales_customers')
        .select('*', { count: 'exact' });

      if (params?.grade) {
        query = query.eq('grade', params.grade);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.industry) {
        query = query.eq('industry', params.industry);
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
        customers: data as Customer[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * 获取客户详情
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('sales_customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      return data as Customer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  /**
   * 创建客户
   */
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('sales_customers')
        .insert([
          {
            ...input,
            status: 'active',
            total_revenue: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * 更新客户信息
   */
  async updateCustomer(
    customerId: string,
    input: UpdateCustomerInput
  ): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('sales_customers')
        .update({
          ...input,
          updated_at: new Date(),
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      return data as Customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * 删除客户
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales_customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  /**
   * 评估客户等级
   */
  async evaluateCustomerGrade(
    customerId: string
  ): Promise<CustomerGradeResult> {
    try {
      // 获取客户信息
      const customer = await this.getCustomer(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // 计算客户指标
      const metrics = await this.calculateCustomerMetrics(customerId);

      // 计算评分
      const score = this.calculateGradeScore(metrics);

      // 确定建议等级
      const suggestedGrade = this.determineGradeFromScore(score);

      // 判断是否需要调整等?      const shouldUpgrade =
        suggestedGrade > this.gradeToNumber(customer.grade || 'D');
      const shouldDowngrade =
        suggestedGrade < this.gradeToNumber(customer.grade || 'A');

      return {
        customerId,
        currentGrade: customer.grade || 'D',
        suggestedGrade,
        score,
        metrics,
        shouldUpgrade,
        shouldDowngrade,
      };
    } catch (error) {
      console.error('Error evaluating customer grade:', error);
      throw error;
    }
  }

  /**
   * 批量评估客户等级
   */
  async batchEvaluateCustomerGrades(
    customerIds?: string[]
  ): Promise<CustomerGradeResult[]> {
    try {
      let customers: Customer[] = [];

      if (customerIds && customerIds.length > 0) {
        // 获取指定客户
        const { data, error } = await supabase
          .from('sales_customers')
          .select('*')
          .in('id', customerIds);

        if (error) throw error;
        customers = data as Customer[];
      } else {
        // 获取所有客?        const { data, error } = await supabase
          .from('sales_customers')
          .select('*');

        if (error) throw error;
        customers = data as Customer[];
      }

      // 并行评估所有客?      const results = await Promise.all(
        customers.map(customer => this.evaluateCustomerGrade(customer.id))
      );

      return results;
    } catch (error) {
      console.error('Error batch evaluating customer grades:', error);
      throw error;
    }
  }

  /**
   * 应用建议的客户等?   */
  async applyCustomerGrade(customerId: string): Promise<Customer> {
    try {
      const evaluation = await this.evaluateCustomerGrade(customerId);

      if (evaluation.shouldUpgrade || evaluation.shouldDowngrade) {
        return await this.updateCustomer(customerId, {
          grade: evaluation.suggestedGrade,
        });
      }

      return await this.getCustomer(customerId)!;
    } catch (error) {
      console.error('Error applying customer grade:', error);
      throw error;
    }
  }

  /**
   * 搜索客户
   */
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('sales_customers')
        .select('*')
        .or(
          `company_name.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
        )
        .limit(50);

      if (error) throw error;

      return data as Customer[];
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  /**
   * 获取客户统计信息
   */
  async getCustomerStatistics(): Promise<{
    total: number;
    byGrade: Record<CustomerGrade, number>;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('sales_customers')
        .select('grade, status, industry');

      if (error) throw error;

      const stats = {
        total: data.length,
        byGrade: {} as Record<CustomerGrade, number>,
        byStatus: {} as Record<string, number>,
        byIndustry: {} as Record<string, number>,
      };

      data.forEach((customer: any) => {
        const grade = customer.grade as CustomerGrade;
        stats.byGrade[grade] = (stats.byGrade[grade] || 0) + 1;

        stats.byStatus[customer.status] =
          (stats.byStatus[customer.status] || 0) + 1;

        if (customer.industry) {
          stats.byIndustry[customer.industry] =
            (stats.byIndustry[customer.industry] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching customer statistics:', error);
      throw error;
    }
  }

  /**
   * 私有方法：计算客户指?   */
  private async calculateCustomerMetrics(
    customerId: string
  ): Promise<CustomerMetrics> {
    // 从订单表获取历史数据
    const { data: orders } = await supabase
      .from('sales_orders')
      .select('total_amount, created_at')
      .eq('customer_id', customerId)
      .eq('status', 'completed')
      .order('created_at', { ascending: true });

    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        orderFrequency: 0,
        avgOrderValue: 0,
        paymentSpeed: 0,
        growthRate: 0,
        cooperationYears: 0,
      };
    }

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const avgOrderValue = totalRevenue / orders.length;

    // 计算合作年限
    const firstOrderDate = new Date(orders[0].created_at);
    const lastOrderDate = new Date(orders[orders.length - 1].created_at);
    const cooperationYears =
      (lastOrderDate.getTime() - firstOrderDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365);

    // 计算下单频率（次/年）
    const orderFrequency =
      cooperationYears > 0 ? orders.length / cooperationYears : orders.length;

    // 计算增长率（简化版本）
    const growthRate = this.calculateGrowthRate(orders);

    // 计算回款速度（需要财务数据，这里简化）
    const paymentSpeed = 30; // 默认 30 �?
    return {
      totalRevenue,
      orderFrequency,
      avgOrderValue,
      paymentSpeed,
      growthRate,
      cooperationYears,
    };
  }

  /**
   * 私有方法：计算评?   */
  private calculateGradeScore(metrics: CustomerMetrics): number {
    const score =
      (metrics.totalRevenue / 100000) * 30 + // 收入贡献 30 �?      Math.min(metrics.orderFrequency, 10) * 2 + // 下单频率 20 �?      (metrics.avgOrderValue / 10000) * 20 + // 平均订单 20 �?      Math.min(365 / metrics.paymentSpeed, 10) * 10 + // 回款速度 10 �?      Math.min(metrics.growthRate, 1) * 10 + // 增长?10 �?      Math.min(metrics.cooperationYears, 10) * 10; // 合作年限 10 �?
    return Math.min(Math.round(score), 100);
  }

  /**
   * 私有方法：根据评分确定等?   */
  private determineGradeFromScore(score: number): CustomerGrade {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    return 'D';
  }

  /**
   * 私有方法：等级转数字
   */
  private gradeToNumber(grade: CustomerGrade): number {
    const mapping = { A: 4, B: 3, C: 2, D: 1 };
    return mapping[grade];
  }

  /**
   * 私有方法：计算增长率
   */
  private calculateGrowthRate(
    orders: Array<{ total_amount: number; created_at: string }>
  ): number {
    if (orders.length < 2) return 0;

    // 按年份分?    const revenueByYear: Record<number, number> = {};
    orders.forEach(order => {
      const year = new Date(order.created_at).getFullYear();
      revenueByYear[year] = (revenueByYear[year] || 0) + order.total_amount;
    });

    const years = Object.keys(revenueByYear)
      .map(Number)
      .sort((a, b) => a - b);
    if (years.length < 2) return 0;

    const lastYear = years[years.length - 1];
    const prevYear = years[years.length - 2];

    const growth =
      (revenueByYear[lastYear] - revenueByYear[prevYear]) /
      revenueByYear[prevYear];
    return growth;
  }
}

// 导出单例
export const customerService = new CustomerService();
