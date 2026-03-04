interface ReportConfig {
  title: string;
  description: string;
  metrics: string[];
  dimensions: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min';
}

interface ReportData {
  metadata: {
    title: string;
    generatedAt: Date;
    timeRange: { start: Date; end: Date };
  };
  summary: Record<string, number>;
  trends: Array<{
    date: string;
    values: Record<string, number>;
  }>;
  breakdown: Record<string, Record<string, number>>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }>;
}

export class AnalyticsReportService {
  /**
   * 生成综合业务报表
   */
  async generateBusinessReport(config: ReportConfig): Promise<ReportData> {
    // 模拟数据生成
    const days = this.getDaysBetween(
      config.timeRange.start,
      config.timeRange.end
    );

    const summary: Record<string, number> = {};
    const trends: ReportData['trends'] = [];
    const breakdown: ReportData['breakdown'] = {};

    // 生成模拟数据
    for (const metric of config.metrics) {
      summary[metric] = Math.floor(Math.random() * 10000) + 1000;

      // 生成趋势数据
      const trendData: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date(config.timeRange.start);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        trendData[dateString] = Math.floor(Math.random() * 1000) + 100;
      }
      trends.push({ date: metric, values: trendData });
    }

    // 生成维度分解数据
    for (const dimension of config.dimensions) {
      breakdown[dimension] = {};
      const values = ['mobile', 'desktop', 'tablet'].includes(dimension)
        ? ['mobile', 'desktop', 'tablet']
        : ['organic', 'direct', 'social'];

      values.forEach(value => {
        breakdown[dimension][value] = Math.floor(Math.random() * 5000) + 500;
      });
    }

    return {
      metadata: {
        title: config.title,
        generatedAt: new Date(),
        timeRange: config.timeRange,
      },
      summary,
      trends,
      breakdown,
    };
  }

  /**
   * 生成图表数据
   */
  generateChartData(reportData: ReportData, chartType: string): ChartData {
    switch (chartType) {
      case 'line':
        return this.generateLineChartData(reportData);
      case 'bar':
        return this.generateBarChartData(reportData);
      case 'pie':
        return this.generatePieChartData(reportData);
      default:
        return this.generateLineChartData(reportData);
    }
  }

  private generateLineChartData(reportData: ReportData): ChartData {
    const labels: string[] = [];
    const datasets: ChartData['datasets'] = [];

    // 提取日期标签
    if (reportData.trends.length > 0) {
      const firstTrend = reportData.trends[0];
      labels.push(...Object.keys(firstTrend.values));
    }

    // 为每个指标创建数据集
    reportData.trends.forEach((trend, index) => {
      const colors = [
        'rgb(59, 130, 246)', // blue
        'rgb(16, 185, 129)', // green
        'rgb(245, 158, 11)', // amber
        'rgb(139, 92, 246)', // purple
      ];

      datasets.push({
        label: trend.date,
        data: Object.values(trend.values),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        fill: false,
      });
    });

    return { labels, datasets };
  }

  private generateBarChartData(reportData: ReportData): ChartData {
    const labels = Object.keys(reportData.summary);
    const data = Object.values(reportData.summary);

    return {
      labels,
      datasets: [
        {
          label: '指标汇?,
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ].slice(0, data.length),
        },
      ],
    };
  }

  private generatePieChartData(reportData: ReportData): ChartData {
    // 使用第一个维度的分解数据
    const dimensionKeys = Object.keys(reportData.breakdown);
    if (dimensionKeys.length === 0) {
      return { labels: [], datasets: [] };
    }

    const firstDimension = reportData.breakdown[dimensionKeys[0]];
    const labels = Object.keys(firstDimension);
    const data = Object.values(firstDimension);

    return {
      labels,
      datasets: [
        {
          label: dimensionKeys[0],
          data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ].slice(0, data.length),
        },
      ],
    };
  }

  /**
   * 导出报表为PDF
   */
  async exportToPDF(reportData: ReportData): Promise<Blob> {
    // 模拟PDF生成
    const pdfContent = `
      # ${reportData.metadata.title}

      生成时间: ${reportData.metadata.generatedAt.toLocaleString()}
      时间范围: ${reportData.metadata.timeRange.start.toLocaleDateString()} - ${reportData.metadata.timeRange.end.toLocaleDateString()}

      ## 指标汇?      ${Object.entries(reportData.summary)
        .map(([key, value]) => `${key}: ${value.toLocaleString()}`)
        .join('\n')}

      ## 数据趋势
      (图表数据...)
    `;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * 导出报表为Excel
   */
  async exportToExcel(reportData: ReportData): Promise<Blob> {
    // 模拟Excel生成
    let excelContent = '指标,数值\n';
    Object.entries(reportData.summary).forEach(([key, value]) => {
      excelContent += `${key},${value}\n`;
    });

    return new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  }

  /**
   * 计算两个日期之间的天?   */
  private getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * 预定义报表模?   */
  getReportTemplates(): Array<{
    id: string;
    name: string;
    config: Partial<ReportConfig>;
  }> {
    return [
      {
        id: 'user-engagement',
        name: '用户参与度分?,
        config: {
          title: '用户参与度月度报?,
          description: '分析用户活跃度、留存率等关键指?,
          metrics: ['daily_active_users', 'session_duration', 'page_views'],
          dimensions: ['device_type', 'user_segment'],
          aggregation: 'avg',
        },
      },
      {
        id: 'business-performance',
        name: '业务表现分析',
        config: {
          title: '业务绩效季度报告',
          description: '评估核心业务指标表现',
          metrics: ['revenue', 'conversion_rate', 'customer_acquisition_cost'],
          dimensions: ['channel', 'region'],
          aggregation: 'sum',
        },
      },
      {
        id: 'content-analytics',
        name: '内容分析报告',
        config: {
          title: '内容效果分析',
          description: '分析内容发布、互动和转化效果',
          metrics: ['posts_published', 'likes_received', 'shares_count'],
          dimensions: ['content_type', 'author'],
          aggregation: 'count',
        },
      },
    ];
  }
}

// 全局实例
export const analyticsReportService = new AnalyticsReportService();
