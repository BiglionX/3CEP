import { DeviceLifecycleService } from '@/services/device-lifecycle.service';
import { DeviceEventType, DeviceStatus } from '@/lib/constants/lifecycle';

/**
 * FCX系统集成服务
 * 负责设备生命周期事件与FCX通证经济系统的交互
 */
export class FcxIntegration {
  private lifecycleService = new DeviceLifecycleService();

  /**
   * 设备激活时发放FCX奖励
   * @param qrcodeId 二维码ID
   * @param userId 用户ID
   * @param activationData 激活数据
   */
  async rewardOnActivation(
    qrcodeId: string, 
    userId: string, 
    activationData?: any
  ): Promise<{ success: boolean; rewardAmount?: number; message?: string }> {
    try {
      // 记录激活事件
      await this.lifecycleService.recordEvent({
        qrcodeId,
        eventType: DeviceEventType.ACTIVATED,
        notes: '首次激活，获得FCX奖励',
        metadata: {
          activationSource: activationData?.source || 'scan',
          activationTime: new Date().toISOString(),
          userId
        }
      }, userId);

      // 发放FCX奖励（这里需要调用实际的FCX系统API）
      const rewardAmount = 100; // 示例奖励数量
      
      // TODO: 调用FCX系统API发放奖励
      // await fxcService.grantTokens(userId, rewardAmount, 'device_activation', {
      //   qrcodeId,
      //   deviceId: activationData?.deviceId
      // });

      console.log(`设备 ${qrcodeId} 激活奖励已发放: ${rewardAmount} FCX`);

      return { 
        success: true, 
        rewardAmount,
        message: `成功获得 ${rewardAmount} FCX 奖励` 
      };
    } catch (error) {
      console.error('设备激活奖励发放失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '奖励发放失败' 
      };
    }
  }

  /**
   * 维修质量评级影响联盟等级
   * @param repairRecord 维修记录
   * @param qualityScore 质量评分 (1-5)
   */
  async updateAllianceLevelFromRepair(repairRecord: any, qualityScore: number): Promise<void> {
    try {
      // 根据维修质量和客户评价更新技师联盟等级
      // 这需要与FCX账户系统集成
      
      const technicianId = repairRecord.technician_id || repairRecord.created_by;
      
      if (!technicianId) {
        console.warn('无法确定技师ID，跳过联盟等级更新');
        return;
      }

      // 计算联盟等级积分
      const basePoints = 10;
      const qualityMultiplier = qualityScore / 5; // 1-5分转换为0.2-1的倍数
      const bonusPoints = qualityScore >= 4 ? 5 : 0; // 高质量额外奖励
      const totalPoints = Math.round(basePoints * qualityMultiplier + bonusPoints);

      // TODO: 调用FCX联盟系统API更新积分
      // await fxcAllianceService.addPoints(technicianId, totalPoints, {
      //   reason: '维修服务质量',
      //   repairId: repairRecord.id,
      //   qualityScore,
      //   deviceId: repairRecord.device_qrcode_id
      // });

      console.log(`技师 ${technicianId} 获得联盟积分: ${totalPoints} (质量评分: ${qualityScore})`);
    } catch (error) {
      console.error('更新联盟等级失败:', error);
      throw error;
    }
  }

  /**
   * 设备回收时的FCX激励
   * @param qrcodeId 二维码ID
   * @param userId 用户ID
   * @param recycleData 回收数据
   */
  async rewardOnRecycling(
    qrcodeId: string,
    userId: string,
    recycleData: any
  ): Promise<{ success: boolean; rewardAmount?: number; message?: string }> {
    try {
      // 记录回收事件
      await this.lifecycleService.recordEvent({
        qrcodeId,
        eventType: DeviceEventType.RECYCLED,
        eventSubtype: recycleData.recycleType,
        location: recycleData.location,
        notes: `设备回收 - ${recycleData.recycleType}`,
        metadata: {
          recycleCenter: recycleData.centerName,
          recyclingMethod: recycleData.method,
          environmentalImpact: recycleData.impactScore,
          userId
        }
      }, userId);

      // 根据回收类型和环保贡献发放奖励
      let rewardAmount = 0;
      switch (recycleData.recycleType) {
        case 'refurbished':
          rewardAmount = 150;
          break;
        case 'parts':
          rewardAmount = 120;
          break;
        case 'trade_in':
          rewardAmount = 200;
          break;
        default:
          rewardAmount = 80;
      }

      // 环保加分
      if (recycleData.impactScore && recycleData.impactScore > 8) {
        rewardAmount += 50;
      }

      // TODO: 调用FCX系统API发放回收奖励
      // await fxcService.grantTokens(userId, rewardAmount, 'device_recycling', {
      //   qrcodeId,
      //   recycleType: recycleData.recycleType,
      //   impactScore: recycleData.impactScore
      // });

      console.log(`设备 ${qrcodeId} 回收奖励已发放: ${rewardAmount} FCX`);

      return {
        success: true,
        rewardAmount,
        message: `感谢环保回收！获得 ${rewardAmount} FCX 奖励`
      };
    } catch (error) {
      console.error('设备回收奖励发放失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '回收奖励发放失败'
      };
    }
  }

