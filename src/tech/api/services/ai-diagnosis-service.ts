// AI诊断服务
// 模拟AI诊断逻辑（生产环境应替换为真实的AI API）

// 诊断历史缓存（生产环境应该使用Redis）
const diagnosisSessions = new Map<string, any[]>();

interface DiagnosisMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ProductInfo {
  brand: string;
  model: string;
  category: string;
  symptoms: string[];
}

export class AIDiagnosisService {
  // 获取产品相关信息
  static async getProductContext(productId: string): Promise<ProductInfo | null> {
    // 这里应该查询数据库获取产品信息
    // 暂时返回模拟数据
    return {
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      category: '手机',
      symptoms: ['无法开机', '电池耗电快', '屏幕闪烁']
    };
  }

  // 生成诊断提示词
  static generateDiagnosisPrompt(productInfo: ProductInfo, userMessage: string): string {
    return `你是一个专业的产品维修技师AI助手。请基于以下产品信息为用户提供诊断建议：

产品信息：
品牌：${productInfo.brand}
型号：${productInfo.model}
类别：${productInfo.category}

用户描述的问题：${userMessage}

请按照以下步骤进行诊断：

1. 分析用户描述的症状
2. 结合该产品的常见故障模式
3. 提供可能的原因分析
4. 给出具体的解决方案或建议
5. 如果需要更多信息，请提出针对性的问题

请用简洁明了的语言回答，并在适当时候询问更多细节。`;
  }

  // 处理诊断对话
  static async processDiagnosis(
    sessionId: string,
    userMessage: string,
    productId?: string
  ): Promise<{ response: string; suggestions: string[] }> {
    try {
      // 获取会话历史
      let conversationHistory = diagnosisSessions.get(sessionId) || [];
      
      // 如果有产品ID，获取产品上下文
      let productInfo: ProductInfo | null = null;
      if (productId) {
        productInfo = await this.getProductContext(productId);
      }

      // 构建系统提示词
      let systemPrompt = '你是一个专业的产品维修技师AI助手，专门帮助用户诊断和解决产品故障问题。';
      if (productInfo) {
        systemPrompt = this.generateDiagnosisPrompt(productInfo, userMessage);
      }

      // 准备消息历史
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // 添加历史对话（限制最近10轮）
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));

      // 添加当前用户消息
      messages.push({ role: 'user', content: userMessage });

      // 模拟AI响应（生产环境应替换为真实的AI API调用）
      const aiResponse = this.generateMockResponse(userMessage, productInfo);

      // 保存对话历史
      const newUserMessage: DiagnosisMessage = {
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      };
      
      const newAiMessage: DiagnosisMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };

      conversationHistory.push(newUserMessage, newAiMessage);
      
      // 限制历史记录长度
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
      
      diagnosisSessions.set(sessionId, conversationHistory);

      // 生成相关建议
      const suggestions = this.generateSuggestions(userMessage, productInfo);

      return {
        response: aiResponse,
        suggestions: suggestions
      };

    } catch (error) {
      console.error('AI诊断服务错误:', error);
      throw new Error('诊断服务暂时不可用，请稍后再试');
    }
  }

  // 生成快捷建议
  static generateSuggestions(userMessage: string, productInfo?: ProductInfo | null): string[] {
    const suggestions: string[] = [];
    
    // 基于关键词的建议
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('不开机') || lowerMessage.includes('无法开机')) {
      suggestions.push('检查充电线和充电器是否正常');
      suggestions.push('尝试强制重启设备');
      suggestions.push('检查电池是否有电');
    }
    
    if (lowerMessage.includes('屏幕') || lowerMessage.includes('显示')) {
      suggestions.push('检查屏幕连接线是否松动');
      suggestions.push('尝试调整亮度设置');
      suggestions.push('检查是否有物理损坏');
    }
    
    if (lowerMessage.includes('声音') || lowerMessage.includes('音频')) {
      suggestions.push('检查音量设置');
      suggestions.push('清理扬声器孔');
      suggestions.push('尝试重启设备');
    }
    
    if (lowerMessage.includes('网络') || lowerMessage.includes('连接')) {
      suggestions.push('检查WiFi/蓝牙开关');
      suggestions.push('重启路由器');
      suggestions.push('忘记网络后重新连接');
    }
    
    // 基于产品类型的通用建议
    if (productInfo) {
      suggestions.push(`查看${productInfo.brand} ${productInfo.model}官方故障排除指南`);
      suggestions.push('联系官方客服获取专业支持');
    }
    
    // 返回最多5个建议
    return [...new Set(suggestions)].slice(0, 5);
  }

  // 清理会话历史
  static clearSession(sessionId: string): void {
    diagnosisSessions.delete(sessionId);
  }

  // 获取会话摘要
  static getSessionSummary(sessionId: string): { messageCount: number; duration: string } | null {
    const history = diagnosisSessions.get(sessionId);
    if (!history || history.length === 0) return null;

    const firstMessage = history[0];
    const lastMessage = history[history.length - 1];
    const durationMs = lastMessage.timestamp - firstMessage.timestamp;
    
    return {
      messageCount: history.length,
      duration: this.formatDuration(durationMs)
    };
  }

  // 格式化持续时间
  static formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    }
    return `${seconds}秒`;
  }

  // 生成模拟AI响应
  static generateMockResponse(userMessage: string, productInfo?: ProductInfo | null): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // 基于关键词的响应模板
    if (lowerMessage.includes('不开机') || lowerMessage.includes('无法开机')) {
      return `根据您的描述，设备无法开机可能是以下原因：

1. 电池电量不足 - 请尝试充电30分钟后再开机
2. 系统卡死 - 可以尝试强制重启（按住电源键10秒）
3. 硬件故障 - 建议联系售后检测

请问您已经尝试过哪些操作？`;
    }
    
    if (lowerMessage.includes('屏幕') || lowerMessage.includes('显示')) {
      return `屏幕问题通常有以下几个方向：

1. 屏幕亮度设置 - 检查是否调至最低
2. 显示驱动问题 - 尝试重启设备
3. 物理损坏 - 查看是否有裂痕或进水痕迹

能详细描述一下具体现象吗？比如是完全黑屏还是有显示异常？`;
    }
    
    if (lowerMessage.includes('声音') || lowerMessage.includes('没声音')) {
      return `声音问题排查建议：

1. 音量设置检查 - 确认不是静音模式
2. 扬声器堵塞 - 检查是否有灰尘遮挡
3. 软件冲突 - 尝试重启或恢复出厂设置

您是在什么情况下发现没有声音的？`;
    }
    
    if (lowerMessage.includes('发热') || lowerMessage.includes('烫')) {
      return `设备发热是常见现象，但如果过热需要注意：

1. 正常使用发热 - 运行大型应用时温度会上升
2. 异常发热 - 可能是电池或散热问题
3. 环境因素 - 高温环境下使用会加剧发热

建议您先停止使用，让设备冷却一段时间。`;
    }
    
    // 默认响应
    return `感谢您的咨询。为了更好地帮助您解决问题，请提供更详细的故障描述，比如：

1. 具体的故障现象
2. 出现问题的时间和频率
3. 是否进行过相关操作
4. 设备的基本信息

这样我能给出更精准的诊断建议。`;
  }
}