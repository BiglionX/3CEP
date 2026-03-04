import { supabaseAdmin as supabase } from '@/lib/supabase';
import {
  DeviceProfile,
  DeviceStatus,
  WarrantyInfo,
  CreateDeviceProfileParams,
} from '@/lib/constants/lifecycle';

export class DeviceProfileService {
  private supabase = supabase;

  /**
   * 创建设备档案
   * @param profileData 档案数据
   * @returns 创建的设备档?   */
  async createDeviceProfile(
    profileData: CreateDeviceProfileParams
  ): Promise<DeviceProfile> {
    try {
      // 计算保修到期日期
      let warrantyExpiry: string | null = null;
      if (profileData.warrantyPeriod) {
        const startDate = new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + profileData.warrantyPeriod);
        warrantyExpiry = expiryDate.toISOString().split('T')[0];
      }

      const { data, error } = await this.supabase
        .from('device_profiles')
        .insert({
          qrcode_id: profileData.qrcodeId,
          product_model: profileData.productModel,
          product_category: profileData.productCategory,
          brand_name: profileData.brandName,
          serial_number: profileData.serialNumber,
          manufacturing_date: profileData.manufacturingDate
            ? profileData.manufacturingDate.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          warranty_start_date: profileData.warrantyPeriod
            ? new Date().toISOString().split('T')[0]
            : null,
          warranty_expiry: warrantyExpiry,
          warranty_period: profileData.warrantyPeriod,
          current_status:
            profileData.currentStatus || DeviceStatus.MANUFACTURED,
          specifications: profileData.specifications,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) throw new Error(`创建设备档案失败: ${error.message}`);

      return this.mapToDeviceProfile(data);
    } catch (error) {
      console.error('创建设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 获取设备档案
   * @param qrcodeId 二维码ID
   * @returns 设备档案
   */
  async getDeviceProfile(qrcodeId: string): Promise<DeviceProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('device_profiles')
        .select(
          `
          *,
          product_qrcodes (
            id,
            product_id,
            qr_content,
            created_at
          )
        `
        )
        .eq('qrcode_id', qrcodeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到记录，返回null
          return null;
        }
        throw new Error(`获取设备档案失败: ${error.message}`);
      }

      return this.mapToDeviceProfile(data);
    } catch (error) {
      console.error('获取设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 更新设备档案
   * @param qrcodeId 二维码ID
   * @param updates 更新数据
   * @returns 更新后的设备档案
   */
  async updateDeviceProfile(
    qrcodeId: string,
    updates: Partial<
      Omit<DeviceProfile, 'id' | 'qrcodeId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<DeviceProfile> {
    try {
      const { data, error } = await this.supabase
        .from('device_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('qrcode_id', qrcodeId)
        .select()
        .single();

      if (error) throw new Error(`更新设备档案失败: ${error.message}`);

      return this.mapToDeviceProfile(data);
    } catch (error) {
      console.error('更新设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 更新设备状?   * @param qrcodeId 二维码ID
   * @param status 新状?   * @param metadata 额外元数?   */
  async updateDeviceStatus(
    qrcodeId: string,
    status: DeviceStatus,
    metadata?: any
  ): Promise<void> {
    try {
      const updates: any = {
        current_status: status,
        updated_at: new Date().toISOString(),
      };

      // 如果是激活状态，记录首次激活时?      if (status === DeviceStatus.ACTIVATED && !metadata?.firstActivatedAt) {
        updates.first_activated_at = new Date().toISOString();
      }

      // 合并额外元数?      if (metadata) {
        Object.assign(updates, metadata);
      }

      const { error } = await this.supabase
        .from('device_profiles')
        .update(updates)
        .eq('qrcode_id', qrcodeId);

      if (error) throw new Error(`更新设备状态失? ${error.message}`);
    } catch (error) {
      console.error('更新设备状态错?', error);
      throw error;
    }
  }

  /**
   * 获取设备保修信息
   * @param qrcodeId 二维码ID
   * @returns 保修信息
   */
  async getWarrantyInfo(qrcodeId: string): Promise<WarrantyInfo> {
    try {
      const profile = await this.getDeviceProfile(qrcodeId);

      if (!profile) {
        return {
          isUnderWarranty: false,
          message: '未找到设备档?,
        };
      }

      if (!profile.warrantyStartDate || !profile.warrantyPeriod) {
        return {
          isUnderWarranty: false,
          message: '无保修信?,
        };
      }

      const startDate = new Date(profile.warrantyStartDate);
      const expiryDate = new Date(profile.warrantyExpiry || startDate);

      const today = new Date();
      const isUnderWarranty = today <= expiryDate;

      return {
        isUnderWarranty,
        startDate: profile.warrantyStartDate,
        expiryDate: profile.warrantyExpiry || expiryDate,
        remainingDays: isUnderWarranty
          ? Math.ceil(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0,
        message: isUnderWarranty ? '在保' : '已过?,
        period: profile.warrantyPeriod,
      };
    } catch (error) {
      console.error('获取保修信息错误:', error);
      throw error;
    }
  }

  /**
   * 获取设备统计信息
   * @returns 统计信息
   */
  async getDeviceStatistics(): Promise<any> {
    try {
      // 获取按状态分组的统计
      const { data: profileData, error: profileError } = await this.supabase
        .from('device_profiles')
        .select('current_status');

      if (profileError)
        throw new Error(`获取档案数据失败: ${profileError.message}`);

      const statusStats: Record<string, number> = {};
      profileData?.forEach(item => {
        const status = item.current_status as string;
        statusStats[status] = (statusStats[status] || 0) + 1;
      }) as any;

      // 获取平均维修次数
      const { data: repairStats, error: repairError } = await this.supabase
        .from('device_profiles')
        .select('total_repair_count, total_part_replacement_count');

      if (repairError)
        throw new Error(`获取维修统计失败: ${repairError.message}`);

      const totalDevices = repairStats?.length || 0;
      const avgRepairCount =
        totalDevices > 0
          ? repairStats!.reduce(
              (sum, item) => sum + (item.total_repair_count || 0),
              0
            ) / totalDevices
          : 0;

      const avgPartReplacementCount =
        totalDevices > 0
          ? repairStats!.reduce(
              (sum, item) => sum + (item.total_part_replacement_count || 0),
              0
            ) / totalDevices
          : 0;

      // 获取总转移次?      const { data: transferData, error: transferError } = await this.supabase
        .from('device_profiles')
        .select('total_transfer_count');

      if (transferError)
        throw new Error(`获取转移统计失败: ${transferError.message}`);

      const totalTransfers =
        transferData?.reduce(
          (sum, item) => sum + (item.total_transfer_count || 0),
          0
        ) || 0;

      return {
        totalDevices,
        byStatus: statusStats,
        averageRepairCount: parseFloat(avgRepairCount.toFixed(2)),
        averagePartReplacementCount: parseFloat(
          avgPartReplacementCount.toFixed(2)
        ),
        totalTransfers,
      };
    } catch (error) {
      console.error('获取设备统计错误:', error);
      throw error;
    }
  }

  /**
   * 搜索设备档案
   * @param searchTerm 搜索?   * @param limit 限制数量
   * @returns 匹配的设备档案列?   */
  async searchDeviceProfiles(
    searchTerm: string,
    limit: number = 20
  ): Promise<DeviceProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('device_profiles')
        .select('*')
        .or(
          `product_model.ilike.%${searchTerm}%,brand_name.ilike.%${searchTerm}%,serial_number.ilike.%${searchTerm}%`
        )
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`搜索设备档案失败: ${error.message}`);

      return data.map(this.mapToDeviceProfile);
    } catch (error) {
      console.error('搜索设备档案错误:', error);
      throw error;
    }
  }

  /**
   * 获取即将过保的设?   * @param days 天数阈?   * @returns 即将过保的设备列?   */
  async getExpiringWarrantyDevices(
    days: number = 30
  ): Promise<DeviceProfile[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);

      const { data, error } = await this.supabase
        .from('device_profiles')
        .select('*')
        .gte('warranty_expiry', new Date().toISOString().split('T')[0])
        .lte('warranty_expiry', cutoffDate.toISOString().split('T')[0])
        .order('warranty_expiry', { ascending: true });

      if (error) throw new Error(`获取即将过保设备失败: ${error.message}`);

      return data.map(this.mapToDeviceProfile);
    } catch (error) {
      console.error('获取即将过保设备错误:', error);
      throw error;
    }
  }

  /**
   * 将数据库记录映射到DeviceProfile对象
   * @param record 数据库记?   * @returns DeviceProfile对象
   */
  private mapToDeviceProfile(record: any): DeviceProfile {
    return {
      id: record.id,
      qrcodeId: record.qrcode_id,
      productModel: record.product_model,
      productCategory: record.product_category,
      brandName: record.brand_name,
      serialNumber: record.serial_number,
      manufacturingDate: record.manufacturing_date
        ? new Date(record.manufacturing_date)
        : undefined,
      firstActivatedAt: record.first_activated_at
        ? new Date(record.first_activated_at)
        : undefined,
      warrantyStartDate: record.warranty_start_date
        ? new Date(record.warranty_start_date)
        : undefined,
      warrantyExpiry: record.warranty_expiry
        ? new Date(record.warranty_expiry)
        : undefined,
      warrantyPeriod: record.warranty_period,
      currentStatus: record.current_status as DeviceStatus,
      lastEventAt: record.last_event_at
        ? new Date(record.last_event_at)
        : undefined,
      lastEventType: record.last_event_type,
      totalRepairCount: record.total_repair_count,
      totalPartReplacementCount: record.total_part_replacement_count,
      totalTransferCount: record.total_transfer_count,
      currentLocation: record.current_location,
      ownerInfo: record.owner_info,
      maintenanceHistory: record.maintenance_history,
      specifications: record.specifications,
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }
}
