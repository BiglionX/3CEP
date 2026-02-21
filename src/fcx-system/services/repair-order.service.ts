/**
 * 维修工单服务实现
 * 处理工单创建、确认、完成、取消等核心业务逻辑
 */

import { DeviceEventType, RepairType } from '@/lib/constants/lifecycle';
import { supabase } from '@/lib/supabase';
import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import {
  CompleteRepairOrderDTO,
  CreateRepairOrderDTO,
  FcxTransactionType,
  OrderStatus,
  RepairOrder,
} from '../models/fcx-account.model';
import { generateOrderNumber, generateUUID } from '../utils/helpers';
import {
  validateCompleteOrderDto,
  validateCreateOrderDto,
} from '../utils/validators';
import { FcxAccountService } from './fcx-account.service';
import { FcxTransactionService } from './fcx-transaction.service';
import { IRepairOrderService } from './interfaces';

export class RepairOrderService implements IRepairOrderService {
  private accountService: FcxAccountService;
  private transactionService: FcxTransactionService;
  private lifecycleService: DeviceLifecycleService;

  constructor() {
    this.accountService = new FcxAccountService();
    this.transactionService = new FcxTransactionService();
    this.lifecycleService = new DeviceLifecycleService();
  }

  /**
   * 创建维修工单
   */
  async createOrder(dto: CreateRepairOrderDTO): Promise<RepairOrder> {
    try {
      // 1. 数据验证
      const validation = validateCreateOrderDto(dto);
      if (!validation.isValid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 2. 检查消费者账户是否存在
      const consumerAccount = await this.accountService.getAccountByUserId(
        dto.consumerId
      );
      if (!consumerAccount) {
        throw new Error('消费者账户不存在，请先创建FCX账户');
      }

      // 3. 检查维修店账户是否存在且为联盟成员
      const shopAccount = await this.accountService.getAccountByUserId(
        dto.factoryId
      );
      if (!shopAccount) {
        throw new Error('维修店工厂账户不存在');
      }

      // 4. 验证维修店是否为联盟成员
      const { data: shopData } = await supabase
        .from('repair_shops')
        .select('is_alliance_member, fcx_staked')
        .eq('id', dto.repairShopId)
        .single();

      if (!shopData?.is_alliance_member) {
        throw new Error('该维修店不是联盟成员，无法接收工单');
      }

      if ((shopData.fcx_staked || 0) < 1000) {
        throw new Error('维修店质押金额不足，需要至少1000 FCX');
      }

      // 5. 检查消费者余额是否足够
      const consumerBalance = await this.accountService.getBalance(
        consumerAccount.id
      );
      if (consumerBalance.availableBalance < dto.fcxAmount) {
        throw new Error(
          `余额不足，需要${dto.fcxAmount} FCX，当前余额${consumerBalance.availableBalance} FCX`
        );
      }

      // 6. 冻结消费者资金
      await this.accountService.freeze(consumerAccount.id, dto.fcxAmount);

      // 7. 生成唯一工单编号
      const orderNumber = await this.generateOrderNumber();

      // 8. 创建工单记录
      const orderData = {
        id: generateUUID(),
        order_number: orderNumber,
        consumer_id: dto.consumerId,
        repair_shop_id: dto.repairShopId,
        device_info: dto.deviceInfo,
        fault_description: dto.faultDescription,
        fcx_amount_locked: dto.fcxAmount,
        status: OrderStatus.PENDING,
        factory_id: shopAccount.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('repair_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        // 如果插入失败，解冻资金
        await this.accountService.unfreeze(consumerAccount.id, dto.fcxAmount);
        throw new Error(`创建工单失败: ${error.message}`);
      }

      // 9. 记录交易流水
      await this.transactionService.createTransaction({
        fromAccountId: consumerAccount.id,
        toAccountId: '',
        amount: dto.fcxAmount,
        transactionType: FcxTransactionType.FREEZE,
        referenceId: data.id,
        memo: `创建工单 ${orderNumber} 冻结资金`,
      });

      return this.mapToRepairOrder(data);
    } catch (error) {
      console.error('创建工单错误:', error);
      throw error;
    }
  }

  /**
   * 获取工单详情
   */
  async getOrder(orderId: string): Promise<RepairOrder | null> {
    try {
      const { data, error } = await supabase
        .from('repair_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 工单不存在
        }
        throw new Error(`查询工单失败: ${error.message}`);
      }

      return this.mapToRepairOrder(data);
    } catch (error) {
      console.error('获取工单详情错误:', error);
      throw error;
    }
  }

  /**
   * 确认工单
   */
  async confirmOrder(orderId: string, shopId: string): Promise<RepairOrder> {
    try {
      // 1. 获取工单信息
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('工单不存在');
      }

      // 2. 验证工单状态
      if (order.status !== OrderStatus.PENDING) {
        throw new Error('只有待确认的工单才能被确认');
      }

      // 3. 验证维修店权限
      if (order.repairShopId !== shopId) {
        throw new Error('无权操作此工单');
      }

      // 4. 更新工单状态
      const { data, error } = await supabase
        .from('repair_orders')
        .update({
          status: OrderStatus.CONFIRMED,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`确认工单失败: ${error.message}`);
      }

      return this.mapToRepairOrder(data);
    } catch (error) {
      console.error('确认工单错误:', error);
      throw error;
    }
  }

