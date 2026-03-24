/**
 * 数据库事务管理器使用示例
 *
 * 展示如何在实际业务场景中使用 TransactionManager
 */

import { TransactionManager } from '@/tech/database/transaction.manager';

/**
 * 示例 1: 用户创建 + 默认角色分配
 *
 * 场景：创建新用户时，同时为其分配默认角色
 * 确保两个操作要么都成功，要么都失败
 */
export async function createUserWithRole(userData: {
  email: string;
  password: string;
  name: string;
}) {
  const operations = [
    // 操作 1: 创建用户
    async (tx: any) => {
      const { data: user, error } = await tx
        .from('users')
        .insert([
          {
            email: userData.email,
            password_hash: userData.password, // 实际应用中应该先加密
            name: userData.name,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return user;
    },

    // 操作 2: 分配默认角色
    async (tx: any, user?: any) => {
      const userId = user?.id;
      const { data: role, error } = await tx
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role: 'user', // 默认角色
            granted_by: 'system',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return role;
    },
  ];

  try {
    const result = await TransactionManager.execute(operations, {
      retryCount: 2,
      timeout: 5000,
      verbose: true,
    });

    console.log('✅ 用户创建成功并分配默认角色');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ 用户创建失败:', error);
    return { success: false, error };
  }
}

/**
 * 示例 2: 订单创建 + 库存扣减
 *
 * 场景：用户下单时，创建订单并扣减商品库存
 */
export async function createOrderWithInventoryDeduction(orderData: {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  totalAmount: number;
}) {
  const operations = orderData.items.flatMap(item => [
    // 为每个商品创建订单项
    async (tx: any, order?: any) => {
      const { data: orderItem, error } = await tx
        .from('order_items')
        .insert([
          {
            order_id: order?.id,
            product_id: item.productId,
            quantity: item.quantity,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return orderItem;
    },

    // 扣减库存
    async (tx: any) => {
      // 先查询当前库存
      const { data: product } = await tx
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single();

      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`库存不足: ${item.productId}`);
      }

      // 扣减库存
      const { error } = await tx
        .from('products')
        .update({ stock_quantity: product.stock_quantity - item.quantity })
        .eq('id', item.productId);

      if (error) throw error;
    },
  ]);

  // 先创建订单主记录
  operations.unshift(async (tx: any) => {
    const { data: order, error } = await tx
      .from('orders')
      .insert([
        {
          user_id: orderData.userId,
          total_amount: orderData.totalAmount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return order;
  });

  try {
    const result = await TransactionManager.execute(operations, {
      retryCount: 3,
      timeout: 10000,
      verbose: true,
    });

    console.log('✅ 订单创建成功并扣减库存');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ 订单创建失败:', error);
    return { success: false, error };
  }
}

/**
 * 示例 3: Token 充值 + 交易记录
 *
 * 场景：用户充值 Token 时，更新余额并记录交易日志
 */
export async function rechargeTokens(
  userId: string,
  amount: number,
  packageId: string
) {
  const operations = [
    // 操作 1: 更新用户 Token 余额
    async (tx: any) => {
      const { data: balance, error } = await tx
        .from('token_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = 未找到记录
        throw error;
      }

      let result;
      if (balance) {
        // 更新现有余额
        result = await tx
          .from('token_balances')
          .update({
            balance_paid: balance.balance_paid + amount,
            last_recharge: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // 创建新余额记录
        result = await tx
          .from('token_balances')
          .insert([
            {
              user_id: userId,
              balance_free: 0,
              balance_paid: amount,
              balance_promotion: 0,
            },
          ])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },

    // 操作 2: 创建交易记录
    async (tx: any) => {
      const { data: transaction, error } = await tx
        .from('token_transactions')
        .insert([
          {
            user_id: userId,
            type: 'recharge',
            amount: amount,
            package_id: packageId,
            status: 'completed',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return transaction;
    },
  ];

  try {
    const result = await TransactionManager.execute(operations, {
      retryCount: 2,
      timeout: 5000,
      verbose: true,
    });

    console.log(`✅ Token 充值成功：+${amount}`);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Token 充值失败:', error);
    throw error;
  }
}

/**
 * 示例 4: FXC 兑换 + 账户更新
 *
 * 场景：外汇兑换时，更新两个账户的余额
 */
export async function exchangeCurrency(
  fromUserId: string,
  toUserId: string,
  fromAmount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
) {
  const toAmount = fromAmount * exchangeRate;

  const operations = [
    // 操作 1: 扣减源账户余额
    async (tx: any) => {
      const { data: fromAccount, error } = await tx
        .from('fxc_accounts')
        .select('*')
        .eq('user_id', fromUserId)
        .eq('currency', fromCurrency)
        .single();

      if (error) throw error;
      if (fromAccount.balance < fromAmount) {
        throw new Error('源账户余额不足');
      }

      const { error: updateError } = await tx
        .from('fxc_accounts')
        .update({ balance: fromAccount.balance - fromAmount })
        .eq('user_id', fromUserId)
        .eq('currency', fromCurrency);

      if (updateError) throw updateError;
    },

    // 操作 2: 增加目标账户余额
    async (tx: any) => {
      const { data: toAccount, error } = await tx
        .from('fxc_accounts')
        .select('*')
        .eq('user_id', toUserId)
        .eq('currency', toCurrency)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let result;
      if (toAccount) {
        result = await tx
          .from('fxc_accounts')
          .update({ balance: toAccount.balance + toAmount })
          .eq('user_id', toUserId)
          .eq('currency', toCurrency)
          .select()
          .single();
      } else {
        result = await tx
          .from('fxc_accounts')
          .insert([
            {
              user_id: toUserId,
              currency: toCurrency,
              balance: toAmount,
            },
          ])
          .select()
          .single();
      }

      if (result.error) throw result.error;
    },

    // 操作 3: 创建兑换记录
    async (tx: any) => {
      const { data: record, error } = await tx
        .from('fxc_transactions')
        .insert([
          {
            from_user_id: fromUserId,
            to_user_id: toUserId,
            from_currency: fromCurrency,
            to_currency: toCurrency,
            from_amount: fromAmount,
            to_amount: toAmount,
            exchange_rate: exchangeRate,
            type: 'exchange',
            status: 'completed',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return record;
    },
  ];

  try {
    const result = await TransactionManager.execute(operations, {
      retryCount: 3,
      timeout: 10000,
      verbose: true,
    });

    console.log(
      `✅ 兑换成功：${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency} (@${exchangeRate})`
    );
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ 兑换失败:', error);
    throw error;
  }
}

/**
 * 示例 5: 使用补偿机制的复杂事务
 *
 * 场景：需要回滚的复杂业务逻辑
 */
export async function complexBusinessProcess(data: any) {
  const mainOperations = [
    async (tx: any) => {
      // 主业务逻辑 1
      console.log('执行主操作 1...');
      return { step: 1, success: true };
    },
    async (tx: any) => {
      // 主业务逻辑 2
      console.log('执行主操作 2...');
      if (Math.random() > 0.5) {
        throw new Error('模拟随机失败');
      }
      return { step: 2, success: true };
    },
  ];

  const compensations = [
    async () => {
      console.log('补偿操作 2: 回滚主操作 2');
      // 实际的补偿逻辑，如删除创建的记录、恢复更新的数据等
    },
    async () => {
      console.log('补偿操作 1: 回滚主操作 1');
      // 实际的补偿逻辑
    },
  ];

  try {
    const result = await TransactionManager.executeWithCompensation(
      mainOperations,
      compensations,
      { verbose: true }
    );

    console.log('✅ 复杂业务流程执行成功');
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ 复杂业务流程执行失败，已执行补偿操作');
    return { success: false, error };
  }
}

/**
 * 示例 6: 批量操作
 */
export async function batchOperations() {
  // 批量插入
  const insertResult = await TransactionManager.batchInsert('users', [
    { name: '用户 1', email: 'user1@example.com' },
    { name: '用户 2', email: 'user2@example.com' },
    { name: '用户 3', email: 'user3@example.com' },
  ]);

  if (insertResult.success) {
    console.log('✅ 批量插入成功');
  } else {
    console.error('❌ 批量插入失败:', insertResult.error);
  }

  // 批量更新
  const updateResult = await TransactionManager.batchUpdate('users', [
    { where: { id: 1 }, data: { status: 'active' } },
    { where: { id: 2 }, data: { status: 'active' } },
    { where: { id: 3 }, data: { status: 'active' } },
  ]);

  if (updateResult.success) {
    console.log('✅ 批量更新成功');
  } else {
    console.error('❌ 批量更新失败:', updateResult.error);
  }

  // 批量删除
  const deleteResult = await TransactionManager.batchDelete('temp_records', [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ]);

  if (deleteResult.success) {
    console.log('✅ 批量删除成功');
  } else {
    console.error('❌ 批量删除失败:', deleteResult.error);
  }
}

// 导出所有示例函数
export default {
  createUserWithRole,
  createOrderWithInventoryDeduction,
  rechargeTokens,
  exchangeCurrency,
  complexBusinessProcess,
  batchOperations,
};
