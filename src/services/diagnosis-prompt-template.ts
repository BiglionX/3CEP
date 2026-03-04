/**
 * 售后诊断专用提示词模? * 为AI故障诊断服务提供专业的提示词和输出格式定? */

// 诊断结果数据结构定义
export interface FaultCause {
  reason: string;
  confidence: number; // 0-1之间的置信度
  probability: '�? | '�? | '�?;
  description?: string;
}

export interface SolutionStep {
  title: string;
  steps: string[];
  estimatedTime: number; // 分钟
  difficulty: 1 | 2 | 3 | 4 | 5; // 1最容易?最?  toolsRequired?: string[];
}

export interface RecommendedPart {
  partName: string;
  partNumber?: string;
  estimatedCost: { min: number; max: number };
  description?: string;
}

export interface DiagnosisResult {
  faultCauses: FaultCause[];
  solutions: SolutionStep[];
  recommendedParts: RecommendedPart[];
  nextQuestions?: string[];
  estimatedTotalTime: number;
  estimatedTotalCost: { min: number; max: number };
  confidenceLevel: '�? | '�? | '�?;
  deviceCategory?: string;
  severityLevel?: '轻微' | '一? | '严重';
}

// 设备类型枚举
export enum DeviceCategory {
  MOBILE_PHONE = '手机',
  LAPTOP = '笔记本电?,
  TABLET = '平板电脑',
  DESKTOP = '台式?,
  SMART_WATCH = '智能手表',
  OTHER = '其他设备',
}

// 故障类型分类
export const FAULT_CATEGORIES = {
  POWER: '电源问题',
  DISPLAY: '显示问题',
  AUDIO: '音频问题',
  NETWORK: '网络连接',
  PERFORMANCE: '性能问题',
  HARDWARE: '硬件故障',
  SOFTWARE: '软件问题',
  CAMERA: '摄像头问?,
  SENSORS: '传感器问?,
};

/**
 * 生成诊断专用系统提示? */
export function generateDiagnosisSystemPrompt(): string {
  return `你是一个专业的电子产品维修技师AI助手，具有丰富的故障诊断经验。你的任务是根据用户描述的故障症状进行专业分析并提供详细的维修建议?
诊断要求?1. 仔细分析用户描述的故障症状，识别关键信息
2. 给出至少3种可能的故障原因，并为每种原因提?-1之间的置信度数?3. 为每种故障原因提供详细的解决方案步骤
4. 推荐可能需要更换的配件及其价格范围
5. 评估每个解决方案的维修难度等级（1-5级，1最容易?最难）
6. 预估总的维修时间和成本范?7. 如果需要更多信息来精确诊断，请提出不超?个针对性问?8. 判断故障的严重程度（轻微/一?严重?
输出格式要求?请严格按照以下JSON格式返回结果，不要包含任何额外的解释文字?
{
  "faultCauses": [
    {
      "reason": "具体的故障原因描?,
      "confidence": 0.85,
      "probability": "�?,
      "description": "详细的原因说?
    }
  ],
  "solutions": [
    {
      "title": "解决方案标题",
      "steps": [
        "具体的解决步?",
        "具体的解决步?"
      ],
      "estimatedTime": 30,
      "difficulty": 3,
      "toolsRequired": ["螺丝刀", "万用?]
    }
  ],
  "recommendedParts": [
    {
      "partName": "配件名称",
      "partNumber": "配件编号（可选）",
      "estimatedCost": {
        "min": 100,
        "max": 200
      },
      "description": "配件用途说?
    }
  ],
  "nextQuestions": ["需要进一步确认的问题1", "需要进一步确认的问题2"],
  "estimatedTotalTime": 45,
  "estimatedTotalCost": {
    "min": 150,
    "max": 300
  },
  "confidenceLevel": "�?,
  "deviceCategory": "手机",
  "severityLevel": "一?
}`;
}

/**
 * 生成用户提示? */
export function generateUserPrompt(
  faultDescription: string,
  deviceInfo?: {
    brand?: string;
    model?: string;
    category?: string;
    purchaseTime?: string;
  },
  conversationHistory?: Array<{ role: string; content: string }>
): string {
  let prompt = `故障描述?{faultDescription}\n\n`;

  if (deviceInfo) {
    prompt += '设备信息：\n';
    if (deviceInfo.brand) prompt += `- 品牌?{deviceInfo.brand}\n`;
    if (deviceInfo.model) prompt += `- 型号?{deviceInfo.model}\n`;
    if (deviceInfo.category) prompt += `- 类别?{deviceInfo.category}\n`;
    if (deviceInfo.purchaseTime)
      prompt += `- 购买时间?{deviceInfo.purchaseTime}\n`;
    prompt += '\n';
  }

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += '对话历史（最?轮）：\n';
    const recentHistory = conversationHistory.slice(-6); // 最?轮对?    recentHistory.forEach((msg, index) => {
      const role = msg.role === 'user' ? '用户' : '技?;
      prompt += `${role}�?{msg.content}\n`;
    });
    prompt += '\n';
  }

  prompt += '请根据以上信息进行专业故障诊断?;

  return prompt;
}

/**
 * 标准化故障描? */
export function normalizeFaultDescription(description: string): string {
  const mappings: Record<string, string> = {
    // 电源相关
    充不进电: '无法充电',
    充不上电: '无法充电',
    不能充电: '无法充电',
    充电很慢: '充电缓慢',
    不开? '无法开?,
    开不了? '无法开?,
    打不开? '无法开?,
    自动关机: '频繁关机',

    // 显示相关
    黑屏: '屏幕无显?,
    白屏: '屏幕显示异常',
    花屏: '屏幕显示异常',
    闪屏: '屏幕闪烁',
    屏幕不亮: '屏幕无显?,
    屏幕模糊: '显示不清?,

    // 音频相关
    没声? '无音频输?,
    听不到声? '无音频输?,
    声音? '音量过小',
    杂音: '音频有杂?,
    破音: '音频失真',

    // 网络相关
    连不上网: '无法连接网络',
    WiFi连不? '无法连接WiFi',
    信号? '网络信号?,
    网速慢: '网络速度?,

    // 性能相关
    卡顿: '运行卡顿',
    很慢: '运行缓慢',
    发热: '设备过热',
    发烫: '设备过热',
    死机: '系统无响?,

    // 其他
    进水: '设备进水',
    摔了: '物理损伤',
    按键失灵: '按键无响?,
  };

  let normalized = description.trim().toLowerCase();

  // 应用映射
  for (const [term, replacement] of Object.entries(mappings)) {
    normalized = normalized.replace(new RegExp(term, 'g'), replacement);
  }

  // 移除多余空格
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * 验证诊断结果格式
 */
export function validateDiagnosisResult(
  result: any
): result is DiagnosisResult {
  if (!result || typeof result !== 'object') return false;

  // 检查必需字段
  const requiredFields = [
    'faultCauses',
    'solutions',
    'recommendedParts',
    'estimatedTotalTime',
    'estimatedTotalCost',
  ];
  for (const field of requiredFields) {
    if (!(field in result)) return false;
  }

  // 检查数组字?  if (
    !Array.isArray(result.faultCauses) ||
    !Array.isArray(result.solutions) ||
    !Array.isArray(result.recommendedParts)
  ) {
    return false;
  }

  // 检查基本数据类?  if (
    typeof result.estimatedTotalTime !== 'number' ||
    typeof result.estimatedTotalCost !== 'object'
  ) {
    return false;
  }

  return true;
}
