/**
 * @file chart-renderer.ts
 * @description 图表渲染引擎
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import { ChartType } from './bi-engine';

// 图表配置选项
export interface ChartOptions {
  title?: string;
  width?: number;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltip?: boolean;
}

// 图表数据?export interface ChartDataPoint {
  [key: string]: any;
}

/**
 * 图表渲染器类
 */
export class ChartRenderer {
  private defaultColors: string[] = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
    '#13c2c2',
    '#eb2f96',
    '#fa8c16',
  ];

  constructor() {}

  /**
   * 渲染指定类型的图?   */
  async render(
    chartType: ChartType,
    data: ChartDataPoint[],
    options: ChartOptions = {}
  ): Promise<string> {
    const config = this.buildChartConfig(chartType, data, options);

    switch (chartType) {
      case ChartType.LINE:
        return this.renderLineChart(config);
      case ChartType.BAR:
        return this.renderBarChart(config);
      case ChartType.PIE:
        return this.renderPieChart(config);
      case ChartType.AREA:
        return this.renderAreaChart(config);
      case ChartType.SCATTER:
        return this.renderScatterChart(config);
      case ChartType.HEATMAP:
        return this.renderHeatmap(config);
      case ChartType.GAUGE:
        return this.renderGaugeChart(config);
      default:
        throw new Error(`不支持的图表类型: ${chartType}`);
    }
  }

  /**
   * 构建图表配置
   */
  private buildChartConfig(
    chartType: ChartType,
    data: ChartDataPoint[],
    options: ChartOptions
  ): any {
    return {
      type: chartType,
      data,
      options: {
        ...this.getDefaultOptions(chartType),
        ...options,
      },
    };
  }

  /**
   * 获取默认配置选项
   */
  private getDefaultOptions(chartType: ChartType): ChartOptions {
    const baseOptions: ChartOptions = {
      width: 600,
      height: 400,
      showLegend: true,
      showGrid: true,
      tooltip: true,
    };

    switch (chartType) {
      case ChartType.LINE:
        return { ...baseOptions, colors: this.defaultColors };
      case ChartType.BAR:
        return { ...baseOptions, colors: this.defaultColors };
      case ChartType.PIE:
        return { ...baseOptions, colors: this.defaultColors };
      default:
        return baseOptions;
    }
  }

  /**
   * 渲染折线?   */
  private renderLineChart(config: any): string {
    const { data, options } = config;
    const { width, height, title, xAxisLabel, yAxisLabel } = options;

    // 生成SVG折线?    const svg = this.createSvgContainer(width, height);

    // 添加标题
    if (title) {
      svg.appendChild(this.createTitle(title, width / 2, 30));
    }

    // 简化的折线图实?    const chartContent = `
      <rect x="50" y="50" width="${width - 100}" height="${height - 100}" 
            fill="#f5f5f5" stroke="#ddd" />
      <polyline points="60,200 150,150 240,180 330,120 420,160" 
                fill="none" stroke="#1890ff" stroke-width="2" />
    `;

    svg.innerHTML += chartContent;
    return svg.outerHTML;
  }

  /**
   * 渲染柱状?   */
  private renderBarChart(config: any): string {
    const { data, options } = config;
    const { width, height, title, colors = this.defaultColors } = options;

    const svg = this.createSvgContainer(width, height);

    if (title) {
      svg.appendChild(this.createTitle(title, width / 2, 30));
    }

    // 简化的柱状图实?    const maxValue = Math.max(...data.map((d: any) => d.value || 0));
    const barWidth = (width - 100) / data.length;
    const chartHeight = height - 150;

    let bars = '';
    data.forEach((item: any, index: number) => {
      const value = item.value || 0;
      const barHeight = (value / maxValue) * chartHeight;
      const x = 50 + index * barWidth + 10;
      const y = height - 100 - barHeight;

      bars += `
        <rect x="${x}" y="${y}" width="${barWidth - 20}" height="${barHeight}" 
              fill="${colors[index % colors.length]}" />
        <text x="${x + (barWidth - 20) / 2}" y="${height - 80}" 
              text-anchor="middle" font-size="12">${item.label || ''}</text>
      `;
    });

    svg.innerHTML += bars;
    return svg.outerHTML;
  }

  /**
   * 渲染饼图
   */
  private renderPieChart(config: any): string {
    const { data, options } = config;
    const { width, height, title, colors = this.defaultColors } = options;

    const svg = this.createSvgContainer(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    if (title) {
      svg.appendChild(this.createTitle(title, centerX, 30));
    }

    const total = data.reduce(
      (sum: number, item: any) => sum + (item.value || 0),
      0
    );
    let currentAngle = 0;

    let slices = '';
    data.forEach((item: any, index: number) => {
      const value = item.value || 0;
      const sliceAngle = (value / total) * 2 * Math.PI;

      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(currentAngle + sliceAngle);
      const y2 = centerY + radius * Math.sin(currentAngle + sliceAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      slices += `
        <path d="M ${centerX} ${centerY} L ${x1} ${y1} 
                 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z" 
              fill="${colors[index % colors.length]}" />
      `;

      currentAngle += sliceAngle;
    });

    svg.innerHTML += slices;
    return svg.outerHTML;
  }

  /**
   * 渲染面积?   */
  private renderAreaChart(config: any): string {
    const { data, options } = config;
    return this.renderLineChart(config); // 简化实现，复用折线图逻辑
  }

  /**
   * 渲染散点?   */
  private renderScatterChart(config: any): string {
    const { data, options } = config;
    const { width, height, title } = options;

    const svg = this.createSvgContainer(width, height);

    if (title) {
      svg.appendChild(this.createTitle(title, width / 2, 30));
    }

    // 简化的散点图实?    const dots = data
      .map((point: any, index: number) => {
        const x = 50 + (index % 10) * 50;
        const y = height - 100 - (point.y || 0) * 10;
        return `<circle cx="${x}" cy="${y}" r="4" fill="#1890ff" />`;
      })
      .join('');

    svg.innerHTML += `
      <rect x="50" y="50" width="${width - 100}" height="${height - 100}" 
            fill="#f5f5f5" stroke="#ddd" />
      ${dots}
    `;

    return svg.outerHTML;
  }

  /**
   * 渲染热力?   */
  private renderHeatmap(config: any): string {
    const { data, options } = config;
    const { width, height, title } = options;

    const svg = this.createSvgContainer(width, height);

    if (title) {
      svg.appendChild(this.createTitle(title, width / 2, 30));
    }

    // 简化的热力图实?    const gridSize = 20;
    const heatmap = data
      .map((row: any, rowIndex: number) => {
        return row.values
          .map((value: number, colIndex: number) => {
            const intensity = Math.min(value / 100, 1);
            const color = `rgb(${Math.floor(255 * (1 - intensity))}, ${Math.floor(255 * intensity)}, 100)`;
            const x = 50 + colIndex * gridSize;
            const y = 80 + rowIndex * gridSize;

            return `<rect x="${x}" y="${y}" width="${gridSize}" height="${gridSize}" 
                      fill="${color}" stroke="#fff" stroke-width="1" />`;
          })
          .join('');
      })
      .join('');

    svg.innerHTML += heatmap;
    return svg.outerHTML;
  }

  /**
   * 渲染仪表盘图
   */
  private renderGaugeChart(config: any): string {
    const { data, options } = config;
    const { width, height, title } = options;
    const value = data[0]?.value || 0;

    const svg = this.createSvgContainer(width, height);
    const centerX = width / 2;
    const centerY = height - 50;
    const radius = Math.min(width, height) / 3;

    if (title) {
      svg.appendChild(this.createTitle(title, centerX, 30));
    }

    // 绘制仪表盘背?    svg.innerHTML += `
      <path d="M ${centerX - radius} ${centerY} 
               A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}" 
            fill="none" stroke="#ddd" stroke-width="20" />
    `;

    // 绘制指针
    const angle = (value / 100) * Math.PI;
    const pointerX = centerX + (radius - 20) * Math.cos(angle);
    const pointerY = centerY - (radius - 20) * Math.sin(angle);

    svg.innerHTML += `
      <line x1="${centerX}" y1="${centerY}" x2="${pointerX}" y2="${pointerY}" 
            stroke="#1890ff" stroke-width="3" />
      <circle cx="${centerX}" cy="${centerY}" r="8" fill="#1890ff" />
      <text x="${centerX}" y="${centerY + 40}" text-anchor="middle" 
            font-size="16" font-weight="bold">${value}%</text>
    `;

    return svg.outerHTML;
  }

  /**
   * 创建SVG容器
   */
  private createSvgContainer(width: number, height: number): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return svg;
  }

  /**
   * 创建标题元素
   */
  private createTitle(text: string, x: number, y: number): SVGTextElement {
    const title = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    title.setAttribute('x', x.toString());
    title.setAttribute('y', y.toString());
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-weight', 'bold');
    title.textContent = text;
    return title;
  }
}
