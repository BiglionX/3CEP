/**
 * Skill 主入口文件
 */

import { SkillHandler, SkillInput, SkillOutput } from './types';
import { handleRequest } from './handler';

export class ProcycSkill implements SkillHandler {
  async execute(input: SkillInput): Promise<SkillOutput> {
    const startTime = Date.now();

    try {
      // 验证输入
      this.validateInput(input);

      // 执行技能逻辑
      const data = await handleRequest(input);

      return {
        success: true,
        data,
        error: null,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: {
          code: error.code || 'SKILL_006',
          message: error.message || '技能执行失败',
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };
    }
  }

  private validateInput(input: SkillInput): void {
    // 检查必填参数
    if (input.latitude === undefined || input.longitude === undefined) {
      const error: any = new Error('缺少必填参数：latitude 和 longitude');
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证纬度
    if (typeof input.latitude !== 'number') {
      const error: any = new Error('纬度必须是数字类型');
      error.code = 'SKILL_001';
      throw error;
    }

    if (input.latitude < -90 || input.latitude > 90) {
      const error: any = new Error('纬度必须在 -90 到 90 之间');
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证经度
    if (typeof input.longitude !== 'number') {
      const error: any = new Error('经度必须是数字类型');
      error.code = 'SKILL_001';
      throw error;
    }

    if (input.longitude < -180 || input.longitude > 180) {
      const error: any = new Error('经度必须在 -180 到 180 之间');
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证可选参数
    if (
      input.radius !== undefined &&
      (typeof input.radius !== 'number' || input.radius <= 0)
    ) {
      const error: any = new Error('radius 必须为正数');
      error.code = 'SKILL_001';
      throw error;
    }

    if (
      input.limit !== undefined &&
      (typeof input.limit !== 'number' || input.limit <= 0)
    ) {
      const error: any = new Error('limit 必须为正数');
      error.code = 'SKILL_001';
      throw error;
    }
  }
}

// 导出默认实例
export default new ProcycSkill();
