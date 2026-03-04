/**
 * @file bi-engine.ts
 * @description 轻量级BI报表引擎核心服务
 * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 *
 * 核心功能? * - 报表模板管理
 * - 数据查询执行
 * - 图表渲染引擎
 * - 导出功能支持
 */

import { ChartRenderer } from './chart-renderer';
import { DataSourceManager } from '../core/data-source-manager';
import { CacheService } from '../core/cache-service';
import { PermissionService } from '../core/simple-permission-service';

// 报表类型枚举
export enum ReportType {
  TABLE = 'table',
  CHART = 'chart',
  DASHBOARD = 'dashboard',
  CUSTOM = 'custom',
}

// 图表类型枚举
export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
}

// 报表模板接口
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  chartType?: ChartType;
  query: string;
  parameters: Record<string, any>;
  layout: ReportLayout;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 报表布局配置
export interface ReportLayout {
  width: number;
  height: number;
  gridColumns: number;
  gridRows: number;
  widgets: WidgetConfig[];
}

// 控件配置
export interface WidgetConfig {
  id: string;
  type: 'chart' | 'table' | 'text' | 'filter';
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: any;
}

// 查询参数
export interface QueryParams {
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  dimensions?: string[];
  metrics?: string[];
  sort?: { field: string; order: 'asc' | 'desc' }[];
  limit?: number;
}

// 查询结果
export interface QueryResult {
  data: any[];
  metadata: {
    rowCount: number;
    columnCount: number;
    executionTime: number;
    cacheHit: boolean;
  };
  columns: ColumnSchema[];
}

// 列模式定?export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  displayName: string;
  format?: string;
}

/**
 * BI报表引擎主服务类
 */
export class BIEngine {
  private chartRenderer: ChartRenderer;
  private dataSourceManager: DataSourceManager;
  private cacheService: CacheService;
  private permissionService: PermissionService;
  private templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.chartRenderer = new ChartRenderer();
    this.dataSourceManager = new DataSourceManager();
    this.cacheService = new CacheService();
    this.permissionService = new PermissionService();

