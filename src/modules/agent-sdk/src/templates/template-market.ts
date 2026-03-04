/**
 * FixCycle Agent SDK 模板市场系统
 * 提供智能体模板的分类、上传、管理和预览功能
 */

// 模板基本信息
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  subcategory?: string;
  tags: string[];
  author: string;
  authorId: string;
  thumbnail?: string;
  previewImages?: string[];
  readme: string;
  sourceCode: string;
  configSchema?: any;
  dependencies: string[];
  license: string;
  price: number; // 0表示免费
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// 模板分类体系
export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: TemplateSubcategory[];
  templateCount: number;
}

export interface TemplateSubcategory {
  id: string;
  name: string;
  description: string;
  templateCount: number;
}

// 模板状态枚?export enum TemplateStatus {
  DRAFT = 'draft', // 草稿
  PENDING = 'pending', // 审核?  APPROVED = 'approved', // 已批?  REJECTED = 'rejected', // 已拒?  PUBLISHED = 'published', // 已发?}

// 模板版本信息
export interface TemplateVersion {
  version: string;
  changelog: string;
  sourceCode: string;
  configSchema?: any;
  dependencies: string[];
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// 模板评价和统?export interface TemplateRating {
  averageRating: number;
  totalReviews: number;
  ratingsDistribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface TemplateStats {
  downloadCount: number;
  viewCount: number;
  favoriteCount: number;
  usageCount: number;
  lastUpdated: Date;
}

// 模板上传请求
export interface TemplateUploadRequest {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  readme: string;
  sourceCode: string;
  configSchema?: any;
  dependencies: string[];
  license: string;
  price: number;
  thumbnail?: File | string;
  previewImages?: (File | string)[];
}

// 模板搜索选项
export interface TemplateSearchOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  priceRange?: [number, number];
  sortBy?: 'downloads' | 'rating' | 'newest' | 'popular' | 'price';
  sortOrder?: 'asc' | 'desc';
  status?: TemplateStatus;
  limit?: number;
  offset?: number;
}

