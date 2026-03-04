/**
 * AI诊断分析服务
 * 基于B2B采购智能体的大模型能力，专门为售后故障诊断场景设? */

import { LargeModelProcurementService } from '@/b2b-procurement-agent/services/large-model-parser.service';
import {
  DeviceCategory,
  DiagnosisResult,
  generateDiagnosisSystemPrompt,
  generateUserPrompt,
  normalizeFaultDescription,
  validateDiagnosisResult,
} from './diagnosis-prompt-template';

// 诊断请求接口
export interface DiagnosisRequest {
  faultDescription: string;
  deviceId?: string;
  deviceInfo?: {
    brand?: string;
    model?: string;
    category?: string;
    purchaseTime?: string;
  };
  sessionId?: string;
  language?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

// 诊断服务配置
interface DiagnosisConfig {
  timeoutMs: number;
  maxRetries: number;
  fallbackToMock: boolean;
  enableLogging: boolean;
}

// 默认配置
const DEFAULT_CONFIG: DiagnosisConfig = {
  timeoutMs: 30000, // 30秒超?  maxRetries: 2,
  fallbackToMock: true,
  enableLogging: true,
};

export class DiagnosisAnalysisService {
  private modelService: LargeModelProcurementService;
  private config: DiagnosisConfig;
  private sessionHistories: Map<
    string,
    Array<{ role: string; content: string }>
  >;

  constructor(config: Partial<DiagnosisConfig> = {}) {
    this.modelService = new LargeModelProcurementService();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionHistories = new Map();
  }

  /**
   * 分析故障描述并返回诊断结?   */
  async analyzeFault(request: DiagnosisRequest): Promise<DiagnosisResult> {
    const startTime = Date.now();

    try {
      // 1. 预处理故障描?      const normalizedDescription = normalizeFaultDescription(
        request.faultDescription
      );

      // 2. 获取对话历史
      const conversationHistory = this.getConversationHistory(
        request.sessionId
      );

      // 3. 生成提示?      const systemPrompt = generateDiagnosisSystemPrompt();
      const userPrompt = generateUserPrompt(
        normalizedDescription,
        request.deviceInfo,
        conversationHistory
      );

      // 4. 调用大模型服?      const modelResponse = await this.callLargeModel(
        systemPrompt,
        userPrompt,
        request.sessionId
      );

      // 5. 解析和验证结?      const diagnosisResult = this.parseModelResponse(modelResponse);

      // 6. 保存对话历史
      this.saveConversationTurn(
        request.sessionId,
        normalizedDescription,
        JSON.stringify(diagnosisResult)
      );

      // 7. 记录日志
      if (this.config.enableLogging) {
        this.logAnalysis(
          normalizedDescription,
          diagnosisResult,
          Date.now() - startTime
        );
      }

      return diagnosisResult;
    } catch (error) {
      console.error('诊断分析失败:', error);

      // 降级到模拟响?      if (this.config.fallbackToMock) {
        return this.generateFallbackResponse(request.faultDescription);
      }

