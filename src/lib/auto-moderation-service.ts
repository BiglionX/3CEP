/**
 * 自动内容审核服务
 * FixCycle 6.0 智能审核引擎
 */

export interface ContentItem {
  /** 内容ID */
  id: string;
  /** 内容类型 */
  type: 'text' | 'image' | 'video' | 'audio' | 'mixed';
  /** 内容主体 */
  content: string;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 标签 */
  tags?: string[];
  /** 作者ID */
  authorId: string;
  /** 提交时间 */
  submittedAt: number;
  /** 上下文信?*/
  context?: {
    category?: string;
    language?: string;
    source?: string;
    metadata?: Record<string, any>;
  };
}

export interface ModerationResult {
  /** 审核ID */
  id: string;
  /** 内容ID */
  contentId: string;
  /** 审核状?*/
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'manual_review';
  /** 风险等级 */
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  /** 审核分数 */
  score: number;
  /** 检测到的问?*/
  issues: ModerationIssue[];
  /** 建议操作 */
  recommendation: 'approve' | 'reject' | 'flag' | 'review';
  /** 审核时间 */
  moderatedAt: number;
  /** 审核器信?*/
  moderator: string;
  /** 置信?*/
  confidence: number;
}

export interface ModerationIssue {
  /** 问题类型 */
  type: string;
  /** 问题描述 */
  description: string;
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high' | 'severe';
  /** 相关文本片段 */
  snippet?: string;
  /** 位置信息 */
  position?: {
    start: number;
    end: number;
  };
  /** 置信?*/
  confidence: number;
}

export interface ModerationRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则类型 */
  type: 'keyword' | 'pattern' | 'ml_model' | 'external_api';
  /** 是否启用 */
  enabled: boolean;
  /** 适用内容类型 */
  contentTypes: string[];
  /** 配置参数 */
  config: Record<string, any>;
  /** 权重 */
  weight: number;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
}

