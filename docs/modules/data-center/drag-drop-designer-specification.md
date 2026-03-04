# 拖拽设计器功能规格文档

## 📋 文档概述

**文档版本**: v1.0  
**创建日期**: 2026年2月28日  
**所属模块**: 数据中心模块  
**任务编号**: DC012  
**负责人**: 数据中心开发团队

## 🎯 功能目标

实现一个可视化的报表拖拽设计工具，让用户能够通过直观的拖拽操作创建和配置数据分析报表，降低技术门槛，提高报表开发效率。

## 🏗️ 系统架构设计

### 整体架构

```
拖拽设计器架构层次
├── UI层 (用户界面)
│   ├── 工具栏组件
│   ├── 画布区域
│   ├── 属性面板
│   └── 数据源面板
├── 逻辑层 (业务逻辑)
│   ├── 拖拽管理器
│   ├── 布局引擎
│   ├── 配置管理器
│   └── 预览渲染器
└── 服务层 (数据服务)
    ├── 模板存储服务
    ├── 数据源服务
    └── 权限验证服务
```

### 核心组件设计

#### 1. 拖拽管理器 (DragDropManager)

```typescript
interface DragDropManager {
  // 开始拖拽
  startDrag(item: DraggableItem, event: DragEvent): void;

  // 处理拖拽过程
  handleDragOver(target: DropTarget, event: DragEvent): void;

  // 完成放置
  handleDrop(target: DropTarget, event: DragEvent): void;

  // 取消拖拽
  cancelDrag(): void;
}
```

#### 2. 布局引擎 (LayoutEngine)

```typescript
interface LayoutEngine {
  // 计算最优位置
  calculateOptimalPosition(widget: WidgetConfig, canvas: CanvasState): Position;

  // 网格对齐
  snapToGrid(position: Position, gridSize: number): Position;

  // 碰撞检测
  detectCollision(widget: WidgetConfig, others: WidgetConfig[]): boolean;

  // 自动布局
  autoArrange(widgets: WidgetConfig[]): WidgetConfig[];
}
```

#### 3. 配置管理器 (ConfigManager)

```typescript
interface ConfigManager {
  // 保存配置
  saveConfiguration(config: ReportDesignConfig): Promise<string>;

  // 加载配置
  loadConfiguration(id: string): Promise<ReportDesignConfig>;

  // 验证配置
  validateConfiguration(config: ReportDesignConfig): ValidationResult;
}
```

## 🎨 UI界面设计

### 1. 主界面布局

```
┌─────────────────────────────────────────────────────────────┐
│  工具栏 (Toolbar)                                           │
├─────────────────────────────────────────────────────────────┤
│  数据源面板    │                                            │
│  (250px)      │           画布区域                         │
│               │         (Canvas Area)                      │
│  • 表格列表    │                                            │
│  • 字段选择    │                                            │
│  • 数据预览    │                                            │
├───────────────┼────────────────────────────────────────────┤
│  属性面板     │                                            │
│  (250px)      │                                            │
│               │                                            │
│  • 组件属性    │                                            │
│  • 样式设置    │                                            │
│  • 数据绑定    │                                            │
└───────────────┴────────────────────────────────────────────┘
```

### 2. 组件详细设计

#### 工具栏组件 (Toolbar)

```tsx
interface ToolbarProps {
  onSave: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onViewMode: 'design' | 'preview';
}

const Toolbar = ({
  onSave,
  onPreview,
  onUndo,
  onRedo,
  onViewMode,
}: ToolbarProps) => {
  return (
    <div className="toolbar-container">
      <Button onClick={onSave}>保存</Button>
      <Button onClick={onPreview}>预览</Button>
      <Button onClick={onUndo} disabled={!canUndo}>
        撤销
      </Button>
      <Button onClick={onRedo} disabled={!canRedo}>
        重做
      </Button>
      <ViewModeToggle currentMode={viewMode} onChange={setViewMode} />
    </div>
  );
};
```

#### 画布组件 (Canvas)

