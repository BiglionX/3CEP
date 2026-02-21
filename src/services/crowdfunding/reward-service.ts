import { supabase, supabaseAdmin } from "@/lib/supabase";

// 回报设置接口定义
export interface CrowdfundingReward {
  id: string;
  project_id: string;
  title: string;
  description: string;
  minimum_amount: number;
  quantity_limit: number | null;
  claimed_count: number;
  delivery_estimate: string | null;
  is_digital: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardCreateData {
  project_id: string;
  title: string;
  description: string;
  minimum_amount: number;
  quantity_limit?: number;
  delivery_estimate?: string;
  is_digital?: boolean;
}

export class CrowdfundingRewardService {
  // 获取项目的所有回报设置
  static async getProjectRewards(projectId: string) {
    try {
      const { data, error } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("project_id", projectId)
        .order("minimum_amount", { ascending: true });

      if (error) throw error;

      // 计算剩余数量
      const rewardsWithAvailability =
        data?.map((reward) => ({
          ...reward,
          available_count: reward.quantity_limit
            ? reward.quantity_limit - reward.claimed_count
            : null,
          is_available: reward.quantity_limit
            ? reward.quantity_limit - reward.claimed_count > 0
            : true,
        })) || [];

      return rewardsWithAvailability;
    } catch (error) {
      console.error("获取项目回报设置失败:", error);
      throw error;
    }
  }

  // 创建回报设置
  static async createReward(rewardData: RewardCreateData, userId: string) {
    try {
      // 验证项目所有权
      const projectResponse = await supabase
        .from("crowdfunding_projects")
        .select("creator_id")
        .eq("id", rewardData.project_id)
        .single();

      if (projectResponse.error) throw projectResponse.error;

      if (projectResponse.data.creator_id !== userId) {
        throw new Error("无权为此项目创建回报设置");
      }

      const { data, error } = await supabase
        .from("crowdfunding_rewards")
        .insert({
          ...rewardData,
          claimed_count: 0,
          is_digital: rewardData.is_digital || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("创建回报设置失败:", error);
      throw error;
    }
  }

  // 更新回报设置
  static async updateReward(
    id: string,
    rewardData: Partial<RewardCreateData>,
    userId: string
  ) {
    try {
      // 验证权限
      const reward = await this.getRewardById(id);

      const projectResponse = await supabase
        .from("crowdfunding_projects")
        .select("creator_id")
        .eq("id", reward.project_id)
        .single();

      if (projectResponse.error) throw projectResponse.error;

      if (projectResponse.data.creator_id !== userId) {
        throw new Error("无权修改此回报设置");
      }

      const { data, error } = await supabase
        .from("crowdfunding_rewards")
        .update({
          ...rewardData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("更新回报设置失败:", error);
      throw error;
    }
  }

  // 删除回报设置
  static async deleteReward(id: string, userId: string) {
    try {
      // 验证权限
      const reward = await this.getRewardById(id);

      const projectResponse = await supabase
        .from("crowdfunding_projects")
        .select("creator_id")
        .eq("id", reward.project_id)
        .single();

      if (projectResponse.error) throw projectResponse.error;

      if (projectResponse.data.creator_id !== userId) {
        throw new Error("无权删除此回报设置");
      }

      // 检查是否已被认领
      if (reward.claimed_count > 0) {
        throw new Error("已有用户认领此回报，无法删除");
      }

      const { error } = await supabase
        .from("crowdfunding_rewards")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("删除回报设置失败:", error);
      throw error;
    }
  }

  // 获取回报详情
  static async getRewardById(id: string) {
    try {
      const { data, error } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("获取回报详情失败:", error);
      throw error;
    }
  }

  // 认领回报（当用户支持时调用）
  static async claimReward(rewardId: string) {
    try {
      const reward = await this.getRewardById(rewardId);

      // 检查数量限制
      if (
        reward.quantity_limit &&
        reward.claimed_count >= reward.quantity_limit
      ) {
        throw new Error("此回报已达到数量上限");
      }

      const { data, error } = await supabaseAdmin
        .from("crowdfunding_rewards")
        .update({
          claimed_count: reward.claimed_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rewardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("认领回报失败:", error);
      throw error;
    }
  }

  // 验证回报有效性
  static async validateReward(rewardId: string, amount: number) {
    try {
      const reward = await this.getRewardById(rewardId);

      // 验证金额是否满足最低要求
      if (amount < reward.minimum_amount) {
        return {
          valid: false,
          message: `支持金额需达到 ${reward.minimum_amount} 元才能选择此回报`,
        };
      }

      // 验证数量限制
      if (
        reward.quantity_limit &&
        reward.claimed_count >= reward.quantity_limit
      ) {
        return {
          valid: false,
          message: "此回报已达到数量上限",
        };
      }

      return {
        valid: true,
        reward,
      };
    } catch (error) {
      console.error("验证回报失败:", error);
      return {
        valid: false,
        message: "回报验证失败",
      };
    }
  }

  // 获取默认回报（最小金额的回报）
  static async getDefaultReward(projectId: string) {
    try {
      const { data, error } = await supabase
        .from("crowdfunding_rewards")
        .select("*")
        .eq("project_id", projectId)
        .order("minimum_amount", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // 如果没有找到回报设置，返回null
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("获取默认回报失败:", error);
      throw error;
    }
  }
}