export class AutoModerationService {
  private rules: Map<string, ModerationRule> = new Map();
  private sensitiveWords: Set<string> = new Set();
  private whitelistWords: Set<string> = new Set();
  private mlModels: Map<string, any> = new Map();
  private externalApis: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.loadSensitiveWords();
    this.initializeMLModels();
  }

  /**
   * 初始化默认审核规?   */
  private initializeDefaultRules(): void {
    const defaultRules: ModerationRule[] = [
      {
        id: 'profanity_filter',
        name: '脏话过滤?,
        type: 'keyword',
        enabled: true,
        contentTypes: ['text'],
        config: {
          action: 'block',
          sensitivity: 'high',
        },
        weight: 0.8,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'spam_detection',
        name: '垃圾信息检?,
        type: 'pattern',
        enabled: true,
        contentTypes: ['text'],
        config: {
          patterns: [
            '\\b(?:click|free|win|prize|cash)\\b',
            '(.)\\1{5,}', // 重复字符
            '[0-9]{10,}', // 长数字串
          ],
          threshold: 0.6,
        },
        weight: 0.6,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'personal_info_protection',
        name: '个人信息保护',
        type: 'pattern',
        enabled: true,
        contentTypes: ['text'],
        config: {
          patterns: [
            '\\b\\d{11}\\b', // 手机?            '\\b\\d{17}[0-9Xx]\\b', // 身份证号
            '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', // 邮箱
          ],
          action: 'mask',
        },
        weight: 0.9,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'political_sensitivity',
        name: '政治敏感内容检?,
        type: 'keyword',
        enabled: true,
        contentTypes: ['text'],
        config: {
          categories: ['politics', 'religion', 'controversial'],
          action: 'flag',
        },
        weight: 0.95,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'copyright_check',
        name: '版权检?,
        type: 'external_api',
        enabled: true,
        contentTypes: ['text', 'image'],
        config: {
          api_endpoint: 'https://api.copyright-check.com/v1/check',
          api_key: process.env.COPYRIGHT_API_KEY,
          threshold: 0.8,
        },
        weight: 0.85,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * 加载敏感词库
   */
  private loadSensitiveWords(): void {
    // 敏感词库 - 实际应用中应该从数据库或配置文件加载
    const sensitiveWords = [
      // 脏话词汇
      'fuck',
      'shit',
      'damn',
      'asshole',
      // 政治敏感?      '政府',
      '领导',
      '政策',
      // 暴力相关
      '暴力',
      '恐?,
      '枪支',
      // 色情相关
      '色情',
      '成人',
      '性爱',
    ];

    const whitelistWords = [
      // 白名单词?      '政府服务',
      '政府网站',
      '领导?,
      '暴力美学',
      '恐怖电?,
      '枪支管制',
    ];

    sensitiveWords.forEach(word => this.sensitiveWords.add(word.toLowerCase()));
    whitelistWords.forEach(word => this.whitelistWords.add(word.toLowerCase()));
  }

  /**
   * 初始化机器学习模?   */
  private initializeMLModels(): void {
    // 实际应用中会加载训练好的ML模型
    this.mlModels.set('sentiment_analysis', {
      name: '情感分析模型',
      version: '1.0.0',
      description: '分析文本情感倾向',
    });

    this.mlModels.set('content_classification', {
      name: '内容分类模型',
      version: '1.0.0',
      description: '对内容进行自动分?,
    });
  }

  /**
   * 审核内容
   */
  async moderateContent(content: ContentItem): Promise<ModerationResult> {
    const issues: ModerationIssue[] = [];
    let totalScore = 0;
    let maxWeight = 0;

    // 并行执行所有启用的规则
    const rulePromises = Array.from(this.rules.values())
      .filter(rule => rule.enabled && this.isRuleApplicable(rule, content))
      .map(rule => this.applyRule(rule, content));

    const ruleResults = await Promise.all(rulePromises);

    // 收集所有问题和计算综合分数
    ruleResults.forEach(({ issues: ruleIssues, score, weight }) => {
      issues.push(...ruleIssues);
      totalScore += score * weight;
      maxWeight += weight;
    });

    // 计算平均分数
    const averageScore = maxWeight > 0 ? totalScore / maxWeight : 0;
    const riskLevel = this.calculateRiskLevel(averageScore, issues);
    const recommendation = this.getRecommendation(riskLevel, issues);

    const result: ModerationResult = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId: content.id,
      status:
        recommendation === 'approve'
          ? 'approved'
          : recommendation === 'reject'
            ? 'rejected'
            : recommendation === 'flag'
              ? 'flagged'
              : 'manual_review',
      riskLevel,
      score: averageScore,
      issues,
      recommendation,
      moderatedAt: Date.now(),
      moderator: 'auto_moderator_v1.0',
      confidence: this.calculateConfidence(issues, averageScore),
    };

    return result;
  }

  /**
   * 检查规则是否适用
   */
  private isRuleApplicable(
    rule: ModerationRule,
    content: ContentItem
  ): boolean {
    return (
      rule.contentTypes.includes(content.type) ||
      rule.contentTypes.includes('mixed')
    );
  }

  /**
   * 应用单个规则
   */
  private async applyRule(
    rule: ModerationRule,
    content: ContentItem
  ): Promise<{
    issues: ModerationIssue[];
    score: number;
    weight: number;
  }> {
    let issues: ModerationIssue[] = [];
    let score = 0;

    switch (rule.type) {
      case 'keyword':
        const keywordResult = this.checkKeywords(content, rule);
        issues = keywordResult.issues;
        score = keywordResult.score;
        break;

      case 'pattern':
        const patternResult = this.checkPatterns(content, rule);
        issues = patternResult.issues;
        score = patternResult.score;
        break;

      case 'ml_model':
        const mlResult = await this.checkMLModel(content, rule);
        issues = mlResult.issues;
        score = mlResult.score;
        break;

      case 'external_api':
        const apiResult = await this.checkExternalAPI(content, rule);
        issues = apiResult.issues;
        score = apiResult.score;
        break;
    }

    return {
      issues,
      score,
      weight: rule.weight,
    };
  }

  /**
   * 关键词检?   */
  private checkKeywords(
    content: ContentItem,
    rule: ModerationRule
  ): {
    issues: ModerationIssue[];
    score: number;
  } {
    const issues: ModerationIssue[] = [];
    const fullText =
      `${content.title || ''} ${content.content} ${content.description || ''}`.toLowerCase();
    let violationCount = 0;

    // 检查敏感词（排除白名单?    for (const word of this.sensitiveWords) {
      if (fullText.includes(word) && !this.whitelistWords.has(word)) {
        // 检查是否在白名单短语中
        const isInWhitelistPhrase = Array.from(this.whitelistWords).some(
          phrase => fullText.includes(phrase) && phrase.includes(word)
        );

        if (!isInWhitelistPhrase) {
          violationCount++;
          issues.push({
            type: 'sensitive_word',
            description: `检测到敏感词汇: "${word}"`,
            severity: 'high',
            snippet: word,
            confidence: 0.9,
          });
        }
      }
    }

    // 计算分数 (0-1, 1表示完全违规)
    const score = Math.min(violationCount * 0.3, 1);

    return { issues, score };
  }

  /**
   * 模式匹配检?   */
  private checkPatterns(
    content: ContentItem,
    rule: ModerationRule
  ): {
    issues: ModerationIssue[];
    score: number;
  } {
    const issues: ModerationIssue[] = [];
    const fullText = `${content.title || ''} ${content.content} ${content.description || ''}`;
    let violationCount = 0;

    const patterns = rule.config.patterns || [];
    const threshold = rule.config.threshold || 0.5;

    patterns.forEach((patternStr: string) => {
      try {
        const pattern = new RegExp(patternStr, 'gi');
        const matches = fullText.match(pattern);

        if (matches) {
          violationCount += matches.length;
          matches.forEach(match => {
            issues.push({
              type: 'pattern_violation',
              description: `匹配违规模式: ${patternStr}`,
              severity: 'medium',
              snippet: match,
              confidence: 0.8,
            });
          });
        }
      } catch (error) {
        console.error('Invalid regex pattern:', patternStr);
      }
    });

    // 计算分数
    const score = Math.min(violationCount * 0.2, 1);

    return { issues, score };
  }

  /**
   * 机器学习模型检?   */
  private async checkMLModel(
    content: ContentItem,
    rule: ModerationRule
  ): Promise<{
    issues: ModerationIssue[];
    score: number;
  }> {
    // 模拟ML模型推理
    const model = this.mlModels.get(rule.id);
    if (!model) {
      return { issues: [], score: 0 };
    }

    // 实际应用中会调用真实的ML模型
    const sentimentScore = Math.random(); // 模拟情感分析结果
    const classificationScore = Math.random(); // 模拟分类结果

    const issues: ModerationIssue[] = [];

    if (sentimentScore < 0.3) {
      issues.push({
        type: 'negative_sentiment',
        description: '检测到强烈的负面情?,
        severity: 'medium',
        confidence: sentimentScore,
      });
    }

    if (classificationScore > 0.7) {
      issues.push({
        type: 'inappropriate_category',
        description: '内容可能属于不当分类',
        severity: 'high',
        confidence: classificationScore,
      });
    }

    const score = Math.max(sentimentScore, classificationScore);

    return { issues, score };
  }

  /**
   * 外部API检?   */
  private async checkExternalAPI(
    content: ContentItem,
    rule: ModerationRule
  ): Promise<{
    issues: ModerationIssue[];
    score: number;
  }> {
    // 模拟外部API调用
    const apiEndpoint = rule.config.api_endpoint;
    if (!apiEndpoint) {
      return { issues: [], score: 0 };
    }

    try {
      // 实际应用中会调用外部API
      const response = await this.mockExternalAPICall(content, rule);

      const issues: ModerationIssue[] = [];
      if (response.violations) {
        response.violations.forEach((violation: any) => {
          issues.push({
            type: violation.type,
            description: violation.description,
            severity: violation.severity,
            confidence: violation.confidence,
          });
        });
      }

      return { issues, score: response.score || 0 };
    } catch (error) {
      console.error('External API call failed:', error);
      return { issues: [], score: 0 };
    }
  }

  /**
   * 模拟外部API调用
   */
  private async mockExternalAPICall(
    content: ContentItem,
    rule: ModerationRule
  ): Promise<any> {
    // 模拟API延迟
    await new Promise(resolve =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    // 模拟API响应
    return {
      score: Math.random(),
      violations:
        Math.random() > 0.8
          ? [
              {
                type: 'copyright_infringement',
                description: '检测到可能的版权侵?,
                severity: 'high',
                confidence: 0.85,
              },
            ]
          : [],
    };
  }

  /**
   * 计算风险等级
   */
  private calculateRiskLevel(
    score: number,
    issues: ModerationIssue[]
  ): 'low' | 'medium' | 'high' | 'severe' {
    const severeIssues = issues.filter(
      issue => issue.severity === 'severe'
    ).length;
    const highIssues = issues.filter(issue => issue.severity === 'high').length;

    if (severeIssues > 0 || score > 0.9) {
      return 'severe';
    } else if (highIssues > 2 || score > 0.7) {
      return 'high';
    } else if (score > 0.4) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 获取建议操作
   */
  private getRecommendation(
    riskLevel: string,
    issues: ModerationIssue[]
  ): 'approve' | 'reject' | 'flag' | 'review' {
    switch (riskLevel) {
      case 'severe':
        return 'reject';
      case 'high':
        return 'flag';
      case 'medium':
        return issues.length > 3 ? 'review' : 'flag';
      default:
        return 'approve';
    }
  }

  /**
   * 计算置信?   */
  private calculateConfidence(
    issues: ModerationIssue[],
    score: number
  ): number {
    if (issues.length === 0) {
      return 0.95; // 无问题时高置信度
    }

    const avgConfidence =
      issues.reduce((sum, issue) => sum + issue.confidence, 0) / issues.length;
    return Math.min(avgConfidence * (1 - score * 0.3), 0.95);
  }

  /**
   * 批量审核内容
   */
  async moderateContents(contents: ContentItem[]): Promise<ModerationResult[]> {
    const results = await Promise.all(
      contents.map(content => this.moderateContent(content))
    );
    return results;
  }

  /**
   * 添加自定义规?   */
  addRule(rule: ModerationRule): void {
    rule.createdAt = Date.now();
    rule.updatedAt = Date.now();
    this.rules.set(rule.id, rule);
  }

  /**
   * 更新规则
   */
  updateRule(ruleId: string, updates: Partial<ModerationRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates, { updatedAt: Date.now() });
    this.rules.set(ruleId, rule);
    return true;
  }

  /**
   * 删除规则
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * 获取所有规?   */
  getAllRules(): ModerationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    sensitiveWords: number;
    mlModels: number;
    externalApis: number;
  } {
    return {
      totalRules: this.rules.size,
      enabledRules: Array.from(this.rules.values()).filter(r => r.enabled)
        .length,
      sensitiveWords: this.sensitiveWords.size,
      mlModels: this.mlModels.size,
      externalApis: this.externalApis.size,
    };
  }
}

// 导出全局自动审核服务实例
export const autoModerationService = new AutoModerationService();