```tsx
interface CanvasProps {
  widgets: WidgetConfig[];
  selectedWidgetId: string | null;
  onWidgetSelect: (id: string) => void;
  onWidgetMove: (id: string, position: Position) => void;
  onWidgetResize: (id: string, size: Size) => void;
}

const Canvas = ({
  widgets,
  selectedWidgetId,
  onWidgetSelect,
  onWidgetMove,
  onWidgetResize,
}: CanvasProps) => {
  return (
    <div className="canvas-area" onDrop={handleDrop}>
      <GridBackground />
      {widgets.map(widget => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          isSelected={widget.id === selectedWidgetId}
          onSelect={() => onWidgetSelect(widget.id)}
          onMove={pos => onWidgetMove(widget.id, pos)}
          onResize={size => onWidgetResize(widget.id, size)}
        />
      ))}
    </div>
  );
};
```

#### 属性面板组件 (PropertyPanel)

```tsx
interface PropertyPanelProps {
  selectedWidget: WidgetConfig | null;
  onDataChange: (updates: Partial<WidgetConfig>) => void;
}

const PropertyPanel = ({
  selectedWidget,
  onDataChange,
}: PropertyPanelProps) => {
  if (!selectedWidget) {
    return <div className="property-panel-empty">请选择一个组件</div>;
  }

  return (
    <div className="property-panel">
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基础属性</TabsTrigger>
          <TabsTrigger value="style">样式设置</TabsTrigger>
          <TabsTrigger value="data">数据绑定</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicProperties widget={selectedWidget} onChange={onDataChange} />
        </TabsContent>

        <TabsContent value="style">
          <StyleProperties widget={selectedWidget} onChange={onDataChange} />
        </TabsContent>

        <TabsContent value="data">
          <DataBinding widget={selectedWidget} onChange={onDataChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

## 🧩 可拖拽组件库

### 1. 基础组件

#### 图表组件 (ChartWidget)

```typescript
interface ChartWidgetConfig extends WidgetConfig {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  dataSource: string;
  xAxisField: string;
  yAxisField: string;
  seriesField?: string;
  title: string;
  showLegend: boolean;
  showTooltip: boolean;
}
```

#### 表格组件 (TableWidget)

```typescript
interface TableWidgetConfig extends WidgetConfig {
  type: 'table';
  dataSource: string;
  columns: TableColumn[];
  pageSize: number;
  showPagination: boolean;
  sortable: boolean;
}
```

#### 文本组件 (TextWidget)

```typescript
interface TextWidgetConfig extends WidgetConfig {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}
```

#### 过滤器组件 (FilterWidget)

```typescript
interface FilterWidgetConfig extends WidgetConfig {
  type: 'filter';
  filterFields: FilterField[];
  layout: 'horizontal' | 'vertical';
}
```

### 2. 高级组件

#### KPI指标卡 (KpiCardWidget)

```typescript
interface KpiCardWidgetConfig extends WidgetConfig {
  type: 'kpi-card';
  metric: string;
  comparisonMetric?: string;
  trendDirection: 'up' | 'down' | 'neutral';
  thresholds: Threshold[];
}
```

#### 地图组件 (MapWidget)

```typescript
interface MapWidgetConfig extends WidgetConfig {
  type: 'map';
  mapType: 'choropleth' | 'bubble' | 'heatmap';
  geoField: string;
  valueField: string;
  center: [number, number];
  zoom: number;
}
```

## 🔧 核心功能实现

### 1. 拖拽交互逻辑

```typescript
class DragDropManager {
  private dragState: DragState | null = null;

  startDrag(item: DraggableItem, event: React.DragEvent) {
    this.dragState = {
      item,
      startPosition: { x: event.clientX, y: event.clientY },
      currentTarget: null,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }

  handleDragOver(target: DropTarget, event: React.DragEvent) {
    event.preventDefault();
    this.dragState!.currentTarget = target;

    // 显示放置指示器
    this.showDropIndicator(target);
  }

  handleDrop(target: DropTarget, event: React.DragEvent) {
    event.preventDefault();

    const draggedItem = JSON.parse(
      event.dataTransfer.getData('application/json')
    );
    const canvasPosition = this.calculateCanvasPosition(
      event.clientX,
      event.clientY,
      target
    );

    // 创建新的组件实例
    const newWidget = this.createWidgetInstance(draggedItem, canvasPosition);

    // 添加到画布
    this.addWidgetToCanvas(newWidget);

    // 清理状态
    this.cleanup();
  }
}
```

### 2. 布局管理系统

```typescript
class LayoutEngine {
  private gridSize = 20; // 20px网格