    this.initializeDefaultTemplates();
  }

  /**
   * 初始化默认报表模?   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ReportTemplate[] = [
      {
        id: 'device-overview',
        name: '设备概览报表',
        description: '展示设备基本信息和统计数?,
        type: ReportType.DASHBOARD,
        chartType: ChartType.BAR,
        query: `
          SELECT 
            brand,
            COUNT(*) as device_count,
            AVG(price) as avg_price,
            MAX(created_at) as last_updated
          FROM devices 
          WHERE created_at >= :startDate 
            AND created_at <= :endDate
          GROUP BY brand
          ORDER BY device_count DESC
        `,
        parameters: {
          startDate: { type: 'date', defaultValue: '2024-01-01' },
          endDate: { type: 'date', defaultValue: '2024-12-31' },
        },
        layout: {
          width: 1200,
          height: 800,
          gridColumns: 12,
          gridRows: 8,
          widgets: [
            {
              id: 'device-count-chart',
              type: 'chart',
              position: { x: 0, y: 0 },
              size: { width: 6, height: 4 },
              config: {
                chartType: ChartType.BAR,
                title: '设备品牌分布',
                xAxis: 'brand',
                yAxis: 'device_count',
              },
            },
            {
              id: 'price-trend-chart',
              type: 'chart',
              position: { x: 6, y: 0 },
              size: { width: 6, height: 4 },
              config: {
                chartType: ChartType.LINE,
                title: '平均价格趋势',
                xAxis: 'last_updated',
                yAxis: 'avg_price',
              },
            },
            {
              id: 'device-table',
              type: 'table',
              position: { x: 0, y: 4 },
              size: { width: 12, height: 4 },
              config: {
                columns: ['brand', 'device_count', 'avg_price', 'last_updated'],
                pageSize: 20,
              },
            },
          ],
        },
        permissions: ['data_center_read', 'data_center_analyze'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * 获取所有报表模?   */
  async getReportTemplates(userId: string): Promise<ReportTemplate[]> {
    const userPermissions =
      await this.permissionService.getUserPermissions(userId);
    const filteredTemplates: ReportTemplate[] = [];

    for (const template of this.templates.values()) {
      if (
        await this.permissionService.checkPermissions(
          userPermissions,
          template.permissions
        )
      ) {
        filteredTemplates.push(template);
      }
    }

    return filteredTemplates;
  }

  /**
   * 获取指定报表模板
   */
  async getReportTemplate(
    templateId: string,
    userId: string
  ): Promise<ReportTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const userPermissions =
      await this.permissionService.getUserPermissions(userId);
    const hasAccess = await this.permissionService.checkPermissions(
      userPermissions,
      template.permissions
    );

    return hasAccess ? template : null;
  }

  /**
   * 执行报表查询
   */
  async executeReport(
    templateId: string,
    params: QueryParams,
    userId: string
  ): Promise<QueryResult> {
    const template = await this.getReportTemplate(templateId, userId);
    if (!template) {
      throw new Error(`报表模板不存在或无访问权? ${templateId}`);
    }

    // 参数验证和处?    const processedParams = this.processParameters(template.parameters, params);

    // 生成缓存?    const cacheKey = this.generateCacheKey(template.id, processedParams);

    // 尝试从缓存获?    const cachedResult: any = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return {
        data: cachedResult.data || [],
        metadata: {
          ...(cachedResult.metadata || {}),
          cacheHit: true,
        },
        columns: cachedResult.columns || [],
      };
    }

    // 执行查询
    const startTime = Date.now();
    const queryResult = await this.dataSourceManager.executeQuery(
      template.query,
      processedParams
    );
    const executionTime = Date.now() - startTime;

    const result: QueryResult = {
      data: queryResult.rows,
      metadata: {
        rowCount: queryResult.rowCount,
        columnCount: queryResult.columns.length,
        executionTime,
        cacheHit: false,
      },
      columns: queryResult.columns.map(col => ({
        name: col.name,
        type: this.inferColumnType(col.type),
        displayName: this.formatColumnName(col.name),
        format: this.getColumnFormat(col.name),
      })),
    };

    // 缓存结果?分钟?    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * 渲染图表
   */
  async renderChart(
    templateId: string,
    chartType: ChartType,
    data: any[],
    options: any = {}
  ): Promise<string> {
    return this.chartRenderer.render(chartType, data, options);
  }

  /**
   * 导出报表数据
   */
  async exportReport(
    templateId: string,
    format: 'csv' | 'excel' | 'pdf',
    params: QueryParams,
    userId: string
  ): Promise<Blob> {
    const result = await this.executeReport(templateId, params, userId);

    switch (format) {
      case 'csv':
        return this.exportToCSV(result);
      case 'excel':
        return this.exportToExcel(result);
      case 'pdf':
        return this.exportToPDF(result);
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 创建新的报表模板
   */
  async createReportTemplate(
    template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * 更新报表模板
   */
  async updateReportTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>,
    userId: string
  ): Promise<ReportTemplate | null> {
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) return null;

    const updatedTemplate: ReportTemplate = {
      ...existingTemplate,
      ...updates,
      id: templateId,
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * 删除报表模板
   */
  async deleteReportTemplate(
    templateId: string,
    userId: string
  ): Promise<boolean> {
    return this.templates.delete(templateId);
  }

  // 私有辅助方法
  private processParameters(
    templateParams: Record<string, any>,
    userParams: QueryParams
  ): Record<string, any> {
    const processed: Record<string, any> = {};

    // 处理模板参数默认?    Object.entries(templateParams).forEach(([key, param]) => {
      processed[key] = param.defaultValue ?? null;
    });

    // 覆盖用户提供的参?    if (userParams.startDate) processed.startDate = userParams.startDate;
    if (userParams.endDate) processed.endDate = userParams.endDate;
    if (userParams.filters) processed.filters = userParams.filters;
    if (userParams.dimensions) processed.dimensions = userParams.dimensions;
    if (userParams.metrics) processed.metrics = userParams.metrics;
    if (userParams.sort) processed.sort = userParams.sort;
    if (userParams.limit) processed.limit = userParams.limit;

    return processed;
  }

  private generateCacheKey(
    templateId: string,
    params: Record<string, any>
  ): string {
    const paramStr = JSON.stringify(params, Object.keys(params).sort());
    return `bi_report:${templateId}:${this.hashString(paramStr)}`;
  }

  private inferColumnType(dbType: string): ColumnSchema['type'] {
    const typeMap: Record<string, ColumnSchema['type']> = {
      varchar: 'string',
      text: 'string',
      integer: 'number',
      bigint: 'number',
      decimal: 'number',
      numeric: 'number',
      real: 'number',
      'double precision': 'number',
      timestamp: 'date',
      date: 'date',
      boolean: 'boolean',
    };

    return typeMap[dbType.toLowerCase()] || 'string';
  }

  private formatColumnName(name: string): string {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getColumnFormat(columnName: string): string | undefined {
    const formatMap: Record<string, string> = {
      price: 'currency',
      amount: 'currency',
      percentage: 'percent',
      created_at: 'datetime',
      updated_at: 'datetime',
    };

    return formatMap[columnName];
  }

  private exportToCSV(result: QueryResult): Blob {
    const headers = result.columns.map(col => col.displayName).join(',');
    const rows = result.data.map(row =>
      result.columns
        .map(col => {
          const value = row[col.name];
          return typeof value === 'string' ? `"${value}"` : value;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private exportToExcel(result: QueryResult): Blob {
    // 简化的Excel导出实现
    // 实际项目中应该使用专门的Excel库如SheetJS
    const csvBlob = this.exportToCSV(result);
    return new Blob([csvBlob], { type: 'application/vnd.ms-excel' });
  }

  private exportToPDF(result: QueryResult): Blob {
    // 简化的PDF导出实现
    // 实际项目中应该使用专门的PDF�?    const content = JSON.stringify(result, null, 2);
    return new Blob([content], { type: 'application/pdf' });
  }

  private generateId(): string {
    return (
      'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换?2位整?    }
    return Math.abs(hash).toString(36);
  }
}
