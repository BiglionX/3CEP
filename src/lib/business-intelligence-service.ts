export interface KPIData {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

export interface ExecutiveDashboard {
  kpis: KPIData[];
  revenueMetrics: {
    monthlyRevenue: number;
    growthRate: number;
    forecast: number;
  };
  userMetrics: {
    activeUsers: number;
    retentionRate: number;
    acquisitionCost: number;
  };
  operationalMetrics: {
    systemUptime: number;
    responseTime: number;
    errorRate: number;
  };
}

export class BusinessIntelligenceService {
  /**
   * 获取高管决策看板数据
   */
  async getExecutiveDashboard(): Promise<ExecutiveDashboard> {
    // 模拟实时数据获取
    const now = new Date();

    return {
      kpis: [
        {
          name: '月度收入',
          value: this.generateRealisticValue(1500000, 2000000),
          target: 1800000,
          trend: this.getRandomTrend(),
          change: this.generateChangePercentage(-10, 25),
          unit: '元',
        },
        {
          name: '活跃用户数',
          value: this.generateRealisticValue(85000, 120000),
          target: 100000,
          trend: this.getRandomTrend(),
          change: this.generateChangePercentage(-5, 30),
          unit: '人',
        },
        {
          name: '转化率',
          value: this.generateRealisticValue(12, 25),
          target: 20,
          trend: this.getRandomTrend(),
          change: this.generateChangePercentage(-3, 8),
          unit: '%',
        },
        {
          name: '客户满意度',
          value: this.generateRealisticValue(85, 95),
          target: 90,
          trend: this.getRandomTrend(),
          change: this.generateChangePercentage(-2, 5),
          unit: '分',
        },
      ],
      revenueMetrics: {
        monthlyRevenue: this.generateRealisticValue(1500000, 2000000),
        growthRate: this.generateChangePercentage(-5, 25),
        forecast: this.generateRealisticValue(1800000, 2200000),
      },
      userMetrics: {
        activeUsers: this.generateRealisticValue(85000, 120000),
        retentionRate: this.generateRealisticValue(75, 85),
        acquisitionCost: this.generateRealisticValue(150, 300),
      },
      operationalMetrics: {
        systemUptime: this.generateRealisticValue(99.5, 99.9),
        responseTime: this.generateRealisticValue(120, 280),
        errorRate: this.generateRealisticValue(0.1, 0.8),
      },
    };
  }

  /**
   * 获取预测分析数据
   */
  async getPredictiveAnalytics(
    timeHorizon: 'month' | 'quarter' | 'year' = 'month'
  ) {
    const periods =
      timeHorizon === 'month' ? 12 : timeHorizon === 'quarter' ? 8 : 5;

    const predictions = [];
    let baseValue = this.generateRealisticValue(1500000, 2000000);

    for (let i = 0; i < periods; i++) {
      const growthFactor = 1 + this.generateChangePercentage(-2, 8) / 100;
      baseValue = baseValue * growthFactor;

      predictions.push({
        period: this.getPeriodLabel(i, timeHorizon),
        predicted: Math.round(baseValue),
        confidence: this.generateRealisticValue(85, 95),
        scenarios: {
          optimistic: Math.round(baseValue * 1.15),
          pessimistic: Math.round(baseValue * 0.85),
        },
      });
    }

    return predictions;
  }

  /**
   * 获取竞争对手分析
   */
  async getCompetitorAnalysis() {
    const competitors = [
      { name: '竞品A', marketShare: 25, strength: 85 },
      { name: '竞品B', marketShare: 18, strength: 78 },
      { name: '竞品C', marketShare: 12, strength: 72 },
      { name: '我们', marketShare: 35, strength: 92 },
    ];

    return {
      marketPosition: competitors.find(c => c.name === '我们')!,
      competitors,
      competitiveAdvantages: [
        '技术创新领先',
        '用户体验优秀',
        '成本控制有效',
        '品牌认知度高',
      ],
      marketOpportunities: [
        '新兴市场拓展',
        '垂直领域深耕',
        '国际化布局',
        '生态合作机会',
      ],
    };
  }

  /**
   * 获取风险评估报告
   */
  async getRiskAssessment() {
    return {
      overallRiskScore: this.generateRealisticValue(60, 85),
      riskCategories: [
        {
          category: '市场风险',
          score: this.generateRealisticValue(65, 80),
          factors: ['竞争加剧', '需求波动', '价格压力'],
        },
        {
          category: '运营风险',
          score: this.generateRealisticValue(70, 85),
          factors: ['供应链稳定', '技术故障', '人员流失'],
        },
        {
          category: '财务风险',
          score: this.generateRealisticValue(60, 75),
          factors: ['现金流管理', '投资回报', '汇率波动'],
        },
        {
          category: '合规风险',
          score: this.generateRealisticValue(80, 95),
          factors: ['法规变化', '数据安全', '隐私保护'],
        },
      ],
      mitigationStrategies: [
        '建立多元化收入来源',
        '加强技术研发投入',
        '完善风险管理体系',
        '提升团队专业能力',
      ],
    };
  }

  /**
   * 生成现实的数值 (在指定范围内)
   */
  private generateRealisticValue(min: number, max: number): number {
    return Math.round(min + Math.random() * (max - min));
  }

  /**
   * 生成变化百分比
   */
  private generateChangePercentage(min: number, max: number): number {
    return parseFloat((min + Math.random() * (max - min)).toFixed(1));
  }

  /**
   * 随机获取趋势方向
   */
  private getRandomTrend(): 'up' | 'down' | 'stable' {
    const rand = Math.random();
    if (rand < 0.6) return 'up';
    if (rand < 0.8) return 'stable';
    return 'down';
  }

  /**
   * 获取周期标签
   */
  private getPeriodLabel(index: number, horizon: string): string {
    const now = new Date();
    if (horizon === 'month') {
      const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (horizon === 'quarter') {
      const quarter = Math.floor((now.getMonth() + index * 3) / 3) + 1;
      const year =
        now.getFullYear() + Math.floor((now.getMonth() + index * 3) / 12);
      return `Q${quarter} ${year}`;
    } else {
      return `${now.getFullYear() + index}年`;
    }
  }

  /**
   * 获取行业基准数据
   */
  getIndustryBenchmarks() {
    return {
      revenueGrowth: { industryAvg: 15, topQuartile: 25, ourCompany: 18 },
      customerRetention: { industryAvg: 78, topQuartile: 88, ourCompany: 82 },
      employeeProductivity: {
        industryAvg: 120000,
        topQuartile: 180000,
        ourCompany: 150000,
      },
      technologyInvestment: { industryAvg: 8, topQuartile: 15, ourCompany: 12 },
    };
  }
}

// 全局实例
export const biService = new BusinessIntelligenceService();