  /**
   * 完成工单并结算
   */
  async completeOrder(dto: CompleteRepairOrderDTO): Promise<RepairOrder> {
    try {
      // 1. 数据验证
      const validation = validateCompleteOrderDto(dto);
      if (!validation.isValid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 2. 获取工单信息
      const order = await this.getOrder(dto.orderId);
      if (!order) {
        throw new Error('工单不存在');
      }

      // 3. 验证工单状态
      if (
        order.status !== OrderStatus.CONFIRMED &&
        order.status !== OrderStatus.IN_PROGRESS
      ) {
        throw new Error('只有已确认或进行中的工单才能完成');
      }

      // 4. 验证评分范围
      if (dto.rating < 0 || dto.rating > 5) {
        throw new Error('评分必须在0-5之间');
      }

      // 5. 获取相关账户
      const consumerAccount = await this.accountService.getAccountByUserId(
        order.consumerId!
      );
      const shopAccount = order.factoryId
        ? await this.accountService.getAccount(order.factoryId)
        : null;

      if (!consumerAccount || !shopAccount) {
        throw new Error('相关账户不存在');
      }

      // 6. 更新工单状态和评分
      const { data, error } = await supabase
        .from('repair_orders')
        .update({
          status: OrderStatus.COMPLETED,
          rating: dto.rating,
          completed_at: new Date().toISOString(),
        })
        .eq('id', dto.orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`完成工单失败: ${error.message}`);
      }

      // 7. 解冻并转移资金给维修店
      const lockedAmount = order.fcxAmountLocked || 0;

      // 解冻消费者资金
      await this.accountService.unfreeze(consumerAccount.id, lockedAmount);

      // 转移资金给维修店
      await this.accountService.transfer({
        fromAccountId: consumerAccount.id,
        toAccountId: shopAccount.id,
        amount: lockedAmount,
        transactionType: FcxTransactionType.SETTLEMENT,
        referenceId: dto.orderId,
        memo: `工单完成结算: ${order.orderNumber}`,
      });

      // 8. 更新维修店统计数据
      await this.updateShopStatistics(order.repairShopId!, dto.rating);

      // 9. 记录设备生命周期事件
      await this.recordLifecycleEvents(order, dto);

      return this.mapToRepairOrder(data);
    } catch (error) {
      console.error('完成工单错误:', error);
      throw error;
    }
  }