  snapToGrid(position: Position): Position {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize,
    };
  }

  autoArrange(widgets: WidgetConfig[]): WidgetConfig[] {
    const arrangedWidgets = [...widgets];
    const occupiedPositions = new Set<string>();

    // 按添加顺序排列
    arrangedWidgets.forEach((widget, index) => {
      let newPosition = this.findEmptyPosition(occupiedPositions, index);
      widget.position = newPosition;

      // 标记占用位置
      this.markOccupiedPositions(widget, occupiedPositions);
    });

    return arrangedWidgets;
  }

  private findEmptyPosition(occupied: Set<string>, index: number): Position {
    const row = Math.floor(index / 4);
    const col = index % 4;

    return {
      x: col * 250 + 50,
      y: row * 200 + 50,
    };
  }
}
```

### 3. 配置持久化

```typescript
class ConfigManager {
  async saveConfiguration(config: ReportDesignConfig): Promise<string> {
    // 验证配置
    const validation = this.validateConfiguration(config);
    if (!validation.isValid) {
      throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
    }

    // 生成唯一ID
    const configId = this.generateConfigId();

    // 保存到数据库
    await this.database.save({
      id: configId,
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return configId;
  }

  validateConfiguration(config: ReportDesignConfig): ValidationResult {
    const errors: string[] = [];

    // 验证必需字段
    if (!config.name) errors.push('缺少报表名称');
    if (!config.widgets || config.widgets.length === 0) {
      errors.push('至少需要一个组件');
    }

    // 验证组件配置
    config.widgets.forEach((widget, index) => {
      if (!widget.type) errors.push(`组件${index}缺少类型`);
      if (!widget.dataSource) errors.push(`组件${index}缺少数据源`);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

## 🛡️ 权限与安全

### 1. 权限控制

```typescript
interface DesignerPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canExport: boolean;
}

const checkDesignerPermissions = (
  userId: string,
  resourceId?: string
): DesignerPermissions => {
  // 集成RBAC权限系统
  const userRoles = getUserRoles(userId);

  return {
    canCreate: hasPermission(userRoles, 'data_center_design_create'),
    canEdit: hasPermission(userRoles, 'data_center_design_edit'),
    canDelete: hasPermission(userRoles, 'data_center_design_delete'),
    canShare: hasPermission(userRoles, 'data_center_design_share'),
    canExport: hasPermission(userRoles, 'data_center_design_export'),
  };
};
```

### 2. 数据安全

```typescript
class DataSecurityManager {
  sanitizeConfiguration(config: ReportDesignConfig): ReportDesignConfig {
    // 移除敏感信息
    const sanitized = { ...config };

    // 清理SQL查询中的潜在危险字符
    sanitized.widgets.forEach(widget => {
      if (widget.type === 'chart' || widget.type === 'table') {
        const chartConfig = widget.config as ChartWidgetConfig;
        chartConfig.dataSource = this.sanitizeSql(chartConfig.dataSource);
      }
    });

    return sanitized;
  }

  private sanitizeSql(sql: string): string {
    // 移除危险关键字
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT'];
    let sanitized = sql.toUpperCase();

    dangerousKeywords.forEach(keyword => {
      sanitized = sanitized.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '');
    });

    return sql;
  }
}
```

## 📊 性能优化

### 1. 渲染优化

```typescript
class PerformanceOptimizer {
  // 虚拟滚动
  enableVirtualScrolling(container: HTMLElement, items: WidgetConfig[]) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderWidget(entry.target as HTMLElement);
        }
      });
    });

    // 观察可见区域
    observer.observe(container);
  }

  // 组件懒加载
  lazyLoadWidgets(widgets: WidgetConfig[]): Promise<WidgetInstance[]> {
    return Promise.all(
      widgets.map(async widget => {
        const Component = await this.loadWidgetComponent(widget.type);
        return new Component(widget);
      })
    );
  }
}
```

### 2. 内存管理

```typescript
class MemoryManager {
  private widgetCache = new Map<string, WidgetInstance>();

  getCachedWidget(id: string): WidgetInstance | null {
    return this.widgetCache.get(id) || null;
  }

  cacheWidget(widget: WidgetInstance) {
    this.widgetCache.set(widget.id, widget);

    // 限制缓存大小
    if (this.widgetCache.size > 100) {
      const oldestKey = this.widgetCache.keys().next().value;
      this.widgetCache.delete(oldestKey);
    }
  }

  clearCache() {
    this.widgetCache.clear();
  }
}
```

## 🔧 技术栈选型

### 前端技术栈

- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **UI组件库**: shadcn/ui + Tailwind CSS
- **拖拽库**: react-beautiful-dnd 或 HTML5 Drag and Drop API
- **图标库**: Lucide React
- **图表库**: Recharts 或 Chart.js

### 后端技术栈

- **API框架**: Next.js API Routes
- **数据库**: PostgreSQL (存储配置)
- **缓存**: Redis (配置缓存)
- **权限**: RBAC权限系统集成

## 🧪 测试策略

### 1. 单元测试

```typescript
describe('DragDropManager', () => {
  let dragManager: DragDropManager;

  beforeEach(() => {
    dragManager = new DragDropManager();
  });

  test('should start drag with correct item', () => {
    const item: DraggableItem = { type: 'chart', subtype: 'bar' };
    const mockEvent = {
      clientX: 100,
      clientY: 200,
      dataTransfer: { setData: jest.fn() },
    } as any;

    dragManager.startDrag(item, mockEvent);

    expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify(item)
    );
  });
});
```

### 2. 集成测试

```typescript
describe('Designer Integration', () => {
  test('should create and save report configuration', async () => {
    const designer = render(<DragDropDesigner />);

    // 拖拽图表组件到画布
    const chartItem = screen.getByTestId('chart-item');
    const canvas = screen.getByTestId('canvas-area');

    fireEvent.dragStart(chartItem);
    fireEvent.dragOver(canvas);
    fireEvent.drop(canvas);

    // 配置组件属性
    const titleInput = screen.getByLabelText('标题');
    fireEvent.change(titleInput, { target: { value: '销售统计' } });

    // 保存配置
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    // 验证保存成功
    expect(await screen.findByText('保存成功')).toBeInTheDocument();
  });
});
```

## 📈 监控与日志

### 1. 用户行为监控

```typescript
class UserActivityMonitor {
  logAction(action: string, details: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId(),
      action,
      details,
      sessionId: this.getSessionId(),
    };

    // 发送到分析服务
    this.sendToAnalytics(logEntry);
  }

  trackDesignerUsage() {
    // 统计使用时长
    this.startTimeTracking();

    // 统计操作频率
    this.trackOperationFrequency();

    // 统计常用功能
    this.trackFeatureUsage();
  }
}
```

### 2. 错误监控

```typescript
class ErrorMonitor {
  captureError(error: Error, context?: any) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // 发送到错误收集服务
    this.reportError(errorInfo);
  }
}
```

## 🚀 部署与运维

### 1. 部署配置

```yaml
# docker-compose.yml
services:
  data-center-designer:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - ./logs:/app/logs
```

### 2. 监控告警

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'data-center-designer'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

## 📚 相关文档

- [`specification.md`](./specification.md) - 数据中心模块规范
- [`bi-engine.ts`](../../../src/data-center/analytics/bi-engine.ts) - BI引擎实现
- [`../reports/data-center-dc011-implementation-report.md`](../../reports/data-center-dc011-implementation-report.md) - BI引擎实施报告

---

_文档版本: v1.0_  
_最后更新: 2026年2月28日_  
_维护人员: 数据中心开发团队_
