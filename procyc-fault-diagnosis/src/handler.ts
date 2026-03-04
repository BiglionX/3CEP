/**
 * 故障诊断核心逻辑
 * 基于知识库和规则引擎实现智能诊断
 */

import { SkillInput, FaultCase } from './types';

/**
 * 故障知识库 - 包含常见 3C 设备故障案例
 */
const FAULT_KNOWLEDGE_BASE: FaultCase[] = [
  // ==================== 手机故障 ====================
  {
    id: 'MOBILE-001',
    deviceTypes: ['mobile'],
    brands: ['Apple'],
    symptoms: ['屏幕出现绿色线条', '触摸响应迟钝', '屏幕闪烁'],
    diagnosis: {
      issue: '屏幕排线损坏或接触不良',
      confidence: 0.9,
      description:
        '屏幕排线可能因跌落、挤压或进水导致接触不良或损坏，需要检查或更换屏幕总成',
    },
    suggestedParts: [
      {
        partName: '屏幕总成',
        partCategory: 'Display',
        priority: 'high',
        reason: '需要更换屏幕以解决显示和触摸问题',
      },
      {
        partName: '屏幕排线',
        partCategory: 'Cable',
        priority: 'medium',
        reason: '可能需要单独更换排线',
      },
    ],
    repairDifficulty: 'moderate',
    estimatedTime: '30-45 分钟',
    keywords: ['屏幕', '线条', '触摸', '显示', 'green line', 'touch'],
  },
  {
    id: 'MOBILE-002',
    deviceTypes: ['mobile'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi'],
    symptoms: ['电池耗电快', '充电慢', '自动关机'],
    diagnosis: {
      issue: '电池老化或损坏',
      confidence: 0.85,
      description: '锂电池长期使用后容量衰减，导致续航下降和意外关机',
    },
    suggestedParts: [
      {
        partName: '电池',
        partCategory: 'Battery',
        priority: 'high',
        reason: '更换新电池可恢复续航能力',
      },
    ],
    repairDifficulty: 'easy',
    estimatedTime: '20-30 分钟',
    keywords: ['电池', '耗电', '充电', '关机', 'battery', 'power'],
  },
  {
    id: 'MOBILE-003',
    deviceTypes: ['mobile'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi'],
    symptoms: ['无法充电', '充电断断续续', 'USB 接口松动'],
    diagnosis: {
      issue: '充电接口损坏或堵塞',
      confidence: 0.88,
      description:
        '尾插接口长期使用可能磨损、氧化或被灰尘堵塞，导致充电接触不良',
    },
    suggestedParts: [
      {
        partName: '充电接口/尾插',
        partCategory: 'Connector',
        priority: 'high',
        reason: '需要更换充电接口组件',
      },
    ],
    repairDifficulty: 'moderate',
    estimatedTime: '40-60 分钟',
    keywords: ['充电', '接口', '尾插', 'usb', 'charging', 'port'],
  },
  {
    id: 'MOBILE-004',
    deviceTypes: ['mobile'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi'],
    symptoms: ['相机模糊', '对焦失败', '相机黑屏'],
    diagnosis: {
      issue: '摄像头模组损坏',
      confidence: 0.82,
      description: '摄像头可能因跌落、进水或电路问题导致损坏，需要检测或更换',
    },
    suggestedParts: [
      {
        partName: '后置摄像头模组',
        partCategory: 'Camera',
        priority: 'high',
        reason: '需要更换摄像头模组',
      },
      {
        partName: '前置摄像头模组',
        partCategory: 'Camera',
        priority: 'medium',
        reason: '如前置相机故障则需要更换',
      },
    ],
    repairDifficulty: 'moderate',
    estimatedTime: '30-45 分钟',
    keywords: ['相机', '拍照', '模糊', '对焦', 'camera', 'lens'],
  },
  {
    id: 'MOBILE-005',
    deviceTypes: ['mobile'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi'],
    symptoms: ['扬声器无声', '声音小', '通话听筒没声音'],
    diagnosis: {
      issue: '扬声器或听筒损坏',
      confidence: 0.8,
      description: '扬声器/听筒可能因进水、灰尘或老化导致损坏',
    },
    suggestedParts: [
      {
        partName: '扬声器/喇叭',
        partCategory: 'Speaker',
        priority: 'high',
        reason: '需要更换扬声器组件',
      },
      {
        partName: '听筒',
        partCategory: 'Receiver',
        priority: 'medium',
        reason: '如通话无声则需要更换听筒',
      },
    ],
    repairDifficulty: 'easy',
    estimatedTime: '20-30 分钟',
    keywords: ['声音', '扬声器', '喇叭', '听筒', 'speaker', 'audio'],
  },

  // ==================== 笔记本电脑故障 ====================
  {
    id: 'LAPTOP-001',
    deviceTypes: ['laptop'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
    symptoms: ['无法开机', '电源指示灯不亮', '黑屏'],
    diagnosis: {
      issue: '电源适配器或主板故障',
      confidence: 0.75,
      description: '可能是电源适配器损坏、电池耗尽或主板供电电路故障',
    },
    suggestedParts: [
      {
        partName: '电源适配器',
        partCategory: 'Charger',
        priority: 'high',
        reason: '首先尝试更换电源适配器',
      },
      {
        partName: '电池',
        partCategory: 'Battery',
        priority: 'medium',
        reason: '电池可能完全放电或损坏',
      },
      {
        partName: '主板',
        partCategory: 'Motherboard',
        priority: 'low',
        reason: '如以上无效，可能为主板故障',
      },
    ],
    repairDifficulty: 'hard',
    estimatedTime: '60-120 分钟',
    keywords: ['开机', '电源', '黑屏', 'power', 'boot', 'adapter'],
  },
  {
    id: 'LAPTOP-002',
    deviceTypes: ['laptop'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
    symptoms: ['屏幕碎裂', '显示异常', '花屏'],
    diagnosis: {
      issue: '屏幕面板损坏',
      confidence: 0.92,
      description: '物理撞击导致屏幕破裂或内部液晶泄漏，需要更换整个屏幕组件',
    },
    suggestedParts: [
      {
        partName: 'LCD/LED 屏幕面板',
        partCategory: 'Display',
        priority: 'high',
        reason: '必须更换损坏的屏幕',
      },
      {
        partName: '屏幕排线',
        partCategory: 'Cable',
        priority: 'medium',
        reason: '建议同时检查并可能更换排线',
      },
    ],
    repairDifficulty: 'moderate',
    estimatedTime: '45-60 分钟',
    keywords: ['屏幕', '碎裂', '显示', '花屏', 'screen', 'display', 'cracked'],
  },
  {
    id: 'LAPTOP-003',
    deviceTypes: ['laptop'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
    symptoms: ['键盘按键失灵', '按键重复输入', '键盘背光不亮'],
    diagnosis: {
      issue: '键盘硬件故障',
      confidence: 0.87,
      description: '键盘可能因进水、灰尘积累或电路老化导致部分按键失效',
    },
    suggestedParts: [
      {
        partName: '笔记本键盘',
        partCategory: 'Keyboard',
        priority: 'high',
        reason: '需要更换整个键盘组件',
      },
    ],
    repairDifficulty: 'moderate',
    estimatedTime: '40-60 分钟',
    keywords: ['键盘', '按键', 'keyboard', 'key', 'typing'],
  },
  {
    id: 'LAPTOP-004',
    deviceTypes: ['laptop'],
    brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
    symptoms: ['运行缓慢', '频繁死机', '硬盘异响'],
    diagnosis: {
      issue: '硬盘故障或系统问题',
      confidence: 0.83,
      description:
        '机械硬盘可能出现坏道，固态硬盘可能寿命将尽，或系统存在软件冲突',
    },
    suggestedParts: [
      {
        partName: 'SSD 固态硬盘',
        partCategory: 'Storage',
        priority: 'high',
        reason: '建议升级为 SSD 或更换新的 SSD',
      },
      {
        partName: '内存条',
        partCategory: 'Memory',
        priority: 'medium',
        reason: '增加内存可改善性能',
      },
    ],
    repairDifficulty: 'easy',
    estimatedTime: '30-45 分钟',
    keywords: ['硬盘', '缓慢', '死机', 'hdd', 'ssd', 'slow', 'freeze'],
  },

  // ==================== 平板电脑故障 ====================
  {
    id: 'TABLET-001',
    deviceTypes: ['tablet'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Lenovo'],
    symptoms: ['屏幕碎裂', '触摸失灵', '显示异常'],
    diagnosis: {
      issue: '屏幕总成损坏',
      confidence: 0.93,
      description: '平板屏幕受到外力撞击导致玻璃破裂或触摸层损坏',
    },
    suggestedParts: [
      {
        partName: '屏幕总成（玻璃 + 触摸）',
        partCategory: 'Display',
        priority: 'high',
        reason: '需要更换整个屏幕组件',
      },
    ],
    repairDifficulty: 'hard',
    estimatedTime: '60-90 分钟',
    keywords: ['屏幕', '平板', '触摸', 'tablet', 'screen', 'cracked'],
  },
  {
    id: 'TABLET-002',
    deviceTypes: ['tablet'],
    brands: ['Apple', 'Samsung', 'Huawei', 'Lenovo'],
    symptoms: ['电池不耐用', '充电困难', '自动重启'],
    diagnosis: {
      issue: '电池老化',
      confidence: 0.86,
      description: '平板电池长期使用后续航能力大幅下降',
    },
    suggestedParts: [
      {
        partName: '内置电池',
        partCategory: 'Battery',
        priority: 'high',
        reason: '更换新电池恢复续航',
      },
    ],
    repairDifficulty: 'hard',
    estimatedTime: '60-90 分钟',
    keywords: ['电池', '充电', '续航', 'tablet', 'battery', 'power'],
  },

  // ==================== 台式机故障 ====================
  {
    id: 'DESKTOP-001',
    deviceTypes: ['desktop'],
    brands: [],
    symptoms: ['无法开机', '风扇不转', '无任何反应'],
    diagnosis: {
      issue: '电源供应器 (PSU) 故障',
      confidence: 0.8,
      description: '台式机电源可能因雷击、电压不稳或老化导致损坏',
    },
    suggestedParts: [
      {
        partName: '电脑电源 (PSU)',
        partCategory: 'Power Supply',
        priority: 'high',
        reason: '需要更换电源供应器',
      },
    ],
    repairDifficulty: 'easy',
    estimatedTime: '20-30 分钟',
    keywords: ['开机', '电源', '台式', 'desktop', 'psu', 'power supply'],
  },
  {
    id: 'DESKTOP-002',
    deviceTypes: ['desktop'],
    brands: [],
    symptoms: ['显示器无信号', '黑屏', '开机报警'],
    diagnosis: {
      issue: '内存或显卡接触不良',
      confidence: 0.78,
      description: '内存条或显卡金手指氧化导致接触不良，或硬件松动',
    },
    suggestedParts: [
      {
        partName: '内存条',
        partCategory: 'Memory',
        priority: 'high',
        reason: '重新插拔或更换内存',
      },
      {
        partName: '独立显卡',
        partCategory: 'Graphics Card',
        priority: 'medium',
        reason: '如使用独显则可能需要更换',
      },
    ],
    repairDifficulty: 'easy',
    estimatedTime: '15-30 分钟',
    keywords: ['显示器', '无信号', '内存', '显卡', 'ram', 'gpu', 'graphics'],
  },
];

/**
 * 技能核心处理逻辑
 * @param input - 输入参数
 * @returns 处理结果
 */
export async function handleRequest(input: SkillInput): Promise<any> {
  const startTime = Date.now();

  // 1. 症状分析和关键词提取
  const extractedKeywords = extractKeywords(input.symptoms);

  // 2. 从知识库中匹配最相关的故障案例
  const matchedCases = matchFaultCases(input, extractedKeywords);

  // 3. 如果没有匹配到，使用通用诊断逻辑
  if (matchedCases.length === 0) {
    return generateGenericDiagnosis(input);
  }

  // 4. 返回最佳匹配的诊断结果
  const bestMatch = matchedCases[0];

  return {
    diagnosis: {
      likelyIssues: [bestMatch.diagnosis],
      suggestedParts: bestMatch.suggestedParts,
      repairDifficulty: bestMatch.repairDifficulty,
      estimatedTime: bestMatch.estimatedTime,
    },
    metadata: {
      matchedCaseId: bestMatch.id,
      totalMatches: matchedCases.length,
    },
  };
}

/**
 * 从症状中提取关键词
 */
function extractKeywords(symptoms: string[]): string[] {
  const keywords: string[] = [];

  symptoms.forEach(symptom => {
    // 中文分词（简化版）
    const chineseWords = symptom.split(/[\s,,.!?.!?,.?]/);
    chineseWords.forEach(word => {
      if (word.trim().length > 0) {
        keywords.push(word.trim().toLowerCase());
      }
    });

    // 添加常见的技术术语映射
    const termMapping: Record<string, string[]> = {
      屏幕: ['screen', 'display'],
      电池: ['battery', 'power'],
      充电: ['charging', 'charge'],
      相机: ['camera', 'photo'],
      键盘: ['keyboard', 'typing'],
      硬盘: ['hdd', 'ssd', 'storage'],
      内存: ['memory', 'ram'],
      开机: ['boot', 'power on'],
      声音: ['audio', 'sound'],
    };

    Object.keys(termMapping).forEach(key => {
      if (symptom.includes(key)) {
        keywords.push(...termMapping[key]);
      }
    });
  });

  return Array.from(new Set(keywords));
}

/**
 * 匹配故障案例
 */
function matchFaultCases(input: SkillInput, keywords: string[]): FaultCase[] {
  const scoredCases: Array<{ case: FaultCase; score: number }> = [];

  FAULT_KNOWLEDGE_BASE.forEach(faultCase => {
    // 检查设备类型是否匹配
    if (!faultCase.deviceTypes.includes(input.deviceType)) {
      return;
    }

    // 如果指定了品牌，检查品牌是否匹配
    if (faultCase.brands && faultCase.brands.length > 0) {
      const brandMatch = faultCase.brands.some(
        brand => brand.toLowerCase() === input.brand.toLowerCase()
      );
      if (!brandMatch) {
        return;
      }
    }

    // 计算症状匹配度
    let score = 0;

    // 关键词匹配
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();

      // 症状匹配
      faultCase.symptoms.forEach(caseSymptom => {
        if (caseSymptom.toLowerCase().includes(keywordLower)) {
          score += 2;
        }
      });

      // 知识库关键词匹配
      faultCase.keywords.forEach(kbKeyword => {
        if (kbKeyword.toLowerCase().includes(keywordLower)) {
          score += 1;
        }
      });
    });

    // 症状直接匹配加分
    input.symptoms.forEach(symptom => {
      if (faultCase.symptoms.some(s => s === symptom)) {
        score += 5;
      }
    });

    if (score > 0) {
      scoredCases.push({ case: faultCase, score });
    }
  });

  // 按分数排序
  scoredCases.sort((a, b) => b.score - a.score);

  return scoredCases.map(item => item.case);
}

/**
 * 生成通用诊断（当没有匹配到特定案例时）
 */
function generateGenericDiagnosis(input: SkillInput): any {
  // 基于设备类型提供通用建议
  const genericAdvice: Record<string, any> = {
    mobile: {
      issue: '需要进一步检测以确定具体问题',
      confidence: 0.5,
      description:
        '根据您描述的症状，建议前往专业维修店进行详细检测。可能的原因包括硬件老化、软件冲突或物理损坏。',
      suggestedParts: [],
      repairDifficulty: 'moderate' as const,
      estimatedTime: '需现场检测',
    },
    tablet: {
      issue: '需要进一步检测以确定具体问题',
      confidence: 0.5,
      description:
        '平板设备结构复杂，建议由专业技术人员检测。请勿自行拆解以免造成进一步损坏。',
      suggestedParts: [],
      repairDifficulty: 'hard' as const,
      estimatedTime: '需现场检测',
    },
    laptop: {
      issue: '需要进一步检测以确定具体问题',
      confidence: 0.5,
      description:
        '笔记本故障可能涉及多个系统，建议使用诊断工具检测或送修专业服务中心。',
      suggestedParts: [],
      repairDifficulty: 'hard' as const,
      estimatedTime: '需现场检测',
    },
    desktop: {
      issue: '需要进一步检测以确定具体问题',
      confidence: 0.5,
      description: '台式机可通过替换法逐步排查故障部件，建议联系专业维修服务。',
      suggestedParts: [],
      repairDifficulty: 'moderate' as const,
      estimatedTime: '需现场检测',
    },
    other: {
      issue: '需要进一步检测以确定具体问题',
      confidence: 0.5,
      description: '请提供更详细的故障描述，或联系专业维修人员进行检测。',
      suggestedParts: [],
      repairDifficulty: 'moderate' as const,
      estimatedTime: '需现场检测',
    },
  };

  const advice = genericAdvice[input.deviceType] || genericAdvice.other;

  return {
    diagnosis: {
      likelyIssues: [
        {
          issue: advice.issue,
          confidence: advice.confidence,
          description: advice.description,
        },
      ],
      suggestedParts: advice.suggestedParts,
      repairDifficulty: advice.repairDifficulty,
      estimatedTime: advice.estimatedTime,
    },
    metadata: {
      matchedCaseId: null,
      totalMatches: 0,
      isGeneric: true,
    },
  };
}
