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
    // 检查必填字段
    if (!input.deviceType) {
      const error: any = new Error('缺少必填字段：deviceType');
      error.code = 'SKILL_001';
      throw error;
    }

    if (!input.brand) {
      const error: any = new Error('缺少必填字段：brand');
      error.code = 'SKILL_001';
      throw error;
    }

    if (!input.model) {
      const error: any = new Error('缺少必填字段：model');
      error.code = 'SKILL_001';
      throw error;
    }

    if (
      !input.symptoms ||
      !Array.isArray(input.symptoms) ||
      input.symptoms.length === 0
    ) {
      const error: any = new Error(
        '缺少必填字段：symptoms（症状列表不能为空）'
      );
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证设备类型
    const validDeviceTypes = ['mobile', 'tablet', 'laptop', 'desktop', 'other'];
    if (!validDeviceTypes.includes(input.deviceType)) {
      const error: any = new Error(
        `无效的设备类型：${input.deviceType}。有效值为：${validDeviceTypes.join(', ')}`
      );
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证品牌名称
    if (typeof input.brand !== 'string' || input.brand.trim().length === 0) {
      const error: any = new Error('品牌名称必须为非空字符串');
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证型号
    if (typeof input.model !== 'string' || input.model.trim().length === 0) {
      const error: any = new Error('型号必须为非空字符串');
      error.code = 'SKILL_001';
      throw error;
    }

    // 验证症状数组
    input.symptoms.forEach((symptom, index) => {
      if (typeof symptom !== 'string' || symptom.trim().length === 0) {
        const error: any = new Error(`第 ${index + 1} 个症状必须为非空字符串`);
        error.code = 'SKILL_001';
        throw error;
      }
    });

    // 验证附加信息（如果提供）
    if (input.additionalInfo) {
      if (
        input.additionalInfo.purchaseDate &&
        typeof input.additionalInfo.purchaseDate !== 'string'
      ) {
        const error: any = new Error('purchaseDate 必须为字符串');
        error.code = 'SKILL_001';
        throw error;
      }

      if (
        input.additionalInfo.warrantyStatus &&
        !['in_warranty', 'out_of_warranty'].includes(
          input.additionalInfo.warrantyStatus
        )
      ) {
        const error: any = new Error(
          'warrantyStatus 必须为 "in_warranty" 或 "out_of_warranty"'
        );
        error.code = 'SKILL_001';
        throw error;
      }

      if (
        input.additionalInfo.previousRepairs &&
        (!Array.isArray(input.additionalInfo.previousRepairs) ||
          input.additionalInfo.previousRepairs.some(r => typeof r !== 'string'))
      ) {
        const error: any = new Error('previousRepairs 必须为字符串数组');
        error.code = 'SKILL_001';
        throw error;
      }
    }
  }
}

// 导出默认实例
export default new ProcycSkill();