// 模板市场API客户?export class TemplateMarketAPI {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'https://templates.fixcycle.com/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * 上传模板
   */
  async uploadTemplate(template: TemplateUploadRequest): Promise<{
    templateId: string;
    status: TemplateStatus;
    message: string;
  }> {
    // 实现模板上传逻辑
    const formData = new FormData();

    Object.entries(template).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'thumbnail' || key === 'previewImages') {
          // 处理文件上传
          if (value instanceof File) {
            formData.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach((file, index) => {
              if (file instanceof File) {
                formData.append(`${key}[${index}]`, file);
              }
            });
          }
        } else {
          formData.append(key, JSON.stringify(value));
        }
      }
    });

    const response = await this.makeRequest('/templates/upload', {
      method: 'POST',
      body: formData,
    });

    return response.data;
  }

  /**
   * 更新模板
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<TemplateUploadRequest>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.makeRequest(`/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    return response.data;
  }

  /**
   * 获取模板详情
   */
  async getTemplate(templateId: string): Promise<{
    template: TemplateInfo;
    versions: TemplateVersion[];
    rating: TemplateRating;
    stats: TemplateStats;
  }> {
    const response = await this.makeRequest(`/templates/${templateId}`);
    return response.data;
  }

  /**
   * 搜索模板
   */
  async searchTemplates(options: TemplateSearchOptions): Promise<{
    templates: Array<
      TemplateInfo & { rating: TemplateRating; stats: TemplateStats }
    >;
    totalCount: number;
    categories: TemplateCategory[];
  }> {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          if (key === 'tags') {
            value.forEach(tag => params.append('tags', tag));
          } else if (key === 'priceRange') {
            params.append('minPrice', value[0].toString());
            params.append('maxPrice', value[1].toString());
          }
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.makeRequest(`/templates/search?${params}`);
    return response.data;
  }

  /**
   * 获取模板分类
   */
  async getCategories(): Promise<TemplateCategory[]> {
    const response = await this.makeRequest('/categories');
    return response.data;
  }

  /**
   * 下载模板
   */
  async downloadTemplate(templateId: string): Promise<{
    downloadUrl: string;
    fileName: string;
    fileSize: number;
  }> {
    const response = await this.makeRequest(
      `/templates/${templateId}/download`,
      {
        method: 'POST',
      }
    );

    return response.data;
  }

  /**
   * 获取我的模板（开发者功能）
   */
  async getMyTemplates(status?: TemplateStatus): Promise<TemplateInfo[]> {
    const params = status ? `?status=${status}` : '';
    const response = await this.makeRequest(`/templates/my${params}`);
    return response.data;
  }

  /**
   * 删除模板
   */
  async deleteTemplate(
    templateId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest(`/templates/${templateId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  /**
   * 提交模板审核
   */
  async submitForReview(
    templateId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.makeRequest(`/templates/${templateId}/submit`, {
      method: 'POST',
    });
    return response.data;
  }

  /**
   * 设置API密钥
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * 通用请求方法
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// 模板验证?export class TemplateValidator {
  /**
   * 验证模板基本信息
   */
  static validateTemplateInfo(template: TemplateUploadRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 必需字段验证
    if (!template.name || template.name.trim().length === 0) {
      errors.push('模板名称不能为空');
    }

    if (!template.description || template.description.trim().length === 0) {
      errors.push('模板描述不能为空');
    }

    if (!template.category) {
      errors.push('必须选择分类');
    }

    if (!template.sourceCode || template.sourceCode.trim().length === 0) {
      errors.push('源代码不能为?);
    }

    if (!template.readme || template.readme.trim().length === 0) {
      errors.push('README文档不能为空');
    }

    // 长度限制验证
    if (template.name && template.name.length > 100) {
      errors.push('模板名称不能超过100个字?);
    }

    if (template.description && template.description.length > 500) {
      errors.push('模板描述不能超过500个字?);
    }

    if (template.tags && template.tags.length > 10) {
      errors.push('标签数量不能超过10�?);
    }

    // 价格验证
    if (template.price < 0) {
      errors.push('价格不能为负?);
    }

    if (template.price > 9999) {
      errors.push('价格不能超过9999');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证源代码格?   */
  static validateSourceCode(sourceCode: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      // 基本语法检查（简化版?      if (!sourceCode.includes('class') && !sourceCode.includes('function')) {
        errors.push('源代码必须包含class或function定义');
      }

      // 检查是否包含基本的导出语句
      if (!sourceCode.includes('export')) {
        errors.push('源代码必须包含export语句');
      }

      // 文件大小检查（假设限制?MB�?      if (new Blob([sourceCode]).size > 1024 * 1024) {
        errors.push('源代码文件大小不能超?MB');
      }
    } catch (error) {
      errors.push('源代码格式验证失?);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 验证配置模式
   */
  static validateConfigSchema(schema: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!schema) return { valid: true, errors };

    try {
      // 简单的JSON Schema验证
      if (typeof schema !== 'object') {
        errors.push('配置模式必须是对象格?);
        return { valid: false, errors };
      }

      // 检查必需字段
      if (
        schema.type &&
        !['object', 'array', 'string', 'number', 'boolean'].includes(
          schema.type
        )
      ) {
        errors.push(
          '配置模式类型必须是object, array, string, number, boolean之一'
        );
      }
    } catch (error) {
      errors.push('配置模式验证失败');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// 默认分类体系
export const DEFAULT_CATEGORIES: TemplateCategory[] = [
  {
    id: 'business',
    name: '商业智能?,
    description: '面向商业场景的智能体模板',
    icon: '💼',
    color: '#3B82F6',
    subcategories: [
      {
        id: 'sales',
        name: '销售助?,
        description: '销售相关的智能?,
        templateCount: 0,
      },
      {
        id: 'marketing',
        name: '营销推广',
        description: '市场营销相关的智能体',
        templateCount: 0,
      },
      {
        id: 'customer-service',
        name: '客户服务',
        description: '客户服务相关的智能体',
        templateCount: 0,
      },
      {
        id: 'analytics',
        name: '数据分析',
        description: '数据分析相关的智能体',
        templateCount: 0,
      },
    ],
    templateCount: 0,
  },
  {
    id: 'development',
    name: '开发工?,
    description: '开发者工具和辅助智能?,
    icon: '💻',
    color: '#10B981',
    subcategories: [
      {
        id: 'code-assistant',
        name: '代码助手',
        description: '编程辅助智能?,
        templateCount: 0,
      },
      {
        id: 'testing',
        name: '测试工具',
        description: '软件测试相关的智能体',
        templateCount: 0,
      },
      {
        id: 'devops',
        name: '运维工具',
        description: 'DevOps相关的智能体',
        templateCount: 0,
      },
      {
        id: 'documentation',
        name: '文档生成',
        description: '文档处理相关的智能体',
        templateCount: 0,
      },
    ],
    templateCount: 0,
  },
  {
    id: 'productivity',
    name: '效率工具',
    description: '提升工作效率的智能体',
    icon: '�?,
    color: '#F59E0B',
    subcategories: [
      {
        id: 'task-management',
        name: '任务管理',
        description: '任务和项目管理智能体',
        templateCount: 0,
      },
      {
        id: 'calendar',
        name: '日程安排',
        description: '时间管理相关的智能体',
        templateCount: 0,
      },
      {
        id: 'note-taking',
        name: '笔记整理',
        description: '笔记和知识管理智能体',
        templateCount: 0,
      },
      {
        id: 'communication',
        name: '沟通协?,
        description: '团队沟通相关的智能?,
        templateCount: 0,
      },
    ],
    templateCount: 0,
  },
  {
    id: 'education',
    name: '教育培训',
    description: '教育和培训相关的智能?,
    icon: '🎓',
    color: '#8B5CF6',
    subcategories: [
      {
        id: 'tutoring',
        name: '辅导教学',
        description: '教学辅导智能?,
        templateCount: 0,
      },
      {
        id: 'course-creation',
        name: '课程制作',
        description: '课程开发相关的智能?,
        templateCount: 0,
      },
      {
        id: 'assessment',
        name: '测评考试',
        description: '考试评测相关的智能体',
        templateCount: 0,
      },
      {
        id: 'learning',
        name: '自主学习',
        description: '个性化学习智能?,
        templateCount: 0,
      },
    ],
    templateCount: 0,
  },
  {
    id: 'entertainment',
    name: '娱乐休闲',
    description: '娱乐和休闲相关的智能?,
    icon: '🎮',
    color: '#EC4899',
    subcategories: [
      {
        id: 'games',
        name: '游戏娱乐',
        description: '游戏相关的智能体',
        templateCount: 0,
      },
      {
        id: 'music',
        name: '音乐创作',
        description: '音乐制作相关的智能体',
        templateCount: 0,
      },
      {
        id: 'storytelling',
        name: '故事创作',
        description: '创意写作相关的智能体',
        templateCount: 0,
      },
      {
        id: 'chatbots',
        name: '聊天伙伴',
        description: '陪伴聊天相关的智能体',
        templateCount: 0,
      },
    ],
    templateCount: 0,
  },
];
