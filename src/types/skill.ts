/**
 * Skill 商店相关类型定义
 * 用于统一管理 Skill 相关的接口和类型
 */

/**
 * 审核状态类型
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 上架状态类型
 */
export type ShelfStatus = 'on_shelf' | 'off_shelf' | 'suspended';

/**
 * Skill 基本信息接口
 */
export interface Skill {
  /** Skill 唯一标识 */
  id: string;
  /** Skill 名称 */
  name: string;
  /** Skill 描述 */
  description: string;
  /** 分类 */
  category: string;
  /** 价格 (积分或代币) */
  price: number;
  /** 审核状态 */
  review_status: ReviewStatus;
  /** 上架状态 */
  shelf_status: ShelfStatus;
  /** 开发者 ID */
  developer_id: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * Skill 筛选条件接口
 */
export interface SkillFilters {
  /** 搜索关键词 (名称或描述) */
  search: string;
  /** 分类筛选 */
  category: string;
  /** 审核状态筛选 */
  reviewStatus: string;
  /** 上架状态筛选 */
  shelfStatus: string;
  /** 排序字段 */
  sortBy: string;
  /** 排序方式 */
  sortOrder: 'asc' | 'desc';
}

/**
 * Skill 统计数据接口
 */
export interface SkillStatistics {
  /** 总 Skill 数 */
  totalSkills: number;
  /** 已上架 Skill 数 */
  onShelfSkills: number;
  /** 已审核 Skill 数 */
  approvedSkills: number;
  /** 待审核 Skill 数 */
  pendingReview: number;
}

/**
 * Skill 列表 API 响应接口
 */
export interface SkillListResponse {
  /** 是否成功 */
  success: boolean;
  /** Skill 列表数据 */
  data: Skill[];
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    pageSize: number;
    /** 总数 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
  /** 错误信息 (如果有) */
  error?: string;
}

/**
 * Skill 统计数据 API 响应接口
 */
export interface SkillStatisticsResponse {
  /** 是否成功 */
  success: boolean;
  /** 统计数据 */
  data: {
    /** 概览统计 */
    overview: SkillStatistics;
  };
  /** 错误信息 (如果有) */
  error?: string;
}

/**
 * Skill 审核操作请求接口
 */
export interface SkillReviewRequest {
  /** Skill ID */
  skillId: string;
  /** 审核动作 */
  action: 'approve' | 'reject';
  /** 审核原因 (拒绝时必填) */
  reason: string;
}

/**
 * Skill 上下架切换请求接口
 */
export interface SkillToggleStatusRequest {
  /** Skill ID */
  skillId: string;
  /** 新的上架状态 */
  shelfStatus: ShelfStatus;
}

/**
 * Skill 审核操作响应接口
 */
export interface SkillReviewResponse {
  /** 是否成功 */
  success: boolean;
  /** 更新后的 Skill 数据 */
  data?: Skill;
  /** 错误信息 (如果有) */
  error?: string;
}

/**
 * Skill 上下架切换响应接口
 */
export interface SkillToggleStatusResponse {
  /** 是否成功 */
  success: boolean;
  /** 更新后的 Skill 数据 */
  data?: Skill;
  /** 错误信息 (如果有) */
  error?: string;
}
