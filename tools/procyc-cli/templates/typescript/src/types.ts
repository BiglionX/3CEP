/**
 * 类型定义
 */

export interface SkillInput {
  [key: string]: any;
}

export interface SkillOutput {
  success: boolean;
  data?: any;
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

export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
}

export interface SkillError extends Error {
  code?: string;
}