  /**
   * 取消工单
   */
  async cancelOrder(orderId: string, reason: string): Promise<RepairOrder> {
    try {
      // 1. 获取工单信息
      const order = await this.getOrder(orderId);
      if (!order) {
        throw new Error('工单不存在');
      }

      // 2. 验证工单状态（只能取消待确认的工单）
      if (order.status !== OrderStatus.PENDING) {
        throw new Error('只能取消待确认的工单');
      }

      // 3. 获取消费者账户
      const consumerAccount = order.consumerId
        ? await this.accountService.getAccountByUserId(order.consumerId)
        : null;
      if (!consumerAccount) {
        throw new Error('消费者账户不存在');
      }

      // 4. 解冻资金
      const lockedAmount = order.fcxAmountLocked || 0;
      if (lockedAmount > 0) {
        await this.accountService.unfreeze(consumerAccount.id, lockedAmount);
      }

      // 5. 更新工单状态
      const { data, error } = await supabase
        .from('repair_orders')
        .update({
          status: OrderStatus.CANCELLED,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        throw new Error(`取消工单失败: ${error.message}`);
      }

      // 6. 记录取消交易
      if (lockedAmount > 0) {
        await this.transactionService.createTransaction({
          fromAccountId: consumerAccount.id,
          toAccountId: '',
          amount: lockedAmount,
          transactionType: FcxTransactionType.UNFREEZE,
          referenceId: orderId,
          memo: `工单取消退款: ${order.orderNumber}, 原因: ${reason}`,
        });
      }

      return this.mapToRepairOrder(data);
    } catch (error) {
      console.error('取消工单错误:', error);
      throw error;
    }
  }

  /**
   * 查询工单列表
   */
  async listOrders(filters: {
    consumerId?: string;
    shopId?: string;
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RepairOrder[]> {
    try {
      let query = supabase.from('repair_orders').select('*');

      // 应用过滤条件
      if (filters.consumerId) {
        query = query.eq('consumer_id', filters.consumerId);
      }

      if (filters.shopId) {
        query = query.eq('repair_shop_id', filters.shopId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      // 按创建时间倒序排列
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`查询工单列表失败: ${error.message}`);
      }

      return data.map(this.mapToRepairOrder);
    } catch (error) {
      console.error('查询工单列表错误:', error);
      throw error;
    }
  }

  /**
   * 生成唯一工单编号
   */
  async generateOrderNumber(): Promise<string> {
    return generateOrderNumber();
  }

  /**
   * 更新维修店统计数据
   */
  private async updateShopStatistics(
    shopId: string,
    rating: number
  ): Promise<void> {
    try {
      // 获取当前统计数据
      const { data: shopData } = await supabase
        .from('repair_shops')
        .select('service_count, rating, review_count')
        .eq('id', shopId)
        .single();

      if (!shopData) return;

      const currentCount = shopData.service_count || 0;
      const currentRating = shopData.rating || 0;
      const currentReviews = shopData.review_count || 0;

      // 计算新的平均评分
      const newReviewCount = currentReviews + 1;
      const newAverageRating =
        (currentRating * currentReviews + rating) / newReviewCount;

      // 更新统计数据
      await supabase
        .from('repair_shops')
        .update({
          service_count: currentCount + 1,
          rating: parseFloat(newAverageRating.toFixed(1)),
          review_count: newReviewCount,
        })
        .eq('id', shopId);
    } catch (error) {
      console.error('更新维修店统计数据错误:', error);
      // 不抛出异常，避免影响主流程
    }
  }

  /**
   * 映射数据库记录到工单对象
   */
  private mapToRepairOrder(data: any): RepairOrder {
    return {
      id: data.id,
      orderNumber: data.order_number,
      consumerId: data.consumer_id,
      repairShopId: data.repair_shop_id,
      deviceInfo: data.device_info,
      faultDescription: data.fault_description,
      fcxAmountLocked: data.fcx_amount_locked,
      status: data.status as OrderStatus,
      rating: data.rating,
      factoryId: data.factory_id,
      createdAt: new Date(data.created_at),
      confirmedAt: data.confirmed_at ? new Date(data.confirmed_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
    };
  }

  /**
   * 记录设备生命周期事件
   * @param order 工单信息
   * @param dto 完成工单DTO
   */
  private async recordLifecycleEvents(
    order: RepairOrder,
    dto: CompleteRepairOrderDTO
  ): Promise<void> {
    try {
      // 从设备信息中提取二维码ID
      const qrcodeId = order.deviceInfo?.qrcodeId || order.deviceInfo?.qrCodeId;

      if (!qrcodeId) {
        console.warn('工单中未找到设备二维码ID，跳过生命周期事件记录');
        return;
      }

      // 确定维修类型
      const repairType = this.determineRepairType(order.faultDescription || '');

      // 记录维修事件
      await this.lifecycleService.recordEvent({
        qrcodeId,
        eventType: DeviceEventType.REPAIRED,
        eventSubtype: repairType,
        location: '维修中心',
        technician: '维修技师',
        cost: order.fcxAmountLocked || 0,
        notes: `工单号: ${order.orderNumber}, 故障描述: ${
          order.faultDescription || '无'
        }, 评分: ${dto.rating}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          consumerId: order.consumerId,
          repairShopId: order.repairShopId,
          rating: dto.rating,
          completionNotes: dto.completionNotes,
          completedAt: new Date().toISOString(),
        },
      });

      console.log(`已为设备 ${qrcodeId} 记录维修生命周期事件`);
    } catch (error) {
      console.error('记录生命周期事件失败:', error);
      // 不抛出异常，避免影响主流程
    }
  }

  /**
   * 根据故障描述确定维修类型
   * @param faultDescription 故障描述
   * @returns 维修类型
   */
  private determineRepairType(faultDescription: string): RepairType {
    const desc = faultDescription.toLowerCase();

    if (
      desc.includes('屏幕') ||
      desc.includes('display') ||
      desc.includes('lcd')
    ) {
      return RepairType.SCREEN_REPLACEMENT;
    } else if (desc.includes('电池') || desc.includes('battery')) {
      return RepairType.BATTERY_REPLACEMENT;
    } else if (desc.includes('进水') || desc.includes('water')) {
      return RepairType.WATER_DAMAGE;
    } else if (
      desc.includes('软件') ||
      desc.includes('software') ||
      desc.includes('系统')
    ) {
      return RepairType.SOFTWARE_ISSUE;
    } else if (desc.includes('硬件') || desc.includes('hardware')) {
      return RepairType.HARDWARE_FAULT;
    } else {
      return RepairType.OTHER;
    }
  }

  /**
   * 记录配件更换事件
   * @param order 工单信息
   * @param partInfo 配件信息
   * @param userId 操作用户ID
   */
  async recordPartReplacement(
    order: RepairOrder,
    partInfo: {
      partId: string;
      partName: string;
      partType: string;
      oldPartSerial?: string;
      newPartSerial?: string;
      cost?: number;
    },
    userId?: string
  ): Promise<void> {
    try {
      // 从设备信息中提取二维码ID
      const qrcodeId = order.deviceInfo?.qrcodeId || order.deviceInfo?.qrCodeId;

      if (!qrcodeId) {
        console.warn('工单中未找到设备二维码ID，跳过配件更换事件记录');
        return;
      }

      // 记录配件更换事件
      await this.lifecycleService.recordEvent({
        qrcodeId,
        eventType: DeviceEventType.PART_REPLACED,
        eventSubtype: partInfo.partType || 'other',
        location: '维修中心',
        technician: '维修技师',
        cost: partInfo.cost || 0,
        notes: `更换配件: ${partInfo.partName}, 工单号: ${order.orderNumber}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          partId: partInfo.partId,
          partName: partInfo.partName,
          partType: partInfo.partType,
          oldPartSerial: partInfo.oldPartSerial,
          newPartSerial: partInfo.newPartSerial,
          cost: partInfo.cost,
          recordedBy: userId,
          recordedAt: new Date().toISOString(),
        },
      });

      console.log(
        `已为设备 ${qrcodeId} 记录配件更换事件: ${partInfo.partName}`
      );
    } catch (error) {
      console.error('记录配件更换事件失败:', error);
      throw error;
    }
  }
}
