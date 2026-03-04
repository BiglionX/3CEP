/**
 * 类型定义
 */

// 输入参数类型
export interface SkillInput {
  deviceType: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'other';
  brand: string;
  model: string;
  symptoms: string[];
  additionalInfo?: {
    purchaseDate?: string;
    warrantyStatus?: 'in_warranty' | 'out_of_warranty';
    previousRepairs?: string[];
  };
}

// 输出结果类型
export interface SkillOutput {
  success: boolean;
  data?: {
    diagnosis: {
      likelyIssues: Array<{
        issue: string;
        confidence: number;
        description: string;
      }>;
      suggestedParts: Array<{
        partName: string;
        partCategory: string;
        priority: 'high' | 'medium' | 'low';
        reason: string;
      }>;
      repairDifficulty: 'easy' | 'moderate' | 'hard' | 'expert';
      estimatedTime?: string;
    };
  } | null;
  error?: {
    code: string;
    message: string;
  } | null;
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
  };
}

// 故障知识库条目
export interface FaultCase {
  id: string;
  deviceTypes: string[];
  brands?: string[];
  models?: string[];
  symptoms: string[];
  diagnosis: {
    issue: string;
    confidence: number;
    description: string;
  };
  suggestedParts: Array<{
    partName: string;
    partCategory: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
  repairDifficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  estimatedTime?: string;
  keywords: string[];
}

export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
}

export interface SkillError extends Error {
  code?: string;
}
