/**
 * 示例智能体：销售助? * 演示如何使用FixCycle Agent SDK创建智能? */

import {
  BaseAgent,
  Agent,
  ValidateInput,
  FormatOutput,
  HandleError,
} from '../index';
import { AgentInput, AgentOutput, AgentConfig, AgentInfo } from '../types';

@Agent({
  name: 'Sales Assistant',
  version: '1.0.0',
  description: '专业的销售对话助手，能够自动跟进客户、生成报价单和合?,
  category: 'sales',
  tags: ['销?, 'CRM', '自动?],
})
export class SalesAssistantAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    const info: AgentInfo = {
      id: 'sales-assistant',
      name: 'Sales Assistant',
      description: '专业的销售对话助?,
      version: '1.0.0',
      category: 'sales',
      tags: ['销?, 'CRM', '自动?],
      author: 'FixCycle Team',
    };

    super(info, config);
  }

  protected async onInitialize(): Promise<void> {
    this.logDebug('Sales Assistant Agent initializing...');
    // 这里可以进行一些初始化工作，比如加载模型、建立连接等
    await this.simulateInitialization();
    this.logDebug('Sales Assistant Agent initialized successfully');
  }

  @ValidateInput(input => {
    if (!input.content || typeof input.content !== 'string') {
      return 'Input content is required and must be a string';
    }
    if (input.content.length > 1000) {
      return 'Input content is too long (max 1000 characters)';
    }
    return true;
  })
  @FormatOutput(output => ({
    ...output,
    content: output.content.trim(),
    metadata: {
      ...output.metadata,
      processedAt: new Date().toISOString(),
      agent: 'Sales Assistant',
    },
  }))
  @HandleError(error => {
    console.error('Sales Assistant processing error:', error);
    return {
      content: '抱歉，我在处理您的请求时遇到了问题，请稍后再试?,
      metadata: { error: error.message },
    };
  })
  protected async onProcess(input: AgentInput): Promise<AgentOutput> {
    this.logDebug('Processing sales request:', input.content);

    // 模拟处理过程
    await this.simulateProcessing();

    // 根据输入内容生成响应
    const response = this.generateSalesResponse(input.content, input.context);

    const output: AgentOutput = {
      content: response,
      tokensUsed: Math.ceil(input.content.length / 4), // 简单估?      metadata: {
        inputType: this.classifyInput(input.content),
        confidence: 0.95,
      },
    };

    this.logDebug('Generated response:', output.content);
    return output;
  }

  protected async onDestroy(): Promise<void> {
    this.logDebug('Cleaning up Sales Assistant Agent...');
    // 清理资源
    await this.simulateCleanup();
    this.logDebug('Sales Assistant Agent cleaned up');
  }

  private async simulateInitialization(): Promise<void> {
    // 模拟初始化延?    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async simulateProcessing(): Promise<void> {
    // 模拟处理延迟
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  private async simulateCleanup(): Promise<void> {
    // 模拟清理延迟
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  private generateSalesResponse(
    content: string,
    context?: Record<string, any>
  ): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('报价') || lowerContent.includes('价格')) {
      return `感谢您的询价！我们的产品具有以下优势?�?高性价比解决方?�?专业技术支?�?灵活的付款方?�?完善的售后服?
我可以为您提供详细的报价单，请问您需要了解哪款产品的具体信息？`;
    }

    if (lowerContent.includes('合同') || lowerContent.includes('签约')) {
      return `我们很高兴与您合作！我们的标准合同包含：
�?明确的服务条?�?合理的价格结?�?完善的保障机?�?灵活的合作模?
您可以选择我们的标准模板，也可以根据具体需求定制合同条款。`;
    }

    if (lowerContent.includes('跟进') || lowerContent.includes('联系')) {
      return `我会及时跟进您的需求！我的工作安排如下?�?24小时内响应您的咨?�?定期提供项目进展报告
�?主动分享行业最新动?�?协助解决各种技术问?
请问有什么具体事项需要我立即处理吗？`;
    }

    // 默认响应
    return `您好！我是您的销售助手，可以帮助您：
�?产品咨询和报?�?合同洽谈和签?�?项目跟进和支?�?售后服务协调

请告诉我您的具体需求，我会尽力为您提供专业服务！`;
  }

  private classifyInput(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('报价') || lowerInput.includes('价格')) {
      return 'pricing';
    }

    if (lowerInput.includes('合同') || lowerInput.includes('签约')) {
      return 'contract';
    }

    if (lowerInput.includes('跟进') || lowerInput.includes('联系')) {
      return 'followup';
    }

    return 'general';
  }
}
