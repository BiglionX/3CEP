/**
 * @file report-models.ts
 * @description 报表设计器相关数据模? * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

// 位置坐标
export interface Position {
  x: number;
  y: number;
}

// 尺寸
export interface Size {
  width: number;
  height: number;
}

// 报表设计配置
export interface ReportDesignConfig {
  id: string;
  name: string;
  description?: string;
  canvas: CanvasConfig;
  widgets: WidgetConfig[];
  dataSource: DataSourceConfig;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
}

// 画布配置
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
}

// 数据源配?export interface DataSourceConfig {
  type: 'database' | 'api' | 'file' | 'manual';
  connectionId?: string;
  query?: string;
  apiUrl?: string;
  filePath?: string;
  manualData?: any[];
}

// 组件配置基类
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: Position;
  size: Size;
  config: any;
  style: WidgetStyle;
}

// 组件类型枚举
export type WidgetType =
  | 'chart'
  | 'table'
  | 'text'
  | 'image'
  | 'filter'
  | 'kpi-card'
  | 'map'
  | 'gauge';

// 组件样式配置
export interface WidgetStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  boxShadow?: string;
  opacity?: number;
  zIndex?: number;
}

// 图表组件配置
export interface ChartWidgetConfig extends WidgetConfig {
  type: 'chart';
  config: {
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
    title: string;
    subtitle?: string;
    xAxis: AxisConfig;
    yAxis: AxisConfig;
    series: SeriesConfig[];
    legend: LegendConfig;
    tooltip: TooltipConfig;
    dataBinding: DataBindingConfig;
  };
}

// 表格组件配置
export interface TableWidgetConfig extends WidgetConfig {
  type: 'table';
  config: {
    title: string;
    columns: TableColumn[];
    dataBinding: DataBindingConfig;
    pagination: PaginationConfig;
    sorting: SortingConfig;
    filtering: FilteringConfig;
  };
}

// 文本组件配置
export interface TextWidgetConfig extends WidgetConfig {
  type: 'text';
  config: {
    content: string;
    fontSize: number;
    fontWeight: 'normal' | 'bold' | 'lighter';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    lineHeight: number;
    fontFamily: string;
  };
}

// KPI卡片组件配置
export interface KpiCardWidgetConfig extends WidgetConfig {
  type: 'kpi-card';
  config: {
    title: string;
    value: string | number;
    valueType: 'number' | 'currency' | 'percentage' | 'text';
    prefix?: string;
    suffix?: string;
    trend?: 'up' | 'down' | 'neutral';
    comparisonValue?: number;
    targetValue?: number;
    dataBinding: DataBindingConfig;
  };
}

// 轴配?export interface AxisConfig {
  field: string;
  title?: string;
  show: boolean;
  format?: string;
  min?: number;
  max?: number;
}

// 系列配置
export interface SeriesConfig {
  name: string;
  field: string;
  type: 'line' | 'bar' | 'area';
  color: string;
  show: boolean;
}

// 图例配置
export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'left' | 'center' | 'right';
}

// 提示框配?export interface TooltipConfig {
  show: boolean;
  trigger: 'item' | 'axis';
  formatter?: string;
}

// 数据绑定配置
export interface DataBindingConfig {
  sourceType: 'static' | 'dynamic';
  dataSourceId?: string;
  query?: string;
  staticData?: any[];
  refreshInterval?: number; // 自动刷新间隔（秒?}

// 表格列配?export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  format?: 'number' | 'currency' | 'date' | 'percentage';
}

// 分页配置
export interface PaginationConfig {
  show: boolean;
  pageSize: number;
  pageSizeOptions: number[];
  showSizeChanger: boolean;
  showQuickJumper: boolean;
}

// 排序配置
export interface SortingConfig {
  defaultSortField?: string;
  defaultSortOrder?: 'asc' | 'desc';
  multiple: boolean;
}

// 过滤配置
export interface FilteringConfig {
  showFilters: boolean;
  filterFields: string[];
}

// 可拖拽项目类?export interface DraggableItem {
  type: 'widget' | 'field' | 'datasource';
  widgetType?: WidgetType;
  subtype?: string;
  data?: any;
}

// 拖拽状?export interface DragState {
  item: DraggableItem;
  startPosition: Position;
  currentPosition: Position;
  currentTarget: DropTarget | null;
}

// 放置目标
export interface DropTarget {
  type: 'canvas' | 'widget' | 'panel';
  id?: string;
  element: HTMLElement;
  rect: DOMRect;
}

// 设计历史记录
export interface DesignHistory {
  id: string;
  action: 'add' | 'remove' | 'modify' | 'move' | 'resize';
  targetId: string;
  targetType: 'widget' | 'canvas';
  beforeState: any;
  afterState: any;
  timestamp: string;
  userId: string;
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 预览配置
export interface PreviewConfig {
  width: number;
  height: number;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
  showBorders: boolean;
}

// 导出配置
export interface ExportConfig {
  format: 'png' | 'jpg' | 'pdf' | 'html';
  quality: number;
  includeData: boolean;
  includeStyles: boolean;
  fileName: string;
}

// 模板配置
export interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  config: ReportDesignConfig;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}
