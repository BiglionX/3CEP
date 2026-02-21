/**
 * 物品画像服务
 * 负责构建、维护和更新物品（维修店、配件等）画像
 */

import { createClient } from "@supabase/supabase-js";
import {
  ItemProfile,
  RecommendationItemType,
} from "../models/recommendation.model";
import { ItemProfileService } from "./recommendation.interfaces";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class ItemProfileServiceImpl implements ItemProfileService {
  /**
   * 构建或更新物品画像
   */
  async buildItemProfile(
    itemId: string,
    itemType: string
  ): Promise<ItemProfile> {
    try {
      console.log(`📦 开始构建物品画像: ${itemId} (${itemType})`);

      let itemData: any = null;

      // 根据物品类型获取不同数据源
      switch (itemType as RecommendationItemType) {
        case RecommendationItemType.REPAIR_SHOP:
          itemData = await this.getRepairShopData(itemId);
          break;
        case RecommendationItemType.PART:
          itemData = await this.getPartData(itemId);
          break;
        case RecommendationItemType.SERVICE:
          itemData = await this.getServiceData(itemId);
          break;
        case RecommendationItemType.DEVICE:
          itemData = await this.getDeviceData(itemId);
          break;
        case RecommendationItemType.ACCESSORY:
          itemData = await this.getAccessoryData(itemId);
          break;
        default:
          throw new Error(`不支持的物品类型: ${itemType}`);
      }

      if (!itemData) {
        throw new Error(`未找到物品数据: ${itemId}`);
      }

      // 构建物品画像
      const itemProfile = await this.constructItemProfile(
        itemId,
        itemType as RecommendationItemType,
        itemData
      );

      // 保存到数据库
      await this.saveItemProfile(itemProfile);

      console.log(`✅ 物品画像构建完成: ${itemId}`);
      return itemProfile;
    } catch (error) {
      console.error(`构建物品画像失败 (${itemId}):`, error);
      throw error;
    }
  }

  /**
   * 获取物品画像
   */
  async getItemProfile(itemId: string): Promise<ItemProfile | null> {
    try {
      const { data, error } = await supabase
        .from("item_profiles")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw new Error(`获取物品画像失败: ${error.message}`);
      }

      return {
        itemId: data.item_id,
        itemType: data.item_type,
        basicInfo: {
          name: data.basic_info?.name || "",
          description: data.basic_info?.description,
          category: data.basic_info?.category || "",
          brand: data.basic_info?.brand,
          price: data.basic_info?.price,
        },
        features: {
          tags: data.features?.tags || [],
          attributes: data.features?.attributes || {},
          popularityScore: data.features?.popularity_score || 0,
          qualityScore: data.features?.quality_score || 0,
        },
        statistics: {
          viewCount: data.statistics?.view_count || 0,
          purchaseCount: data.statistics?.purchase_count || 0,
          rating: data.statistics?.rating,
          reviewCount: data.statistics?.review_count,
        },
        location: data.location
          ? {
              lat: data.location.lat,
              lng: data.location.lng,
              city: data.location.city,
              province: data.location.province,
            }
          : undefined,
        lastUpdated: data.last_updated,
      };
    } catch (error) {
      console.error("获取物品画像错误:", error);
      throw error;
    }
  }

  /**
   * 批量构建物品画像
   */
  async buildItemProfiles(itemIds: string[]): Promise<void> {
    if (!itemIds.length) return;

    console.log(`📦 开始批量构建物品画像 (${itemIds.length} 个物品)`);

    // 分批处理
    const batchSize = 20;
    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batch = itemIds.slice(i, i + batchSize);

      // 并行处理一批物品
      await Promise.all(
        batch.map(async (itemId) => {
          try {
            // 先尝试从数据库获取，如果没有则构建
            const existingProfile = await this.getItemProfile(itemId);
            if (!existingProfile) {
              // 这里需要知道物品类型才能构建画像
              // 简化处理：假设都是维修店
              await this.buildItemProfile(
                itemId,
                RecommendationItemType.REPAIR_SHOP
              );
            }
          } catch (error) {
            console.warn(`构建物品画像失败 (${itemId}):`, error);
          }
        })
      );

      console.log(`✅ 批次 ${Math.floor(i / batchSize) + 1} 处理完成`);
    }

    console.log("✅ 批量物品画像构建完成");
  }

  /**
   * 计算物品相似度
   */
  async calculateItemSimilarity(
    itemId1: string,
    itemId2: string
  ): Promise<number> {
    try {
      const profile1 = await this.getItemProfile(itemId1);
      const profile2 = await this.getItemProfile(itemId2);

      if (!profile1 || !profile2) {
        return 0;
      }

      // 类别相似度
      const categorySimilarity =
        profile1.basicInfo.category === profile2.basicInfo.category ? 1 : 0;

      // 品牌相似度
      const brandSimilarity =
        profile1.basicInfo.brand === profile2.basicInfo.brand ? 1 : 0;

      // 价格相似度（如果都有价格）
      let priceSimilarity = 0;
      if (profile1.basicInfo.price && profile2.basicInfo.price) {
        const priceDiff = Math.abs(
          profile1.basicInfo.price - profile2.basicInfo.price
        );
        const maxPrice = Math.max(
          profile1.basicInfo.price,
          profile2.basicInfo.price
        );
        priceSimilarity = maxPrice > 0 ? 1 - priceDiff / maxPrice : 0;
      }

      // 质量分数相似度
      const qualityDiff = Math.abs(
        profile1.features.qualityScore - profile2.features.qualityScore
      );
      const qualitySimilarity = 1 - qualityDiff / 100; // 假设质量分数是0-100

      // 综合相似度
      const similarity =
        categorySimilarity * 0.3 +
        brandSimilarity * 0.2 +
        priceSimilarity * 0.2 +
        qualitySimilarity * 0.3;

      return Math.max(0, Math.min(1, similarity));
    } catch (error) {
      console.error("计算物品相似度错误:", error);
      return 0;
    }
  }

  /**
   * 获取维修店数据
   */
  private async getRepairShopData(shopId: string): Promise<any> {
    const { data, error } = await supabase
      .from("repair_shops")
      .select(
        `
        id,
        name,
        slug,
        contact_person,
        phone,
        address,
        city,
        province,
        postal_code,
        latitude,
        longitude,
        logo_url,
        cover_image_url,
        business_license,
        services,
        specialties,
        rating,
        review_count,
        service_count,
        certification_level,
        is_verified,
        status,
        created_at,
        updated_at
      `
      )
      .eq("id", shopId)
      .single();

    if (error) {
      throw new Error(`获取维修店数据失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取配件数据
   */
  private async getPartData(partId: string): Promise<any> {
    // 这里需要根据实际的配件表结构调整
    const { data, error } = await supabase
      .from("parts_inventory")
      .select("*")
      .eq("id", partId)
      .single();

    if (error) {
      throw new Error(`获取配件数据失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取服务数据
   */
  private async getServiceData(serviceId: string): Promise<any> {
    // 服务数据可能来自维修订单或其他表
    const { data, error } = await supabase
      .from("repair_orders")
      .select("service_type, device_type, status")
      .eq("id", serviceId)
      .single();

    if (error) {
      throw new Error(`获取服务数据失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取设备数据
   */
  private async getDeviceData(deviceId: string): Promise<any> {
    const { data, error } = await supabase
      .from("devices")
      .select("*")
      .eq("id", deviceId)
      .single();

    if (error) {
      throw new Error(`获取设备数据失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 获取配件附件数据
   */
  private async getAccessoryData(accessoryId: string): Promise<any> {
    // 配件附件数据
    const { data, error } = await supabase
      .from("accessories")
      .select("*")
      .eq("id", accessoryId)
      .single();

    if (error) {
      throw new Error(`获取配件附件数据失败: ${error.message}`);
    }

    return data;
  }

  /**
   * 构建物品画像
   */
  private async constructItemProfile(
    itemId: string,
    itemType: RecommendationItemType,
    rawData: any
  ): Promise<ItemProfile> {
    // 基础信息提取
    const basicInfo = this.extractBasicInfo(rawData, itemType);

    // 特征提取
    const features = await this.extractFeatures(rawData, itemType);

    // 统计信息计算
    const statistics = await this.calculateStatistics(itemId, itemType);

    // 地理位置信息
    const location = this.extractLocation(rawData);

    return {
      itemId,
      itemType,
      basicInfo,
      features,
      statistics,
      location,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 提取基础信息
   */
  private extractBasicInfo(
    rawData: any,
    itemType: RecommendationItemType
  ): any {
    switch (itemType) {
      case RecommendationItemType.REPAIR_SHOP:
        return {
          name: rawData.name,
          description: rawData.description || `专业的${rawData.name}维修服务`,
          category: "repair_service",
          brand: this.extractBrandFromName(rawData.name),
          price: undefined, // 维修店没有固定价格
        };

      case RecommendationItemType.PART:
        return {
          name: rawData.name || rawData.part_name,
          description: rawData.description,
          category: rawData.category || "electronic_part",
          brand: rawData.brand,
          price: rawData.price,
        };

      case RecommendationItemType.SERVICE:
        return {
          name: rawData.service_type || "维修服务",
          description: `专业${rawData.service_type}服务`,
          category: rawData.device_type || "general",
          brand: undefined,
          price: undefined,
        };

      default:
        return {
          name: rawData.name || rawData.id,
          description: rawData.description,
          category: "general",
          brand: rawData.brand,
          price: rawData.price,
        };
    }
  }

  /**
   * 提取特征
   */
  private async extractFeatures(
    rawData: any,
    itemType: RecommendationItemType
  ): Promise<any> {
    const tags: string[] = [];
    const attributes: Record<string, any> = {};

    switch (itemType) {
      case RecommendationItemType.REPAIR_SHOP:
        // 从服务和专长提取标签
        if (rawData.services) {
          try {
            const services = JSON.parse(rawData.services);
            tags.push(...services.slice(0, 5)); // 取前5个服务作为标签
          } catch (e) {
            tags.push("维修服务");
          }
        }

        if (rawData.specialties) {
          try {
            const specialties = JSON.parse(rawData.specialties);
            tags.push(...specialties.slice(0, 3));
          } catch (e) {
            // 忽略解析错误
          }
        }

        // 属性特征
        attributes.certificationLevel = rawData.certification_level;
        attributes.isVerified = rawData.is_verified;
        attributes.serviceCount = rawData.service_count;
        break;

      case RecommendationItemType.PART:
        tags.push(rawData.category, rawData.brand);
        attributes.compatibility = rawData.compatibility;
        attributes.warranty = rawData.warranty_period;
        break;

      default:
        tags.push("通用");
        break;
    }

    // 计算流行度分数（基于统计数据）
    const stats = await this.calculateStatistics(rawData.id, itemType);
    const popularityScore = this.calculatePopularityScore(stats);

    // 质量分数（基于评分和认证等）
    const qualityScore = this.calculateQualityScore(rawData, itemType);

    return {
      tags: [...new Set(tags.filter((tag) => tag))], // 去重并过滤空值
      attributes,
      popularityScore,
      qualityScore,
    };
  }

  /**
   * 计算统计数据
   */
  private async calculateStatistics(
    itemId: string,
    itemType: RecommendationItemType
  ): Promise<any> {
    // 这里应该从用户行为表和其他相关表中计算统计数据
    // 简化处理，返回模拟数据

    switch (itemType) {
      case RecommendationItemType.REPAIR_SHOP:
        return {
          viewCount: Math.floor(Math.random() * 1000) + 100,
          purchaseCount: Math.floor(Math.random() * 200) + 20,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0
          reviewCount: Math.floor(Math.random() * 500) + 50,
        };

      default:
        return {
          viewCount: Math.floor(Math.random() * 500) + 50,
          purchaseCount: Math.floor(Math.random() * 100) + 10,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 200) + 20,
        };
    }
  }

  /**
   * 提取地理位置
   */
  private extractLocation(rawData: any): any {
    if (rawData.latitude && rawData.longitude) {
      return {
        lat: rawData.latitude,
        lng: rawData.longitude,
        city: rawData.city,
        province: rawData.province,
      };
    }
    return undefined;
  }

  /**
   * 从名称中提取品牌
   */
  private extractBrandFromName(name: string): string | undefined {
    const brandPatterns = [
      /苹果|apple/i,
      /华为|huawei/i,
      /小米|xiaomi/i,
      /三星|samsung/i,
      /oppo/i,
      /vivo/i,
      /一加|oneplus/i,
    ];

    for (const pattern of brandPatterns) {
      if (pattern.test(name)) {
        const match = name.match(pattern);
        return match ? match[0].toLowerCase() : undefined;
      }
    }
    return undefined;
  }

  /**
   * 计算流行度分数
   */
  private calculatePopularityScore(statistics: any): number {
    const {
      viewCount = 0,
      purchaseCount = 0,
      rating = 0,
      reviewCount = 0,
    } = statistics;

    // 加权计算流行度分数 (0-100)
    const viewScore = Math.min(100, viewCount / 10);
    const purchaseScore = Math.min(100, purchaseCount * 2);
    const ratingScore = rating * 20; // 5星 = 100分
    const reviewScore = Math.min(100, reviewCount / 5);

    return Math.round(
      viewScore * 0.3 +
        purchaseScore * 0.3 +
        ratingScore * 0.2 +
        reviewScore * 0.2
    );
  }

  /**
   * 计算质量分数
   */
  private calculateQualityScore(
    rawData: any,
    itemType: RecommendationItemType
  ): number {
    let score = 50; // 基础分数

    switch (itemType) {
      case RecommendationItemType.REPAIR_SHOP:
        // 认证等级加分
        if (rawData.certification_level) {
          score += rawData.certification_level * 10;
        }

        // 官方认证加分
        if (rawData.is_verified) {
          score += 20;
        }

        // 评分加权
        if (rawData.rating) {
          score += (rawData.rating - 3) * 15; // 3星为基础，每高0.1星加1.5分
        }
        break;

      default:
        // 默认质量分数
        if (rawData.rating) {
          score = rawData.rating * 20;
        }
        break;
    }

    return Math.max(0, Math.min(100, score)); // 限制在0-100之间
  }

  /**
   * 保存物品画像到数据库
   */
  private async saveItemProfile(profile: ItemProfile): Promise<void> {
    const { error } = await supabase.from("item_profiles").upsert(
      {
        item_id: profile.itemId,
        item_type: profile.itemType,
        basic_info: {
          name: profile.basicInfo.name,
          description: profile.basicInfo.description,
          category: profile.basicInfo.category,
          brand: profile.basicInfo.brand,
          price: profile.basicInfo.price,
        },
        features: {
          tags: profile.features.tags,
          attributes: profile.features.attributes,
          popularity_score: profile.features.popularityScore,
          quality_score: profile.features.qualityScore,
        },
        statistics: {
          view_count: profile.statistics.viewCount,
          purchase_count: profile.statistics.purchaseCount,
          rating: profile.statistics.rating,
          review_count: profile.statistics.reviewCount,
        },
        location: profile.location
          ? {
              lat: profile.location.lat,
              lng: profile.location.lng,
              city: profile.location.city,
              province: profile.location.province,
            }
          : null,
        last_updated: profile.lastUpdated,
      },
      {
        onConflict: "item_id",
      }
    );

    if (error) {
      throw new Error(`保存物品画像失败: ${error.message}`);
    }
  }
}