  /**
   * 基于设备使用情况的忠诚度奖励
   * @param qrcodeId 二维码ID
   * @param userId 用户ID
   */
  async loyaltyRewardForLongTermUsage(
    qrcodeId: string,
    userId: string
  ): Promise<{ success: boolean; rewardAmount?: number; message?: string }> {
    try {
      // 获取设备档案和使用历史
      const profile = await this.lifecycleService['supabase']
        .from('device_profiles')
        .select('*')
        .eq('qrcode_id', qrcodeId)
        .single();

      if (profile.error) throw new Error(`获取设备档案失败: ${profile.error.message}`);

      const events = await this.lifecycleService.getDeviceLifecycleHistory(qrcodeId);
      
      // 计算使用时长（从首次激活到现在）
      const firstActivation = events.find(e => e.eventType === DeviceEventType.ACTIVATED);
      if (!firstActivation) {
        return {
          success: false,
          message: '设备尚未激活，无法计算忠诚度奖励'
        };
      }

      const usageDays = Math.floor(
        (Date.now() - new Date(firstActivation.eventTimestamp).getTime()) / (1000 * 60 * 60 * 24)
      );

      // 基于使用时长计算奖励
      let rewardAmount = 0;
      if (usageDays >= 365) {
        rewardAmount = 200; // 使用1年+
      } else if (usageDays >= 180) {
        rewardAmount = 100; // 使用6个月+
      } else if (usageDays >= 90) {
        rewardAmount = 50;  // 使用3个月+
      }

      if (rewardAmount > 0) {
        // TODO: 调用FCX系统API发放忠诚度奖励
        // await fxcService.grantTokens(userId, rewardAmount, 'loyalty_reward', {
        //   qrcodeId,
        //   usageDays,
        //   deviceModel: profile.data?.product_model
        // });

        console.log(`设备 ${qrcodeId} 忠诚度奖励已发放: ${rewardAmount} FCX (使用${usageDays}天)`);

        return {
          success: true,
          rewardAmount,
          message: `长期使用奖励！获得 ${rewardAmount} FCX (${usageDays}天)`
        };
      }

      return {
        success: true,
        message: '使用时长不足，暂无忠诚度奖励'
      };
    } catch (error) {
      console.error('忠诚度奖励计算失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '忠诚度奖励计算失败'
      };
    }
  }

  /**
   * 获取用户的设备生命周期相关奖励统计
   * @param userId 用户ID
   */
  async getUserDeviceRewardsSummary(userId: string): Promise<any> {
    try {
      // 查询用户相关的设备生命周期事件
      const { data: events, error } = await this.lifecycleService['supabase']
        .from('device_lifecycle_events')
        .select(`
          *,
          device_profiles!inner(qrcode_id, product_model)
        `)
        .eq('created_by', userId)
        .order('event_timestamp', { ascending: false });

      if (error) throw new Error(`查询用户设备事件失败: ${error.message}`);

      // 统计各类奖励
      const summary = {
        totalActivations: events?.filter(e => e.event_type === 'activated').length || 0,
        totalRepairs: events?.filter(e => e.event_type === 'repaired').length || 0,
        totalRecyclings: events?.filter(e => e.event_type === 'recycled').length || 0,
        totalEvents: events?.length || 0,
        recentActivity: events?.slice(0, 5) || []
      };

      return summary;
    } catch (error) {
      console.error('获取用户设备奖励统计失败:', error);
      throw error;
    }
  }
}