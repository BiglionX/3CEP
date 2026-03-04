/**
 * 合同服务 - 合同管理、电子签署、谈判支? */

import { createClient } from '@supabase/supabase-js';
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  PaymentTerm,
  DeliveryTerm,
} from '../types';
import { quotationService } from './quotation.service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class ContractService {
  /**
   * 获取合同列表
   */
  async getContracts(params?: {
    customerId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ contracts: Contract[]; total: number }> {
    try {
      let query = supabase
        .from('sales_contracts')
        .select('*', { count: 'exact' });

      if (params?.customerId) {
        query = query.eq('customer_id', params.customerId);
      }

      if (params?.status) {
        query = query.eq('status', params.status);
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
        contracts: data as Contract[],
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * 获取合同详情
   */
  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const { data, error } = await supabase
        .from('sales_contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;

      return data as Contract;
    } catch (error) {
      console.error('Error fetching contract:', error);
      return null;
    }
  }

  /**
   * 创建合同
   */
  async createContract(input: CreateContractInput): Promise<Contract> {
    try {
      // 如果有关联的报价单，获取报价信息
      let customerId = input.customer_id;
      let amount = input.amount;

      if (input.quotation_id) {
        const quotation = await quotationService.getQuotation(
          input.quotation_id
        );
        if (quotation) {
          customerId = quotation.customer_id;
          amount = quotation.total_amount;
        }
      }

      // 生成合同编号
      const contractNumber = await this.generateContractNumber();

      // 插入数据?      const { data, error } = await supabase
        .from('sales_contracts')
        .insert([
          {
            ...input,
            customer_id: customerId,
            contract_number: contractNumber,
            amount,
            status: 'draft',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data as Contract;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * 更新合同
   */
  async updateContract(
    contractId: string,
    input: UpdateContractInput
  ): Promise<Contract> {
    try {
      const { data, error } = await supabase
        .from('sales_contracts')
        .update({
          ...input,
          updated_at: new Date(),
        })
        .eq('id', contractId)
        .select()
        .single();

      if (error) throw error;

      return data as Contract;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  }

  /**
   * 提交合同进行谈判
   */
  async submitForNegotiation(contractId: string): Promise<Contract> {
    try {
      return await this.updateContract(contractId, {
        status: 'negotiating',
      });
    } catch (error) {
      console.error('Error submitting for negotiation:', error);
      throw error;
    }
  }

  /**
   * 完成电子签署
   */
  async signContract(
    contractId: string,
    signedByCustomer: string,
    signedByCompany: string,
    documentUrl: string
  ): Promise<Contract> {
    try {
      return await this.updateContract(contractId, {
        status: 'signed',
        signed_at: new Date(),
        signed_by_customer: signedByCustomer,
        signed_by_company: signedByCompany,
        document_url: documentUrl,
      });
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  }

  /**
   * 完成合同
   */
  async completeContract(contractId: string): Promise<Contract> {
    try {
      return await this.updateContract(contractId, {
        status: 'completed',
      });
    } catch (error) {
      console.error('Error completing contract:', error);
      throw error;
    }
  }

  /**
   * 终止合同
   */
  async terminateContract(
    contractId: string,
    reason?: string
  ): Promise<Contract> {
    try {
      return await this.updateContract(contractId, {
        status: 'terminated',
      });
    } catch (error) {
      console.error('Error terminating contract:', error);
      throw error;
    }
  }

  /**
   * 删除合同
   */
  async deleteContract(contractId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales_contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  /**
   * 获取合同统计
   */
  async getContractStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalAmount: number;
    monthlyGrowth: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('sales_contracts')
        .select('status, amount, created_at');

      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {} as Record<string, number>,
        totalAmount: 0,
        monthlyGrowth: 0,
      };

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      let thisMonthAmount = 0;
      let lastMonthAmount = 0;

      data.forEach((contract: any) => {
        stats.byStatus[contract.status] =
          (stats.byStatus[contract.status] || 0) + 1;
        stats.totalAmount += contract.amount;

        const createdAt = new Date(contract.created_at);
        if (createdAt >= thisMonth) {
          thisMonthAmount += contract.amount;
        } else if (createdAt >= lastMonth && createdAt < thisMonth) {
          lastMonthAmount += contract.amount;
        }
      });

      stats.monthlyGrowth =
        lastMonthAmount > 0
          ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100
          : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching contract statistics:', error);
      throw error;
    }
  }

  /**
   * 即将到期的合?   */
  async getExpiringContracts(daysThreshold: number = 30): Promise<Contract[]> {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from('sales_contracts')
        .select('*')
        .eq('status', 'signed')
        .lte('end_date', thresholdDate.toISOString())
        .order('end_date', { ascending: true });

      if (error) throw error;

      return data as Contract[];
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  }

  /**
   * 私有方法：生成合同编?   */
  private async generateContractNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const { count } = await supabase
      .from('sales_contracts')
      .select('*', { count: 'exact', head: true })
      .gte(
        'created_at',
        new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
      );

    const sequence = String((count || 0) + 1).padStart(4, '0');

    return `CT-${year}${month}-${sequence}`;
  }
}

// 导出单例
export const contractService = new ContractService();
