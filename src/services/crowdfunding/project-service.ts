import { supabase } from "@/lib/supabase";

// 众筹项目接口定义
export interface CrowdfundingProject {
  id: string;
  title: string;
  description: string;
  product_model: string;
  old_models: string[];
  target_amount: number;
  current_amount: number;
  min_pledge_amount: number;
  max_pledge_amount: number | null;
  start_date: string;
  end_date: string;
  delivery_date: string | null;
  status: "draft" | "active" | "success" | "failed" | "cancelled";
  cover_image_url: string | null;
  images: string[];
  video_url: string | null;
  creator_id: string;
  category: string;
  tags: string[];
  risk_info: string | null;
  faq: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateData {
  title: string;
  description: string;
  product_model: string;
  old_models?: string[];
  target_amount: number;
  min_pledge_amount?: number;
  max_pledge_amount?: number;
  start_date: string;
  end_date: string;
  delivery_date?: string;
  cover_image_url?: string;
  images?: string[];
  video_url?: string;
  category: string;
  tags?: string[];
  risk_info?: string;
  faq?: any;
}

export interface ProjectUpdateData {
  title?: string;
  description?: string;
  product_model?: string;
  old_models?: string[];
  target_amount?: number;
  min_pledge_amount?: number;
  max_pledge_amount?: number;
  start_date?: string;
  end_date?: string;
  delivery_date?: string;
  cover_image_url?: string;
  images?: string[];
  video_url?: string;
  category?: string;
  tags?: string[];
  risk_info?: string;
  faq?: any;
  status?: "draft" | "active" | "success" | "failed" | "cancelled";
}

export class CrowdfundingProjectService {
  // 获取所有活跃项目
  static async getActiveProjects(page: number = 1, limit: number = 12) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("crowdfunding_projects")
        .select("*", { count: "exact" })
        .in("status", ["active", "success"])
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 计算进度百分比
      const projectsWithProgress =
        data?.map((project) => ({
          ...project,
          progress_percentage: Math.round(
            (project.current_amount / project.target_amount) * 100
          ),
        })) || [];

      return {
        projects: projectsWithProgress,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("获取活跃项目失败:", error);
      throw error;
    }
  }

  // 根据分类获取项目
  static async getProjectsByCategory(
    category: string,
    page: number = 1,
    limit: number = 12
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("crowdfunding_projects")
        .select("*", { count: "exact" })
        .eq("category", category)
        .in("status", ["active", "success"])
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const projectsWithProgress =
        data?.map((project) => ({
          ...project,
          progress_percentage: Math.round(
            (project.current_amount / project.target_amount) * 100
          ),
        })) || [];

      return {
        projects: projectsWithProgress,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("根据分类获取项目失败:", error);
      throw error;
    }
  }

  // 搜索项目
  static async searchProjects(
    query: string,
    page: number = 1,
    limit: number = 12
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("crowdfunding_projects")
        .select("*", { count: "exact" })
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,product_model.ilike.%${query}%`
        )
        .in("status", ["active", "success"])
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const projectsWithProgress =
        data?.map((project) => ({
          ...project,
          progress_percentage: Math.round(
            (project.current_amount / project.target_amount) * 100
          ),
        })) || [];

      return {
        projects: projectsWithProgress,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("搜索项目失败:", error);
      throw error;
    }
  }

  // 获取项目详情
  static async getProjectById(id: string) {
    try {
      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // 计算进度百分比
      const projectWithProgress = {
        ...data,
        progress_percentage: Math.round(
          (data.current_amount / data.target_amount) * 100
        ),
      };

      return projectWithProgress;
    } catch (error) {
      console.error("获取项目详情失败:", error);
      throw error;
    }
  }

  // 获取用户创建的项目
  static async getUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 12
  ) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("crowdfunding_projects")
        .select("*", { count: "exact" })
        .eq("creator_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const projectsWithProgress =
        data?.map((project) => ({
          ...project,
          progress_percentage: Math.round(
            (project.current_amount / project.target_amount) * 100
          ),
        })) || [];

      return {
        projects: projectsWithProgress,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      console.error("获取用户项目失败:", error);
      throw error;
    }
  }

  // 创建项目
  static async createProject(projectData: ProjectCreateData, userId: string) {
    try {
      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .insert({
          ...projectData,
          creator_id: userId,
          current_amount: 0,
          status: "draft",
          old_models: projectData.old_models || [],
          tags: projectData.tags || [],
          images: projectData.images || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("创建项目失败:", error);
      throw error;
    }
  }

  // 更新项目
  static async updateProject(
    id: string,
    projectData: ProjectUpdateData,
    userId: string
  ) {
    try {
      // 验证用户权限
      const project = await this.getProjectById(id);
      if (project.creator_id !== userId) {
        throw new Error("无权修改此项目");
      }

      // 只有草稿状态的项目才能被修改
      if (project.status !== "draft") {
        throw new Error("只有草稿状态的项目才能被修改");
      }

      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("更新项目失败:", error);
      throw error;
    }
  }

  // 发布项目（从草稿变为活跃）
  static async publishProject(id: string, userId: string) {
    try {
      const project = await this.getProjectById(id);
      if (project.creator_id !== userId) {
        throw new Error("无权发布此项目");
      }

      if (project.status !== "draft") {
        throw new Error("只有草稿状态的项目才能被发布");
      }

      // 验证项目数据完整性
      if (!project.title || !project.description || !project.cover_image_url) {
        throw new Error("项目信息不完整，请完善后再发布");
      }

      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .update({
          status: "active",
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("发布项目失败:", error);
      throw error;
    }
  }

  // 取消项目
  static async cancelProject(id: string, userId: string) {
    try {
      const project = await this.getProjectById(id);
      if (project.creator_id !== userId) {
        throw new Error("无权取消此项目");
      }

      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("取消项目失败:", error);
      throw error;
    }
  }

  // 获取项目统计信息
  static async getProjectStats(id: string) {
    try {
      const { data, error } = await supabase.rpc("get_project_stats", {
        project_id: id,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("获取项目统计失败:", error);
      throw error;
    }
  }
}
