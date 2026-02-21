'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';

export interface TokenPackage {
  id: string;
  name: string;
  description: string;
  token_amount: number;
  price: number;
  discount_percentage: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserTokenBalance {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_consumed: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  payment_data: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'consume' | 'refund' | 'bonus';
  amount: number;
  balance_before: number;
  balance_after: number;
  package_id: string | null;
  payment_id: string | null;
  description: string | null;
  created_at: string;
}

// 获取所有可用的Token套餐
export async function getTokenPackages(): Promise<{ data: TokenPackage[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('token_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('获取Token套餐失败:', error);
    return { data: [], error: '获取Token套餐失败' };
  }
}

// 获取用户Token余额
export async function getUserTokenBalance(userId: string): Promise<{ data: UserTokenBalance | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116表示没有找到记录
      throw error;
    }

    // 如果用户没有Token记录，创建默认记录
    if (!data) {
      const { data: newRecord, error: insertError } = await supabase
        .from('user_tokens')
        .insert({
          user_id: userId,
          balance: 0,
          total_purchased: 0,
          total_consumed: 0
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return { data: newRecord, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('获取用户Token余额失败:', error);
    return { data: null, error: '获取用户Token余额失败' };
  }
}

// 创建支付订单
export async function createPaymentOrder(
  userId: string,
  packageId: string,
  paymentMethod: string
): Promise<{ data: Payment | null; error: string | null }> {
  try {
    // 获取套餐信息
    const { data: packageData, error: packageError } = await supabase
      .from('token_packages')
      .select('price')
      .eq('id', packageId)
      .single();

    if (packageError) throw packageError;
    if (!packageData) throw new Error('套餐不存在');

    // 创建支付记录
    const { data, error } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: packageData.price,
        payment_method: paymentMethod,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('创建支付订单失败:', error);
    return { data: null, error: '创建支付订单失败' };
  }
}

// 完成支付
export async function completePayment(
  paymentId: string,
  transactionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 更新支付状态
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: 'completed',
        transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('user_id, package_id, amount')
      .single();

    if (updateError) throw updateError;

    // 获取套餐对应的Token数量
    const { data: packageData, error: packageError } = await supabase
      .from('token_packages')
      .select('token_amount')
      .eq('id', payment.package_id)
      .single();

    if (packageError) throw packageError;

    // 更新用户Token余额
    const userId = payment.user_id;
    const tokenAmount = packageData.token_amount;

    // 获取当前余额
    const { data: currentBalance } = await supabase
      .from('user_tokens')
      .select('balance, total_purchased')
      .eq('user_id', userId)
      .single();

    if (currentBalance) {
      // 更新现有记录
      const { error: updateTokenError } = await supabase
        .from('user_tokens')
        .update({
          balance: currentBalance.balance + tokenAmount,
          total_purchased: currentBalance.total_purchased + tokenAmount,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateTokenError) throw updateTokenError;
    } else {
      // 创建新记录
      const { error: insertTokenError } = await supabase
        .from('user_tokens')
        .insert({
          user_id: userId,
          balance: tokenAmount,
          total_purchased: tokenAmount,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertTokenError) throw insertTokenError;
    }

    // 记录交易
    await recordTokenTransaction(
      userId,
      'purchase',
      tokenAmount,
      currentBalance?.balance || 0,
      (currentBalance?.balance || 0) + tokenAmount,
      paymentId,
      payment.package_id,
      `购买${tokenAmount}个Token`
    );

    return { success: true, error: null };
  } catch (error) {
    console.error('完成支付失败:', error);
    return { success: false, error: '完成支付失败' };
  }
}

// 消费Token
export async function consumeTokens(
  userId: string,
  amount: number,
  description?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // 获取当前余额
    const { data: currentBalance, error: balanceError } = await supabase
      .from('user_tokens')
      .select('balance, total_consumed')
      .eq('user_id', userId)
      .single();

    if (balanceError) throw balanceError;

    if (!currentBalance || currentBalance.balance < amount) {
      return { success: false, error: 'Token余额不足' };
    }

    // 更新余额
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({
        balance: currentBalance.balance - amount,
        total_consumed: currentBalance.total_consumed + amount,
        last_updated: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // 记录交易
    await recordTokenTransaction(
      userId,
      'consume',
      -amount,
      currentBalance.balance,
      currentBalance.balance - amount,
      null,
      null,
      description || `消费${amount}个Token`
    );

    return { success: true, error: null };
  } catch (error) {
    console.error('消费Token失败:', error);
    return { success: false, error: '消费Token失败' };
  }
}

// 获取用户交易记录
export async function getUserTransactions(
  userId: string,
  limit: number = 20
): Promise<{ data: TokenTransaction[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return { data: [], error: '获取交易记录失败' };
  }
}

// 记录Token交易
async function recordTokenTransaction(
  userId: string,
  transactionType: 'purchase' | 'consume' | 'refund' | 'bonus',
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  paymentId: string | null,
  packageId: string | null,
  description: string
): Promise<void> {
  try {
    await supabase.from('token_transactions').insert({
      user_id: userId,
      transaction_type: transactionType,
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      payment_id: paymentId,
      package_id: packageId,
      description: description,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('记录Token交易失败:', error);
  }
}