      throw new Error(
        `诊断服务暂时不可? ${
          error instanceof Error ? error.message : '未知错误'
        }`
      );
    }
  }

  /**
   * 调用大模型服?   */
  private async callLargeModel(
    systemPrompt: string,
    userPrompt: string,
    sessionId?: string
  ): Promise<any> {
    // 构造类似B2B采购请求的对?    const mockRawRequest = {
      id: `diag_${Date.now()}_${
        sessionId || Math.random().toString(36).substr(2, 9)
      }`,
      companyId: 'diagnosis_service',
      requesterId: sessionId || 'anonymous',
      rawDescription: userPrompt,
      input: userPrompt,
      inputType: 'text' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 使用Promise.race实现超时控制
    const modelPromise = this.modelService.parseDemand(mockRawRequest);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('诊断服务超时')),
        this.config.timeoutMs
      );
    });

    return Promise.race([modelPromise, timeoutPromise]);
  }

  /**
   * 解析模型响应
   */
  private parseModelResponse(modelResponse: any): DiagnosisResult {
    try {
      // 尝试从模型响应中提取JSON内容
      let jsonString = '';

      if (typeof modelResponse === 'string') {
        jsonString = modelResponse;
      } else if (modelResponse && typeof modelResponse === 'object') {
        // 从各种可能的字段中提取JSON
        const possibleFields = ['content', 'response', 'result', 'analysis'];
        for (const field of possibleFields) {
          if (
            modelResponse[field] &&
            typeof modelResponse[field] === 'string'
          ) {
            jsonString = modelResponse[field];
            break;
          }
        }

        if (!jsonString) {
          jsonString = JSON.stringify(modelResponse);
        }
      }

      // 提取JSON部分
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);

        // 验证结果格式
        if (validateDiagnosisResult(parsedResult)) {
          return parsedResult;
        }
      }

      throw new Error('无法解析模型响应为有效格?);
    } catch (error) {
      console.error('解析模型响应失败:', error);
      throw new Error('诊断结果格式错误');
    }
  }

  /**
   * 获取会话历史
   */
  private getConversationHistory(
    sessionId?: string
  ): Array<{ role: string; content: string }> {
    if (!sessionId) return [];

    return this.sessionHistories.get(sessionId) || [];
  }

  /**
   * 保存对话轮次
   */
  private saveConversationTurn(
    sessionId: string | undefined,
    userMessage: string,
    aiResponse: string
  ): void {
    if (!sessionId) return;

    const history = this.getConversationHistory(sessionId);

    // 添加用户消息
    history.push({ role: 'user', content: userMessage });
    // 添加AI响应
    history.push({ role: 'assistant', content: aiResponse });

    // 限制历史长度
    if (history.length > 10) {
      this.sessionHistories.set(sessionId, history.slice(-10));
    } else {
      this.sessionHistories.set(sessionId, history);
    }
  }

  /**
   * 生成降级响应（当大模型服务不可用时）
   */
  private generateFallbackResponse(faultDescription: string): DiagnosisResult {
    const lowerDesc = faultDescription.toLowerCase();

    // 基于关键词的预设响应
    if (lowerDesc.includes('充电') || lowerDesc.includes('充不进电')) {
      return {
        faultCauses: [
          {
            reason: '充电接口故障',
            confidence: 0.8,
            probability: '�?,
            description: '充电口可能存在灰尘堆积或物理损坏',
          },
          {
            reason: '充电线缆问题',
            confidence: 0.7,
            probability: '�?,
            description: '充电线可能出现断裂或接触不良',
          },
          {
            reason: '电池老化',
            confidence: 0.6,
            probability: '�?,
            description: '电池寿命到期导致无法正常充电',
          },
        ],
        solutions: [
          {
            title: '清洁充电接口',
            steps: [
              '关闭设备电源',
              '使用干净的软布轻轻擦拭充电口',
              '用牙签小心清理灰尘（注意不要损坏金属触点?,
              '重新尝试充电',
            ],
            estimatedTime: 10,
            difficulty: 1,
          },
          {
            title: '更换充电?,
            steps: [
              '尝试使用其他充电线测?,
              '如果其他线能正常充电，说明原线缆损坏',
              '购买原装或认证的充电线更?,
            ],
            estimatedTime: 5,
            difficulty: 1,
          },
        ],
        recommendedParts: [
          {
            partName: '原装充电?,
            estimatedCost: { min: 50, max: 150 },
          },
          {
            partName: '充电接口模块',
            estimatedCost: { min: 80, max: 200 },
          },
        ],
        nextQuestions: [
          '设备是否有跌落或进水经历?,
          '充电时指示灯是否亮起?,
          '使用其他充电器是否能正常充电?,
        ],
        estimatedTotalTime: 30,
        estimatedTotalCost: { min: 50, max: 350 },
        confidenceLevel: '�?,
        deviceCategory: DeviceCategory.MOBILE_PHONE,
        severityLevel: '一?,
      };
    }

    // 默认响应
    return {
      faultCauses: [
        {
          reason: '通用硬件故障',
          confidence: 0.5,
          probability: '�?,
          description: '需要进一步检测确定具体故障点',
        },
      ],
      solutions: [
        {
          title: '基础故障排查',
          steps: [
            '重启设备',
            '检查连接状?,
            '更新系统软件',
            '联系专业技术支?,
          ],
          estimatedTime: 20,
          difficulty: 2,
        },
      ],
      recommendedParts: [],
      nextQuestions: ['能否详细描述故障现象?, '设备使用多长时间了？'],
      estimatedTotalTime: 30,
      estimatedTotalCost: { min: 0, max: 500 },
      confidenceLevel: '�?,
      severityLevel: '一?,
    };
  }

  /**
   * 记录分析日志
   */
  private logAnalysis(
    faultDescription: string,
    result: DiagnosisResult,
    processingTime: number
  ): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('=== AI诊断分析日志 ===')// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`故障描述: ${faultDescription}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`处理时间: ${processingTime}ms`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`置信? ${result.confidenceLevel}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`故障原因数量: ${result.faultCauses.length}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`解决方案数量: ${result.solutions.length}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`推荐配件数量: ${result.recommendedParts.length}`)// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('=====================')}

  /**
   * 清理会话历史
   */
  clearSession(sessionId: string): void {
    this.sessionHistories.delete(sessionId);
  }

  /**
   * 获取会话统计信息
   */
  getSessionStats(
    sessionId: string
  ): { messageCount: number; totalTime: number } | null {
    const history = this.sessionHistories.get(sessionId);
    if (!history || history.length === 0) return null;

    return {
      messageCount: history.length,
      totalTime: 0, // 可以扩展为计算总对话时?    };
  }
}

// 导出单例实例
export const diagnosisService = new DiagnosisAnalysisService();
