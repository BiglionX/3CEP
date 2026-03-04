// AI故障诊断服务核心?
export interface DiagnosisRequest {
  deviceId: string;
  symptoms: string;
  conversationHistory?: ChatMessage[];
  language?: string;
}

export interface DiagnosisResult {
  faultId?: string;
  confidence: number; // 0-1
  diagnosis: string;
  suggestedSolutions: Solution[];
  nextQuestions?: string[];
  estimatedTime?: number; // 预估修复时间(分钟)
  difficultyLevel?: 1 | 2 | 3 | 4 | 5;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Solution {
  id: string;
  title: string;
  steps: Step[];
  requiredTools: string[];
  estimatedCost: { min: number; max: number };
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface Step {
  id: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  estimatedDuration: number; // 分钟
}

export interface FaultKnowledge {
  faultId: string;
  name: string;
  category: string;
  commonSymptoms: string[];
  diagnosticQuestions: QuestionTree;
  solutionSteps: Step[];
  requiredTools: string[];
  estimatedCost: { min: number; max: number };
  videoResources: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
}

export interface QuestionTree {
  question: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
  nextQuestion?: QuestionTree;
  leadsToFault?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  deviceId: string;
  status: 'active' | 'completed' | 'expired';
  messages: ChatMessage[];
  currentFault?: string;
  confidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisFeedback {
  diagnosisId: string;
  userId: string;
  rating: number; // 1-5�?  feedback: string;
  wasHelpful: boolean;
}

export class AIDiagnosisService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey =
      process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
    this.apiUrl =
      process.env.DEEPSEEK_API_URL ||
      'https://api.deepseek.com/v1/chat/completions';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  }

  /**
   * 主要诊断方法
   */
  async diagnose(request: DiagnosisRequest): Promise<DiagnosisResult> {
    try {
      // 1. 预处理用户输?      const processedSymptoms = this.preprocessSymptoms(request.symptoms);

      // 2. 基于知识库的初步匹配
      const knowledgeMatches = await this.searchKnowledgeBase(
        processedSymptoms,
        request.deviceId
      );

      // 3. 如果有高置信度匹配，直接返回
      if (
        knowledgeMatches.length > 0 &&
        knowledgeMatches[0].confidence >= 0.8
      ) {
        return this.formatKnowledgeBasedResult(knowledgeMatches[0]);
      }

      // 4. 调用AI大模型进行深度分?      const aiResult = await this.callAIDiagnosis(request, knowledgeMatches);

      // 5. 后处理和格式化结?      return this.postProcessResult(aiResult, knowledgeMatches);
    } catch (error) {
      console.error('AI诊断失败:', error);
      throw new Error('诊断服务暂时不可用，请稍后重?);
    }
  }

  /**
   * 预处理症状描?   */
  private preprocessSymptoms(symptoms: string): string {
    // 移除多余空格和标?    let processed = symptoms.trim().toLowerCase();

    // 标准化常见术?    const termMappings: Record<string, string> = {
      开不了? '无法开?,
      打不开: '无法开?,
      黑屏: '屏幕无显?,
      花屏: '屏幕显示异常',
      没声? '无音频输?,
      充不进电: '无法充电',
      发热: '设备过热',
    };

    for (const [term, replacement] of Object.entries(termMappings)) {
      processed = processed.replace(new RegExp(term, 'g'), replacement);
    }

    return processed;
  }

  /**
   * 搜索本地知识?   */
  private async searchKnowledgeBase(
    symptoms: string,
    deviceId: string
  ): Promise<Array<{ fault: FaultKnowledge; confidence: number }>> {
    // 这里应该调用实际的知识库搜索服务
    // 暂时返回模拟数据
    const mockResults = [
      {
        fault: {
          faultId: 'screen-crack-001',
          name: '屏幕碎裂',
          category: '屏幕故障',
          commonSymptoms: ['屏幕有裂?, '触摸不灵?, '显示异常'],
          diagnosticQuestions: {
            question: '屏幕是否有明显裂痕？',
            options: [
              { id: 'yes', text: '是的，有明显裂痕' },
              { id: 'no', text: '没有明显裂痕' },
            ],
          },
          solutionSteps: [
            {
              id: 'step1',
              description: '关闭设备电源',
              estimatedDuration: 1,
            },
            {
              id: 'step2',
              description: '小心拆卸损坏的屏?,
              estimatedDuration: 15,
            },
            {
              id: 'step3',
              description: '安装新屏幕并测试',
              estimatedDuration: 10,
            },
          ],
          requiredTools: ['螺丝刀套装', '吸盘', '撬棒'],
          estimatedCost: { min: 200, max: 500 },
          videoResources: ['https://example.com/screen-repair-video'],
          difficultyLevel: 3 as const,
        },
        confidence: 0.75,
      },
    ];

    return mockResults.filter(result =>
      result.fault.commonSymptoms.some(symptom => symptoms.includes(symptom))
    );
  }

  /**
   * 调用AI大模型进行诊?   */
  private async callAIDiagnosis(
    request: DiagnosisRequest,
    knowledgeMatches: any[]
  ): Promise<any> {
    const systemPrompt = `
你是一个专业的电子产品维修专家AI助手。请根据用户描述的症状进行故障诊断?
诊断要求?1. 分析用户描述的问题症?2. 给出可能的故障原因和置信?3. 提供详细的解决方案步?4. 估计修复难度和所需时间
5. 如需要更多信息，请提出针对性的问题

请以JSON格式返回结果?{
  "faultId": "故障ID（如果有匹配的话?,
  "confidence": 0.95,
  "diagnosis": "详细的诊断说?,
  "suggestedSolutions": [
    {
      "title": "解决方案标题",
      "steps": [
        {
          "description": "步骤描述",
          "estimatedDuration": 10
        }
      ],
      "requiredTools": ["工具1", "工具2"],
      "estimatedCost": {"min": 100, "max": 300},
      "difficultyLevel": 3
    }
  ],
  "nextQuestions": ["需要进一步确认的问题"],
  "estimatedTime": 30,
  "difficultyLevel": 3
}
`;

    const userPrompt = `
设备ID: ${request.deviceId}
症状描述: ${request.symptoms}
语言: ${request.language || 'zh'}

${
  knowledgeMatches.length > 0
    ? `参考知识库匹配结果（置信度最高）: ${JSON.stringify(knowledgeMatches[0]?.fault, null, 2)}`
    : '无匹配的知识库结?
}

${
  request.conversationHistory
    ? `对话历史: ${JSON.stringify(request.conversationHistory.slice(-3))}`
    : '首次诊断'
}`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API调用失败: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // 尝试解析JSON响应
      try {
        return JSON.parse(aiResponse);
      } catch {
        // 如果不是JSON格式，构造基本响?        return {
          confidence: 0.6,
          diagnosis: aiResponse,
          suggestedSolutions: [],
          nextQuestions: ['能否提供更多关于问题的详细描述？'],
        };
      }
    } catch (error) {
      console.error('AI API调用错误:', error);
      // 返回默认响应
      return {
        confidence: 0.1,
        diagnosis: '抱歉，当前无法连接到AI诊断服务。请稍后重试或联系人工客服?,
        suggestedSolutions: [],
        nextQuestions: [],
      };
    }
  }

  /**
   * 格式化基于知识库的结?   */
  private formatKnowledgeBasedResult(match: any): DiagnosisResult {
    return {
      faultId: match.fault.faultId,
      confidence: match.confidence,
      diagnosis: `根据您的描述，这很可能是${match.fault.name}问题。\n\n常见症状包括?{match.fault.commonSymptoms.join('�?)}`,
      suggestedSolutions: [
        {
          id: `solution-${match.fault.faultId}`,
          title: `修复${match.fault.name}`,
          steps: match.fault.solutionSteps,
          requiredTools: match.fault.requiredTools,
          estimatedCost: match.fault.estimatedCost,
          difficultyLevel: match.fault.difficultyLevel,
        },
      ],
      estimatedTime: match.fault.solutionSteps.reduce(
        (sum: number, step: Step) => sum + step.estimatedDuration,
        0
      ),
      difficultyLevel: match.fault.difficultyLevel,
    };
  }

  /**
   * 后处理AI结果
   */
  private postProcessResult(
    aiResult: any,
    knowledgeMatches: any[]
  ): DiagnosisResult {
    // 确保必需字段存在
    const result: DiagnosisResult = {
      faultId: aiResult.faultId,
      confidence: aiResult.confidence || 0.5,
      diagnosis: aiResult.diagnosis || '无法确定具体故障原因',
      suggestedSolutions: aiResult.suggestedSolutions || [],
      nextQuestions: aiResult.nextQuestions || [],
      estimatedTime: aiResult.estimatedTime,
      difficultyLevel: aiResult.difficultyLevel,
    };

    // 如果AI结果置信度较低且有知识库匹配，融合两者结?    if (result.confidence < 0.6 && knowledgeMatches.length > 0) {
      const knowledgeResult = this.formatKnowledgeBasedResult(
        knowledgeMatches[0]
      );
      result.confidence = Math.max(
        result.confidence,
        knowledgeResult.confidence * 0.8
      );
      if (result.suggestedSolutions.length === 0) {
        result.suggestedSolutions = knowledgeResult.suggestedSolutions;
      }
    }

    return result;
  }

  /**
   * 获取故障建议
   */
  async getFaultSuggestions(
    deviceId: string,
    userInput: string
  ): Promise<FaultKnowledge[]> {
    const processedInput = this.preprocessSymptoms(userInput);
    const matches = await this.searchKnowledgeBase(processedInput, deviceId);
    return matches.map(match => match.fault);
  }

  /**
   * 生成解决方案步骤
   */
  async generateSolutionSteps(
    faultId: string,
    deviceInfo: any
  ): Promise<Step[]> {
    // 根据故障ID和设备信息生成具体的解决方案步骤
    // 这里可以调用更详细的解决方案生成服务
    return [
      {
        id: 'general-step-1',
        description: '请先确认设备的具体型号和故障现象',
        estimatedDuration: 2,
      },
      {
        id: 'general-step-2',
        description: '检查设备是否有物理损坏',
        estimatedDuration: 5,
      },
      {
        id: 'general-step-3',
        description: '尝试重启设备',
        estimatedDuration: 1,
      },
    ];
  }
}
