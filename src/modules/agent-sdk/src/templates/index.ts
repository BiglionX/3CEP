/**
 * FixCycle Agent SDK 模板系统主入? * 导出所有模板相关功? */

// 核心模板市场功能
import {
  TemplateMarketAPI,
  TemplateValidator,
  DEFAULT_CATEGORIES,
  TemplateInfo,
  TemplateUploadRequest,
} from './template-market';

// 模板预览系统
import { TemplatePreviewer } from './template-preview';

// 预览配置
import type { PreviewConfig } from './template-preview';

export {
  TemplateMarketAPI,
  TemplateValidator,
  DEFAULT_CATEGORIES,
  TemplatePreviewer,
};

// 类型定义
export type {
  TemplateInfo,
  TemplateCategory,
  TemplateSubcategory,
  TemplateVersion,
  TemplateRating,
  TemplateStats,
  TemplateUploadRequest,
  TemplateSearchOptions,
} from './template-market';

export type { TemplateStatus } from './template-market';

// 模板装饰器（用于模板开发）
export interface TemplateOptions {
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  tags?: string[];
  configSchema?: any;
}

/**
 * 模板装饰? * 用于标记和配置智能体模板
 */
export function Template(options: TemplateOptions) {
  return function (constructor: any) {
    // 设置模板元数?    constructor.__templateOptions = options;
    constructor.__templateType = 'agent-template';
    return constructor;
  };
}

/**
 * 配置模式装饰? * 用于定义模板的配置选项
 */
export function ConfigSchema(schema: any) {
  return function (constructor: any) {
    constructor.__configSchema = schema;
    return constructor;
  };
}

/**
 * 模板示例基类
 */
export abstract class BaseTemplate {
  protected templateInfo: TemplateInfo;

  constructor(
    info: Omit<TemplateInfo, 'id' | 'authorId' | 'createdAt' | 'updatedAt'>
  ) {
    this.templateInfo = {
      ...info,
      id: this.generateId(info.name, info.version),
      authorId: 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 获取模板信息
   */
  getTemplateInfo(): TemplateInfo {
    return { ...this.templateInfo };
  }

  /**
   * 更新模板信息
   */
  updateTemplateInfo(
    updates: Partial<Omit<TemplateInfo, 'id' | 'authorId' | 'createdAt'>>
  ): void {
    Object.assign(this.templateInfo, updates, { updatedAt: new Date() });
  }

  /**
   * 生成模板ID
   */
  private generateId(name: string, version: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${version}`;
  }

  /**
   * 抽象方法：返回模板源代码
   */
  abstract getSourceCode(): string;

  /**
   * 抽象方法：返回README文档
   */
  abstract getReadme(): string;
}

// 便捷函数
export async function createTemplateMarket(
  baseUrl?: string
): Promise<TemplateMarketAPI> {
  const market = new TemplateMarketAPI(baseUrl);

  // 可以在这里添加事件监听等

  return market;
}

export function createTemplatePreviewer(
  config?: Partial<PreviewConfig>
): TemplatePreviewer {
  return new TemplatePreviewer(config);
}

export function validateTemplate(template: TemplateUploadRequest): {
  valid: boolean;
  errors: string[];
  qualityScore?: number;
} {
  // 基本验证
  const basicValidation = TemplateValidator.validateTemplateInfo(template);
  if (!basicValidation.valid) {
    return { valid: false, errors: basicValidation.errors };
  }

  // 源代码验?  const sourceValidation = TemplateValidator.validateSourceCode(
    template.sourceCode
  );
  if (!sourceValidation.valid) {
    return { valid: false, errors: sourceValidation.errors };
  }

  // 配置模式验证
  if (template.configSchema) {
    const schemaValidation = TemplateValidator.validateConfigSchema(
      template.configSchema
    );
    if (!schemaValidation.valid) {
      return { valid: false, errors: schemaValidation.errors };
    }
  }

  // 质量评估
  const previewer = new TemplatePreviewer();
  const quality = previewer.assessQuality(template.sourceCode);

  return {
    valid: true,
    errors: [],
    qualityScore: quality.score,
  };
}

// 版本信息
export const TEMPLATE_SYSTEM_VERSION = '1.0.0';
export const TEMPLATE_SYSTEM_NAME = 'FixCycle Template System';

// 默认配置
export const DEFAULT_PREVIEW_CONFIG: PreviewConfig = {
  width: 800,
  height: 600,
  theme: 'light',
  showLineNumbers: true,
  highlightErrors: true,
  autoRefresh: true,
};

export const DEFAULT_TEMPLATE_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: '智能体名?,
    },
    description: {
      type: 'string',
      description: '智能体描?,
    },
    category: {
      type: 'string',
      description: '智能体分?,
    },
  },
  required: ['name', 'description', 'category'],
};
