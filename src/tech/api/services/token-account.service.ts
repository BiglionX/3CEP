// Token账户管理服务

import { supabase, supabaseAdmin } from '@/lib/supabase';
import {
  TokenAccount,
  TokenTransaction,
  TokenPackage,
  BillingRule,
  CreateTokenAccountDTO,
  TokenTransactionDTO,
  TokenTransactionQuery,
  AccountBalanceResponse,
  ConsumeTokensDTO,
} from '@/models/token-account.model';

export class TokenAccountService {
  private supabase = supabase;
  private supabaseAdmin = supabaseAdmin;

  /**
   * 创建Token账户
   */
  async createAccount(dto: CreateTokenAccountDTO): Promise<TokenAccount> {
    const { data, error } = await this.supabase
      .from('token_accounts')
      .insert([
        {
          user_id: dto.userId,
          brand_id: dto.brandId,
          balance: 0,
          total_consumed: 0,
          total_purchased: 0,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw new Error(`创建Token账户失败: ${error.message}`);
    return data;
  }

  /**
   * 获取用户Token账户
   */
  async getUserAccount(userId: string): Promise<TokenAccount | null> {
    const { data, error } = await this.supabase
      .from('token_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`获取用户账户失败: ${error.message}`);
    }

    return data || null;
  }

  /**
   * 获取品牌商Token账户
   */
  async getBrandAccount(brandId: string): Promise<TokenAccount | null> {
    const { data, error } = await this.supabase
      .from('token_accounts')
      .select('*')
      .eq('brand_id', brandId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`获取品牌商账户失? ${error.message}`);
    }

    return data || null;
  }

  /**
   * 获取账户余额信息
   */
  async getAccountBalance(accountId: string): Promise<AccountBalanceResponse> {
    // 获取账户信息
    const { data: account, error: accountError } = await this.supabase
      .from('token_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError)
      throw new Error(`获取账户信息失败: ${accountError.message}`);

    // 获取最?0笔交易记?    const { data: transactions, error: txError } = await this.supabase
      .from('token_transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (txError) throw new Error(`获取交易记录失败: ${txError.message}`);

    return {
      accountId: account.id,
      currentBalance: account.balance,
      totalConsumed: account.total_consumed,
      totalPurchased: account.total_purchased,
      recentTransactions: transactions || [],
    };
  }

  /**
   * 消费Token
   */
  async consumeTokens(
    dto: ConsumeTokensDTO
  ): Promise<{ success: boolean; remainingBalance: number }> {
    // 获取计费规则
    const billingRule = await this.getBillingRule(dto.serviceType);
    if (!billingRule) {
      throw new Error(`未找到服务类?${dto.serviceType} 的计费规则`);
    }

    // 计算消耗的Token数量
    const tokensToConsume = billingRule.costPerUnit * dto.usageAmount;

    // 创建消费交易记录（触发器会自动扣减余额）
    const transaction: TokenTransactionDTO = {
      accountId: dto.accountId,
      amount: -tokensToConsume, // 负数表示消费
      transactionType: 'consumption',
      description: dto.description,
      referenceId: undefined,
    };

    const result = await this.createTransaction(transaction);

    // 获取最新余?    const balanceInfo = await this.getAccountBalance(dto.accountId);

    return {
      success: result !== null,
      remainingBalance: balanceInfo.currentBalance,
    };
  }

  /**
   * 充值Token（通过购买套餐?   */
  async addTokens(
    accountId: string,
    tokens: number,
    description: string,
    referenceId?: string
  ): Promise<TokenTransaction | null> {
    const transaction: TokenTransactionDTO = {
      accountId,
      amount: tokens,
      transactionType: 'purchase',
      description,
      referenceId,
    };

    return this.createTransaction(transaction);
  }

  /**
   * 创建交易记录
   */
  async createTransaction(
    dto: TokenTransactionDTO
  ): Promise<TokenTransaction | null> {
    const { data, error } = await this.supabase
      .from('token_transactions')
      .insert([
        {
          account_id: dto.accountId,
          amount: dto.amount,
          transaction_type: dto.transactionType,
          reference_id: dto.referenceId,
          description: dto.description,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('创建交易记录失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 获取交易记录
   */
  async getTransactions(
    query: TokenTransactionQuery
  ): Promise<TokenTransaction[]> {
    let supabaseQuery = this.supabase
      .from('token_transactions')
      .select(
        `
        *,
        token_accounts(user_id, brand_id)
      `
      )
      .order('created_at', { ascending: false });

    // 应用查询条件
    if (query.accountId) {
      supabaseQuery = supabaseQuery.eq('account_id', query.accountId);
    }

    if (query.transactionType) {
      supabaseQuery = supabaseQuery.eq(
        'transaction_type',
        query.transactionType
      );
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('created_at', query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('created_at', query.endDate);
    }

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    if (query.offset) {
      supabaseQuery = supabaseQuery.range(
        query.offset,
        query.offset + (query.limit || 10) - 1
      );
    }

    const { data, error } = await supabaseQuery;

    if (error) throw new Error(`获取交易记录失败: ${error.message}`);
    return data || [];
  }

  /**
   * 获取计费规则
   */
  private async getBillingRule(
    serviceType: string
  ): Promise<BillingRule | null> {
    const { data, error } = await this.supabase
      .from('billing_rules')
      .select('*')
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('获取计费规则失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 获取所有活跃的Token套餐
   */
  async getActivePackages(): Promise<TokenPackage[]> {
    const { data, error } = await this.supabase
      .from('token_packages')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`获取套餐列表失败: ${error.message}`);
    return data || [];
  }

  /**
   * 验证账户余额是否充足
   */
  async hasSufficientBalance(
    accountId: string,
    requiredTokens: number
  ): Promise<boolean> {
    const balanceInfo = await this.getAccountBalance(accountId);
    return balanceInfo.currentBalance >= requiredTokens;
  }

  /**
   * 冻结账户
   */
  async freezeAccount(accountId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('token_accounts')
      .update({ status: 'frozen' } as any)
      .eq('id', accountId);

    if (error) {
      console.error('冻结账户失败:', error);
      return false;
    }

    return true;
  }

  /**
   * 解冻账户
   */
  async unfreezeAccount(accountId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('token_accounts')
      .update({ status: 'active' } as any)
      .eq('id', accountId);

    if (error) {
      console.error('解冻账户失败:', error);
      return false;
    }

    return true;
  }
}
